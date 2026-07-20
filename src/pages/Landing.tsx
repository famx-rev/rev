import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Activity, Video, Globe as Globe2, Code2, Zap, Shield, BarChart3, TrendingUp, Eye, MousePointerClick, Play, Check, Sparkles, Lock, Cpu, LineChart, Server, Users, MapPin, Terminal, ChevronRight } from 'lucide-react';

const LOGO_URL = 'https://idealfrank.sirv.com/rev_by_famx_gradient.png';
const FEEDBACK_EMAIL = 'profamx@gmail.com';

type PlanId = 'beta' | 'saas' | 'enterprise';
interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  tagline: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'beta',
    name: 'Beta / SaaS',
    price: 'FREE trial',
    period: 'one-time',
    tagline: 'Try the full platform.',
    description: 'Everything you need to validate analytics on a single site.',
    features: [
      'Real-time event tracking',
      'Session replays (rrweb)',
      '3D visitor globe',
      '5 project',
      '100K events / month',
      'Community support',
    ],
    cta: 'Start Beta',
  },
  {
    id: 'saas',
    name: 'SaaS',
    price: '$3',
    period: '/mo',
    tagline: 'For growing sites.',
    description: 'Higher limits and multi-project tracking for teams that ship.',
    features: [
      'Everything in Beta',
      '25 projects',
      '500K events / month',
      '10K session replays',
      '5 GB storage',
      'Custom tracking script editor',
      'Priority email support',
    ],
    cta: 'Choose SaaS',
    highlighted: true,
    badge: 'Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$5',
    period: '/mo',
    tagline: 'Scale without limits.',
    description: 'Maximum capacity and dedicated support for high-traffic apps.',
    features: [
      'Everything in SaaS',
      'Unlimited projects',
      '1M events / month',
      '100K session replays',
      '50 GB storage',
      'Dedicated support channel',
      'Custom SLAs',
    ],
    cta: 'Go Enterprise',
  },
];

const FEATURES = [
  {
    icon: Activity,
    title: 'Real-time event tracking',
    desc: 'Pageviews, clicks, and custom events stream in the moment they happen. No batching delays, no stale dashboards.',
    accent: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Video,
    title: 'Session replays',
    desc: 'Watch exactly how visitors move through your site — every scroll, click, and input — replayed with rrweb.',
    accent: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  },
  {
    icon: Globe2,
    title: '3D visitor globe',
    desc: 'See your audience light up across a live, interactive globe. Geolocated IPs, ISP, device, and browser at a glance.',
    accent: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Code2,
    title: 'Editable tracking script',
    desc: 'Each project ships its own customizable tracking script. Push changes live instantly from the in-app editor.',
    accent: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  },
  {
    icon: BarChart3,
    title: 'Time-series analytics',
    desc: 'Bucket events by minute, hour, day, or month. Spot trends across 24 hours or 12 months in a single chart.',
    accent: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: Shield,
    title: 'Private by default',
    desc: 'Anonymous visitor IDs, no third-party data sharing, and full control over what your script collects.',
    accent: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
  },
];

