import React, { useState, useEffect, useCallback, useContext } from 'react';
import { StatsContext } from '../context';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import {
  Title,
  FilterContainer,
  StyledSelect,
  SearchDiv,
  PPRPageContainer,
} from './index';
import Nav from '../Navbar/Nav';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero'; // Ensure this path is correct
import TextInput from '../WeeklyProjections/TextInput';
import { Form, Radio } from 'semantic-ui-react';

const PPR = () => {
  const {
    stats,
    loading,
    currentPage,
    setCurrentPage,
    fetchStats,
    totalPages,
  } = useContext(StatsContext);

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearchChange = useCallback(e => setSearch(e.target.value), []);
  const handlePositionFilterChange = useCallback(
    e => setPositionFilter(e.target.value),
    []
  );
  const handleSortOptionChange = useCallback(
    (e, { value }) => setSortOption(value),
    []
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredStats = stats
    .filter(
      player =>
        !search || player.Name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(player => !positionFilter || player.Position === positionFilter)
    .sort((a, b) => {
      if (
        sortOption &&
        a[sortOption] !== undefined &&
        b[sortOption] !== undefined
      ) {
        return b[sortOption] - a[sortOption];
      }
      return 0;
    });

  const itemsPerPage = 12;
  const totalFilteredPages = Math.ceil(filteredStats.length / itemsPerPage);

  const currentStats = filteredStats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PPRPageContainer>
      <Nav />
      <MainHero /> {/* Ensure this is placed correctly */}
      <Title>Player Points Projection</Title>
      <FilterContainer>
        <SearchDiv>
          <TextInput
            name='search'
            title='Search'
            placeholder='Search For Players'
            value={search}
            onChange={handleSearchChange}
          />
          <StyledSelect
            onChange={handlePositionFilterChange}
            aria-label='Filter Players By Position'
          >
            <option value=''>Filter By Position</option>
            {['QB', 'RB', 'WR', 'TE'].map(position => (
              <option key={position} value={position}>
                {position === 'QB'
                  ? 'Quarterback'
                  : position === 'RB'
                    ? 'Running Back'
                    : position === 'WR'
                      ? 'Wide Receiver'
                      : 'Tight End'}
              </option>
            ))}
          </StyledSelect>
          <Form>
            {[
              'PassingAttempts',
              'PassingYards',
              'PassingTouchdowns',
              'RushingAttempts',
              'RushingYards',
              'RushingTouchdowns',
              'Receptions',
              'ReceivingYards',
              'ReceivingTouchdowns',
            ].map(option => (
              <Form.Field key={option}>
                <Radio
                  label={option.replace(/([A-Z])/g, ' $1')}
                  name='sortOption'
                  value={option}
                  onChange={handleSortOptionChange}
                  checked={sortOption === option}
                />
              </Form.Field>
            ))}
          </Form>
        </SearchDiv>
      </FilterContainer>
      <PlayerCards stats={currentStats} loading={loading} />
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalFilteredPages}
      />
      <Footer />
    </PPRPageContainer>
  );
};

export default PPR;
