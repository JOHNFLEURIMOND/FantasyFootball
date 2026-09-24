# NFL & Fantasy Football Dashboard

A public React and Express dashboard for researching NFL players, teams,
schedules, standings, statistics, rankings, and estimated projections. The
primary experience does not require an account or fantasy-platform connection.

The application keeps provider-specific data behind server-side boundaries and
returns validated, canonical NFL data to the browser. Sleeper remains available
as secondary compatibility support for the legacy command-center workflow.

## Features

- Search and browse NFL players and teams.
- View player profiles with weekly and seasonal statistics.
- Review schedules, results, and standings by season.
- Compare multiple players and browse statistical leaderboards.
- Review full-PPR rankings derived from observed statistics.
- View estimated weekly projections based on a trailing average of up to four
  observed game weeks.
- See loading, empty, error, partial-data, and stale-data states.
- Use keyboard-accessible navigation, skip links, route announcements, and
  accessible data tables.
- Optionally use the legacy Sleeper command center to inspect league data by
  username.

Estimated projections are application-generated estimates. They are not
official projections supplied by the upstream data provider.

## Screenshots

Branding assets included in the repository:

![Fantasy Football Home](public/fantasyfootballHomePage.jpeg)
![Fantasy Football](public/fantasyfootball.jpeg)
![Players](public/Players.jpeg)

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Public dashboard with player and team search |
| `/players` | Player directory |
| `/players/:id` | Player profile and statistics |
| `/teams` | Team directory |
| `/schedule` | Schedules and results (canonical route) |
| `/Schedule` | Backwards-compatible Schedule alias |
| `/standings` | Season standings derived from completed games |
| `/stats` | Seasonal player statistics |
| `/WeeklyProjections` | Estimated weekly projections |
| `/PPR` | Full-PPR rankings from observed statistics |
| `/compare` | Player comparison |
| `/leaderboards` | Statistical leaderboards |

## API Endpoints

The Express server and Netlify function expose the same canonical API surface
under `/api`.

### Health and compatibility

- `GET /api/health`
- `GET /api/command-center`
- `POST /api/command-center`

The command-center endpoints are the secondary Sleeper compatibility flow.

### Public NFL data

- `GET /api/nflverse/players`
- `GET /api/nflverse/players/:id`
- `GET /api/nflverse/teams`
- `GET /api/nflverse/teams/:id`
- `GET /api/nflverse/schedule?season=YYYY&week=N`
- `GET /api/nflverse/standings?season=YYYY`
- `GET /api/nflverse/stats/weekly?season=YYYY&week=N`
- `GET /api/nflverse/stats/seasonal?season=YYYY`
- `GET /api/nflverse/projections?season=YYYY`
- `GET /api/nflverse/rankings?season=YYYY&format=ppr`
- `GET /api/nflverse/metadata`
- `POST /api/nflverse/refresh`

List endpoints support pagination and resource-specific filtering and sorting.
Compatibility endpoints also remain available for season-specific schedules and
statistics. See `server/routes/nflverseRoutes.js` for the complete request
contract.

The `/api/nflverse` path is an internal compatibility name. User-facing copy
uses provider-neutral terms such as “public NFL data” and “canonical NFL data.”

## Technology Stack

- Node.js 20 and npm 10
- React 18
- Express 4
- Webpack 5 and Babel
- Styled Components and Semantic UI React
- Zod runtime validation
- SQLite through `better-sqlite3`
- Node's built-in test runner, JSDOM, Supertest, and `@babel/register`
- Netlify hosting and Functions

Runtime constraints are defined in [package.json](package.json), and
[.nvmrc](.nvmrc) pins Node.js 20.

## Local Development

Install the locked dependencies:

```bash
npm ci
```

Optionally create a local environment file:

```bash
cp .env.example .env
```

Start the browser development server and Express API together:

```bash
npm run serve
```

You can also run them in separate terminals:

```bash
npm run server
npm run dev
```

The Express server defaults to port `8080`. Webpack Dev Server starts on an
available port beginning at `5000` and proxies `/api` requests to Express.

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Runtime mode: `development`, `test`, or `production` |
| `PORT` | No | `8080` | Local Express port; Netlify Functions do not use it |
| `NFL_DATA_DB_PATH` | No | `./data/nfl-data.sqlite` | Local SQLite path for ingestion and persistence tooling |

Run `npm run validate:env` to validate the environment. Production builds run
the same check automatically. The public data provider does not require an API
key. Do not commit `.env` files, credentials, or machine-specific paths.

## npm Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Webpack Dev Server in development mode |
| `npm run server` | Start the local Express server |
| `npm run serve` | Start the frontend and backend together |
| `npm start` | Start the Express production runtime |
| `npm run build` | Validate the environment and create a production bundle |
| `npm run ingest:nflverse -- YYYY` | Download and store versioned local snapshots |
| `npm run validate:env` | Validate supported runtime configuration |
| `npm run lint` | Run repository lint checks |
| `npm run test:a11y` | Run the automated accessibility baseline |
| `npm test` | Run the complete Node test suite |
| `npm run prettier` | Format supported repository files |

## Architecture

```text
React public NFL/fantasy dashboard
    ↓
Canonical frontend API layer
    ↓
Express / Netlify function API
    ↓
Canonical NFL service contracts
    ↓
nflverse provider boundary
    ↓
Validated public NFL datasets
```

