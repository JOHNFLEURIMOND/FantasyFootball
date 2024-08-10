import React, { useContext, useEffect } from 'react';
import WeeklyProjectionCards from './WeeklyProjectionCards';
import { StatsContext } from '../context'; // Updated import path
import { MainContainer, Title } from './index';
import MainHero from '../MainHero/MainHero';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import GlobalStyle from '../CSS/global-style';

function WeeklyProjections() {
  const { stats, loading, error, fetchStats } = useContext(StatsContext);

  useEffect(() => {
    // Replace 'YOUR_API_KEY' with the actual API key or logic to retrieve it
    fetchStats('YOUR_API_KEY');
  }, [fetchStats]);

  return (
    <>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <MainContainer>
        <Title>Fantasy Football Projections</Title>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <WeeklyProjectionCards stats={stats} loading={loading} />
            {error && <p>Error loading stats: {error.message}</p>}
          </>
        )}
      </MainContainer>
      <Footer />
    </>
  );
}

export default WeeklyProjections;
