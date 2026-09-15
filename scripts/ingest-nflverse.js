#!/usr/bin/env node

const { openNflDatabase } = require('../server/lib/persistence/database');
const {
  createIngestionStore,
} = require('../server/lib/persistence/ingestionStore');
const {
  createNflverseIngestionPipeline,
} = require('../server/lib/ingestion/nflverseIngestion');
const {
  createNflverseClient,
} = require('../server/lib/providers/nflverse');

async function main() {
  const season = Number(process.argv[2] || new Date().getFullYear());
  const datasets = process.argv[3]
    ? process.argv[3].split(',').map(value => value.trim()).filter(Boolean)
    : undefined;

  const database = openNflDatabase();
  try {
    const store = createIngestionStore({ database });
    const client = createNflverseClient();
    const pipeline = createNflverseIngestionPipeline({ client, store });
    const result = await pipeline.ingest({ season, datasets });

    process.stdout.write(
      `${JSON.stringify(
        {
          runId: result.run.run_id,
          season,
          status: result.run.status,
          snapshots: result.snapshots.map(snapshot => ({
            dataset: snapshot.dataset,
            season: snapshot.season,
            version: snapshot.dataset_version,
            rows: snapshot.row_count,
          })),
        },
        null,
        2
      )}\n`
    );
  } finally {
    database.close();
  }
}

main().catch(error => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