Provider-specific response shapes do not flow into React components. The
backend validates downloaded records, normalizes them into strict domain
contracts, applies bounded retries and timeouts, and returns safe error and
freshness metadata.

The legacy command center follows a separate compatibility path:

```text
Legacy command-center UI
    ↓
Command-center API and service
    ↓
Sleeper client boundary
```

Technical references:

- [Domain contracts](docs/domain-contracts.md)
- [Public data provider](docs/providers/nflverse.md)
- [Ingestion pipeline](docs/ingestion.md)
- [Persistence](docs/persistence.md)
- [Deployment and runtime](docs/deployment.md)

## Persistence and Ingestion

The ingestion command downloads validated public datasets and stores versioned,
immutable local snapshots in SQLite:

```bash
npm run ingest:nflverse -- 2026
```

An optional comma-separated dataset list can follow the season. See
[docs/ingestion.md](docs/ingestion.md) for supported datasets, checkpoint
behavior, cache semantics, and failure handling.

SQLite is suitable for local ingestion history and tooling when
`NFL_DATA_DB_PATH` points to a durable writable filesystem. Netlify Functions
use ephemeral filesystems, so the repository's SQLite file is **not** a durable
production database on Netlify. Production API routes currently fetch public
data through the server-side provider boundary and do not depend on persisted
SQLite snapshots.

## Testing and CI

Run the complete local validation set before opening a pull request:

```bash
npm ci
npm test
npm run lint
npm run test:a11y
npm run build
npm audit --omit=dev --audit-level=critical
git diff --check
```

The GitHub Actions workflow runs dependency installation, tests, lint,
accessibility checks, the production build, and a critical-level production
dependency audit for pull requests targeting `main` and configured branch
pushes.

Automated checks provide a baseline; they do not replace keyboard, screen-reader,
responsive-layout, and production smoke testing.

## Netlify Deployment

[netlify.toml](netlify.toml) defines the production build:

- Build command: `NODE_ENV=production npm run build`
- Dependency installation includes development packages required by Webpack.
- Publish directory: `build`
- Functions directory: `netlify/functions`
- `/api/*` requests rewrite to the API function.
- Other routes fall back to `index.html` for client-side routing.

After deployment, verify `/api/health`, representative public API endpoints,
the home page, `/players`, `/leaderboards`, and a player-profile deep link.
See [docs/deployment.md](docs/deployment.md) for the complete deployment and
smoke-test procedure.

## Known Limitations

- Public source data can lag live games and may be corrected after publication.
- Estimated projections use recent observed statistics; they are not official or
  provider-authored forecasts.
- PPR is the only ranking/scoring format currently exposed.
- Standings are calculated from completed schedule results and do not include
  every league tiebreaking rule.
- Production Netlify Functions do not persist the local SQLite database.
- Sleeper support remains a secondary compatibility flow and is not required for
  the public dashboard.
- Automated accessibility checks do not prove full accessibility conformance.

## Roadmap

- Refine the public dashboard's visual hierarchy and responsive presentation
  while preserving the existing hero artwork and navy, red, and white identity.
- Improve data freshness visibility and operational monitoring.
- Expand projection methodology and scoring formats only when supported by clear
  source data and documented calculations.
- Add optional fantasy-provider connections behind server-side boundaries.
- Move persisted production snapshots to durable storage if production serving
  begins to depend on ingestion history.

## Contributing

- Use Node.js 20 and npm 10.
- Keep provider integrations server-side and preserve canonical application
  contracts.
- Prefer small, reviewable changes over broad rewrites.
- Add tests for new behavior and failure paths.
- Run the validation commands before opening a pull request.
- Do not commit secrets, local databases, generated build output, or
  machine-specific files.

## Links

- [GitHub repository](https://github.com/JOHNFLEURIMOND/FantasyFootball)
- [John Fleurimond on GitHub](https://github.com/JOHNFLEURIMOND)
- [John Fleurimond on LinkedIn](https://www.linkedin.com/in/john-fleurimond/)

## Public page metadata

Public routes use route-specific titles, descriptions, Open Graph metadata, and
production canonical URLs. The Schedule alias canonicalizes to `/schedule`;
query strings and fragments are excluded from canonical URLs.
The HTML shell provides default metadata, while route metadata requires JavaScript.
Netlify Prerender must be configured and verified separately for crawlers that
do not execute JavaScript. Disable the Netlify Drawer in project settings;
do not hide the injected overlay with application CSS or JavaScript.

## Public data controls

- Standings: search team names, filter conference/division, and sort by win
  percentage, wins, losses, or team name.
- Seasonal statistics: search player names, filter team/position, and sort player
  names or passing, rushing, and receiving yards.
- PPR: retain season/search/position controls, with team filtering, ascending or
  descending numeric sorting, and a reset button. Reset retains the selected season.
- Filters and sorting apply to the full loaded collection before pagination.
  Missing numeric values sort last; zero remains a valid value.

The analytics consent panel is intentionally hidden when production analytics
configuration or hostname gating disables analytics, including localhost and
Netlify deploy previews. Test production-enabled consent controls independently
from preview UI checks; a hidden preview banner does not indicate a broken button.
