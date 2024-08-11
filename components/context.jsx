import React, { createContext, useState, useCallback, useEffect } from 'react';

export const NewsContext = createContext();
export const StatsContext = createContext();

const apiKey = process.env.REACT_APP_MY_API_KEY;

if (!apiKey) {
  console.error('API key is not defined. Check your .env file.');
} else {
  console.log('API Key:', apiKey); // Log API key to ensure it is loaded
}

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoaded(false);
    console.log('Fetching news...'); // Log fetch start
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/scores/json/News?key=${apiKey}`
      );
      console.log('Response status:', response.status); // Log response status
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      console.log('News data:', data); // Log fetched data
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoaded(true);
      console.log('News fetch complete. Loaded:', loaded); // Log when fetch is complete
    }
  }, [apiKey]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <NewsContext.Provider
      value={{ news, search, setSearch, loaded, fetchNews }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching stats...'); // Log fetch start
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2024REG/7?key=${apiKey}`
      );
      console.log('Response status:', response.status); // Log response status
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      console.log('Stats data:', data); // Log fetched data
      setStats(data);
    } catch (error) {
      setError(error);
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      console.log('Stats fetch complete. Loading:', loading); // Log when fetch is complete
    }
  }, [apiKey]);

  const fetchScores = useCallback(
    async (season, week) => {
      setLoading(true);
      setError(null);
      console.log('Fetching scores...'); // Log fetch start
      try {
        const response = await fetch(
          `https://api.sportsdata.io/v3/nfl/scores/json/ScoresBasicFinal/${season}/${week}?key=${apiKey}`
        );
        console.log('Response status:', response.status); // Log response status
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        console.log('Scores data:', data); // Log fetched data
        setScores(data);
      } catch (error) {
        setError(error);
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
        console.log('Scores fetch complete. Loading:', loading); // Log when fetch is complete
      }
    },
    [apiKey]
  );

  const itemsPerPage = 12;
  const totalPages = Math.ceil(stats.length / itemsPerPage);
  const currentStats = stats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log('Total Pages:', totalPages);
  console.log('Current stats:', currentStats); // Log current stats

  return (
    <StatsContext.Provider
      value={{
        stats: currentStats,
        scores,
        loading,
        error,
        fetchStats,
        fetchScores,
        currentPage,
        setCurrentPage,
        totalPages,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
};
