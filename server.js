require('dotenv').config();

const { createApp } = require('./server/createApp');

const PORT = process.env.PORT || 8080;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Fantasy Football Command Center server is running on port ${PORT}`);
});
