import React, { useMemo, useState } from 'react';
import usePlayerData from './usePlayerData';
import { buildComparisonRows } from './playerResearch';
import { TableRegion } from '../accessibility/Accessibility';
import { NavLink } from '../routing/SimpleRouter';

const ComparePlayers = () => {
  const [season, setSeason] = useState(new Date().getFullYear());
  const [week, setWeek] = useState('');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const state = usePlayerData(season);

  const candidates = useMemo(() => {
    const value = query.trim().toLowerCase();
    return state.players.filter(player =>
      !value || [player.displayName, player.position, player.teamId]
        .filter(Boolean)
        .some(field => String(field).toLowerCase().includes(value))
    ).slice(0, 40);
  }, [state.players, query]);

  const rows = useMemo(() => buildComparisonRows({
    playerIds: selectedIds,
    players: state.players,
    weeklyStats: state.weeklyStats,
    season,
    week,
  }), [selectedIds, state.players, state.weeklyStats, season, week]);

  const toggle = id => setSelectedIds(current =>
    current.includes(id) ? current.filter(value => value !== id) : [...current, id]
  );

  return (
    <main id='main-content' tabIndex='-1' style={{ maxWidth: 1200, margin: '0 auto', padding: '6rem 1rem 3rem' }}>
      <h1>Player Comparison</h1>
      <p>Compare two or more players using the same season, week scope, and full-PPR scoring.</p>
      <div>
        <label htmlFor='compare-season'>Season</label>{' '}
        <input id='compare-season' type='number' min='1999' max='2100' value={season} onChange={event => setSeason(Number(event.target.value))} />{' '}
        <label htmlFor='compare-week'>Week</label>{' '}
        <input id='compare-week' type='number' min='1' max='30' value={week} onChange={event => setWeek(event.target.value)} placeholder='All' />{' '}
        <label htmlFor='compare-scoring'>Scoring</label>{' '}
        <select id='compare-scoring' value='ppr' disabled><option value='ppr'>Full PPR</option></select>{' '}
        <label htmlFor='compare-search'>Find players</label>{' '}
        <input id='compare-search' type='search' value={query} onChange={event => setQuery(event.target.value)} />
      </div>

      {state.loading ? <p role='status'>Loading comparison data…</p> : null}
      {!state.loading && state.error ? <p role='alert'>Unable to load comparison data: {state.error.message}</p> : null}
      {!state.loading && !state.error && state.stale ? <p role='status'>Showing cached data while the latest source refreshes.</p> : null}
      {!state.loading && !state.error && state.partial ? <p role='status'>Some metrics are incomplete; missing values are disclosed below.</p> : null}

      {!state.loading && !state.error ? (
        <>
          <fieldset>
            <legend>Select players</legend>
            {candidates.map(player => (
              <label key={player.playerId} style={{ display: 'block' }}>
                <input type='checkbox' checked={selectedIds.includes(player.playerId)} onChange={() => toggle(player.playerId)} />{' '}
                {player.displayName} · {player.position || '—'} · {player.teamId || 'FA'}
              </label>
            ))}
          </fieldset>
          <p role='status' aria-live='polite'>{selectedIds.length} players selected.</p>
          {selectedIds.length < 2 ? <p>Select at least two players to compare.</p> : null}
          {selectedIds.length >= 2 ? (
            <TableRegion label='Player comparison table'>
              <table>
                <caption>Aligned comparison for {season}{week ? ` week ${week}` : ' season to date'}</caption>
                <thead><tr><th scope='col'>Player</th><th scope='col'>Team</th><th scope='col'>Games</th><th scope='col'>PPR</th><th scope='col'>Passing yds</th><th scope='col'>Rushing yds</th><th scope='col'>Receiving yds</th><th scope='col'>Receptions</th><th scope='col'>Status</th></tr></thead>
                <tbody>{rows.map(row => (
                  <tr key={row.playerId}>
                    <th scope='row'><NavLink to={`/players/${encodeURIComponent(row.playerId)}`}>{row.displayName}</NavLink></th>
                    <td>{row.teamId || '—'}</td><td>{row.games}</td><td>{row.missing ? '—' : row.fantasyPointsPpr}</td>
                    <td>{row.missing ? '—' : row.metrics.passing_yards ?? 0}</td><td>{row.missing ? '—' : row.metrics.rushing_yards ?? 0}</td>
                    <td>{row.missing ? '—' : row.metrics.receiving_yards ?? 0}</td><td>{row.missing ? '—' : row.metrics.receptions ?? 0}</td>
                    <td>{row.missing ? 'Missing statistics' : 'Available'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </TableRegion>
          ) : null}
        </>
      ) : null}
    </main>
  );
};

export default ComparePlayers;
