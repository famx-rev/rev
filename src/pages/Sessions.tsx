import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Calendar, Monitor, User, Clock, Globe, MousePointer, MapPin, Trash2, AlertTriangle, X, Info, ExternalLink, Chrome, ChevronDown } from 'lucide-react';
import { useProject } from '../App';

interface SessionMeta {
  id: number;
  sessionId: string;
  visitorId: string;
  ip: string;
  url: string;
  userAgent: string;
  screenResolution: string;
  viewportWidth?: number;
  viewportHeight?: number;
  timestamp: string;
  recordedAt: string;
  events?: any[];
}

function Sessions() {
  const { selectedProject } = useProject();
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const PAGE_LIMIT = 50;

  const [selectedSession, setSelectedSession] = useState<SessionMeta | null>(null);
  const [fetchingReplay, setFetchingReplay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerDimensions, setPlayerDimensions] = useState({ width: 1024, height: 576 });

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Scroll container + sentinel refs for infinite scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const [sessionToDelete, setSessionToDelete] = useState<SessionMeta | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionMeta | null>(null);

  // Keep latest hasMore/loadingMore in refs so the observer callback
  // (created once) always reads fresh values without needing to be re-created.
  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const offsetRef = useRef(offset);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  // Fetch initial session list metadata
  const fetchSessions = useCallback(async (currentOffset: number, isInitial = false) => {
    if (!selectedProject) return;

    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    setError(null);

    try {
      const res = await fetch(
        `https://api1-orpin.vercel.app/api/custom/${selectedProject.id}/session?limit=${PAGE_LIMIT}&offset=${currentOffset}`
      );
      if (!res.ok) throw new Error('Failed to fetch sessions');

      const data = await res.json();
      const fetchedRows: SessionMeta[] = data.sessions || [];

      // Check if we reached the end of records
      if (fetchedRows.length < PAGE_LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setSessions((prev) => {
        const combined = isInitial ? fetchedRows : [...prev, ...fetchedRows];

        // Deduplicate rows by sessionId
        const map = new Map<string, SessionMeta>();
        combined.forEach((item) => {
          if (item.sessionId && !map.has(item.sessionId)) {
            map.set(item.sessionId, item);
          }
        });

        return Array.from(map.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    setSelectedSession(null);
    fetchSessions(0, true);
  }, [selectedProject, fetchSessions]);

  const handleLoadMore = useCallback(() => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    const nextOffset = offsetRef.current + PAGE_LIMIT;
    setOffset(nextOffset);
    fetchSessions(nextOffset, false);
  }, [fetchSessions]);

  // Auto-load more sessions when the sentinel div scrolls into view
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { root, rootMargin: '150px', threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore, sessions.length > 0]);

  // Fetch complete event payload on demand when playing/viewing details
  const loadFullSession = async (session: SessionMeta): Promise<SessionMeta | null> => {
    if (session.events && session.events.length > 0) return session;

    setFetchingReplay(true);
    try {
      const res = await fetch(
        `https://api1-orpin.vercel.app/api/custom/${selectedProject?.id}/session/${session.sessionId}`
      );
      if (!res.ok) throw new Error('Failed to fetch replay data');

      const fullData = await res.json();
      const rawEvents = fullData.events || [];

      const parsedEvents = rawEvents
        .map((e: any) => {
          if (typeof e === 'string') {
            try { return JSON.parse(e); } catch { return null; }
          }
          return e;
        })
        .filter((e: any) => e !== null && e.type !== undefined && e.timestamp !== undefined)
        .sort((a: any, b: any) => a.timestamp - b.timestamp);

      const updatedSession: SessionMeta = {
        ...session,
        ...fullData,
        events: parsedEvents,
      };

      setSessions((prev) =>
        prev.map((s) => (s.sessionId === session.sessionId ? updatedSession : s))
      );

      setFetchingReplay(false);
      return updatedSession;
    } catch (err) {
      console.error('Error loading replay events:', err);
      setError('Failed to load session replay data');
      setFetchingReplay(false);
      return null;
    }
  };

  const handleSelectSession = async (session: SessionMeta) => {
    const fullSession = await loadFullSession(session);
    if (fullSession) {
      setSelectedSession(fullSession);
    }
  };

  const handleOpenInfo = async (session: SessionMeta) => {
    const fullSession = await loadFullSession(session);
    if (fullSession) {
      setSessionInfo(fullSession);
    }
  };

  // Clean up Svelte instance for rrweb player
  const cleanupPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.$destroy === 'function') {
          playerRef.current.$destroy();
        } else if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (e) {
        console.warn('Error destroying player instance:', e);
      }
      playerRef.current = null;
    }
  }, []);

  const calculateDimensions = useCallback(() => {
    if (!wrapperRef.current) return { width: 1024, height: 576 };
    const wrapperWidth = wrapperRef.current.clientWidth;
    const aspectRatio = 16 / 9;
    const width = Math.max(320, wrapperWidth - 48);
    const height = Math.round(width / aspectRatio);
    return { width, height };
  }, []);

  useEffect(() => {
    const handleResize = () => setPlayerDimensions(calculateDimensions());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateDimensions, selectedSession]);

  useEffect(() => cleanupPlayer, [cleanupPlayer]);

  // Render rrweb Player
  useEffect(() => {
    if (!selectedSession || !containerRef.current) return;

    cleanupPlayer();
    containerRef.current.innerHTML = '';

    let cancelled = false;

    const initPlayer = async () => {
      try {
        const { default: rrwebPlayer } = await import('rrweb-player');
        await import('rrweb-player/dist/style.css');

        if (cancelled || !containerRef.current) return;

        const events = selectedSession.events || [];
        const orderedEvents = events
          .filter((e: any) => e.type === 2 || e.type === 3 || e.type === 4)
          .sort((a: any, b: any) => a.timestamp - b.timestamp);

        const fullSnapshot = orderedEvents.find((e: any) => e.type === 2);

        if (!fullSnapshot) {
          containerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #6b7280; background: #f3f4f6; border-radius: 8px;">
              <p>Session recording is incomplete (missing initial snapshot)</p>
            </div>
          `;
          return;
        }

        let recordedWidth = 1280;
        let recordedHeight = 720;

        if (selectedSession.viewportWidth && selectedSession.viewportHeight) {
          recordedWidth = selectedSession.viewportWidth;
          recordedHeight = selectedSession.viewportHeight;
        } else if (selectedSession.screenResolution) {
          const [w, h] = selectedSession.screenResolution.split('x').map(Number);
          if (w && h) {
            recordedWidth = w;
            recordedHeight = h;
          }
        }

        const containerWidth = containerRef.current.clientWidth || 800;
        const aspectRatio = recordedWidth / recordedHeight;
        const playerWidth = containerWidth;
        const playerHeight = Math.round(playerWidth / aspectRatio);

        if (cancelled || !containerRef.current) return;

        const newPlayer = new rrwebPlayer({
          target: containerRef.current,
          props: {
            events: orderedEvents,
            width: playerWidth,
            height: playerHeight,
            skipInactive: true,
            showController: true,
            autoPlay: false,
            speedOption: [0.5, 1, 2, 4],
            mouseTail: {
              duration: 1.5,
              lineCap: 'round',
              lineWidth: 3,
              strokeStyle: '#ef4444',
            },
            tagsColor: {
              click: '#22c55e',
              scroll: '#3b82f6',
              input: '#f59e0b',
            },
          },
        });

        playerRef.current = newPlayer;
        if (!cancelled) setPlayerDimensions({ width: playerWidth, height: playerHeight });
      } catch (error) {
        if (cancelled) return;
        console.error('Error mounting player:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #ef4444; background: #fef2f2; border-radius: 8px;">
              <p>Failed to initialize player: ${error}</p>
            </div>
          `;
        }
      }
    };

    const timer = setTimeout(initPlayer, 50);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedSession, cleanupPlayer]);

  const handleDeleteSession = async (session: SessionMeta) => {
    if (!selectedProject) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `https://api1-orpin.vercel.app/api/custom/${selectedProject.id}/session/${session.sessionId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.sessionId !== session.sessionId));
        if (selectedSession?.sessionId === session.sessionId) {
          setSelectedSession(null);
          cleanupPlayer();
        }
        setSessionToDelete(null);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to delete session');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session');
    } finally {
      setDeleting(false);
    }
  };

  const formatDuration = (events?: any[]) => {
    if (!events || events.length < 2) return '0s';
    const timestamps = events.map((e: any) => e.timestamp).filter((t: any) => typeof t === 'number');
    if (timestamps.length < 2) return '0s';
    const seconds = Math.floor((Math.max(...timestamps) - Math.min(...timestamps)) / 1000);
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatEventCount = (events?: any[]) => events ? events.length : 0;

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <Globe className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Project Selected</h2>
          <p className="text-gray-500 dark:text-gray-400">Select a project from the sidebar to view sessions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Project:</span>
          <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">{selectedProject.name}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Session Recordings</h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-12 text-center">
            <Play className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions recorded</h3>
            <p className="text-gray-500 dark:text-gray-400">Sessions will appear here when visitors interact with your site.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Session List Column */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions ({sessions.length})</h2>
              </div>
              <div
                ref={scrollContainerRef}
                className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-280px)] overflow-y-auto flex-1"
              >
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`flex items-center gap-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      selectedSession?.sessionId === session.sessionId ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleSelectSession(session)}
                      className="flex-1 text-left space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {session.events ? formatDuration(session.events) : 'Click to load'}
                        </span>
                        {session.events && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            ({formatEventCount(session.events)} events)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {session.visitorId ? `${session.visitorId.slice(0, 8)}...` : 'Unknown'}
                        </span>
                      </div>
                      {session.ip && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-emerald-400 dark:text-emerald-500" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                            {session.ip}
                          </span>
                        </div>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSelectSession(session)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                        title="Play session"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInfo(session);
                        }}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session);
                        }}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Infinite scroll sentinel - triggers auto-load when scrolled into view */}
                {hasMore && (
                  <div ref={loadMoreSentinelRef} className="p-4 flex justify-center items-center h-14">
                    {loadingMore && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 dark:border-indigo-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Replay Player Column */}
            <div className="lg:col-span-2" ref={wrapperRef}>
              {fetchingReplay ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Fetching session events...</p>
                </div>
              ) : selectedSession ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 dark:from-gray-800/50 to-white dark:to-gray-900">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
                          <Play className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Session Replay</h2>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            {new Date(selectedSession.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <Monitor className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{selectedSession.screenResolution || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <MousePointer className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDuration(selectedSession.events)}</span>
                        </div>
                        {selectedSession.ip && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                            <MapPin className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-mono">{selectedSession.ip}</span>
                          </div>
                        )}
                        <button
                          onClick={() => setSessionToDelete(selectedSession)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div
                      ref={containerRef}
                      className="w-full bg-white dark:bg-gray-800 rounded-lg"
                      style={{ minHeight: '450px' }}
                    />
                  </div>

                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MousePointer className="h-4 w-4" />
                          <span className="font-medium">{formatEventCount(selectedSession.events)}</span> events
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span>Duration: <span className="font-medium">{formatDuration(selectedSession.events)}</span></span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs font-mono truncate max-w-[200px]" title={selectedSession.visitorId}>
                        ID: {selectedSession.sessionId ? selectedSession.sessionId.slice(0, 16) : ''}...
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Play className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Select a session to watch the replay</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Click on any session from the list</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Session Recording?</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This will permanently delete this session recording and all its event data. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSessionToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSession(sessionToDelete)}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {sessionInfo && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-300" />
                  <h2 className="font-semibold">Session Details</h2>
                </div>
                <button onClick={() => setSessionInfo(null)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {sessionInfo.url && (
                <div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Website</span>
                  <a href={sessionInfo.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 break-all text-xs font-medium flex items-center gap-1 mt-1">
                    {sessionInfo.url}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Visitor</span>
                  <p className="font-mono text-xs text-slate-700 dark:text-gray-300 mt-1">{sessionInfo.visitorId ? `${sessionInfo.visitorId.slice(0, 10)}...` : 'Unknown'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">IP</span>
                  <p className="font-mono text-xs text-slate-700 dark:text-gray-300 mt-1">{sessionInfo.ip || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-slate-50 dark:bg-gray-800/50 border-t border-slate-100 dark:border-gray-800 flex items-center gap-2">
              <button onClick={() => setSessionInfo(null)} className="flex-1 py-2 text-sm text-slate-600 dark:text-gray-400 hover:bg-white rounded-lg">Close</button>
              <button onClick={() => { setSelectedSession(sessionInfo); setSessionInfo(null); }} className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1">
                <Play className="h-3.5 w-3.5" /> Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sessions;
