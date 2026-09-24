import React, { useContext, useEffect, useCallback } from 'react';
import { NewsContext } from '../context';
import { resolveDataRouteState } from '../routing/dataRouteState';
import ScheduleCardWithModal from './ScheduleCard';
import Pagination from '../Pagination/Pagination';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme';
import Nav from '../Navbar/Nav';
import Footer from '../Footer/Footer';

const FIRST_SCHEDULE_SEASON = 1920;
const WEEKS = Array.from({ length: 22 }, (_, index) => index + 1);

const Schedule = () => {
  const {
    schedules,
    loaded,
    fetchSchedules,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedSeason,
    setSelectedSeason,
    selectedWeek,
    setSelectedWeek,
    error,
    stale,
    partial,
  } = useContext(NewsContext);

  useEffect(() => {
    fetchSchedules(1);
  }, [fetchSchedules]);

  const handlePageChange = useCallback(
    (_event, { activePage }) => {
      const page = Number(activePage);
      setCurrentPage(page);
      fetchSchedules(page);
    },
    [fetchSchedules, setCurrentPage]
  );

  const routeState = resolveDataRouteState({
    loading: !loaded,
    error,
    items: schedules,
    stale,
    partial,
  });

  const seasons = [];
  for (
    let season = new Date().getFullYear();
    season >= FIRST_SCHEDULE_SEASON;
    season -= 1
  ) {
    seasons.push(season);
  }

  return (
    <>
      <Nav />
      <ContentWrapper id='main-content' tabIndex='-1'>
        <Title>NFL Schedule & Results</Title>
        <ControlRow>
          <label htmlFor='schedule-season'>Season</label>
          <select
            id='schedule-season'
            value={selectedSeason}
            onChange={event => {
              setCurrentPage(1);
              setSelectedSeason(Number(event.target.value));
            }}
          >
            {seasons.map(season => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
          <label htmlFor='schedule-week'>Week</label>
          <select
            id='schedule-week'
            value={selectedWeek}
            onChange={event => {
              setCurrentPage(1);
              setSelectedWeek(event.target.value);
            }}
          >
            <option value=''>All weeks</option>
            {WEEKS.map(week => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </ControlRow>

        {routeState.primary === 'loading' && (
          <Status role='status'>Loading schedule…</Status>
        )}
        {routeState.primary === 'failure' && (
          <Status role='alert'>{error.message}</Status>
        )}
        {routeState.primary === 'empty' && (
          <Status role='status'>No games are available for the selected season and week.</Status>
        )}
        {routeState.primary === 'success' && routeState.stale && (
          <Status role='status'>Showing stale cached schedule data while the source refreshes.</Status>
        )}
        {routeState.primary === 'success' && routeState.partial && (
          <Status role='status'>Some schedule records were skipped because they are incomplete.</Status>
        )}
        {routeState.primary === 'success' && (
          <>
            <CardContainer>
              {schedules.map(game => (
                <ScheduleCardWithModal key={game.GameKey} data={game} />
              ))}
            </CardContainer>
            <PaginationWrapper>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </PaginationWrapper>
          </>
        )}
      </ContentWrapper>
      <Footer />
    </>
  );
};

const ContentWrapper = styled.main`
  padding: 6rem 1rem 3rem;
  background-color: ${fleurimondColors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  min-height: 100vh;
  box-sizing: border-box;

  &:focus { outline: none; }
`;

const Title = styled.h1`
  margin: 0;
`;

const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

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

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const PaginationWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0;
`;

const Status = styled.p`
  width: min(100%, 72ch);
  text-align: center;
  color: ${fleurimondColors.textMuted};
  padding: 1rem;
  background-color: ${fleurimondColors.surface};
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 0.25rem;
`;

export default Schedule;
