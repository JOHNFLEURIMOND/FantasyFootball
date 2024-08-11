import React, { useState, useEffect, useCallback, useContext } from 'react';
import { StatsContext } from '../context';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import Nav from '../Navbar/Nav';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import { Form, Radio } from 'semantic-ui-react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';
import { Helmet } from 'react-helmet';

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
    <>
      <Helmet>
        <title>Player Points Projection</title>
        <meta
          name='description'
          content='View player points projections, filter by position, and sort based on various stats.'
        />
      </Helmet>
      <PPRPageContainer>
        <Nav />
        <MainHero />
        <Title>Player Points Projection</Title>
        <FilterContainer>
          <SearchDiv>
            <StyledInput
              type='text'
              name='search'
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
    </>
  );
};

const PPRPageContainer = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
  background-color: ${fleurimondColors.white};
`;

const StyledSelect = styled.select`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${fleurimondColors.black};
  outline: none;
  box-sizing: border-box;
  font-size: 1rem;
  margin: 0 0.5rem;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: ${fleurimondColors.blueSapphire};
    box-shadow: 0 0 0 2px ${fleurimondColors.blueSapphire};
  }

  @media (max-width: 1200px) {
    padding: 1rem;
    max-width: 90%;
  }

  @media (max-width: 600px) {
    padding: 1rem;
    max-width: 95%;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${fleurimondColors.black};
  outline: none;
  box-sizing: border-box;
  font-size: 1rem;
  margin: 0 0.5rem;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: ${fleurimondColors.blueSapphire};
    box-shadow: 0 0 0 2px ${fleurimondColors.blueSapphire};
  }

  @media (max-width: 1200px) {
    padding: 1rem;
    max-width: 90%;
  }

  @media (max-width: 600px) {
    padding: 1rem;
    max-width: 95%;
  }
`;

const SearchDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: ${fleurimondColors.white};

  @media (max-width: 1200px) {
    max-width: 900px;
  }

  @media (max-width: 900px) {
    max-width: 600px;
  }

  @media (max-width: 600px) {
    font-size: 0.875rem;
    padding: 1rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1.5rem;
  background-color: ${fleurimondColors.white};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 800px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin: 2rem 0;

  @media (max-width: 800px) {
    font-size: 2rem;
    margin: 1.5rem 0;
  }

  @media (max-width: 320px) {
    font-size: 1.75rem;
    margin: 1rem 0;
  }
`;

export default PPR;
