const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build'))); // Serve static files from the build directory

// Serve index.html if no route matches
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Proxy endpoint
app.use('/api', async (req, res) => {
  try {
    const url = `https://api.sportsdata.io${req.originalUrl.replace('/api', '')}`;
    const response = await axios.get(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.REACT_APP_API_KEY, // Use your API key here
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy request error:', error.message);
    res.status(error.response?.status || 500).send(error.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
