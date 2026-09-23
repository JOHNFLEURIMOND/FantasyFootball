import React, { useContext, useEffect } from 'react';
import WeeklyProjectionCards from './WeeklyProjectionCards';
import { StatsContext } from '../context';
import { resolveDataRouteState } from '../routing/dataRouteState';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import GlobalStyle from '../CSS/global-style';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme.js';

const FIRST_STATS_SEASON = 1999;

function WeeklyProjections() {
  const {
    stats,
    loading,
    error,
    fetchStats,
    selectedSeason,
    setSelectedSeason,
    stale,
    partial,
  } = useContext(StatsContext);

  useEffect(() => {
    fetchStats('projection');
  }, [fetchStats]);

  const routeState = resolveDataRouteState({
    loading,
    error,
    items: stats,
    stale,
    partial,
  });

  const seasons = [];
  for (let season = new Date().getFullYear(); season >= FIRST_STATS_SEASON; season -= 1) {
    seasons.push(season);
  }

  return (
    <>
      <GlobalStyle />
      <Nav />
      <MainContainer id='main-content' tabIndex='-1'>
        <Title>Weekly Fantasy Football Projections</Title>
        <DataNotice>
          Estimated projections use a trailing average of up to four observed NFL
          game weeks and full-PPR scoring. They are application estimates, not
          official provider-supplied projections.
        </DataNotice>
        <ControlRow>
          <label htmlFor='projection-season'>Season</label>
          <select
            id='projection-season'
            value={selectedSeason}
            onChange={event => setSelectedSeason(Number(event.target.value))}
          >
            {seasons.map(season => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </ControlRow>

        {routeState.primary === 'loading' && (
          <Status role='status'>Loading projections…</Status>
        )}
        {routeState.primary === 'failure' && (
          <Status role='alert'>Unable to load projections: {error.message}</Status>
        )}
        {routeState.primary === 'empty' && (
          <Status role='status'>No projection data is available for this season.</Status>
        )}
        {routeState.primary === 'success' && routeState.stale && (
          <Status role='status'>Showing stale cached NFL data while the source refreshes.</Status>
        )}
        {routeState.primary === 'success' && routeState.partial && (
          <Status role='status'>Player identity data is partial; projection values remain available.</Status>
        )}
        {routeState.primary === 'success' && (
          <WeeklyProjectionCards stats={stats} loading={false} />
        )}
      </MainContainer>
      <Footer />
    </>
  );
}

export const MainContainer = styled.main`
  padding: 3rem clamp(1rem, 4vw, 3rem);
  background-color: ${fleurimondColors.background};
  min-height: 60dvh;

  &:focus { outline: none; }
`;

export const Title = styled.h1`
  font-size: 2rem;
  color: ${fleurimondColors.text};
  margin-bottom: 1rem;
`;

const DataNotice = styled.p`
  max-width: 72ch;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  color: ${fleurimondColors.textMuted};
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  select {
    min-width: 7rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  select:focus-visible {
    outline: 3px solid ${fleurimondColors.accent};
    outline-offset: 2px;
  }
`;

const Status = styled.p`
  padding: 1rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 0.25rem;
  background: ${fleurimondColors.surface};
`;

export default WeeklyProjections;
