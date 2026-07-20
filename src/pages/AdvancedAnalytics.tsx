import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  LogOut, TrendingDown, Activity, Layers, Repeat, Sparkles,
  Monitor, Chrome, Globe, MousePointer, Clock, Star,
} from 'lucide-react';
import { useProject } from '../App';
import { useTheme } from '../auth/ThemeContext';

interface Event {
  timestamp: string;
  eventName: string;
  visitorId: string;
  url: string;
  ip?: string;
  userAgent?: string;
  language?: string;
  screenResolution?: string;
  referrer?: string;
}

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#a855f7', '#14b8a6', '#ec4899', '#84cc16', '#06b6d4'];

function parseUA(ua?: string) {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  let browser = 'Unknown';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/iphone|ipad|mac os|macintosh/i.test(ua)) os = 'iOS/macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  const device = /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
  return { browser, os, device };
}

function safeTime(ts?: string): number {
  if (!ts) return NaN;
  const t = new Date(ts).getTime();
  return isNaN(t) ? NaN : t;
}

function AdvancedAnalytics({ events }: { events: Event[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const gridStroke = isDark ? '#374151' : '#e5e7eb';
  const tickFill = isDark ? '#9ca3af' : '#6b7280';
  const tooltipStyle = {
    borderRadius: 10,
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    fontSize: 13,
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#111827',
  };

  // ── Bounce & Exit rates ──
  const { bounceRate, exitPages, avgEventsPerVisitor, newVisitors, returningVisitors } = useMemo(() => {
    const byVisitor = new Map<string, Event[]>();
    for (const e of events) {
      if (!e || !e.visitorId) continue;
      const arr = byVisitor.get(e.visitorId) || [];
      arr.push(e);
      byVisitor.set(e.visitorId, arr);
    }

    let singlePageVisitors = 0;
    const SESSION_GAP = 30 * 60 * 1000;

    byVisitor.forEach((evs) => {
      const sorted = [...evs].sort((a, b) => safeTime(a.timestamp) - safeTime(b.timestamp));
      const pageviews = sorted.filter(e => e.eventName === 'pageview');
      if (pageviews.length <= 1) singlePageVisitors++;
    });

    // New vs returning: based on session count per visitor within the loaded
    // event window (a visitor with 2+ distinct sessions, separated by a
    // 30-min gap, counts as returning). This replaces the old "first event
    // timestamp within last 24h" check, which always classified everyone as
    // "new" whenever the events array itself only covered a <=24h window.
    let newCount = 0;
    let returningCount = 0;

    byVisitor.forEach((evs) => {
      const sorted = [...evs].sort((a, b) => safeTime(a.timestamp) - safeTime(b.timestamp));
      let sessionCount = 0;
      let lastTs: number | null = null;
      for (const e of sorted) {
        const t = safeTime(e.timestamp);
        if (isNaN(t)) continue;
        if (lastTs === null || t - lastTs > SESSION_GAP) sessionCount++;
        lastTs = t;
      }
      if (sessionCount <= 1) newCount++;
      else returningCount++;
    });

    const totalVisitors = byVisitor.size || 1;
    const bounce = (singlePageVisitors / totalVisitors) * 100;

    // Exit rate per page: last pageview in each visitor session
    const exitCount = new Map<string, number>();
    const visitCount = new Map<string, number>();
    byVisitor.forEach(evs => {
      const sorted = [...evs].sort((a, b) => safeTime(a.timestamp) - safeTime(b.timestamp));
      // group into sessions
      const sessions: Event[][] = [];
      let cur: Event[] = [];
      for (const e of sorted) {
        if (cur.length === 0) cur.push(e);
        else {
          const last = cur[cur.length - 1];
          if (safeTime(e.timestamp) - safeTime(last.timestamp) > SESSION_GAP) {
            sessions.push(cur); cur = [e];
          } else cur.push(e);
        }
      }
      if (cur.length) sessions.push(cur);

      sessions.forEach(s => {
        const pvs = s.filter(e => e.eventName === 'pageview');
        pvs.forEach((p, i) => {
          if (!p.url) return;
          visitCount.set(p.url, (visitCount.get(p.url) || 0) + 1);
          if (i === pvs.length - 1) exitCount.set(p.url, (exitCount.get(p.url) || 0) + 1);
        });
      });
    });

    const exitPagesList = Array.from(visitCount.entries())
      .map(([url, visits]) => ({
        url,
        visits,
        exits: exitCount.get(url) || 0,
        exitRate: visits > 0 ? ((exitCount.get(url) || 0) / visits) * 100 : 0,
      }))
      .filter(p => p.visits >= 2)
      .sort((a, b) => b.exits - a.exits)
      .slice(0, 8);

    return {
      bounceRate: bounce,
      exitPages: exitPagesList,
      avgEventsPerVisitor: totalVisitors > 0 ? events.length / totalVisitors : 0,
      newVisitors: newCount,
      returningVisitors: returningCount,
    };
  }, [events]);

  // ── Device / Browser / OS distributions (pie) ──
  const deviceData = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) {
      const { device } = parseUA(e.userAgent);
      m.set(device, (m.get(device) || 0) + 1);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [events]);

  const browserData = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) {
      const { browser } = parseUA(e.userAgent);
      m.set(browser, (m.get(browser) || 0) + 1);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [events]);

  const osData = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) {
      const { os } = parseUA(e.userAgent);
      m.set(os, (m.get(os) || 0) + 1);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [events]);

  const eventTypeData = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of events) m.set(e.eventName, (m.get(e.eventName) || 0) + 1);
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [events]);

  // ── Hourly activity heatmap (7-day x 24-hour) ──
  const heatmap = useMemo(() => {
    const days = 7;
    const matrix: number[][] = Array.from({ length: days }, () => new Array(24).fill(0));
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    for (const e of events) {
      const t = new Date(e.timestamp);
      if (isNaN(t.getTime())) continue;
      if (t < cutoff) continue;
      const dayDiff = Math.floor((now.getTime() - t.getTime()) / (24 * 60 * 60 * 1000));
      if (dayDiff < 0 || dayDiff >= days) continue;
      const dayIdx = days - 1 - dayDiff;
      const hour = t.getHours();
      if (hour < 0 || hour >= 24) continue;
      matrix[dayIdx][hour]++;
    }
    return matrix;
  }, [events]);

  const maxHeat = useMemo(() => Math.max(1, ...heatmap.flat()), [heatmap]);

  // ── Top pages by engagement ──
  const topPages = useMemo(() => {
    const m = new Map<string, { url: string; visits: number; clicks: number; visitors: Set<string> }>();
    for (const e of events) {
      if (!e.url) continue;
      const ex = m.get(e.url) || { url: e.url, visits: 0, clicks: 0, visitors: new Set<string>() };
      if (e.eventName === 'pageview') ex.visits++;
      if (e.eventName === 'click') ex.clicks++;
      ex.visitors.add(e.visitorId);
      m.set(e.url, ex);
    }
    return Array.from(m.values())
      .map(p => ({ url: p.url, visits: p.visits, clicks: p.clicks, visitors: p.visitors.size, engagement: p.visits > 0 ? p.clicks / p.visits : 0 }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6);
  }, [events]);

  const total = events.length || 1;

  const PieCard = ({ title, icon: Icon, data, colors }: { title: string; icon: React.ElementType; data: { name: string; value: number }[]; colors: string[] }) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
        {title}
      </h3>
      {data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} (${((v / total) * 100).toFixed(1)}%)`, n]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  const MetricCard = ({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) => (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );

  const dayLabels = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];

  return (
    <div className="space-y-6">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Insights</h2>
      </div>

      {/* Advanced metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={TrendingDown}
          label="Bounce Rate"
          value={`${bounceRate.toFixed(1)}%`}
          sub="Single-page sessions"
          color="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
        />
        <MetricCard
          icon={LogOut}
          label="Avg Exit Rate"
          value={exitPages.length ? `${(exitPages.reduce((s, p) => s + p.exitRate, 0) / exitPages.length).toFixed(1)}%` : '—'}
          sub="Top exit pages"
          color="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          icon={Activity}
          label="Events / Visitor"
          value={avgEventsPerVisitor.toFixed(1)}
          sub="Engagement depth"
          color="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          icon={Repeat}
          label="New vs Returning"
          value={`${newVisitors} / ${returningVisitors}`}
          sub={`${((newVisitors / (newVisitors + returningVisitors || 1)) * 100).toFixed(0)}% new`}
          color="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Pie charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PieCard title="Devices" icon={Monitor} data={deviceData} colors={PALETTE} />
        <PieCard title="Browsers" icon={Chrome} data={browserData} colors={PALETTE} />
        <PieCard title="Operating Systems" icon={Layers} data={osData} colors={PALETTE} />
        <PieCard title="Event Types" icon={MousePointer} data={eventTypeData} colors={PALETTE} />
      </div>

      {/* Hourly heatmap */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          Activity Heatmap
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Events by hour over the last 7 days</p>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Hour labels */}
            <div className="flex pl-16 mb-1">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-gray-400 dark:text-gray-500">{h % 6 === 0 ? `${h}h` : ''}</div>
              ))}
            </div>
            {heatmap.map((row, di) => (
              <div key={di} className="flex items-center mb-1">
                <div className="w-16 text-[10px] text-gray-400 dark:text-gray-500 pr-2 text-right">{dayLabels[di]}</div>
                <div className="flex flex-1 gap-0.5">
                  {row.map((v, hi) => {
                    const intensity = v / maxHeat;
                    const bg = v === 0
                      ? (isDark ? '#1f2937' : '#f3f4f6')
                      : `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`;
                    return (
                      <div
                        key={hi}
                        title={`${dayLabels[di]} ${hi}:00 — ${v} events`}
                        className="flex-1 h-6 rounded-sm transition-all hover:ring-2 hover:ring-indigo-400 cursor-pointer"
                        style={{ backgroundColor: bg }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top exit pages + Top pages by engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <LogOut className="h-4 w-4 text-rose-500 dark:text-rose-400" />
            Top Exit Pages
          </h3>
          {exitPages.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">Not enough data yet.</p>
          ) : (
            <div className="space-y-2">
              {exitPages.map(p => {
                let path = p.url;
                try { path = new URL(p.url).pathname; } catch {}
                return (
                  <div key={p.url} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{path}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${p.exitRate}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">{p.exitRate.toFixed(0)}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{p.exits}/{p.visits}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            Top Pages by Engagement
          </h3>
          {topPages.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No page data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topPages} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: tickFill }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="url" tick={{ fontSize: 10, fill: tickFill }} tickLine={false} axisLine={false} width={120}
                  tickFormatter={(v: string) => { try { return new URL(v).pathname; } catch { return v; } }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [v, n === 'visits' ? 'Visits' : n]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="visits" fill="#6366f1" radius={[0, 4, 4, 0]} name="Visits" />
                <Bar dataKey="clicks" fill="#10b981" radius={[0, 4, 4, 0]} name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvancedAnalytics;
