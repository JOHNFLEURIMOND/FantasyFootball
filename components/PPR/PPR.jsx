import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import {Provider as StyletronProvider, DebugEngine} from 'styletron-react';
import {Client as Styletron} from 'styletron-engine-atomic';
import {GlobalStyle, Container} from '../CSS/global-style';

const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();
const key = process.env.REACT_APP_MY_API_KEY;

export default function PPR() {
  const [pprStats, setPprStats] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statsPerPage] = useState(12);

  const indexOfLastStat = currentPage * statsPerPage;
  const indexOfFirstStat = indexOfLastStat - statsPerPage;
  const currentStats = pprStats.slice(indexOfFirstStat, indexOfLastStat);
  // Get current stats
  const paginate = (pageNumbers) => setCurrentPage(pageNumbers);

  useEffect(() => {
    const getStats = async () => {
      setLoaded(true);
      const res = await axios.get(
        `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/3?key=${key}`,
      );
      setPprStats(res.data);
      setLoaded(false);
    };
    getStats();
  }, []);

  return (
    <Container>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <PlayerCards stats={currentStats} loaded={loaded} />
      <Pagination statsPerPage={statsPerPage} paginate={paginate} />
      <Footer />
    </Container>
  );
}
