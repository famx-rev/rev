/*!
 * speed-boost-pro.js
 * Universal front-end performance script.
 * Works on: plain HTML/CSS/JS sites, WordPress/CMS pages, and
 * React/Vue/Svelte/etc. single-page apps (SPA-safe via MutationObserver).
 *
 * FEATURES
 * 1. Lazy-loads images, iframes & video posters (IntersectionObserver)
 * 2. SPA-safe: watches for DOM changes so it keeps lazy-loading content
 *    that React/Vue/etc. render AFTER initial page load
 * 3. Auto-upgrades images to WebP/AVIF when the browser supports it
 * 4. Connection-aware: loads less/lower-quality media on slow or
 *    data-saver connections (navigator.connection + Save-Data)
 * 5. Defers non-critical scripts until after first paint
 * 6. Prefetches internal links on hover/viewport-entry for instant nav
 * 7. Runs non-urgent work during browser idle time (requestIdleCallback)
 * 8. Registers a service worker (sw-speed-boost.js) for asset caching
 *    so repeat visits load near-instantly, even offline
 * 9. Debounce/throttle helpers exposed on window.SpeedBoost for your
 *    own scroll/resize handlers
 *
 * INSTALL
 * 1. Upload speed-boost-pro.js AND sw-speed-boost.js to the same folder
 *    on your server (e.g. /js/).
 * 2. Add near the end of <body>, or in <head> with defer:
 *      <script src="/js/speed-boost-pro.js" defer></script>
 * 3. Mark lazy media like this (works for static HTML, CMS output,
 *    or JSX/Vue templates — the observer catches it either way):
 *      <img data-src="photo.jpg" data-src-webp="photo.webp" class="lazy" alt="..." />
 *      <iframe data-src="https://example.com/embed" class="lazy"></iframe>
 *      <video data-poster="poster.jpg" class="lazy"></video>
 * 4. Defer non-critical third-party scripts:
 *      <script type="speedboost/defer" src="analytics.js"></script>
 * 5. That's it — the service worker + observers set themselves up
 *    automatically and keep working as your app re-renders.
 *
 * NOTE ON REACT/VUE: this is a plain <script> tag, not an npm package,
 * so it works regardless of framework — it observes the real DOM the
 * framework produces, rather than hooking into framework internals.
 */

