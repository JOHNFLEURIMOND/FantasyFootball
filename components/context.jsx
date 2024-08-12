import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

// Contexts
export const NewsContext = createContext();
export const StatsContext = createContext();

// API Key
const apiKey = process.env.REACT_APP_MY_API_KEY;
if (!apiKey) {
  console.error('API key is not defined. Check your .env file.');
}

// NewsProvider Component
export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Fetch News
  const fetchNews = useCallback(async () => {
    setLoaded(false);
    console.log('Fetching news...');
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/scores/json/News?key=${apiKey}`
      );
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      console.log('Fetched news data:', data);
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Fetch Schedules
  const fetchSchedules = useCallback(
    async (page = 1) => {
      setLoaded(false);
      console.log('Fetching schedules for page:', page);
      try {
        const response = await fetch(
          `https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2024?key=${apiKey}`
        );
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        console.log('Fetched schedules data:', data);

        const sortedData = data
          .filter(schedule => !schedule.Canceled)
          .sort((a, b) =>
            a.Week !== b.Week
              ? a.Week - b.Week
              : new Date(a.Date) - new Date(b.Date)
          );

        const totalSchedules = sortedData.length;
        const totalPages = Math.ceil(totalSchedules / itemsPerPage);

        const startIndex = (page - 1) * itemsPerPage;
        const paginatedData = sortedData.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        setSchedules(paginatedData);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoaded(true);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    fetchNews();
    fetchSchedules(currentPage);
  }, [fetchNews, fetchSchedules, currentPage]);

  // Context value
  const contextValue = useMemo(
    () => ({
      news,
      schedules,
      loaded,
      fetchNews,
      fetchSchedules,
      currentPage,
      setCurrentPage,
      totalPages,
    }),
    [
      news,
      schedules,
      loaded,
      fetchNews,
      fetchSchedules,
      currentPage,
      totalPages,
    ]
  );

  return (
    <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>
  );
};

// StatsProvider Component
export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosition, setSelectedPosition] = useState('');
  const itemsPerPage = 12;

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching stats...');
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2024REG/7?key=${apiKey}`
      );
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      console.log('Fetched stats data:', data);

      const uniqueStats = data
        .filter(
          (value, index, self) =>
            index === self.findIndex(t => t.PlayerID === value.PlayerID)
        )
        .sort((a, b) => a.Name.localeCompare(b.Name));

      setStats(uniqueStats);
    } catch (error) {
      setError(error);
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      console.log('Stats loading complete');
    }
  }, []);

  // Fetch Scores
  const fetchScores = useCallback(async (season = '2024', week = '7') => {
    setLoading(true);
    setError(null);
    console.log('Fetching scores...');
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/scores/json/ScoresBasicFinal/${season}/${week}?key=${apiKey}`
      );
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      console.log('Fetched scores data:', data);
      setScores(data);
    } catch (error) {
      setError(error);
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
      console.log('Scores loading complete');
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchScores();
  }, [fetchStats, fetchScores]);

  // Filter and paginate stats
  const filteredStats = useMemo(
    () =>
      selectedPosition
        ? stats.filter(player => player.Position === selectedPosition)
        : stats,
    [stats, selectedPosition]
  );

  const paginatedStats = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return filteredStats.slice(start, end);
  }, [filteredStats, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredStats.length / itemsPerPage),
    [filteredStats.length, itemsPerPage]
  );

  // Context value
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
