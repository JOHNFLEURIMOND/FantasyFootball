import React, { useEffect, useMemo, useState } from 'react';
import usePlayerData from './usePlayerData';
import { buildLeaderboard } from './playerResearch';
import { TableRegion } from '../accessibility/Accessibility';
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
    <main id='main-content' tabIndex='-1' style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1rem 3rem' }}>
      <h1>Statistical Leaderboards</h1>
      <div>
        <label htmlFor='leaderboard-season'>Season</label>{' '}
        <input id='leaderboard-season' type='number' min='1999' max='2100' value={season} onChange={event => setSeason(Number(event.target.value))} />{' '}
        <label htmlFor='leaderboard-week'>Week</label>{' '}
        <input id='leaderboard-week' type='number' min='1' max='30' value={week} onChange={event => setWeek(event.target.value)} placeholder='All' />{' '}
        <label htmlFor='leaderboard-position'>Position</label>{' '}
        <select id='leaderboard-position' value={position} onChange={event => setPosition(event.target.value)}><option value=''>All</option>{['QB','RB','WR','TE'].map(value => <option key={value}>{value}</option>)}</select>{' '}
        <label htmlFor='leaderboard-scoring'>Scoring</label>{' '}
        <select id='leaderboard-scoring' value='ppr' disabled><option value='ppr'>Full PPR</option></select>{' '}
        <label htmlFor='leaderboard-sort'>Sort by</label>{' '}
        <select id='leaderboard-sort' value={sortBy} onChange={event => setSortBy(event.target.value)}>{SORTS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>

      {state.loading ? <p role='status'>Loading leaderboard…</p> : null}
      {!state.loading && state.error ? <p role='alert'>Unable to load leaderboard: {state.error.message}</p> : null}
      {!state.loading && !state.error && state.stale ? <p role='status'>Showing cached data while the latest source refreshes.</p> : null}
      {!state.loading && !state.error && state.partial ? <p role='status'>Some metrics are incomplete; available results are shown.</p> : null}
      {!state.loading && !state.error && leaderboard.totalItems === 0 ? <p role='status'>No leaderboard data matches these filters.</p> : null}

      {!state.loading && !state.error && leaderboard.totalItems > 0 ? (
        <>
          <TableRegion label='Statistical leaderboard table'>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <caption>{season}{week ? ` week ${week}` : ' season-to-date'} leaderboard</caption>
              <thead><tr><th scope='col'>Rank</th><th scope='col'>Player</th><th scope='col'>Pos</th><th scope='col'>Team</th><th scope='col'>PPR</th><th scope='col'>Pass yds</th><th scope='col'>Rush yds</th><th scope='col'>Rec yds</th><th scope='col'>Rec</th></tr></thead>
              <tbody>{leaderboard.items.map((row, index) => (
                <tr key={row.playerId}>
                  <td>{(leaderboard.activePage - 1) * 25 + index + 1}</td>
                  <th scope='row'><NavLink to={`/players/${encodeURIComponent(row.playerId)}`}>{row.displayName}</NavLink></th>
                  <td>{row.position || '—'}</td><td>{row.teamId || '—'}</td><td>{row.fantasyPointsPpr}</td>
                  <td>{row.passingYards}</td><td>{row.rushingYards}</td><td>{row.receivingYards}</td><td>{row.receptions}</td>
                </tr>
              ))}</tbody>
            </table>
          </TableRegion>
          <p role='status' aria-live='polite'>Page {leaderboard.activePage} of {leaderboard.totalPages}.</p>
          <Pagination currentPage={leaderboard.activePage} totalPages={leaderboard.totalPages} onPageChange={(_event, data) => setPage(Number(data.activePage))} />
        </>
      ) : null}
    </main>
  );
};

export default Leaderboards;
