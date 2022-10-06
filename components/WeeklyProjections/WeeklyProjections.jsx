import React, {useContext} from 'react';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Nav from '../Navbar/Nav.jsx';
import Pagination from '../Pagination/Pagination';
import WeeklyProjectionCards from './WeeklyProjectionCards';
import {ProjectsSectionContainer, Title} from './index';
import {StatsContext} from '../App';
import {GlobalStyle, Container} from '../CSS/global-style';

function WeeklyProjections() {
  const {currentPage, currentStats, setCurrentPage, loading, error, totalPages} = useContext(StatsContext);

  return (
    <Container>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <ProjectsSectionContainer>
        <Title>Fantasy Football News</Title>
        <WeeklyProjectionCards stats={currentStats} loading={loading} error={error} />
        <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={Math.ceil(totalPages)} />
      </ProjectsSectionContainer>
      <Footer />
    </Container>
  );
}

export default WeeklyProjections;
