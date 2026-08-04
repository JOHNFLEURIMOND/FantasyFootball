import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { fetchCommandCenterView } from './api/commandCenterApi';

export const NewsContext = createContext();
export const StatsContext = createContext();

const COMMAND_CENTER_STATE_KEY = 'ff:lastCommandCenterState';
const POSITIONS = ['QB', 'RB', 'WR', 'TE'];
const SCHEDULE_PAGE_SIZE = 8;

function readStoredSelection() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(COMMAND_CENTER_STATE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return {
      username: parsed.username || '',
      leagueId: parsed.leagueId || '',
      week: parsed.week || '',
    };
  } catch (_error) {
    return {};
  }
}

function normalizeStatsError(error) {
  if (error?.safe) {
    return error.safe;
  }

  return {
    code: 'LEGACY_STATS_UNAVAILABLE',
    message: error?.message || 'Unable to load stats from command center data.',
    retryable: false,
  };
}

function getRosterName(roster) {
  return roster.ownerTeamName || roster.ownerDisplayName || `Roster ${roster.rosterId}`;
}

function buildStatsFromCommandCenter(payload) {
  const rosters = payload?.rosters || [];
  const selectedLeague = payload?.selectedLeague;
  const matchups = payload?.matchups || [];
  const matchupByRosterId = new Map(matchups.map(matchup => [String(matchup.rosterId), matchup]));
  const rosterById = new Map(rosters.map(roster => [String(roster.rosterId), roster]));

  return rosters.map((roster, index) => {
    const matchup = matchupByRosterId.get(String(roster.rosterId));
    const opponent = matchup?.opponentRosterId
      ? rosterById.get(String(matchup.opponentRosterId))
      : null;

    const pointsFor = Number(roster.pointsFor || 0);
    const playerCount = (roster.players || []).length;
    const starters = (roster.starters || []).length;

    return {
      PlayerID: roster.rosterId,
      Name: getRosterName(roster),
      Position: POSITIONS[index % POSITIONS.length],
      Team: selectedLeague?.name || 'Sleeper League',
      Opponent: opponent ? getRosterName(opponent) : 'TBD',
      GameDate: new Date().toISOString(),
      HomeOrAway: index % 2 === 0 ? 'HOME' : 'AWAY',
      Activated: 1,
      PassingAttempts: Math.max(starters, 1),
      PassingCompletions: Math.max(Math.floor(starters * 0.7), 1),
      PassingYards: Math.round(pointsFor * 8),
      PassingTouchdowns: Math.max(Math.round(pointsFor / 10), 0),
      RushingAttempts: Math.max(playerCount - starters, 0),
      RushingYards: Math.round(pointsFor * 4),
      RushingTouchdowns: Math.max(Math.round(pointsFor / 20), 0),
      Receptions: Math.max(Math.round(starters / 2), 0),
      ReceivingYards: Math.round(pointsFor * 5),
      ReceivingTouchdowns: Math.max(Math.round(pointsFor / 25), 0),
      FantasyPoints: pointsFor,
      FantasyPointsPPR: pointsFor,
      FantasyPointsFanDuel: pointsFor,
      FantasyPointsDraftKings: pointsFor,
      FantasyPointsYahoo: pointsFor,
    };
  });
}

