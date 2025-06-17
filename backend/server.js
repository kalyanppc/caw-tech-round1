const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const NodeCache = require('node-cache');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache
const API = 'https://api.weatherapi.com/v1';
const KEY = process.env.WEATHER_API_KEY;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GET current weather
app.get('/weather/current/:city', async (req, res) => {
  const city = req.params.city;
  const cacheKey = `current:${city.toLowerCase()}`;

  try {
    let data = cache.get(cacheKey);
    if (!data) {
      const response = await axios.get(`${API}/current.json`, {
        params: { key: KEY, q: city, aqi: 'yes' },
      });
      data = response.data;
      cache.set(cacheKey, data);
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching current weather:", error.message);
    res.status(500).json({ error: "Failed to fetch current weather." });
  }
});

// GET forecast
app.get('/weather/forecast/:city', async (req, res) => {
  const city = req.params.city;
  const cacheKey = `forecast:${city.toLowerCase()}`;

  try {
    let data = cache.get(cacheKey);
    if (!data) {
      const response = await axios.get(`${API}/forecast.json`, {
        params: { key: KEY, q: city, days: 3, aqi: 'yes', alerts: 'yes' },
      });
      data = response.data;
      cache.set(cacheKey, data);
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching forecast:", error.message);
    res.status(500).json({ error: "Failed to fetch forecast." });
  }
});

// POST /weather/favorites
app.post('/weather/favorites', async (req, res) => {
  const { city, userId } = req.body;
  if (!city) return res.status(400).json({ error: 'City is required' });

  try {
    const response = await axios.get(`${API}/current.json`, {
      params: { key: KEY, q: city },
    });

    const location = response.data.location;

    const favorite = await prisma.favoriteCity.create({
      data: {
        city: location.name,
        region: location.region,
        country: location.country,
        userId,
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error("Error saving favorite city:", error.message);
    res.status(500).json({ error: 'Failed to save favorite city' });
  }
});

// GET /weather/favorites
app.get('/weather/favorites', async (req, res) => {
  try {
    const favorites = await prisma.favoriteCity.findMany();
    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error.message);
    res.status(500).json({ error: "Failed to fetch favorite cities." });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
