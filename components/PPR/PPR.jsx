import React, { useContext } from 'react';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import { PPRPageContainer, Title } from './index';
import { StatsContext } from '../context';

export default function PPR() {
  const { stats, loading, currentStats, totalPages, setCurrentPage } =
    useContext(StatsContext);

  return (
    <PPRPageContainer>
      <Nav />
      <MainHero />
      <Title>Player Points Projection</Title>
      <PlayerCards stats={currentStats} loading={loading} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
      />
      <Footer />
    </PPRPageContainer>
  );
}
