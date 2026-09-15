require('dotenv').config();

const { createApp } = require('./server/createApp');
const { parseRuntimeConfig } = require('./server/lib/runtimeConfig');

const config = parseRuntimeConfig(process.env);
process.env.NFL_DATA_DB_PATH = config.nflDataDbPath;

const app = createApp();

app.listen(config.port, () => {
  console.log(`Fantasy Football server is running on port ${config.port}`);
});
