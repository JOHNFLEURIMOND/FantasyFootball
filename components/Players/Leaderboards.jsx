import React, { useEffect, useMemo, useState } from 'react';
import usePlayerData from './usePlayerData';
import { buildLeaderboard } from './playerResearch';
import { NavLink } from '../routing/SimpleRouter';
import Pagination from '../Pagination/Pagination';

const SORTS = [
  ['fantasyPointsPpr', 'PPR points'],
  ['passingYards', 'Passing yards'],
  ['rushingYards', 'Rushing yards'],
  ['receivingYards', 'Receiving yards'],
  ['receptions', 'Receptions'],
];

const Leaderboards = () => {
  const [season, setSeason] = useState(new Date().getFullYear());
  const [week, setWeek] = useState('');
  const [position, setPosition] = useState('');
  const [sortBy, setSortBy] = useState('fantasyPointsPpr');
  const [page, setPage] = useState(1);
  const state = usePlayerData(season);

  useEffect(() => setPage(1), [season, week, position, sortBy]);

  const leaderboard = useMemo(() => buildLeaderboard({
    players: state.players,
    weeklyStats: state.weeklyStats,
    season,
    week,
    position,
    sortBy,
    page,
    pageSize: 25,
  }), [state.players, state.weeklyStats, season, week, position, sortBy, page]);

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1rem 3rem' }}>
      <h1>Statistical Leaderboards</h1>
      <div>
        <label>Season <input type='number' min='1999' max='2100' value={season} onChange={event => setSeason(Number(event.target.value))} /></label>{' '}
        <label>Week <input type='number' min='1' max='30' value={week} onChange={event => setWeek(event.target.value)} placeholder='All' /></label>{' '}
        <label>Position <select value={position} onChange={event => setPosition(event.target.value)}><option value=''>All</option>{['QB','RB','WR','TE'].map(value => <option key={value}>{value}</option>)}</select></label>{' '}
        <label>Scoring <select value='ppr' disabled><option value='ppr'>Full PPR</option></select></label>{' '}
        <label>Sort by <select value={sortBy} onChange={event => setSortBy(event.target.value)}>{SORTS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>

      {state.loading ? <p role='status'>Loading leaderboard…</p> : null}
      {!state.loading && state.error ? <p role='alert'>Unable to load leaderboard: {state.error.message}</p> : null}
      {!state.loading && !state.error && state.stale ? <p role='status'>Showing cached data while the latest source refreshes.</p> : null}
      {!state.loading && !state.error && state.partial ? <p role='status'>Some metrics are incomplete; available results are shown.</p> : null}
      {!state.loading && !state.error && leaderboard.totalItems === 0 ? <p role='status'>No leaderboard data matches these filters.</p> : null}

      {!state.loading && !state.error && leaderboard.totalItems > 0 ? (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <caption>{season}{week ? ` week ${week}` : ' season-to-date'} leaderboard</caption>
            <thead><tr><th>Rank</th><th>Player</th><th>Pos</th><th>Team</th><th>PPR</th><th>Pass yds</th><th>Rush yds</th><th>Rec yds</th><th>Rec</th></tr></thead>
            <tbody>{leaderboard.items.map((row, index) => (
              <tr key={row.playerId}>
                <td>{(leaderboard.activePage - 1) * 25 + index + 1}</td>
                <th scope='row'><NavLink to={`/players/${encodeURIComponent(row.playerId)}`}>{row.displayName}</NavLink></th>
                <td>{row.position || '—'}</td><td>{row.teamId || '—'}</td><td>{row.fantasyPointsPpr}</td>
                <td>{row.passingYards}</td><td>{row.rushingYards}</td><td>{row.receivingYards}</td><td>{row.receptions}</td>
              </tr>
            ))}</tbody>
          </table>
          <Pagination currentPage={leaderboard.activePage} totalPages={leaderboard.totalPages} onPageChange={(_event, data) => setPage(Number(data.activePage))} />
        </>
      ) : null}
    </main>
  );
};

export default Leaderboards;
