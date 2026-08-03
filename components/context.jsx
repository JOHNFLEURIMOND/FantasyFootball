import React, {
  createContext,
  useMemo,
} from 'react';

// Contexts
export const NewsContext = createContext();
export const StatsContext = createContext();

const noop = () => {};

export const NewsProvider = ({ children }) => {
  const contextValue = useMemo(
    () => ({
      news: [],
      schedules: [],
      loaded: true,
      fetchNews: noop,
      fetchSchedules: noop,
      currentPage: 1,
      setCurrentPage: noop,
      totalPages: 1,
    }),
    []
  );

  return <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>;
};

export const StatsProvider = ({ children }) => {
  const contextValue = useMemo(
    () => ({
      stats: [],
      scores: [],
      loading: false,
      error: null,
      fetchStats: noop,
      fetchScores: noop,
      currentPage: 1,
      setCurrentPage: noop,
      totalPages: 1,
      selectedPosition: '',
      setSelectedPosition: noop,
    }),
    []
  );

  return <StatsContext.Provider value={contextValue}>{children}</StatsContext.Provider>;
};
