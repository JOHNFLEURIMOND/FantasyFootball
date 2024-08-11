import React, { useContext, useEffect } from 'react';
import WeeklyProjectionCards from './WeeklyProjectionCards';
import { StatsContext } from '../context'; // Updated import path
import MainHero from '../MainHero/MainHero';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import GlobalStyle from '../CSS/global-style';
import styled from 'styled-components'; // Import keyframes along with styled
import { fleurimondColors } from '../CSS/theme.js';

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
// Add MainContainer and Title if they are used in WeeklyProjections.jsx
export const MainContainer = styled.div`
  padding: 2rem;
  background-color: ${fleurimondColors.white};
`;

export const Title = styled.h1`
  font-size: 2rem;
  color: ${fleurimondColors.primary};
  margin-bottom: 1.5rem;
`;

export default WeeklyProjections;
