# Deployment and runtime baseline

## Supported runtime

- Node.js 20.x, as defined by `.nvmrc` and `package.json`.
- npm 10.x.
- Production frontend hosting and API routing use Netlify.
- The browser bundle is written to `build/`.
- Requests under `/api/*` are rewritten to `netlify/functions/api.js`.
- Other paths fall back to `index.html` for client-side routing.

## Environment variables

Copy `.env.example` to `.env` for local development. No secrets are required for the public nflverse data provider.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Runtime mode. Allowed values are `development`, `test`, and `production`. |
| `PORT` | No | `8080` | Port for the local Express server. Netlify Functions do not use it. |
| `NFL_DATA_DB_PATH` | No | `./data/nfl-data.sqlite` | SQLite file used by local persistence and ingestion tooling. |

Run `npm run validate:env` to validate the current environment. The production build runs the same validation automatically through `prebuild`.

## Local development

Install dependencies with the repository lockfile:

```sh
npm ci
```

Optional local environment file:

```sh
cp .env.example .env
```

Run the browser development server and Express API together:

```sh
npm run serve
```

The Express server listens on `PORT` and the webpack development server proxies API requests to it.

## Data ingestion

The local ingestion command stores versioned raw-feed snapshots in SQLite:

```sh
npm run ingest:nflverse -- 2026
```

You can optionally pass a comma-separated dataset list as the next argument. See `docs/ingestion.md` for snapshot and cache semantics.

`NFL_DATA_DB_PATH` must point to a durable writable filesystem when ingestion history needs to persist. Netlify Functions have ephemeral filesystem semantics, so the local SQLite file is **not** a supported persistent production database for serverless requests. Current production canonical API routes fetch public nflverse data through the provider boundary and do not depend on a durable SQLite file.

## Production validation

Before deployment, run:

```sh
npm ci
npm test
npm run lint
npm run test:a11y
npm run build
npm audit --omit=dev --audit-level=critical
```

`npm run build` first validates runtime configuration and then creates the webpack production bundle.

## Netlify deployment

`netlify.toml` is the source of truth for the deployment target:

- build command: `NODE_ENV=production npm run build`
- publish directory: `build`
- functions directory: `netlify/functions`
- function bundler: `esbuild`
- `/api/*` rewrite: `/.netlify/functions/api/:splat`
- SPA fallback: `/index.html`

A production deployment should be considered healthy only after the Netlify build succeeds and these checks respond successfully:

```text
/api/health
/api/nflverse/players
/api/nflverse/teams
/api/nflverse/schedule?season=<supported-season>
```

Also smoke-test direct browser routes such as `/players`, `/leaderboards`, and one `/players/:id` URL to verify the SPA fallback.

## Failure behavior

Invalid environment values fail before the local Express server starts or before a production bundle is built. The validator reports the invalid variable names without printing credentials or other environment values.
