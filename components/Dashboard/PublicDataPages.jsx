import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchPlayers, fetchSeasonalStats, fetchStandings, fetchTeams } from '../api/nflverseApi';
import { TableRegion } from '../accessibility/Accessibility';
import { NavLink } from '../routing/SimpleRouter';
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

export const PlayersPage = () => (
  <ResourcePage
    title='Players'
    loader={fetchPlayers}
    render={players => (
      <List>{players.slice(0, 200).map(player => (
        <li key={player.playerId}>
          <NavLink to={`/players/${encodeURIComponent(player.playerId)}`}>{player.displayName}</NavLink>{' '}
          <span>{[player.position, player.teamId].filter(Boolean).join(' · ')}</span>
        </li>
      ))}</List>
    )}
  />
);

export const TeamsPage = () => (
  <ResourcePage
    title='Teams'
    loader={fetchTeams}
    render={teams => (
      <Grid>{teams.map(team => (
        <article key={team.teamId} aria-labelledby={`team-${team.teamId}`}>
          {team.logoUrl ? <img src={team.logoUrl} alt='' width='48' height='48' /> : null}
          <h2 id={`team-${team.teamId}`}>{[team.city, team.name].filter(Boolean).join(' ')}</h2>
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
            {rows.slice(0, 200).map(row => <tr key={row.statId}><th scope='row'><NavLink to={`/players/${encodeURIComponent(row.playerId)}`}>{row.playerId}</NavLink></th><td>{row.teamId || '—'}</td><td>{row.metrics?.passing_yards ?? '—'}</td><td>{row.metrics?.rushing_yards ?? '—'}</td><td>{row.metrics?.receiving_yards ?? '—'}</td></tr>)}
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
  gap: 0.65rem;

  li {
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
