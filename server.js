const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/weatherApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for favorite cities
const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  weather: { type: Object, required: true },
});

const City = mongoose.model('City', citySchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Fetch weather data from OpenWeatherMap
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'City is required' });

  try {
    const apiKey = process.env.API_KEY; // Replace with your OpenWeatherMap API key
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Save favorite city
app.post('/api/favorites', async (req, res) => {
  const { name, weather } = req.body;

  if (!name || !weather) {
    return res.status(400).json({ error: 'Invalid city data' });
  }

  try {
    const city = new City({ name, weather });
    await city.save();
    res.json({ message: 'City saved', city });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save city' });
  }
});

// Get favorite cities
app.get('/api/favorites', async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorite cities' });
  }
});

// Delete a favorite city
app.delete('/api/favorites/:id', async (req, res) => {
  try {
    await City.findByIdAndDelete(req.params.id);
    res.json({ message: 'City deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
