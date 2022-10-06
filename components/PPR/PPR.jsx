import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import {ProjectsSectionContainer, Title} from './index';
import {GlobalStyle, Container} from '../CSS/global-style';
const key = process.env.REACT_APP_MY_API_KEY;

export default function PPR() {
  const [pprStats, setPprStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfFirstStat = indexOfLastStat - 12;
  const indexOfLastStat = currentPage * 12;
  const totalPages = pprStats.length / 12;
  const currentStats = pprStats.slice(indexOfFirstStat, indexOfLastStat);
  // Get current stats

  useEffect(() => {
    const getStats = async () => {
      setLoading(true);
      await axios
        .get(`https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/3?key=${key}`)
        .then((responses) => {
          setPprStats(responses.data);
        })
        .catch((responses) => setError(responses.error))
        .finally(() => setLoading(false));
    };
    getStats();
  }, [currentPage]);

  return (
    <Container>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <Title>Fantasy Football PPR Stats</Title>
      <ProjectsSectionContainer>
        <PlayerCards stats={currentStats} loading={loading} error={error} />
        <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={Math.ceil(totalPages)} />
      </ProjectsSectionContainer>
      <Footer />
    </Container>
  );
}
