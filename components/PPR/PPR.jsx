import React, { useContext } from 'react';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import { PPRPageContainer, Title } from './index';
import { GlobalStyle, Container } from '../CSS/global-style';
import { StatsContext } from '../App';

export default function PPR() {
  const { currentPage, stats, setCurrentPage, loading, error, totalPages } =
    useContext(StatsContext);

  return (
    <Container>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <Title>Fantasy Football PPR Stats</Title>
      <PPRPageContainer>
        <PlayerCards stats={stats} loading={loading} error={error} />
        <Pagination
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPages={Math.ceil(totalPages)}
        />
      </PPRPageContainer>
      <Footer />
    </Container>
  );
}
