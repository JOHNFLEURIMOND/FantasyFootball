import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NavLink } from '../routing/SimpleRouter';
import {
  fetchPlayers,
  fetchStandings,
  fetchTeams,
  isPartialMeta,
  isStaleMeta,
} from '../api/nflverseApi';
import { fleurimondColors } from '../CSS/theme';

const DEFAULT_SEASON = new Date().getFullYear();
const DESTINATIONS = [
  ['Players', '/players'],
  ['Teams', '/teams'],
  ['Schedule', '/Schedule'],
  ['Standings', '/standings'],
  ['Stats', '/stats'],
  ['Weekly Projections', '/WeeklyProjections'],
  ['PPR', '/PPR'],
  ['Comparisons', '/compare'],
  ['Leaderboards', '/leaderboards'],
];

function searchItems(players, teams, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const playerResults = players
    .filter(player =>
      [player.displayName, player.position, player.teamId]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(normalized))
    )
    .slice(0, 8)
    .map(player => ({
      id: player.playerId,
      type: 'Player',
      title: player.displayName,
      detail: [player.position, player.teamId].filter(Boolean).join(' · '),
      href: `/players/${encodeURIComponent(player.playerId)}`,
    }));

  const teamResults = teams
    .filter(team =>
      [team.city, team.name, team.abbreviation]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(normalized))
    )
    .slice(0, 8)
    .map(team => ({
      id: team.teamId,
      type: 'Team',
      title: [team.city, team.name].filter(Boolean).join(' '),
      detail: team.abbreviation,
      href: '/teams',
    }));

  return [...playerResults, ...teamResults].slice(0, 12);
}

function fulfilledValue(result, fallback = { data: [], meta: null }) {
  return result.status === 'fulfilled' ? result.value : fallback;
}

const PublicDashboard = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [standings, setStandings] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const [partial, setPartial] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          fetchPlayers({ signal: controller.signal }),
          fetchTeams({ signal: controller.signal }),
          fetchStandings(DEFAULT_SEASON, { signal: controller.signal }),
        ]);

        if (controller.signal.aborted) return;

        const [playersResult, teamsResult, standingsResult] = results;
        const playerFeed = fulfilledValue(playersResult);
        const teamFeed = fulfilledValue(teamsResult);
        const standingsFeed = fulfilledValue(standingsResult);
        const coreFeedsUnavailable =
          playersResult.status === 'rejected' && teamsResult.status === 'rejected';

        if (coreFeedsUnavailable) {
          throw playersResult.reason || teamsResult.reason || new Error('Player and team feeds are unavailable.');
        }

        const fulfilledMeta = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value.meta);

        setPlayers(playerFeed.data);
        setTeams(teamFeed.data);
        setStandings(standingsFeed.data);
        setStale(fulfilledMeta.some(isStaleMeta));
        setPartial(
          results.some(result => result.status === 'rejected') ||
            fulfilledMeta.some(isPartialMeta)
        );
      } catch (caughtError) {
        if (caughtError.name !== 'AbortError') {
          setError(caughtError);
          setPlayers([]);
          setTeams([]);
          setStandings([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const results = useMemo(
    () => searchItems(players, teams, query),
    [players, teams, query]
  );

  return (
    <Main id='main-content' tabIndex='-1'>
      <Hero>
        <h1>NFL & Fantasy Football Dashboard</h1>
        <p>Browse public NFL data, fantasy rankings, projections, schedules, and player research without an account.</p>
        <label htmlFor='global-nfl-search'>Search players and teams</label>
        <SearchInput
          id='global-nfl-search'
          type='search'
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='Search by player, position, team, or abbreviation'
        />
        <Results aria-live='polite' aria-label='Search results'>
          {query && results.length === 0 ? <p>No matching players or teams.</p> : null}
          {results.map(result => (
            <ResultLink key={`${result.type}-${result.id}`} to={result.href}>
              <strong>{result.title}</strong>
              <span>{result.type}{result.detail ? ` · ${result.detail}` : ''}</span>
            </ResultLink>
          ))}
        </Results>
      </Hero>

      {loading ? <Status role='status'>Loading public NFL data…</Status> : null}
      {!loading && error ? <Status role='alert'>Unable to load public NFL data: {error.message}</Status> : null}
      {!loading && !error && players.length === 0 && teams.length === 0 ? (
        <Status role='status'>No public NFL data is available right now.</Status>
      ) : null}
      {!loading && !error && stale ? (
        <Status role='status'>Showing cached data while the latest source refreshes.</Status>
      ) : null}
      {!loading && !error && partial ? (
        <Status role='status'>Some source records are unavailable; available data is shown.</Status>
      ) : null}

      <Section aria-labelledby='dashboard-destinations'>
        <h2 id='dashboard-destinations'>Explore</h2>
        <Grid>
          {DESTINATIONS.map(([label, href]) => (
            <DestinationCard key={href} to={href}>
              <strong>{label}</strong>
              <span>Open {label.toLowerCase()}</span>
            </DestinationCard>
          ))}
        </Grid>
      </Section>

      <Section aria-labelledby='dashboard-summary'>
        <h2 id='dashboard-summary'>Current data summary</h2>
        <SummaryGrid>
          <SummaryCard><strong>{players.length}</strong><span>Players</span></SummaryCard>
          <SummaryCard><strong>{teams.length}</strong><span>Teams</span></SummaryCard>
          <SummaryCard><strong>{standings.length}</strong><span>Teams with completed-game standings</span></SummaryCard>
        </SummaryGrid>
      </Section>
    </Main>
  );
};

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 1rem 3rem;
  min-height: 100dvh;

  &:focus { outline: none; }
`;

const Hero = styled.section`
  display: grid;
  gap: 1rem;
  padding: clamp(1.5rem, 4vw, 3rem);
  border-radius: 1rem;
  background: ${fleurimondColors.surface};
  border: 1px solid ${fleurimondColors.surfaceBorder};
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);

  p, label { color: ${fleurimondColors.textMuted}; }
`;

const SearchInput = styled.input`
  width: min(100%, 680px);
  padding: 0.9rem 1rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 0.5rem;
  font: inherit;

  &:focus-visible {
    outline: 3px solid ${fleurimondColors.accent};
    outline-offset: 2px;
  }
`;

const Results = styled.div`
  display: grid;
  gap: 0.5rem;
  width: min(100%, 680px);
`;

const ResultLink = styled(NavLink)`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  background: ${fleurimondColors.rowAlt};
  border-radius: 0.5rem;
  color: inherit;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid ${fleurimondColors.accent};
    outline-offset: 2px;
  }
`;

const Status = styled.p`
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  background: ${fleurimondColors.surface};
  border-radius: 0.5rem;
`;

const Section = styled.section`
  margin-top: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const DestinationCard = styled(NavLink)`
  display: grid;
  gap: 0.4rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background: ${fleurimondColors.surface};
  border: 1px solid ${fleurimondColors.surfaceBorder};
  color: inherit;
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);

  span { color: ${fleurimondColors.textMuted}; }

  &:hover { border-color: ${fleurimondColors.accent}; }

  &:focus-visible {
    outline: 3px solid ${fleurimondColors.accent};
    outline-offset: 2px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const SummaryCard = styled.div`
  display: grid;
  gap: 0.25rem;
  padding: 1.25rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  background: ${fleurimondColors.surface};
  border-radius: 0.75rem;

  strong { font-size: 2rem; }
  span { color: ${fleurimondColors.textMuted}; }
`;

export { fulfilledValue, searchItems };
export default PublicDashboard;
