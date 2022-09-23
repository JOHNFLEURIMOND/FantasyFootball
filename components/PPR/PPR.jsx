import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import Pagination from './Pagination';
import PlayerCards from './PlayerCards';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { GlobalStyle, Container } from '../CSS/global-style';

const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();
const key = process.env.REACT_APP_MY_API_KEY;

export default function PPR() {
  const [pprStats, setPprStats] = useState([]);
  const [card, flipCard] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
      const getStats = async () => {
          setLoaded(true);
          const res = await axios
              .get(`https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/3?key=${key}`)
          setPprStats(res.data)
          setLoaded(false)
      };
      getStats();
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = pprStats.slice(indexOfFirstPost, indexOfLastPost);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostPerPage] = useState(12);

  // Get current posts
  const paginate = (pageNumbers) => setCurrentPage(pageNumbers)

  return (
    <Container>
      <GlobalStyle />
      <Nav />
      <MainHero />
      <PlayerCards posts={currentPosts} loaded={loaded} />
      <Pagination postPerPage={postsPerPage} paginate={paginate} />
      <Footer />
    </Container>
  );
}
