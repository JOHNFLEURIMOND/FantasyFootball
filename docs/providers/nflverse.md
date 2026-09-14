# nflverse provider

The nflverse provider is the public, account-independent NFL data boundary for
the application. It downloads CSV assets on the server and converts provider
rows into the strict canonical contracts in `server/lib/domainSchemas.js`.
React components and future API routes must not consume nflverse rows directly.

## Sources

The URLs match the release assets used by the nflverse project and its
`nflreadr` loader:

| Resource                   | Release asset                                    | Supported seasons                   |
| -------------------------- | ------------------------------------------------ | ----------------------------------- |
| Player directory           | `players/players.csv`                            | Provider-maintained history         |
| Team directory             | `teams/teams_colors_logos.csv`                   | Current and historical teams        |
| Rosters                    | `rosters/roster_{season}.csv`                    | 1920 through the current NFL season |
| Schedules and results      | `schedules/games.csv`                            | 1920 through the current NFL season |
| Weekly player statistics   | `stats_player/stats_player_week_{season}.csv`    | 1999 through the current NFL season |
| Seasonal player statistics | `stats_player/stats_player_regpost_{season}.csv` | 1999 through the current NFL season |

Primary references:

- https://github.com/nflverse/nflverse-data
- https://github.com/nflverse/nflreadr
- https://nflreadr.nflverse.com/articles/nflverse_data_schedule.html
- https://nflreadr.nflverse.com/articles/dictionary_players.html
- https://nflreadr.nflverse.com/articles/dictionary_rosters.html
- https://nflreadr.nflverse.com/articles/dictionary_schedules.html
- https://nflreadr.nflverse.com/articles/dictionary_player_stats.html

The nflverse repositories publish their data under CC BY 4.0. Preserve source
attribution in product documentation and downstream exports.

## Provider contract

`createNflverseProvider()` exposes:

- `getPlayers()`
- `getTeams({ currentOnly })`
- `getRosters(season)`
- `getSchedules(season)`
- `getWeeklyStats(season)`
- `getSeasonalStats(season)`

Every method returns `{ data, meta }`. `data` contains canonical entities.
`meta` identifies the source URL, release tag, ETag or Last-Modified version,
fetch time, source update time when supplied, and cache state.
Metadata also reports received, returned, and skipped record counts. Roster rows
without a GSIS player ID cannot satisfy the canonical player contract and are
skipped explicitly instead of causing the entire roster import to fail.
Player-stat releases can contain team-aggregate rows without player IDs; these
are counted and skipped for the same reason. List-valued kicking fields remain
provider details and are not copied into the numeric canonical metrics record.

Downloads use a 30-second timeout, two bounded retries for transient failures,
a 64 MiB response limit, a six-hour fresh cache, and a 24-hour stale fallback.
Callers receive safe error codes instead of raw provider payloads or parser
details. Seasons are checked before any network request.

## Refresh expectations and limitations

nflverse assets update on their automation schedule. They are not a guaranteed
real-time commercial feed. Scores and statistics can lag games and can be
corrected after initial publication. The provider reports freshness metadata so
callers can disclose that state.

The schedules asset contains multiple seasons and is filtered after validation.
Team results default to the current 32 abbreviations while historical teams can
be requested. Roster rows are returned as canonical player snapshots because a
separate canonical roster contract does not yet exist.

This provider does not supply application projections, standings calculations,
player comparisons, leaderboards, or fantasy-account data. Those belong to
separate application services and later issues. Sleeper remains available only
for the existing command-center flow until that flow is migrated.
