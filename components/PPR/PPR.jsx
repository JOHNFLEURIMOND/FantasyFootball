import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StatsContext } from '../context';
import { resolveDataRouteState } from '../routing/dataRouteState';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import Nav from '../Navbar/Nav';
import Footer from '../Footer/Footer';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';
import DataControls from '../DataControls/DataControls';
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

  const [teamFilter, setTeamFilter] = useState('');
  const [direction, setDirection] = useState('desc');
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortOption, setSortOption] = useState('FantasyPointsPPR');

  useEffect(() => {
    fetchStats('ppr');
  }, [fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, positionFilter, teamFilter, direction, sortOption, selectedSeason, setCurrentPage]);

  const page = useMemo(
    () => derivePprPage({
      stats,
      search,
      position: positionFilter,
      team: teamFilter,
      direction,
      sortBy: sortOption,
      currentPage,
    }),
    [stats, search, positionFilter, teamFilter, direction, sortOption, currentPage]
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

  const handlePageChange = (_event, { activePage }) => {
    setCurrentPage(Number(activePage));
  };

  return (
    <>
      <PPRPageContainer>
        <Nav />
        <MainContent id='main-content' tabIndex='-1'>
          <Title>PPR Rankings</Title>
          <DataNotice>
            Rankings use observed canonical NFL statistics and application-calculated
            full-PPR scoring: 1 point per reception, 0.1 per rushing or receiving
            yard, 0.04 per passing yard, 6 per rushing or receiving touchdown, and
            4 per passing touchdown. These are rankings, not projections.
          </DataNotice>
          <DataControls search={search} onSearch={setSearch}
            filters={[
              { label: 'Position', allLabel: 'All positions', value: positionFilter, options: ['QB', 'RB', 'WR', 'TE'], onChange: value => { setPositionFilter(value); setSelectedPosition(value); } },
              { label: 'Team', allLabel: 'All teams', value: teamFilter, options: [...new Set(stats.map(player => player.Team).filter(Boolean))].sort(), onChange: setTeamFilter },
            ]}
            sort={sortOption} onSort={setSortOption}
            sortOptions={SORT_OPTIONS.map(value => ({ value, label: value === 'FantasyPointsPPR' ? 'PPR points' : value.replace(/([A-Z])/g, ' $1').trim() }))}
            direction={direction} onDirection={setDirection}
            onReset={() => { setSearch(''); setPositionFilter(''); setSelectedPosition(''); setTeamFilter(''); setSortOption('FantasyPointsPPR'); setDirection('desc'); setCurrentPage(1); }}>
            <label>Season<select value={selectedSeason} onChange={event => setSelectedSeason(Number(event.target.value))}>
              {seasons.map(season => <option key={season} value={season}>{season}</option>)}
            </select></label>
          </DataControls>

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
  background-color: ${fleurimondColors.background};
`;

const MainContent = styled.main`
  width: 100%;
  min-height: 60dvh;
  padding-top: 6rem;

  &:focus { outline: none; }
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
  color: ${fleurimondColors.textMuted};
`;

const Status = styled.p`
  max-width: 76ch;
  margin: 1.5rem auto;
  padding: 1rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 0.25rem;
  background: ${fleurimondColors.surface};
`;

const PageStatus = styled.p`
  margin: 1rem auto;
`;

export default PPR;
