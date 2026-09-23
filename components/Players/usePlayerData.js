import { useEffect, useState } from 'react';
import {
  fetchPlayers,
  fetchPlayer,
  fetchSeasonalStats,
  fetchTeams,
  fetchWeeklyStats,
  isPartialMeta,
  isStaleMeta,
} from '../api/nflverseApi';

export default function usePlayerData(season, playerId) {
  const [state, setState] = useState({
    players: [],
    teams: [],
    weeklyStats: [],
    seasonalStats: [],
    meta: [],
    loading: true,
    error: null,
    stale: false,
    partial: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState(current => ({ ...current, loading: true, error: null }));
      try {
        const settled = await Promise.allSettled([
          playerId ? fetchPlayer(playerId, { signal: controller.signal }) : fetchPlayers({ season, signal: controller.signal }),
          fetchTeams({ signal: controller.signal }),
          fetchWeeklyStats(season, { signal: controller.signal }),
          fetchSeasonalStats(season, { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        if (settled[0].status === 'rejected') throw settled[0].reason;
        const results = settled.map(result => result.status === 'fulfilled' ? result.value : { data: [], meta: null });
        const metas = results.map(result => result.meta);
        setState({
          players: results[0].data,
          teams: results[1].data,
          weeklyStats: results[2].data,
          seasonalStats: results[3].data,
          meta: metas,
          loading: false,
          error: null,
          stale: metas.some(isStaleMeta),
          partial: settled.some(result => result.status === 'rejected') || metas.some(isPartialMeta),
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          players: [],
          teams: [],
          weeklyStats: [],
          seasonalStats: [],
          meta: [],
          loading: false,
          error,
          stale: false,
          partial: false,
        });
      }
    }

    load();
    return () => controller.abort();
  }, [season, playerId]);

  return state;
}
