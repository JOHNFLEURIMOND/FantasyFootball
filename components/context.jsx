import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

export const NewsContext = createContext();
export const StatsContext = createContext();

const apiKey = process.env.REACT_APP_MY_API_KEY;

if (!apiKey) {
  console.error('API key is not defined. Check your .env file.');
}

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoaded(false);
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/scores/json/News?key=${apiKey}`
      );
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const contextValue = useMemo(
    () => ({
      news,
      search,
      setSearch,
      loaded,
      fetchNews,
    }),
    [news, search, loaded, fetchNews]
  );

  return (
    <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>
  );
};

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosition, setSelectedPosition] = useState('');
  const itemsPerPage = 12;

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2024REG/7?key=${apiKey}`
      );
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();

      // Ensure no duplicate PlayerIDs
      const uniqueStats = data.reduce((acc, player) => {
        if (!acc.some(p => p.PlayerID === player.PlayerID)) {
          acc.push(player);
        }
        return acc;
      }, []);

      // Sort the stats based on a criteria, e.g., by Player Name
      uniqueStats.sort((a, b) => a.Name.localeCompare(b.Name));

      setStats(uniqueStats);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScores = useCallback(async (season, week) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/scores/json/ScoresBasicFinal/${season}/${week}?key=${apiKey}`
      );
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setScores(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchScores();
  }, [fetchStats, fetchScores]);

  // Filter stats based on the selected position
  const filteredStats = useMemo(() => {
    if (selectedPosition) {
      return stats.filter(player => player.Position === selectedPosition);
    }
    return stats;
  }, [stats, selectedPosition]);

  // Paginate the filtered stats ensuring 12 items per page
  const paginatedStats = useMemo(() => {
    const filledStats = [...filteredStats];

    // Fill in any empty slots with other available players to ensure no empty pages
    while (filledStats.length % itemsPerPage !== 0) {
      const nextPlayer = stats.find(player => !filledStats.includes(player));
      if (nextPlayer) filledStats.push(nextPlayer);
      else break; // Stop if no more players are available
    }

    return filledStats.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredStats, currentPage, itemsPerPage, stats]);

  const totalPages = useMemo(
    () => Math.ceil(filteredStats.length / itemsPerPage),
    [filteredStats.length, itemsPerPage]
  );

  const contextValue = useMemo(
    () => ({
      stats: paginatedStats,
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
    }),
    [
      paginatedStats,
      scores,
      loading,
      error,
      fetchStats,
      fetchScores,
      currentPage,
      totalPages,
      selectedPosition,
    ]
  );

  return (
    <StatsContext.Provider value={contextValue}>
      {children}
    </StatsContext.Provider>
  );
};