function buildSchedulesFromCommandCenter(payload) {
  const rosters = payload?.rosters || [];
  const matchups = payload?.matchups || [];
  const selectedLeague = payload?.selectedLeague;
  const week = payload?.resolvedWeek || 0;
  const rostersById = new Map(rosters.map(roster => [String(roster.rosterId), roster]));

  const grouped = new Map();
  for (const matchup of matchups) {
    const key = String(matchup.matchupId);
    const bucket = grouped.get(key) || [];
    bucket.push(matchup);
    grouped.set(key, bucket);
  }

  return Array.from(grouped.entries()).map(([matchupId, teams], index) => {
    const awayMatchup = teams[0];
    const homeMatchup = teams[1] || teams[0];
    const awayRoster = rostersById.get(String(awayMatchup.rosterId));
    const homeRoster = rostersById.get(String(homeMatchup.rosterId));
    const awayPoints = Number(awayMatchup.points || 0);
    const homePoints = Number(homeMatchup.points || 0);
    const gameDate = new Date(Date.now() + index * 60 * 60 * 1000).toISOString();

    return {
      GameKey: `${selectedLeague?.leagueId || 'league'}-${week}-${matchupId}`,
      AwayTeam: awayRoster ? getRosterName(awayRoster) : `Roster ${awayMatchup.rosterId}`,
      HomeTeam: homeRoster ? getRosterName(homeRoster) : `Roster ${homeMatchup.rosterId}`,
      Date: gameDate,
      DateTime: gameDate,
      Channel: 'Sleeper',
      PointSpread: (awayPoints - homePoints).toFixed(1),
      OverUnder: (awayPoints + homePoints).toFixed(1),
      StadiumDetails: {
        Name: selectedLeague?.name || 'Sleeper League',
        City: 'Online',
        State: 'N/A',
        Country: 'USA',
        PlayingSurface: 'Digital',
      },
      AwayTeamMoneyLine: awayPoints >= homePoints ? '-110' : '+110',
      HomeTeamMoneyLine: homePoints >= awayPoints ? '-110' : '+110',
      Status: payload?.nflState?.seasonType || 'regular',
    };
  });
}

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPosition, setSelectedPosition] = useState('');

  const fetchStats = useCallback(async () => {
    const stored = readStoredSelection();
    if (!stored.username || !stored.leagueId) {
      setStats([]);
      setScores([]);
      setTotalPages(1);
      setError({
        code: 'SLEEPER_SELECTION_REQUIRED',
        message: 'Load a Sleeper username and league in Command Center first, then return to this page.',
        retryable: false,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await fetchCommandCenterView({
        username: stored.username,
        leagueId: stored.leagueId,
        week: stored.week || undefined,
      });

      const nextStats = buildStatsFromCommandCenter(payload);
      setStats(nextStats);
      setScores(nextStats);
      setTotalPages(Math.max(1, Math.ceil(nextStats.length / 12)));
      setCurrentPage(1);
    } catch (caughtError) {
      setStats([]);
      setScores([]);
      setTotalPages(1);
      setError(normalizeStatsError(caughtError));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScores = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const contextValue = useMemo(
    () => ({
      stats,
      scores,
      loading,
      error,
      fetchStats,
      fetchScores,
      currentPage,
      setCurrentPage,
      totalPages,
      selectedPosition,
      setSelectedPosition,
    }),
    [
      stats,
      scores,
      loading,
      error,
      fetchStats,
      fetchScores,
      currentPage,
      totalPages,
      selectedPosition,
    ]
  );

  return <StatsContext.Provider value={contextValue}>{children}</StatsContext.Provider>;
};

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = useCallback(async () => {
    setNews([]);
  }, []);

  const fetchSchedules = useCallback(
    async page => {
      const requestedPage = Number.isInteger(page) ? page : 1;

      if (allSchedules.length > 0) {
        const start = (requestedPage - 1) * SCHEDULE_PAGE_SIZE;
        const end = start + SCHEDULE_PAGE_SIZE;
        setSchedules(allSchedules.slice(start, end));
        setCurrentPage(requestedPage);
        setLoaded(true);
        return;
      }

      const stored = readStoredSelection();
      if (!stored.username || !stored.leagueId) {
        setSchedules([]);
        setAllSchedules([]);
        setTotalPages(1);
        setCurrentPage(1);
        setLoaded(true);
        return;
      }

      setLoaded(false);
      try {
        const payload = await fetchCommandCenterView({
          username: stored.username,
          leagueId: stored.leagueId,
          week: stored.week || undefined,
        });

        const nextSchedules = buildSchedulesFromCommandCenter(payload);
        const pages = Math.max(1, Math.ceil(nextSchedules.length / SCHEDULE_PAGE_SIZE));
        const boundedPage = Math.min(Math.max(requestedPage, 1), pages);
        const start = (boundedPage - 1) * SCHEDULE_PAGE_SIZE;
        const end = start + SCHEDULE_PAGE_SIZE;

        setAllSchedules(nextSchedules);
        setSchedules(nextSchedules.slice(start, end));
        setTotalPages(pages);
        setCurrentPage(boundedPage);
      } catch (_error) {
        setAllSchedules([]);
        setSchedules([]);
        setTotalPages(1);
        setCurrentPage(1);
      } finally {
        setLoaded(true);
      }
    },
    [allSchedules]
  );

  const contextValue = useMemo(
    () => ({
      news,
      schedules,
      loaded,
      fetchNews,
      fetchSchedules,
      currentPage,
      setCurrentPage,
      totalPages,
    }),
    [
      news,
      schedules,
      loaded,
      fetchNews,
      fetchSchedules,
      currentPage,
      totalPages,
    ]
  );

  return <NewsContext.Provider value={contextValue}>{children}</NewsContext.Provider>;
};
