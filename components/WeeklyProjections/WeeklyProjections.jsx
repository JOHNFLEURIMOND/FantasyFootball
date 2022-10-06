import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Nav from '../Navbar/Nav.jsx';
import Pagination from '../Pagination/Pagination';
import WeeklyProjectionCards from './WeeklyProjectionCards';
import {ProjectsSectionContainer, Title} from './index';
import {GlobalStyle, Container} from '../CSS/global-style';
const key = process.env.REACT_APP_MY_API_KEY;

function WeeklyProjections() {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastStat = currentPage * 12;
  const totalPages = stats.length / 12;
  const indexOfFirstStat = indexOfLastStat - 12;
  const currentStats = stats.slice(indexOfFirstStat, indexOfLastStat);

  useEffect(() => {
    setLoading(true);
    const getStats = async () => {
      await axios
        .get(`https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/3?key=${key}`)
        .then((responses) => {
          setStats(responses.data);
        })
        .catch((error) => setError(error))
        .finally(() => setLoading(false));
    };
    getStats();
  }, [currentPage]);

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
