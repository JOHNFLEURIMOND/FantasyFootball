import React, { useContext } from 'react';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Nav from '../Navbar/Nav.jsx';
import Pagination from '../Pagination/Pagination';
import WeeklyProjectionCards from './WeeklyProjectionCards';
import { MainContainer, Title } from './index';
import { StatsContext } from '../App';
import { GlobalStyle, Container } from '../CSS/global-style';

function WeeklyProjections() {
  const { stats, currentStats, setCurrentPage, loading, error, totalPages } =
    useContext(StatsContext);

  return (
    <Container>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <MainContainer>
        <Title>Fantasy Football News</Title>
        <WeeklyProjectionCards stats={stats} loading={loading} error={error} />
      </MainContainer>
      <Footer />
    </Container>
  );
}

export default WeeklyProjections;
