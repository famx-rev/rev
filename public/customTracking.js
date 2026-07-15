// Custom Web Analytics Tracking Script
// This is the default template. It is served per-project from:
//   GET  /api/custom/:projectId/tracking.js        -> returns JS (for <script src>)
//   GET  /api/custom/:projectId/tracking-script   -> returns JSON { scriptContent, updatedAt }
//   PUT  /api/custom/:projectId/tracking-script   -> saves updated script
//   POST /api/custom/:projectId/tracking-script/reset -> resets to this default
//
// Single-tag install — server injects the project ID automatically:
//   <script src="https://api1-orpin.vercel.app/api/custom/PROJECT_ID/tracking.js" defer></script>
// You can still override by calling window.AnalyticsTracker.init('PROJECT_ID').
(function() {
  const API_URL = 'https://api1-orpin.vercel.app/api/custom';
  const RRWEB_URL = 'https://unpkg.com/rrweb@2.0.0-alpha.4/dist/rrweb.min.js';
  let events = [];
  let recording = false;
  let stopFn = null;
  let sendInterval = null;
  let projectId = '__PROJECT_ID__';
  let rrwebLoading = false;
  let rrwebCallbacks = [];

  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getProjectId() {
    return projectId;
  }

  function getVisitorId() {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = generateId();
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  }

  function getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = generateId();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  function startRecording() {
    if (recording || typeof rrweb === 'undefined' || !getProjectId()) return;

    stopFn = rrweb.record({
      emit(event) {
        events.push(event);
        if (events.length >= 10) {
          sendEvents();
        }
      },
      recordCanvas: true,
      recordAfter: 'DOMContentLoaded',
      maskAllInputs: false,
      maskTextSelector: '[data-mask]',
      slimDOMOptions: {
        script: true,
        comment: true,
        headFavicon: true,
        headWhitespace: true,
      },
      sampling: {
        canvas: 10,
        input: 'last',
        scroll: 150,
        media: 500
      },
      dataURLOptions: {
        type: 'image/webp',
        quality: 0.8
      },
      inlineStylesheet: true
    });

    recording = true;

    if (sendInterval) clearInterval(sendInterval);
    sendInterval = setInterval(sendEvents, 5000);

    window.addEventListener('beforeunload', () => {
      if (sendInterval) clearInterval(sendInterval);
      sendEvents();
    });
  }

  async function sendEvents() {
    if (events.length === 0 || !getProjectId()) return;

    const eventsToSend = events.splice(0, events.length);
    const sessionData = {
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: window.screen.width + 'x' + window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      events: eventsToSend
    };

    try {
      await fetch(API_URL + '/' + getProjectId() + '/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
    } catch (error) {
      console.error('Failed to send session data:', error);
      events.unshift(...eventsToSend);
    }
  }

  function trackEvent(eventName, eventData) {
    if (!getProjectId()) {
      console.warn('Analytics: No project ID configured.');
      return;
    }

    var event = {
      timestamp: new Date().toISOString(),
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      eventName: eventName,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: window.screen.width + 'x' + window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      language: navigator.language
    };
    if (eventData) Object.assign(event, eventData);

    fetch(API_URL + '/' + getProjectId() + '/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(console.error);
  }

  // Auto-load rrweb if not already present, then call callback.
  function ensureRrwebLoaded(callback) {
    if (typeof rrweb !== 'undefined') { callback(); return; }
    rrwebCallbacks.push(callback);
    if (rrwebLoading) return;
    rrwebLoading = true;
    var s = document.createElement('script');
    s.src = RRWEB_URL;
    s.onload = function() {
      rrwebCallbacks.forEach(function(cb) { cb(); });
      rrwebCallbacks = [];
    };
    s.onerror = function() { console.warn('Analytics: Failed to load rrweb'); };
    document.head.appendChild(s);
  }

  function init(pId) {
    projectId = pId;

    ensureRrwebLoaded(function() {
      if (document.readyState === 'complete') {
        startRecording();
      } else {
        window.addEventListener('load', startRecording);
      }
    });

    trackEvent('pageview');

    document.addEventListener('click', function(e) {
      var target = e.target.closest('a, button');
      if (target) {
        trackEvent('click', {
          elementType: target.tagName.toLowerCase(),
          elementText: target.textContent ? target.textContent.trim() : '',
          elementId: target.id,
          elementClass: target.className,
          clickX: e.clientX,
          clickY: e.clientY
        });
      }
    });
  }

  // Auto-init: project ID is already injected server-side
  if (projectId) {
    if (document.readyState === 'complete') {
      init(projectId);
    } else {
      window.addEventListener('load', function() { init(projectId); });
    }
  }

  window.trackEvent = trackEvent;
  window.AnalyticsTracker = {
    init: init,
    trackEvent: trackEvent,
    getProjectId: getProjectId,
    getVisitorId: getVisitorId,
    getSessionId: getSessionId
  };
})();
