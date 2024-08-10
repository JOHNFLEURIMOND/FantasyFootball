// src/contexts.js
import React, { createContext, useState, useCallback } from 'react';

// Create NewsContext
export const NewsContext = createContext();

// Create StatsContext
export const StatsContext = createContext();
const apiKey = process.env.REACT_APP_MY_API_KEY;

// Provider component for NewsContext
export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Fetch news data and update state
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
  }, []); // Dependency array is empty, so fetchNews will not change

  return (
    <NewsContext.Provider
      value={{ news, search, setSearch, loaded, fetchNews }}
    >
      {children}
    </NewsContext.Provider>
  );
};

// Provider component for StatsContext
export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Define items per page for pagination

  // Fetch stats data and update state
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/7?key=${apiKey}`
      );
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []); // Dependency array is empty, so fetchStats will not change

  // Fetch scores data and update state
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
      console.error('Error fetching scores:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []); // Dependency array is empty, so fetchScores will not change

  // Calculate pagination details
  const totalPages = Math.ceil(stats.length / itemsPerPage);
  const currentStats = stats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <StatsContext.Provider
      value={{
        stats,
        scores,
        loading,
        error,
        fetchStats,
        fetchScores,
        currentPage,
        setCurrentPage, // Ensure this is a function
        currentStats,
        totalPages,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
};
