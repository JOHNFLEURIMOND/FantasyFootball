import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Nav from '../Navbar/Nav.jsx';
import Pagination from '../Pagination/Pagination';
import WeeklyProjectionCards from './WeeklyProjectionCards';
import {Provider as StyletronProvider, DebugEngine} from 'styletron-react';
import {Icon} from 'semantic-ui-react';
import {Client as Styletron} from 'styletron-engine-atomic';
import {ProjectsSectionContainer, Title} from './index';
import {GlobalStyle, Container} from '../CSS/global-style';
const key = process.env.REACT_APP_MY_API_KEY;

const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();

function WeeklyProjections() {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastStat = currentPage * 12;
  const totalPages = stats.length / 12;
  const indexOfFirstStat = indexOfLastStat - 12;
  const currentStats = stats.slice(indexOfFirstStat, indexOfLastStat);

  // Get current stats
  const paginate = (pageNumbers) => setCurrentPage(pageNumbers);

  useEffect(() => {
    setLoaded(true);
    const getStats = async () => {
      await axios
        .get(`https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/3?key=${key}`)
        .then((responses) => {
          setStats(responses.data);
        })
        .catch((error) => setError(error))
        .finally(() => setLoaded(false));
    };
    console.log('this is weekly projections: ', currentPage);
    getStats();
  }, [currentPage]);
  // console.log('this outside useEffects: ', stats)

  return (
    <Container>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <ProjectsSectionContainer>
        <Title>Fantasy Football News</Title>
        <WeeklyProjectionCards stats={currentStats} loading={loading} />
        <Pagination setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={Math.ceil(totalPages)} />
      </ProjectsSectionContainer>
      <Footer />
    </Container>
  );
}

export default WeeklyProjections;