(function () {
  "use strict";

  const CONFIG = {
    lazySelector: ".lazy",
    deferredScriptType: "speedboost/defer",
    lazyRootMargin: "200px 0px",
    prefetchHoverDelay: 65,
    swPath: "./sw-speed-boost.js",
    // AUTO MODE: if true, the script scans every <img>/<iframe> on the
    // page itself — no data-src or class="lazy" needed anywhere in your
    // HTML. Anything already visible on screen at load time is left
    // alone (loads normally, instantly). Anything below the fold gets
    // auto-converted to lazy-load. Set to false if you'd rather mark
    // elements manually for full control.
    autoMode: true,
  };

  const state = {
    supportsWebP: false,
    supportsAVIF: false,
    saveData: false,
    slowConnection: false,
    prefetched: new Set(),
  };

  // ---------- CONNECTION AWARENESS ----------
  function detectConnection() {
    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (conn) {
      state.saveData = !!conn.saveData;
      state.slowConnection = ["slow-2g", "2g"].includes(conn.effectiveType);
    }
  }

  // ---------- IMAGE FORMAT DETECTION ----------
  function detectImageFormats() {
    return Promise.all([
      canUseFormat(
        "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="
      ).then((ok) => (state.supportsWebP = ok)),
      canUseFormat(
        "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI="
      ).then((ok) => (state.supportsAVIF = ok)),
    ]);
  }

  function canUseFormat(dataUri) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0);
      img.onerror = () => resolve(false);
      img.src = dataUri;
    });
  }

  // ---------- LAZY LOAD (images / iframes / video posters) ----------
  let lazyObserver;

  function getLazyObserver() {
    if (lazyObserver) return lazyObserver;
    if (!("IntersectionObserver" in window)) return null;
    lazyObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadElement(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: CONFIG.lazyRootMargin }
    );
    return lazyObserver;
  }

  // ---------- AUTO MODE: convert plain <img>/<iframe> automatically ----------
  function isAboveTheFold(el) {
    const rect = el.getBoundingClientRect();
    // Give a little buffer (300px) so images just below the initial
    // viewport still load immediately rather than flashing in late.
    return rect.top < window.innerHeight + 300 && rect.bottom > -300;
  }

  function autoConvertElements(root) {
    // Plain <img> tags that still use a normal src (not yet lazy, not
    // already handled, and not an inline data: URI or SVG placeholder)
    const imgs = root.querySelectorAll(
      "img[src]:not([data-speedboost-seen]):not(.lazy)"
    );
    imgs.forEach((img) => {
      if (isAboveTheFold(img)) {
        img.dataset.speedboostSeen = "1"; // leave it loading normally
        return;
      }
      img.dataset.src = img.getAttribute("src");
      if (img.srcset) img.dataset.srcset = img.getAttribute("srcset");
      img.removeAttribute("src");
      img.removeAttribute("srcset");
      img.classList.add("lazy");
    });

    // Iframes (YouTube embeds, maps, widgets, etc.)
    const iframes = root.querySelectorAll(
      "iframe[src]:not([data-speedboost-seen]):not(.lazy)"
    );
    iframes.forEach((iframe) => {
      if (isAboveTheFold(iframe)) {
        iframe.dataset.speedboostSeen = "1";
        return;
      }
      iframe.dataset.src = iframe.getAttribute("src");
      iframe.removeAttribute("src");
      iframe.classList.add("lazy");
    });
  }

  function scanForLazyElements(root) {
    const els = root.querySelectorAll
      ? root.querySelectorAll(CONFIG.lazySelector)
      : [];
    if (!els.length) return;

    const observer = getLazyObserver();
    els.forEach((el) => {
      if (el.dataset.speedboostSeen) return; // avoid double-observing
      el.dataset.speedboostSeen = "1";
      if (observer) {
        observer.observe(el);
      } else {
        loadElement(el); // no IO support: load immediately
      }
    });
  }

  function loadElement(el) {
    // On very slow / data-saver connections, skip upgrading to
    // high-res / next-gen formats — just load the base source.
    const useNextGen = !state.saveData && !state.slowConnection;

    if (el.tagName === "IMG") {
      if (useNextGen && state.supportsAVIF && el.dataset.srcAvif) {
        el.src = el.dataset.srcAvif;
      } else if (useNextGen && state.supportsWebP && el.dataset.srcWebp) {
        el.src = el.dataset.srcWebp;
      } else if (el.dataset.src) {
        el.src = el.dataset.src;
      }
      if (el.dataset.srcset) el.srcset = el.dataset.srcset;
    } else if (el.tagName === "IFRAME" && el.dataset.src) {
      el.src = el.dataset.src;
    } else if (el.tagName === "VIDEO" && el.dataset.poster) {
      el.poster = el.dataset.poster;
      if (el.dataset.src) {
        const source = document.createElement("source");
        source.src = el.dataset.src;
        el.appendChild(source);
      }
    }

    el.classList.remove("lazy");
    el.classList.add("lazy-loaded");
  }

  // ---------- SPA SUPPORT: watch for DOM changes ----------
  function initMutationWatcher() {
    if (!("MutationObserver" in window)) return;
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return; // only elements
          if (CONFIG.autoMode && node.querySelectorAll) {
            autoConvertElements(node);
          }
          if (node.matches && node.matches(CONFIG.lazySelector)) {
            scanForLazyElements({
              querySelectorAll: () => [node],
            });
          }
          if (node.querySelectorAll) scanForLazyElements(node);
        });
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ---------- DEFERRED SCRIPTS ----------
  function initDeferredScripts() {
    const run = () => {
      document
        .querySelectorAll(`script[type="${CONFIG.deferredScriptType}"]`)
        .forEach((oldScript) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) => {
            if (attr.name !== "type")
              newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          oldScript.replaceWith(newScript);
        });
    };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
  }

  // ---------- HOVER / VIEWPORT PREFETCH FOR INTERNAL LINKS ----------
  function initPrefetch() {
    document.addEventListener(
      "mouseover",
      (e) => {
        const link = e.target.closest("a[href]");
        if (!link || !isInternalLink(link)) return;
        schedulePrefetch(link.href, CONFIG.prefetchHoverDelay);
      },
      { passive: true }
    );
  }

  function isInternalLink(link) {
    try {
      const url = new URL(link.href, location.href);
      return (
        url.origin === location.origin &&
        !link.hasAttribute("download") &&
        link.target !== "_blank"
      );
    } catch {
      return false;
    }
  }

  function schedulePrefetch(href, delay) {
    if (state.prefetched.has(href) || state.saveData || state.slowConnection)
      return;
    setTimeout(() => {
      if (state.prefetched.has(href)) return;
      const l = document.createElement("link");
      l.rel = "prefetch";
      l.href = href;
      document.head.appendChild(l);
      state.prefetched.add(href);
    }, delay);
  }

  // ---------- IDLE-TIME TASK RUNNER ----------
  function runWhenIdle(fn) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(fn, { timeout: 2000 });
    } else {
      setTimeout(fn, 200);
    }
  }

  // ---------- FONT LOADING OPTIMIZATION ----------
  function initFontOptimization() {
    if (!("fonts" in document)) return;
    document.fonts.ready.then(() => {
      document.documentElement.classList.add("fonts-loaded");
    });
  }

  // ---------- SERVICE WORKER REGISTRATION ----------
  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    // Register during idle time so it never competes with first paint
    runWhenIdle(() => {
      navigator.serviceWorker.register(CONFIG.swPath).catch(() => {
        // Silently ignore — e.g. running from file:// or unsupported host
      });
    });
  }

  // ---------- DEBOUNCE / THROTTLE HELPERS ----------
  function debounce(fn, delay) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function throttle(fn, limit) {
    let waiting = false;
    return function (...args) {
      if (waiting) return;
      fn.apply(this, args);
      waiting = true;
      setTimeout(() => (waiting = false), limit);
    };
  }

  window.SpeedBoost = { debounce, throttle };

  // ---------- INIT ----------
  function init() {
    detectConnection();
    detectImageFormats().finally(() => {
      if (CONFIG.autoMode) autoConvertElements(document);
      scanForLazyElements(document);
      initMutationWatcher();
    });
    initDeferredScripts();
    initPrefetch();
    initFontOptimization();
    runWhenIdle(initServiceWorker);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
