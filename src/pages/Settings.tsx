import React, { useState, useEffect } from 'react';
import {
  Trash2, AlertTriangle, Settings as SettingsIcon, Database, CreditCard,
  BarChart3, Check, X, Zap, Crown, Building2, Sparkles, TrendingUp, Calendar,
} from 'lucide-react';
import { useProject } from '../App';

interface UsageData {
  userId: string;
  plan: string;
  billingCycleStart: string;
  billingCycleEnd: string;
  usage: {
    events: { used: number; limit: number };
    sessions: { used: number; limit: number };
    projects: { used: number; limit: number };
    storage: { used: number; limit: number };
  };
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const PLAN_PRICES: Record<string, string> = {
  free: '$0',
  pro: '$29',
  enterprise: '$99',
};

const PLAN_PERIODS: Record<string, string> = {
  free: 'forever',
  pro: '/mo',
  enterprise: '/mo',
};

const PLAN_ICONS: Record<string, React.ElementType> = {
  free: Zap,
  pro: Crown,
  enterprise: Building2,
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  free: 'Perfect for getting started with basic analytics.',
  pro: 'Advanced analytics and higher limits for growing teams.',
  enterprise: 'Maximum capacity and priority support for large organizations.',
};

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['10K events/mo', '1K sessions/mo', '3 projects', '100 MB storage'],
  pro: ['100K events/mo', '10K sessions/mo', '25 projects', '5 GB storage', 'Priority support'],
  enterprise: ['1M events/mo', '100K sessions/mo', 'Unlimited projects', '50 GB storage', 'Dedicated support', 'Custom SLAs'],
};

const PLAN_ACCENTS: Record<string, { border: string; bg: string; text: string; ring: string; glow: string }> = {
  free: {
    border: 'border-gray-200 dark:border-gray-700',
    bg: 'bg-white dark:bg-gray-800/50',
    text: 'text-gray-600 dark:text-gray-400',
    ring: 'ring-gray-300 dark:ring-gray-600',
    glow: '',
  },
  pro: {
    border: 'border-blue-500 dark:border-blue-500',
    bg: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-gray-900',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-400 dark:ring-blue-500',
    glow: 'shadow-lg shadow-blue-100 dark:shadow-blue-950/30',
  },
  enterprise: {
    border: 'border-emerald-500 dark:border-emerald-500',
    bg: 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-gray-900',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-400 dark:ring-emerald-500',
    glow: 'shadow-lg shadow-emerald-100 dark:shadow-emerald-950/30',
  },
};

const PLAN_BADGE_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  pro: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  enterprise: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
};

function getUserId(): string {
  try {
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      const user = JSON.parse(authUser);
      return user.id || '';
    }
  } catch {}
  return '';
}

