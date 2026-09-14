import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchPlayers, fetchSeasonalStats, fetchStandings, fetchTeams } from '../api/nflverseApi';
import { NavLink } from '../routing/SimpleRouter';

const DEFAULT_SEASON = new Date().getFullYear();

function ResourcePage({ title, loader, render }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
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
    <Main>
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
        <article key={team.teamId}>
          {team.logoUrl ? <img src={team.logoUrl} alt='' width='48' height='48' /> : null}
          <h2>{[team.city, team.name].filter(Boolean).join(' ')}</h2>
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
      <Table><thead><tr><th>Team</th><th>W</th><th>L</th><th>T</th><th>Win %</th></tr></thead><tbody>
        {rows.map(row => <tr key={row.teamId}><th scope='row'>{row.name}</th><td>{row.wins}</td><td>{row.losses}</td><td>{row.ties}</td><td>{row.winPercentage}</td></tr>)}
      </tbody></Table>
    )}
  />
);

export const StatsPage = () => (
  <ResourcePage
    title={`${DEFAULT_SEASON} Seasonal Statistics`}
    loader={() => fetchSeasonalStats(DEFAULT_SEASON)}
    render={rows => (
      <Table><thead><tr><th>Player</th><th>Team</th><th>Passing</th><th>Rushing</th><th>Receiving</th></tr></thead><tbody>
        {rows.slice(0, 200).map(row => <tr key={row.statId}><th scope='row'><NavLink to={`/players/${encodeURIComponent(row.playerId)}`}>{row.playerId}</NavLink></th><td>{row.teamId || '—'}</td><td>{row.metrics?.passing_yards ?? '—'}</td><td>{row.metrics?.rushing_yards ?? '—'}</td><td>{row.metrics?.receiving_yards ?? '—'}</td></tr>)}
      </tbody></Table>
    )}
  />
);

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 1rem 3rem;
`;
const List = styled.ul`
  display: grid;
  gap: 0.65rem;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td { padding: 0.65rem; border-bottom: 1px solid #ccc; text-align: left; }
`;
