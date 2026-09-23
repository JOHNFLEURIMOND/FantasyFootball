import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchPlayerPage, fetchSeasonalStats, fetchStandings, fetchTeams } from '../api/nflverseApi';
import { TableRegion } from '../accessibility/Accessibility';
import { NavLink, useParams } from '../routing/SimpleRouter';
import { fleurimondColors } from '../CSS/theme';

const DEFAULT_SEASON = new Date().getFullYear();

function ResourcePage({ title, loader, render }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loader()
      .then(result => {
        if (active) setData(result.data || []);
      })
      .catch(caught => {
        if (active) setError(caught);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loader]);

  return (
    <Main id='main-content' tabIndex='-1'>
      <h1>{title}</h1>
      {loading ? <p role='status'>Loading…</p> : null}
      {!loading && error ? <p role='alert'>Unable to load data: {error.message}</p> : null}
      {!loading && !error && data.length === 0 ? <p role='status'>No data is available.</p> : null}
      {!loading && !error && data.length > 0 ? render(data) : null}
    </Main>
  );
}

export const PlayersPage = () => {
  const { id: team } = useParams();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [season, setSeason] = useState(String(DEFAULT_SEASON));
  const [position, setPosition] = useState('');
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ data: [], meta: null, loading: true, error: null });
  useEffect(() => { setPage(1); setQuery(''); }, [team]);
  useEffect(() => {
    const controller = new AbortController();
    setState(current => ({ ...current, loading: true, error: null }));
    const timer = setTimeout(() => {
      fetchPlayerPage({ page, q: query.trim(), team, position, season, signal: controller.signal })
        .then(result => { if (!controller.signal.aborted) setState({ ...result, loading: false, error: null }); })
        .catch(error => { if (!controller.signal.aborted) setState({ data: [], meta: null, loading: false, error }); });
    }, query ? 250 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [page, query, team, position, season, retry]);
  return (
    <Main id='main-content' tabIndex='-1'>
      <NavLink to='/teams'>Browse all teams</NavLink>
      <h1>{team ? `${team} player directory` : 'NFL players'}</h1>
      <p>{season ? `Browse ${season} season roster records across the NFL. Roster status can change as the source updates.` : 'Historical directory: team filters use the last recorded team, not a current roster.'}</p>
      <Controls>
        <label>Player name<input type='search' value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder='Search all players' /></label>
        <label>Dataset<select value={season} onChange={event => { setSeason(event.target.value); setPage(1); }}><option value=''>All historical players</option>{[DEFAULT_SEASON, DEFAULT_SEASON - 1, DEFAULT_SEASON - 2].map(value => <option key={value} value={value}>{value} season rosters</option>)}</select></label>
        <label>Position<select value={position} onChange={event => { setPosition(event.target.value); setPage(1); }}>
          <option value=''>All positions</option>
          {['QB', 'RB', 'WR', 'TE', 'FB', 'K', 'P', 'C', 'G', 'T', 'OL', 'DT', 'DE', 'DL', 'LB', 'CB', 'S', 'DB', 'LS'].map(value => <option key={value}>{value}</option>)}
        </select></label>
      </Controls>
      {state.loading ? <p role='status'>Loading players…</p> : null}
      {state.error ? <p role='alert'>Unable to load players. <button onClick={() => setRetry(value => value + 1)}>Try again</button></p> : null}
      {!state.loading && !state.error ? <>
        <p role='status'>{state.meta?.total ?? state.data.length} players found</p>
        {state.data.length === 0 ? <p>No players match these filters.</p> : null}
        <List>{state.data.map(player => <li key={player.playerId}>
          <NavLink to={`/players/${encodeURIComponent(player.playerId)}`}>{player.displayName}</NavLink>
          <span>{[player.position, player.teamId].filter(Boolean).join(' · ')}</span>
        </li>)}</List>
      </> : null}
      <Controls aria-label='Player pagination'>
        <button disabled={state.loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
        <span>Page {page} of {state.meta?.totalPages || 1}</span>
        <button disabled={state.loading || !!state.error || page >= (state.meta?.totalPages || 1)} onClick={() => setPage(value => value + 1)}>Next</button>
      </Controls>
    </Main>
  );
};

export const TeamsPage = () => (
  <ResourcePage
    title='Teams'
    loader={fetchTeams}
    render={teams => (
      <Grid>{teams.map(team => (
        <article key={team.teamId} aria-labelledby={`team-${team.teamId}`}>
          {team.logoUrl ? <img src={team.logoUrl} alt='' width='48' height='48' /> : null}
          <h2 id={`team-${team.teamId}`}><NavLink to={`/teams/${encodeURIComponent(team.teamId)}`}>{[team.city, team.name].filter(Boolean).join(' ')}</NavLink></h2>
          <NavLink to={`/teams/${encodeURIComponent(team.teamId)}`}>Explore players →</NavLink>
          <p>{team.abbreviation} · {[team.conference, team.division].filter(Boolean).join(' · ')}</p>
        </article>
      ))}</Grid>
    )}
  />
);

export const StandingsPage = () => (
  <ResourcePage
    title={`${DEFAULT_SEASON} Standings`}
    loader={() => fetchStandings(DEFAULT_SEASON)}
    render={rows => (
      <TableRegion label={`${DEFAULT_SEASON} NFL standings table`}>
        <Table>
          <thead><tr><th scope='col'>Team</th><th scope='col'>W</th><th scope='col'>L</th><th scope='col'>T</th><th scope='col'>Win %</th></tr></thead>
          <tbody>
            {rows.map(row => <tr key={row.teamId}><th scope='row'>{row.name}</th><td>{row.wins}</td><td>{row.losses}</td><td>{row.ties}</td><td>{row.winPercentage}</td></tr>)}
          </tbody>
        </Table>
      </TableRegion>
    )}
  />
);

export const StatsPage = () => (
  <ResourcePage
    title={`${DEFAULT_SEASON} Seasonal Statistics`}
    loader={() => fetchSeasonalStats(DEFAULT_SEASON)}
    render={rows => (
      <TableRegion label={`${DEFAULT_SEASON} seasonal player statistics table`}>
        <Table>
          <thead><tr><th scope='col'>Player</th><th scope='col'>Team</th><th scope='col'>Passing</th><th scope='col'>Rushing</th><th scope='col'>Receiving</th></tr></thead>
          <tbody>
            {rows.map(row => <tr key={row.statId}><th scope='row'><NavLink to={`/players/${encodeURIComponent(row.playerId)}`}>{row.playerId}</NavLink></th><td>{row.teamId || '—'}</td><td>{row.metrics?.passing_yards ?? '—'}</td><td>{row.metrics?.rushing_yards ?? '—'}</td><td>{row.metrics?.receiving_yards ?? '—'}</td></tr>)}
          </tbody>
        </Table>
      </TableRegion>
    )}
  />
);

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 1rem 3rem;
  min-height: 100dvh;

  &:focus { outline: none; }
`;
const List = styled.ul`
  display: grid;
  list-style: none;
  padding: 0;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 0.65rem;

  li {
    display: grid;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid ${fleurimondColors.surfaceBorder};
    border-radius: 0.75rem;
    background: ${fleurimondColors.surface};
  }

  span { color: ${fleurimondColors.textMuted}; }
  a:hover { color: ${fleurimondColors.accent}; }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;

  article {
    padding: 1.5rem;
    border: 1px solid ${fleurimondColors.surfaceBorder};
    border-radius: 1rem;
    background: ${fleurimondColors.surface};
  }

  p { color: ${fleurimondColors.textMuted}; }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 0.75rem;
  background: ${fleurimondColors.surface};

  th, td { padding: 0.8rem; border-bottom: 1px solid ${fleurimondColors.surfaceBorder}; text-align: left; }
  thead { background: ${fleurimondColors.accentHover}; }
  tbody tr:nth-child(even) { background: ${fleurimondColors.rowAlt}; }
  tbody tr:hover { background: ${fleurimondColors.surfaceBorder}; }
  a:hover { color: ${fleurimondColors.accent}; }
`;

export { ResourcePage };

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  label { display: grid; gap: 0.5rem; flex: 1; min-width: min(100%, 220px); }
  input, select, button { font: inherit; padding: 0.8rem 1rem; border-radius: 0.5rem; border: 1px solid ${fleurimondColors.surfaceBorder}; }
  button { cursor: pointer; background: ${fleurimondColors.surface}; color: inherit; }
  button:disabled { opacity: 0.5; cursor: default; }
  :is(input, select, button):focus-visible { outline: 3px solid ${fleurimondColors.accent}; outline-offset: 3px; }
`;