const SPOTLIGHTS = [
  {
    eyebrow: 'Session Replay',
    title: 'Relive every visitor session',
    body: 'Famx REV records the DOM with rrweb and replays it pixel-perfect — mouse movements, scrolls, form inputs, and navigation. Filter by event type, scrub the timeline, and see exactly where users hesitate.',
    bullets: ['Pixel-perfect DOM replay', 'Click & scroll markers on timeline', 'Per-session delete & privacy controls'],
    icon: Video,
    accent: 'from-purple-500/10 to-transparent',
    mock: 'replay',
  },
  {
    eyebrow: 'Live Visitors',
    title: 'A globe that breathes with your traffic',
    body: 'Every visitor is geolocated and plotted on an interactive 3D globe. Active visitors pulse green in real time; rings ripple outward from each point. Drag to rotate, scroll to zoom.',
    bullets: ['Client-side IP geolocation', 'Live active-visitor pulses', 'ISP, ASN, device & browser detail'],
    icon: Globe2,
    accent: 'from-emerald-500/10 to-transparent',
    mock: 'globe',
  },
  {
    eyebrow: 'Custom Tracking',
    title: 'Own the script, own the data',
    body: 'Each project gets its own tracking script — editable in the dashboard and pushed live with one click. Add custom events, tune sampling, mask sensitive inputs. No redeploys, no SDK lock-in.',
    bullets: ['Per-project script editor', 'One-click push to production', 'Custom events via trackEvent()'],
    icon: Code2,
    accent: 'from-amber-500/10 to-transparent',
    mock: 'code',
  },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Aurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className="aurora-orb absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full opacity-40 dark:opacity-25"
        style={{ background: 'radial-gradient(circle, #DA7756 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="aurora-orb-2 absolute top-40 -right-32 w-[32rem] h-[32rem] rounded-full opacity-30 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, #E89B7E 0%, transparent 70%)', filter: 'blur(70px)' }}
      />
      <div
        className="aurora-orb absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full opacity-25 dark:opacity-15"
        style={{ background: 'radial-gradient(circle, #B4451F 0%, transparent 70%)', filter: 'blur(50px)' }}
      />
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      {/* Glow behind */}
      <div
        className="absolute -inset-6 rounded-3xl opacity-50 dark:opacity-30 blur-2xl"
        style={{ background: 'linear-gradient(120deg, #DA7756 0%, #E89B7E 50%, transparent 100%)' }}
      />
      <div className="relative rounded-2xl border border-[#E5E3DD] dark:border-[#3D3D3A] bg-white dark:bg-[#262524] shadow-2xl shadow-[#DA7756]/10 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E3DD] dark:border-[#3D3D3A] bg-[#FAFAF7] dark:bg-[#1a1a18]">
          <div className="w-3 h-3 rounded-full bg-[#DA7756]/60" />
          <div className="w-3 h-3 rounded-full bg-[#E89B7E]/60" />
          <div className="w-3 h-3 rounded-full bg-[#3D3929]/20 dark:bg-[#E8E6DC]/20" />
          <div className="ml-3 flex-1 h-6 rounded-md bg-[#F0EEE6] dark:bg-[#33322E] flex items-center px-3">
            <span className="text-[10px] text-[#8B8779] dark:text-[#8B887E] font-mono">app.famxrev.com/analytics</span>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="p-5 bg-[#FAFAF7] dark:bg-[#1a1a18]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#8B8779] dark:text-[#8B887E]">Project</div>
              <div className="text-sm font-semibold text-[#3D3929] dark:text-[#E8E6DC]">acme-store.com</div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="relative flex h-1.5 w-1.5 text-emerald-500">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">42 live</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2.5 mb-4">
            {[
              { label: 'Pageviews', value: '12.4K', icon: Eye, color: 'text-blue-500' },
              { label: 'Visitors', value: '3,218', icon: Users, color: 'text-emerald-500' },
              { label: 'IPs', value: '2,901', icon: MapPin, color: 'text-indigo-500' },
              { label: 'Clicks', value: '8,142', icon: MousePointerClick, color: 'text-rose-500' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-lg border border-[#E5E3DD] dark:border-[#3D3D3A] bg-white dark:bg-[#262524] p-2.5">
                  <Icon className={`h-3.5 w-3.5 ${s.color} mb-1.5`} />
                  <div className="text-sm font-bold text-[#3D3929] dark:text-[#E8E6DC] leading-none">{s.value}</div>
                  <div className="text-[9px] text-[#8B8779] dark:text-[#8B887E] mt-0.5">{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* Chart mock */}
          <div className="rounded-lg border border-[#E5E3DD] dark:border-[#3D3D3A] bg-white dark:bg-[#262524] p-4 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-[#DA7756]" />
              <span className="text-[11px] font-medium text-[#3D3929] dark:text-[#E8E6DC]">Events timeline</span>
              <span className="ml-auto text-[9px] text-[#8B8779] dark:text-[#8B887E]">Last 24h</span>
            </div>
            <div className="flex items-end gap-1 h-20">
              {[35, 48, 42, 60, 52, 70, 65, 82, 75, 90, 78, 95, 68, 72, 58, 64, 50, 55, 40, 45, 38, 30, 28, 22].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i > 18 ? 'linear-gradient(180deg, #DA7756, #E89B7E)' : 'linear-gradient(180deg, #E89B7E, #DA775680)',
                    opacity: 0.55 + (h / 200),
                  }}
                />
              ))}
            </div>
          </div>

          {/* Live visitor row */}
          <div className="rounded-lg border border-[#E5E3DD] dark:border-[#3D3D3A] bg-white dark:bg-[#262524] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-base">🇺🇸</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-[#3D3929] dark:text-[#E8E6DC] truncate">192.168.x.x — Brooklyn, US</div>
              <div className="text-[9px] text-[#8B8779] dark:text-[#8B887E] truncate">Chrome · macOS · just now</div>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[9px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpotlightMock({ kind }: { kind: 'replay' | 'globe' | 'code' }) {
  if (kind === 'replay') {
    return (
      <div className="rounded-2xl border border-[#E5E3DD] dark:border-[#3D3D3A] bg-white dark:bg-[#262524] shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E3DD] dark:border-[#3D3D3A] bg-[#FAFAF7] dark:bg-[#1a1a18]">
          <Play className="h-3.5 w-3.5 text-[#DA7756]" />
          <span className="text-xs font-medium text-[#3D3929] dark:text-[#E8E6DC]">Session #a4f2 · 2m 14s</span>
          <span className="ml-auto text-[10px] text-[#8B8779] dark:text-[#8B887E] font-mono">128 events</span>
        </div>
        <div className="p-4 bg-[#FAFAF7] dark:bg-[#1a1a18]">
          <div className="rounded-lg border border-[#E5E3DD] dark:border-[#3D3D3A] bg-white dark:bg-[#262524] p-4 h-40 relative overflow-hidden">
            <div className="text-[10px] text-[#8B8779] dark:text-[#8B887E] mb-2">acme-store.com/checkout</div>
            <div className="space-y-2">
              <div className="h-2.5 w-3/4 rounded bg-[#F0EEE6] dark:bg-[#33322E]" />
              <div className="h-2.5 w-1/2 rounded bg-[#F0EEE6] dark:bg-[#33322E]" />
              <div className="h-7 w-28 rounded bg-[#DA7756]/80 mt-3" />
            </div>
            {/* cursor */}
            <div className="absolute top-16 left-32">
              <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_0_3px_rgba(239,68,68,0.3)]" />
            </div>
          </div>
          {/* timeline */}
          <div className="mt-3 h-1.5 rounded-full bg-[#F0EEE6] dark:bg-[#33322E] relative">
            <div className="absolute left-0 top-0 h-full w-2/3 rounded-full bg-[#DA7756]" />
            <div className="absolute left-[22%] top-0 h-full w-0.5 bg-emerald-500" />
            <div className="absolute left-[48%] top-0 h-full w-0.5 bg-emerald-500" />
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'globe') {
    return (
      <div className="rounded-2xl border border-[#E5E3DD] dark:border-[#3D3D3A] bg-slate-900 shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-white">Live visitor map</span>
          <span className="ml-auto text-[10px] text-slate-400">42 active</span>
        </div>
        <div className="relative h-56 bg-slate-900 overflow-hidden">
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 70%)' }}
          />
          {/* dotted grid */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          {/* pulse points */}
          {[
            { top: '30%', left: '22%', live: true },
            { top: '45%', left: '48%', live: true },
            { top: '38%', left: '70%', live: false },
            { top: '60%', left: '35%', live: true },
            { top: '55%', left: '78%', live: false },
            { top: '25%', left: '55%', live: true },
          ].map((p, i) => (
            <div key={i} className="absolute" style={{ top: p.top, left: p.left }}>
              <span className="relative flex h-2.5 w-2.5">
                {p.live && (
                  <span className="pulse-ring absolute inline-flex h-full w-full rounded-full text-emerald-400" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${p.live ? 'bg-emerald-400' : 'bg-rose-400'}`}
                />
              </span>
            </div>
          ))}
          <div className="absolute bottom-3 left-4 flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Inactive
            </span>
          </div>
        </div>
      </div>
    );
  }
  // code mock
  return (
    <div className="rounded-2xl border border-[#3D3D3A] bg-[#1a1a18] shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3D3D3A]">
        <Terminal className="h-3.5 w-3.5 text-[#DA7756]" />
        <span className="text-xs font-medium text-[#E8E6DC]">tracking.js</span>
        <span className="ml-auto text-[10px] text-[#8B887E]">live</span>
      </div>
      <pre className="p-4 text-[11px] leading-relaxed font-mono text-[#E8E6DC] overflow-x-auto">
{`<span class="text-[#8B887E]">// custom event — fires on CTA click</span>
<span class="text-[#DA7756]">trackEvent</span>(<span class="text-emerald-400">'cta_click'</span>, {
  ctaId: <span class="text-emerald-400">'signup-hero'</span>,
  location: <span class="text-emerald-400">'header'</span>,
  value: <span class="text-indigo-300">42</span>
});`}
      </pre>
      <div className="px-4 py-3 border-t border-[#3D3D3A] bg-[#262524] flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-[#DA7756]" />
        <span className="text-[11px] text-[#E8E6DC]">Pushed live to all visitors</span>
        <span className="ml-auto text-[10px] text-emerald-400 font-medium">● deployed</span>
      </div>
    </div>
  );
}

interface LandingProps {
  onEnterApp: () => void;
}

export default function Landing({ onEnterApp }: LandingProps) {
  const [year] = useState(() => new Date().getFullYear());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleEnter = () => onEnterApp();

  return (
    <div className="font-sans-premium min-h-screen bg-[#F5F4EF] dark:bg-[#1a1a18] text-[#3D3929] dark:text-[#E8E6DC]">
      {/* ── Nav ──────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#F5F4EF]/85 dark:bg-[#1a1a18]/85 backdrop-blur-xl border-b border-[#E5E3DD]/60 dark:border-[#3D3D3A]/60'
            : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="Famx REV" className="h-8 w-auto" />
            <span className="font-serif-display text-xl text-[#3D3929] dark:text-[#E8E6DC]">Famx REV</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#3D3929]/80 dark:text-[#E8E6DC]/80">
            <a href="#features" className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Features</a>
            <a href="#spotlight" className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Product</a>
            <a href="#pricing" className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Pricing</a>
            <a href={`mailto:${FEEDBACK_EMAIL}`} className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={handleEnter}
              className="text-sm font-medium text-[#3D3929] dark:text-[#E8E6DC] hover:text-[#DA7756] dark:hover:text-[#DA7756] transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={handleEnter}
              className="group flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-[#DA7756] hover:bg-[#C86A4D] text-white shadow-sm hover:shadow transition-all"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────── */}
      <section id="top" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <Aurora />
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div>
            <div className="reveal reveal-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-[#E5E3DD] dark:border-[#3D3D3A] text-xs font-medium text-[#3D3929] dark:text-[#E8E6DC] mb-6">
              <span className="relative flex h-1.5 w-1.5 text-emerald-500">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Real-time analytics &amp; session replay
            </div>

            <h1 className="reveal reveal-2 font-serif-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[#3D3929] dark:text-[#E8E6DC]">
              See every visitor.
              <br />
              <span className="gradient-text">Replay every session.</span>
            </h1>

            <p className="reveal reveal-3 mt-6 text-lg text-[#3D3929]/75 dark:text-[#E8E6DC]/75 max-w-xl leading-relaxed">
              Famx REV is a premium web analytics platform — real-time events, pixel-perfect session replays, and a
              live 3D visitor globe. One script tag. Full control. Built for teams that ship.
            </p>

            <div className="reveal reveal-4 mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={handleEnter}
                className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#3D3929] dark:bg-[#E8E6DC] text-[#F5F4EF] dark:text-[#1a1a18] font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Start tracking free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#spotlight"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/60 dark:bg-white/5 border border-[#E5E3DD] dark:border-[#3D3D3A] text-[#3D3929] dark:text-[#E8E6DC] font-medium hover:bg-white dark:hover:bg-white/10 transition-all"
              >
                <Play className="h-4 w-4 text-[#DA7756]" />
                Watch the tour
              </a>
            </div>

            <div className="reveal reveal-5 mt-10 flex items-center gap-6 text-xs text-[#8B8779] dark:text-[#8B887E]">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 1-minute setup</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Cancel anytime</span>
            </div>
          </div>

          <div className="reveal reveal-3">
            <HeroMockup />
          </div>
        </div>

        {/* Trust marquee */}
        <div className="mt-20 max-w-6xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-[#8B8779] dark:text-[#8B887E] mb-6">
            Powered by a modern open-source stack
          </p>
          <div className="relative overflow-hidden mask-fade">
            <div className="marquee-track flex gap-12 whitespace-nowrap text-[#3D3929]/40 dark:text-[#E8E6DC]/40">
              {[...Array(2)].map((_, dup) => (
                <div key={dup} className="flex gap-12 items-center text-sm font-medium">
                  <span className="flex items-center gap-2"><Cpu className="h-4 w-4" /> React 18</span>
                  <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Vite</span>
                  <span className="flex items-center gap-2"><Globe2 className="h-4 w-4" /> globe.gl</span>
                  <span className="flex items-center gap-2"><Video className="h-4 w-4" /> rrweb</span>
                  <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Recharts</span>
                  <span className="flex items-center gap-2"><Server className="h-4 w-4" /> TiDB</span>
                  <span className="flex items-center gap-2"><LineChart className="h-4 w-4" /> Express</span>
                  <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Tailwind</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────── */}
      <section className="border-y border-[#E5E3DD] dark:border-[#3D3D3A] bg-white/40 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '< 200ms', label: 'Event ingestion latency' },
            { value: '60fps', label: 'Session replay playback' },
            { value: '100%', label: 'Client-side geolocation' },
            { value: '1 tag', label: 'To install on your site' },
          ].map((s) => (
            <Reveal key={s.label}>
              <div className="text-center md:text-left">
                <div className="font-serif-display text-4xl text-[#3D3929] dark:text-[#E8E6DC]">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-[#8B8779] dark:text-[#8B887E] mt-1">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features grid ───────────────────────────── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-[#DA7756] font-medium mb-3">Everything you need</p>
            <h2 className="font-serif-display text-4xl sm:text-5xl text-[#3D3929] dark:text-[#E8E6DC] leading-tight">
              A complete analytics toolkit, refined to feel effortless.
            </h2>
            <p className="mt-5 text-[#3D3929]/70 dark:text-[#E8E6DC]/70 text-lg">
              From the moment a visitor lands to the moment they convert, Famx REV captures the full story — and lets you replay it.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.06}>
                  <div className="group h-full rounded-2xl border border-[#E5E3DD] dark:border-[#3D3D3A] bg-white/60 dark:bg-white/[0.03] p-6 hover:shadow-xl hover:shadow-[#DA7756]/5 hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-lg text-[#3D3929] dark:text-[#E8E6DC] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#3D3929]/70 dark:text-[#E8E6DC]/70 leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Feature spotlights ──────────────────────── */}
      <section id="spotlight" className="py-24 sm:py-32 bg-white/40 dark:bg-white/[0.02] border-y border-[#E5E3DD] dark:border-[#3D3D3A]">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {SPOTLIGHTS.map((s, i) => {
            const Icon = s.icon;
            const reverse = i % 2 === 1;
            return (
              <div key={s.title} className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <Reveal>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${s.accent} border border-[#E5E3DD] dark:border-[#3D3D3A] text-xs font-medium text-[#3D3929] dark:text-[#E8E6DC] mb-5`}>
                    <Icon className="h-3.5 w-3.5 text-[#DA7756]" />
                    {s.eyebrow}
                  </div>
                  <h3 className="font-serif-display text-4xl sm:text-5xl text-[#3D3929] dark:text-[#E8E6DC] leading-tight mb-5">
                    {s.title}
                  </h3>
                  <p className="text-lg text-[#3D3929]/75 dark:text-[#E8E6DC]/75 leading-relaxed mb-6">{s.body}</p>
                  <ul className="space-y-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-[#3D3929] dark:text-[#E8E6DC]">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-[#DA7756]/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-[#DA7756]" />
                        </span>
                        <span className="text-sm leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={0.1}>
                  <SpotlightMock kind={s.mock as 'replay' | 'globe' | 'code'} />
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────── */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-[#DA7756] font-medium mb-3">Pricing</p>
            <h2 className="font-serif-display text-4xl sm:text-5xl text-[#3D3929] dark:text-[#E8E6DC] leading-tight">
              Simple, honest pricing.
            </h2>
            <p className="mt-5 text-[#3D3929]/70 dark:text-[#E8E6DC]/70 text-lg">
              Start for a dollar. Scale when you need to. No hidden fees, no usage surprises.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.08}>
                <div
                  className={`relative h-full rounded-2xl p-7 transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-gradient-to-b from-[#3D3929] to-[#262524] text-[#F5F4EF] border border-[#3D3929] shadow-2xl shadow-[#DA7756]/20 lg:-translate-y-3'
                      : 'bg-white/60 dark:bg-white/[0.03] border border-[#E5E3DD] dark:border-[#3D3D3A] hover:-translate-y-1 hover:shadow-xl'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#DA7756] text-white text-[11px] font-semibold shadow-md">
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className={`font-serif-display text-2xl ${plan.highlighted ? 'text-[#F5F4EF]' : 'text-[#3D3929] dark:text-[#E8E6DC]'}`}>
                      {plan.name}
                    </h3>
                  </div>
                  <p className={`text-xs mb-5 ${plan.highlighted ? 'text-[#E8E6DC]/70' : 'text-[#8B8779] dark:text-[#8B887E]'}`}>
                    {plan.tagline}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`font-serif-display text-5xl ${plan.highlighted ? 'text-[#F5F4EF]' : 'text-[#3D3929] dark:text-[#E8E6DC]'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-[#E8E6DC]/60' : 'text-[#8B8779] dark:text-[#8B887E]'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-xs mb-6 ${plan.highlighted ? 'text-[#E8E6DC]/60' : 'text-[#8B8779] dark:text-[#8B887E]'}`}>
                    {plan.description}
                  </p>

                  <button
                    onClick={handleEnter}
                    className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? 'bg-[#DA7756] hover:bg-[#C86A4D] text-white shadow-lg'
                        : 'bg-[#3D3929] dark:bg-[#E8E6DC] text-[#F5F4EF] dark:text-[#1a1a18] hover:opacity-90'
                    }`}
                  >
                    {plan.cta}
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm">
                        <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-[#DA7756]' : 'text-emerald-500'}`} />
                        <span className={plan.highlighted ? 'text-[#E8E6DC]/90' : 'text-[#3D3929]/80 dark:text-[#E8E6DC]/80'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 text-center" delay={0.2}>
            <p className="text-sm text-[#8B8779] dark:text-[#8B887E]">
              All plans include real-time events, session replays, and the 3D visitor globe. No credit card required to start.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden p-12 sm:p-16 text-center bg-gradient-to-br from-[#3D3929] to-[#262524] text-[#F5F4EF]">
              <div
                className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle, #DA7756 0%, transparent 70%)' }}
              />
              <div
                className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, #E89B7E 0%, transparent 70%)' }}
              />
              <div className="relative">
                <h2 className="font-serif-display text-4xl sm:text-5xl leading-tight mb-5">
                  Start seeing your visitors in <span className="gradient-text">real time</span>.
                </h2>
                <p className="text-[#E8E6DC]/80 text-lg max-w-xl mx-auto mb-8">
                  Drop one script tag on your site and watch the data flow. Free to start, premium when you scale.
                </p>
                <button
                  onClick={handleEnter}
                  className="group inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-[#DA7756] hover:bg-[#C86A4D] text-white font-semibold shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-[#E5E3DD] dark:border-[#3D3D3A] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <img src={LOGO_URL} alt="Famx REV" className="h-8 w-auto" />
                <span className="font-serif-display text-xl text-[#3D3929] dark:text-[#E8E6DC]">Famx REV</span>
              </div>
              <p className="text-sm text-[#8B8779] dark:text-[#8B887E] leading-relaxed">
                Real-time web analytics, session replay, and visitor intelligence.
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-[#3D3929] dark:text-[#E8E6DC] font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-[#8B8779] dark:text-[#8B887E]">
                <li><a href="#features" className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Features</a></li>
                <li><a href="#spotlight" className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Session replay</a></li>
                <li><a href="#pricing" className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Pricing</a></li>
                <li><button onClick={handleEnter} className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-[#3D3929] dark:text-[#E8E6DC] font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-[#8B8779] dark:text-[#8B887E]">
                <li><a href={`mailto:${FEEDBACK_EMAIL}`} className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Contact</a></li>
                <li><button onClick={handleEnter} className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Feedback</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-[#3D3929] dark:text-[#E8E6DC] font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-[#8B8779] dark:text-[#8B887E]">
                <li><button onClick={handleEnter} className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Terms of Service</button></li>
                <li><button onClick={handleEnter} className="link-shimmer hover:text-[#3D3929] dark:hover:text-[#E8E6DC]">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#E5E3DD] dark:border-[#3D3D3A] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#8B8779] dark:text-[#8B887E]">© {year} Famx REV. All rights reserved.</p>
            <p className="text-xs text-[#8B8779] dark:text-[#8B887E] flex items-center gap-1.5">
              Built with <Zap className="h-3 w-3 text-[#DA7756]" /> and care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
