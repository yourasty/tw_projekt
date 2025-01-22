const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherResults = document.getElementById('weatherResults');
const favoritesList = document.getElementById('favoritesList');

searchBtn.addEventListener('click', async () => {
  const city = cityInput.value;
  if (!city) return alert('Please enter a city');

  try {
    const response = await fetch(`/api/weather?city=${city}`);
    const weatherData = await response.json();

    weatherResults.innerHTML = `
      <h3>${weatherData.name}</h3>
      <p>Temperature: ${weatherData.main.temp}°C</p>
      <p>Weather: ${weatherData.weather[0].description}</p>
      <button onclick="saveFavorite('${weatherData.name}', '${JSON.stringify(weatherData)}')">Save to Favorites</button>
    `;
  } catch (error) {
    alert('Failed to fetch weather data');
  }
});

async function saveFavorite(name, weather) {
  try {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, weather: JSON.parse(weather) }),
    });
    loadFavorites();
  } catch (error) {
    alert('Failed to save favorite city');
  }
}

async function loadFavorites() {
  try {
    const response = await fetch('/api/favorites');
    const favorites = await response.json();

    favoritesList.innerHTML = favorites
      .map(
        city => `
          <li>
            ${city.name}
            <button onclick="deleteFavorite('${city._id}')">Delete</button>
          </li>
        `
      )
      .join('');
  } catch (error) {
    alert('Failed to load favorite cities');
  }
}

async function deleteFavorite(id) {
  try {
    await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
    loadFavorites();
  } catch (error) {
    alert('Failed to delete favorite city');
  }
}

loadFavorites();
