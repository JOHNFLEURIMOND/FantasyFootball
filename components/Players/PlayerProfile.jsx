import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { TableRegion } from '../accessibility/Accessibility';
import { useParams } from '../routing/SimpleRouter';
import { buildPlayerProfile } from './playerResearch';
import usePlayerData from './usePlayerData';
import { fleurimondColors } from '../CSS/theme';

const FIRST_SEASON = 1999;

function freshness(meta = []) {
  const timestamps = meta
    .map(item => item?.sourceUpdatedAt || item?.fetchedAt || item?.generatedAt)
    .filter(Boolean)
    .sort();
  return timestamps.length ? timestamps[timestamps.length - 1] : null;
}

const PlayerProfile = () => {
  const { id } = useParams();
  const [season, setSeason] = useState(new Date().getFullYear());
  const state = usePlayerData(season);
  const profile = useMemo(
    () => buildPlayerProfile({
      playerId: id,
      players: state.players,
      teams: state.teams,
      weeklyStats: state.weeklyStats,
      seasonalStats: state.seasonalStats,
    }),
    [id, state.players, state.teams, state.weeklyStats, state.seasonalStats]
  );
  const seasons = [];
  for (let value = new Date().getFullYear(); value >= FIRST_SEASON; value -= 1) seasons.push(value);

  return (
    <Main id='main-content' tabIndex='-1'>
      <h1>Player Profile</h1>
      <label htmlFor='profile-season'>Season</label>{' '}
      <select id='profile-season' value={season} onChange={event => setSeason(Number(event.target.value))}>
        {seasons.map(value => <option key={value} value={value}>{value}</option>)}
      </select>

      {state.loading ? <Status role='status'>Loading player profile…</Status> : null}
      {!state.loading && state.error ? <Status role='alert'>Unable to load player profile: {state.error.message}</Status> : null}
      {!state.loading && !state.error && !profile ? <Status role='status'>No player was found for this canonical ID.</Status> : null}
      {!state.loading && !state.error && profile && state.stale ? <Status role='status'>Showing cached player data while the latest source refreshes.</Status> : null}
      {!state.loading && !state.error && profile && state.partial ? <Status role='status'>Some player metrics are unavailable; available data is shown.</Status> : null}

      {!state.loading && !state.error && profile ? (
        <>
          <Identity aria-labelledby='player-name'>
            {profile.team?.logoUrl ? <img src={profile.team.logoUrl} alt='' width='64' height='64' /> : null}
            <div>
              <h2 id='player-name'>{profile.player.displayName}</h2>
              <p>{profile.player.position || 'Position unavailable'} · {profile.team ? [profile.team.city, profile.team.name].filter(Boolean).join(' ') : profile.player.teamId || 'Free agent'}</p>
              <p>Canonical player ID: <code>{profile.player.playerId}</code></p>
            </div>
          </Identity>

          <section aria-labelledby='weekly-heading'>
            <h2 id='weekly-heading'>Weekly game logs</h2>
            {profile.weekly.length === 0 ? <p>No weekly statistics are available for this season.</p> : (
              <TableRegion label={`${profile.player.displayName} weekly game logs`}>
                <Table><thead><tr><th scope='col'>Week</th><th scope='col'>Team</th><th scope='col'>Passing yds</th><th scope='col'>Rushing yds</th><th scope='col'>Receiving yds</th><th scope='col'>Receptions</th></tr></thead><tbody>
                  {profile.weekly.map(stat => (
                    <tr key={stat.statId}>
                      <th scope='row'>{stat.week}</th>
                      <td>{stat.teamId || '—'}</td>
                      <td>{stat.metrics?.passing_yards ?? '—'}</td>
                      <td>{stat.metrics?.rushing_yards ?? '—'}</td>
                      <td>{stat.metrics?.receiving_yards ?? '—'}</td>
                      <td>{stat.metrics?.receptions ?? '—'}</td>
                    </tr>
                  ))}
                </tbody></Table>
              </TableRegion>
            )}
          </section>

          <section aria-labelledby='seasonal-heading'>
            <h2 id='seasonal-heading'>Season totals</h2>
            {profile.seasonal.length === 0 ? <p>No seasonal totals are available for this season.</p> : (
              <TableRegion label={`${profile.player.displayName} season totals`}>
                <Table><thead><tr><th scope='col'>Season</th><th scope='col'>Team</th><th scope='col'>Passing yds</th><th scope='col'>Rushing yds</th><th scope='col'>Receiving yds</th><th scope='col'>Receptions</th></tr></thead><tbody>
                  {profile.seasonal.map(stat => (
                    <tr key={stat.statId}>
                      <th scope='row'>{stat.season}</th>
                      <td>{stat.teamId || '—'}</td>
                      <td>{stat.metrics?.passing_yards ?? '—'}</td>
                      <td>{stat.metrics?.rushing_yards ?? '—'}</td>
                      <td>{stat.metrics?.receiving_yards ?? '—'}</td>
                      <td>{stat.metrics?.receptions ?? '—'}</td>
                    </tr>
                  ))}
                </tbody></Table>
              </TableRegion>
            )}
          </section>

          <Metadata>
            <h2>Data source & freshness</h2>
            <p>Source: public canonical NFL datasets.</p>
            <p>Latest source/fetch timestamp: {freshness(state.meta) ? new Date(freshness(state.meta)).toLocaleString() : 'Unavailable'}</p>
          </Metadata>
        </>
      ) : null}
    </Main>
  );
};

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 1rem 3rem;
  min-height: 100dvh;
  select { padding: 0.65rem; border-radius: 0.5rem; }
  select:focus-visible { outline: 3px solid ${fleurimondColors.accent}; outline-offset: 2px; }
  &:focus { outline: none; }
`;
const Identity = styled.section`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1.5rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 1rem;
  background: ${fleurimondColors.surface};
`;
const Status = styled.p`
  padding: 1rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 0.5rem;
  background: ${fleurimondColors.surface};
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  background: ${fleurimondColors.surface};
  th, td { padding: 0.75rem; border-bottom: 1px solid ${fleurimondColors.surfaceBorder}; text-align: left; }
  thead { background: ${fleurimondColors.accentHover}; }
  tbody tr:nth-child(even) { background: ${fleurimondColors.rowAlt}; }
`;
const Metadata = styled.section`
  padding: 1rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 0.5rem;
  background: ${fleurimondColors.surface};

  p { color: ${fleurimondColors.textMuted}; }
`;

export { freshness };
export default PlayerProfile;
