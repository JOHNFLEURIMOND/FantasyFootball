// components/PPR/PPR.jsx
import React, { useState, useContext, useEffect } from 'react';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer.jsx';
import MainHero from '../MainHero/MainHero.jsx';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import { Title, FilterContainer, StyledSelect, SearchDiv } from './index.jsx';
import { StatsContext } from '../context';
import TextInput from '../WeeklyProjections/TextInput';
import { Form, Radio } from 'semantic-ui-react';

const PPR = () => {
  const {
    stats,
    loading,
    currentPage,
    totalPages,
    setCurrentPage,
    fetchStats,
  } = useContext(StatsContext);

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearchChange = e => setSearch(e.target.value);

  const handlePositionFilterChange = e => setPositionFilter(e.target.value);

  const handleSortOptionChange = (e, { value }) => setSortOption(value);

  // Filter and sort stats based on user input
  const filteredStats = stats
    .filter(
      player =>
        search === '' ||
        player.Name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      player => positionFilter === '' || player.Position === positionFilter
    )
    .sort((a, b) => {
      if (!sortOption || !(sortOption in a) || !(sortOption in b)) return 0;
      return b[sortOption] - a[sortOption];
    });

  const handlePageChange = page => setCurrentPage(page);

  return (
    <>
      <Nav />
      <MainHero />
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
      <PlayerCards stats={filteredStats} loading={loading} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <Footer />
    </>
  );
};

export default PPR;