/* ── Skeleton primitives ─────────────────────────────────────── */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200/70 dark:bg-gray-700/50 ${className}`} />;
}

function UsageBarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-4 w-28" />
      </div>
      <SkeletonBlock className="h-2.5 w-full rounded-full" />
      <div className="flex justify-between">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-20" />
      </div>
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <SkeletonBlock className="h-6 w-16 mb-3" />
      <SkeletonBlock className="h-4 w-full mb-2" />
      <SkeletonBlock className="h-4 w-3/4 mb-4" />
      <SkeletonBlock className="h-9 w-full rounded-lg" />
    </div>
  );
}

/* ── Usage bar ──────────────────────────────────────────────── */

function UsageBar({ label, used, limit, unit }: { label: string; used: number; limit: number; unit?: string }) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  const barColor = isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500';
  const textColor = isCritical ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className={`text-sm font-medium ${textColor}`}>
          {used.toLocaleString()} / {limit.toLocaleString()}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">{percentage.toFixed(1)}% used</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{(limit - used).toLocaleString()} remaining</span>
      </div>
    </div>
  );
}

/* ── Settings ───────────────────────────────────────────────── */

function Settings() {
  const { selectedProject, projects, setProjects, setSelectedProject } = useProject();
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deleteDataResult, setDeleteDataResult] = useState<{ deletedEvents: number; deletedSessions: number } | null>(null);
  const [projectDeleted, setProjectDeleted] = useState(false);

  const [usage, setUsage] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [planUpdating, setPlanUpdating] = useState(false);
  const [planUpdateMsg, setPlanUpdateMsg] = useState<string | null>(null);

  const userId = getUserId();

  useEffect(() => {
    if (!userId) {
      setUsageLoading(false);
      return;
    }
    setUsageLoading(true);
    fetch(`https://api1-orpin.vercel.app/api/usage/${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch usage');
        return res.json();
      })
      .then((data) => setUsage(data))
      .catch((err) => console.error('Usage fetch error:', err))
      .finally(() => setUsageLoading(false));
  }, [userId, projects.length]);

  const handleDeleteAllData = async () => {
    if (!selectedProject) return;
    setDeletingData(true);
    try {
      const res = await fetch(`https://api1-orpin.vercel.app/api/${selectedProject.id}/data`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const result = await res.json();
        setDeleteDataResult({ deletedEvents: result.deletedEvents, deletedSessions: result.deletedSessions });
        setShowDeleteDataModal(false);
      } else {
        const error = await res.json();
        alert(`Failed to delete data: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data. Please try again.');
    } finally {
      setDeletingData(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!userId) {
      alert('Unable to delete project: missing user ID. Please log in again.');
      return;
    }
    setDeletingProject(true);
    try {
      const res = await fetch(
        `https://api1-orpin.vercel.app/api/projects/${selectedProject.id}?userId=${encodeURIComponent(userId)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        const updated = projects.filter((p) => p.id !== selectedProject.id);
        setProjects(updated);
        setSelectedProject(updated[0] || null);
        setShowDeleteProjectModal(false);
        setProjectDeleted(true);
        setTimeout(() => setProjectDeleted(false), 4000);
      } else {
        const error = await res.json();
        alert(`Failed to delete project: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingProject(false);
    }
  };

  const handlePlanChange = async (newPlan: string) => {
    if (!userId) return;
    setPlanUpdating(true);
    setPlanUpdateMsg(null);
    try {
      const res = await fetch(`https://api1-orpin.vercel.app/api/usage/${encodeURIComponent(userId)}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsage((prev) => (prev ? { ...prev, plan: data.plan } : prev));
        setPlanUpdateMsg(`Plan updated to ${PLAN_LABELS[data.plan] || data.plan}`);
        setTimeout(() => setPlanUpdateMsg(null), 3000);
      } else {
        alert('Failed to update plan');
      }
    } catch (error) {
      console.error('Plan update error:', error);
      alert('Failed to update plan. Please try again.');
    } finally {
      setPlanUpdating(false);
    }
  };

  /* ── No project state ────────────────────────────────────── */

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
            <SettingsIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Project Selected</h2>
          <p className="text-gray-500 dark:text-gray-400">Select a project from the sidebar to manage settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1.5">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your project, subscription plan, and data.</p>
        </div>

        {/* Success banner */}
        {projectDeleted && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-emerald-800 dark:text-emerald-400 text-sm font-medium">Project deleted successfully.</p>
          </div>
        )}

        {/* ── Project Info ─────────────────────────────────── */}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Database className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide font-medium">Project Name</span>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedProject.name}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide font-medium">Domain</span>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedProject.domain || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide font-medium">Project ID</span>
              <p className="font-mono text-gray-700 dark:text-gray-300 text-xs mt-0.5">{selectedProject.id}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide font-medium">Tracking ID</span>
              <p className="font-mono text-gray-700 dark:text-gray-300 text-xs mt-0.5">{selectedProject.trackingId}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide font-medium">Created</span>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                {new Date(selectedProject.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Usage & Plan ─────────────────────────────────── */}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Usage &amp; Plan</h2>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 ml-11">Track resource usage and manage your subscription.</p>

          {usageLoading ? (
            /* Skeleton loading state */
            <div className="animate-pulse">
              {/* Current plan skeleton */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <SkeletonBlock className="h-3 w-20 mb-2" />
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-7 w-20 rounded-full" />
                    <SkeletonBlock className="h-4 w-32" />
                  </div>
                </div>
              </div>

              {/* Usage bars skeleton */}
              <div className="space-y-5 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <SkeletonBlock className="h-4 w-4 rounded" />
                  <SkeletonBlock className="h-4 w-28" />
                </div>
                <UsageBarSkeleton />
                <UsageBarSkeleton />
                <UsageBarSkeleton />
                <UsageBarSkeleton />
              </div>

              {/* Plan cards skeleton */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <SkeletonBlock className="h-5 w-28 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PlanCardSkeleton />
                  <PlanCardSkeleton />
                  <PlanCardSkeleton />
                </div>
              </div>
            </div>
          ) : !usage ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-6 w-6 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Unable to load usage data. Please try again later.</p>
            </div>
          ) : (
            <>
              {/* Current plan badge */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 font-medium">Current Plan</p>
                  <div className="flex items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${PLAN_BADGE_COLORS[usage.plan] || PLAN_BADGE_COLORS.free}`}>
                      {PLAN_LABELS[usage.plan] || usage.plan}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Renews {new Date(usage.billingCycleEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                {planUpdateMsg && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in duration-200">
                    <Check className="h-4 w-4" /> {planUpdateMsg}
                  </span>
                )}
              </div>

              {/* Usage bars */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resource Usage</h3>
                </div>
                <UsageBar label="Events" used={usage.usage.events.used} limit={usage.usage.events.limit} />
                <UsageBar label="Sessions" used={usage.usage.sessions.used} limit={usage.usage.sessions.limit} />
                <UsageBar label="Projects" used={usage.usage.projects.used} limit={usage.usage.projects.limit} />
                <UsageBar label="Storage" used={usage.usage.storage.used} limit={usage.usage.storage.limit} unit="MB" />
              </div>

              {/* Plan selector — premium SaaS cards */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Change Plan</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(['free', 'pro', 'enterprise'] as const).map((planKey) => {
                    const isActive = usage.plan === planKey;
                    const Icon = PLAN_ICONS[planKey];
                    const accent = PLAN_ACCENTS[planKey];
                    const features = PLAN_FEATURES[planKey] || [];

                    return (
                      <div
                        key={planKey}
                        className={`relative rounded-2xl border-2 p-5 transition-all duration-300 ${accent.border} ${accent.bg} dark:bg-opacity-5 ${
                          isActive ? `ring-2 ${accent.ring} ${accent.glow}` : 'hover:shadow-md hover:-translate-y-0.5'
                        } ${planUpdating ? 'opacity-60' : ''}`}
                      >
                        {planKey === 'pro' && !isActive && (
                          <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-sm">
                            Popular
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-5 w-5 ${accent.text}`} />
                          <span className="font-semibold text-gray-900 dark:text-white">{PLAN_LABELS[planKey]}</span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{PLAN_PRICES[planKey]}</span>
                          <span className="text-sm text-gray-400 dark:text-gray-500">{PLAN_PERIODS[planKey]}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{PLAN_DESCRIPTIONS[planKey]}</p>
                        <ul className="space-y-1.5 mb-5">
                          {features.map((feat) => (
                            <li key={feat} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Check className={`h-3.5 w-3.5 flex-shrink-0 ${accent.text}`} />
                              {feat}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => !isActive && handlePlanChange(planKey)}
                          disabled={planUpdating || isActive}
                          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            isActive
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default'
                              : planKey === 'free'
                              ? 'bg-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-700'
                              : planKey === 'pro'
                              ? 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-600 shadow-sm hover:shadow'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600 dark:hover:bg-emerald-600 shadow-sm hover:shadow'
                          } disabled:cursor-not-allowed`}
                        >
                          {isActive ? 'Current Plan' : planUpdating ? 'Updating...' : `Switch to ${PLAN_LABELS[planKey]}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Danger Zone ──────────────────────────────────── */}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-red-100 dark:border-red-900/50">
          <div className="bg-red-50 dark:bg-red-950/40 px-6 py-4 border-b border-red-100 dark:border-red-900/50 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Delete all data */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Delete All Project Data</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Permanently delete all events and session recordings for this project. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteDataModal(true);
                  setDeleteDataResult(null);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap text-sm font-medium shadow-sm hover:shadow"
              >
                <Trash2 className="h-4 w-4" />
                Delete Data
              </button>
            </div>

            {deleteDataResult && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-800 dark:text-emerald-400 text-sm">
                  Successfully deleted {deleteDataResult.deletedEvents} events and {deleteDataResult.deletedSessions} sessions.
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Delete project */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Delete Project</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Permanently delete this project along with all its events, sessions, and settings. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteProjectModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap text-sm font-medium shadow-sm hover:shadow"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </button>
            </div>
          </div>
        </div>

        {/* ── Delete Data Modal ────────────────────────────── */}

        {showDeleteDataModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-100 dark:bg-red-900/50 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete All Data?</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                This will permanently delete all events and session recordings for project <strong>"{selectedProject.name}"</strong>. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteDataModal(false)}
                  disabled={deletingData}
                  className="px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllData}
                  disabled={deletingData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
                >
                  {deletingData ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete All Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Project Modal ─────────────────────────── */}

        {showDeleteProjectModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-100 dark:bg-red-900/50 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Project?</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                This will permanently delete the project <strong>"{selectedProject.name}"</strong> along with all its events, sessions, and settings.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6 font-medium">
                This action cannot be undone. All data associated with this project will be lost forever.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteProjectModal(false)}
                  disabled={deletingProject}
                  className="px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={deletingProject}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
                >
                  {deletingProject ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
