import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StatsContext } from '../context';
import { resolveDataRouteState } from '../routing/dataRouteState';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import Nav from '../Navbar/Nav';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';
import { Helmet } from 'react-helmet';
import { derivePprPage } from './pagination';

const FIRST_STATS_SEASON = 1999;
const SORT_OPTIONS = [
  'FantasyPointsPPR',
  'PassingYards',
  'PassingTouchdowns',
  'RushingYards',
  'RushingTouchdowns',
  'Receptions',
  'ReceivingYards',
  'ReceivingTouchdowns',
];

const PPR = () => {
  const {
    stats = [],
    loading,
    currentPage,
    setCurrentPage,
    setSelectedPosition,
    fetchStats,
    error,
    selectedSeason,
    setSelectedSeason,
    stale,
    partial,
  } = useContext(StatsContext);

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortOption, setSortOption] = useState('FantasyPointsPPR');

  useEffect(() => {
    fetchStats('ppr');
  }, [fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, positionFilter, sortOption, setCurrentPage]);

  const page = useMemo(
    () => derivePprPage({
      stats,
      search,
      position: positionFilter,
      sortBy: sortOption,
      currentPage,
    }),
    [stats, search, positionFilter, sortOption, currentPage]
  );

  const routeState = resolveDataRouteState({
    loading,
    error,
    items: page.totalItems > 0 ? page.items : [],
    stale,
    partial,
  });

  const seasons = [];
  for (
    let season = new Date().getFullYear();
    season >= FIRST_STATS_SEASON;
    season -= 1
  ) {
    seasons.push(season);
  }

  const handlePositionChange = event => {
    const { value } = event.target;
    setPositionFilter(value);
    setSelectedPosition(value);
  };

  const handlePageChange = (_event, { activePage }) => {
    setCurrentPage(Number(activePage));
  };

  return (
    <>
      <Helmet>
        <title>PPR Rankings</title>
        <meta
          name='description'
          content='Full-PPR rankings calculated from observed canonical NFL statistics.'
        />
      </Helmet>
      <PPRPageContainer>
        <Nav />
        <MainHero />
        <MainContent id='main-content' tabIndex='-1'>
          <Title>PPR Rankings</Title>
          <DataNotice>
            Rankings use observed canonical NFL statistics and application-calculated
            full-PPR scoring: 1 point per reception, 0.1 per rushing or receiving
            yard, 0.04 per passing yard, 6 per rushing or receiving touchdown, and
            4 per passing touchdown. These are rankings, not projections.
          </DataNotice>
          <FilterContainer>
            <SearchDiv>
              <StyledInput
                type='search'
                name='search'
                aria-label='Search players'
                placeholder='Search For Players'
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
              <StyledSelect
                value={selectedSeason}
                onChange={event => setSelectedSeason(Number(event.target.value))}
                aria-label='Select NFL season'
              >
                {seasons.map(season => (
                  <option key={season} value={season}>
                    {season} season
                  </option>
                ))}
              </StyledSelect>
              <StyledSelect
                value={positionFilter}
                onChange={handlePositionChange}
                aria-label='Filter Players By Position'
              >
                <option value=''>All positions</option>
                {['QB', 'RB', 'WR', 'TE'].map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </StyledSelect>
              <SortFieldset>
                <legend>Sort rankings</legend>
                {SORT_OPTIONS.map(option => (
                  <label key={option}>
                    <input
                      type='radio'
                      name='sortOption'
                      value={option}
                      checked={sortOption === option}
                      onChange={event => setSortOption(event.target.value)}
                    />
                    <span>{option.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </SortFieldset>
            </SearchDiv>
          </FilterContainer>

          {routeState.primary === 'loading' && (
            <Status role='status'>Loading PPR rankings…</Status>
          )}
          {routeState.primary === 'failure' && (
            <Status role='alert'>{error.message}</Status>
          )}
          {routeState.primary === 'empty' && (
            <Status role='status'>No matching PPR ranking data is available.</Status>
          )}
          {routeState.primary === 'success' && routeState.stale && (
            <Status role='status'>
              Showing stale cached NFL data while the source refreshes.
            </Status>
          )}
          {routeState.primary === 'success' && routeState.partial && (
            <Status role='status'>
              Player identity data is partial; rankings are based on available
              statistics.
            </Status>
          )}
          {routeState.primary === 'success' && (
            <>
              <PlayerCards stats={page.items} loading={false} />
              <PageStatus role='status' aria-live='polite'>
                Page {page.activePage} of {page.totalPages}. {page.totalItems} matching players.
              </PageStatus>
              <Pagination
                currentPage={page.activePage}
                onPageChange={handlePageChange}
                totalPages={page.totalPages}
              />
            </>
          )}
        </MainContent>
        <Footer />
      </PPRPageContainer>
    </>
  );
};

const PPRPageContainer = styled.div`
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
  background-color: ${fleurimondColors.white};
`;

const MainContent = styled.main`
  width: 100%;

  &:focus { outline: none; }
`;

const StyledSelect = styled.select`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${fleurimondColors.black};
  box-sizing: border-box;
  font-size: 1rem;

  &:focus-visible {
    outline: 2px solid ${fleurimondColors.blueSapphire};
    outline-offset: 2px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${fleurimondColors.black};
  box-sizing: border-box;
  font-size: 1rem;

  &:focus-visible {
    outline: 2px solid ${fleurimondColors.blueSapphire};
    outline-offset: 2px;
  }
`;

const SortFieldset = styled.fieldset`
  width: min(100%, 720px);
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 0.25rem;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  text-align: left;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  input:focus-visible {
    outline: 2px solid ${fleurimondColors.blueSapphire};
    outline-offset: 2px;
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
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1.5rem;
  box-sizing: border-box;
  background-color: ${fleurimondColors.white};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin: 2rem 0 1rem;
`;

const DataNotice = styled.p`
  max-width: 76ch;
  margin: 0 auto 1.5rem;
  padding: 0 1rem;
`;

const Status = styled.p`
  max-width: 76ch;
  margin: 1.5rem auto;
  padding: 1rem;
  border: 1px solid ${fleurimondColors.gray};
  border-radius: 0.25rem;
`;

const PageStatus = styled.p`
  margin: 1rem auto;
`;

export default PPR;
