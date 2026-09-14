import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  fetchPlayers,
  fetchSchedule,
  fetchWeeklyStats,
  isPartialMeta,
  isStaleMeta,
} from './api/nflverseApi';
import {
  buildPprRankings,
  buildScheduleCards,
  buildWeeklyProjections,
} from './api/nflDataTransforms';

export const NewsContext = createContext();
export const StatsContext = createContext();

const SCHEDULE_PAGE_SIZE = 8;
const STATS_PAGE_SIZE = 12;
const DEFAULT_SEASON = new Date().getFullYear();

function normalizeError(error, fallbackMessage) {
  return {
    code: error?.code || 'NFL_DATA_UNAVAILABLE',
    message: error?.message || fallbackMessage,
    retryable: error?.status >= 500 || error?.name === 'AbortError',
  };
}

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(DEFAULT_SEASON);
  const [stale, setStale] = useState(false);
  const [partial, setPartial] = useState(false);
  const [meta, setMeta] = useState(null);
  const [dataKind, setDataKind] = useState('observed');

  const fetchStats = useCallback(
    async (mode = 'ppr') => {
      setLoading(true);
      setError(null);
      setPartial(false);
      setStale(false);

      try {
        const [playersResult, weeklyResult] = await Promise.allSettled([
          fetchPlayers(),
          fetchWeeklyStats(selectedSeason),
        ]);

        if (weeklyResult.status === 'rejected') {
          throw weeklyResult.reason;
        }

        const players =
          playersResult.status === 'fulfilled' ? playersResult.value.data : [];
        const weeklyStats = weeklyResult.value.data;
        const nextPartial =
          playersResult.status === 'rejected' ||
          isPartialMeta(weeklyResult.value.meta) ||
          (playersResult.status === 'fulfilled' &&
            isPartialMeta(playersResult.value.meta));
        const nextStats =
          mode === 'projection'
            ? buildWeeklyProjections({ players, weeklyStats })
            : buildPprRankings({ players, weeklyStats });

        setStats(nextStats);
        setScores(nextStats);
        setCurrentPage(1);
        setTotalPages(Math.max(1, Math.ceil(nextStats.length / STATS_PAGE_SIZE)));
        setPartial(nextPartial);
        setDataKind(mode === 'projection' ? 'estimated' : 'observed');
        setMeta({
          players: playersResult.status === 'fulfilled' ? playersResult.value.meta : null,
          weeklyStats: weeklyResult.value.meta,
          season: selectedSeason,
        });
        setStale(
          (playersResult.status === 'fulfilled' &&
            isStaleMeta(playersResult.value.meta)) ||
            isStaleMeta(weeklyResult.value.meta)
        );
      } catch (caughtError) {
        setStats([]);
        setScores([]);
        setTotalPages(1);
        setMeta(null);
        setError(
          normalizeError(
            caughtError,
            'Unable to load canonical NFL statistics right now.'
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedSeason]
  );

  const fetchScores = useCallback(async () => {
    await fetchStats('ppr');
  }, [fetchStats]);

  const contextValue = useMemo(
    () => ({
      stats,
      scores,
      loading,
      error,
      fetchStats,
      fetchScores,
      currentPage,
      setCurrentPage,
      totalPages,
      selectedPosition,
      setSelectedPosition,
      selectedSeason,
      setSelectedSeason,
      stale,
      partial,
      meta,
      dataKind,
    }),
    [
      stats,
      scores,
      loading,
      error,
      fetchStats,
      fetchScores,
      currentPage,
      totalPages,
      selectedPosition,
      selectedSeason,
      stale,
      partial,
      meta,
      dataKind,
    ]
  );

  return <StatsContext.Provider value={contextValue}>{children}</StatsContext.Provider>;
};

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSeason, setSelectedSeason] = useState(DEFAULT_SEASON);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const [partial, setPartial] = useState(false);
  const [meta, setMeta] = useState(null);

  const fetchNews = useCallback(async () => {
    setNews([]);
  }, []);

  const fetchSchedules = useCallback(
    async (page = 1) => {
      const requestedPage = Number.isInteger(Number(page)) ? Number(page) : 1;
      setLoaded(false);
      setError(null);
      setPartial(false);

      try {
        const result = await fetchSchedule(selectedSeason);
        const cards = buildScheduleCards(result.data);
        const filtered = selectedWeek
          ? cards.filter(game => Number(game.Week) === Number(selectedWeek))
          : cards;
        const pages = Math.max(1, Math.ceil(filtered.length / SCHEDULE_PAGE_SIZE));
        const boundedPage = Math.min(Math.max(requestedPage, 1), pages);
        const start = (boundedPage - 1) * SCHEDULE_PAGE_SIZE;

        setAllSchedules(filtered);
        setSchedules(filtered.slice(start, start + SCHEDULE_PAGE_SIZE));
        setTotalPages(pages);
        setCurrentPage(boundedPage);
        setMeta({ schedule: result.meta, season: selectedSeason });
        setStale(isStaleMeta(result.meta));
        setPartial(isPartialMeta(result.meta));
      } catch (caughtError) {
        setAllSchedules([]);
        setSchedules([]);
        setTotalPages(1);
        setCurrentPage(1);
        setMeta(null);
        setStale(false);
        setPartial(false);
        setError(
          normalizeError(caughtError, 'Unable to load the NFL schedule right now.')
        );
      } finally {
        setLoaded(true);
      }
    },
    [selectedSeason, selectedWeek]
  );

  const contextValue = useMemo(
    () => ({
      news,
      schedules,
      allSchedules,
      loaded,
      fetchNews,
      fetchSchedules,
      currentPage,
      setCurrentPage,
      totalPages,
      selectedSeason,
      setSelectedSeason,
      selectedWeek,
      setSelectedWeek,
      error,
      stale,
      partial,
      meta,
    }),
    [
      news,
      schedules,
      allSchedules,
      loaded,
      fetchNews,
      fetchSchedules,
      currentPage,
      totalPages,
      selectedSeason,
      selectedWeek,
      error,
      stale,
      partial,
      meta,
    ]
  );

  return <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>;
};
