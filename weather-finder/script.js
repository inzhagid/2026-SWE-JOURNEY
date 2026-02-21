let state = {
  query: "",
  status: "idle",
  error: "",
  place: null,
  weather: null,
};

let debounceTimer = null;
let requestId = 0;

const cache = new Map();

const formSection = document.getElementById("formSection");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusSection = document.getElementById("statusSection");
const resultSection = document.getElementById("resultSection");

function normalizeCity(city) {
  return city.trim().toLowerCase();
}

function setState(patch) {
  state = { ...state, ...patch };
  render();
}

function render() {
  statusSection.innerHTML = "";
  resultSection.innerHTML = "";

  if (state.status === "idle") {
    statusSection.innerHTML = "Type a city and search.";
  }

  if (state.status === "loading") {
    statusSection.innerHTML = "Loading . . .";
  }

  if (state.status === "error") {
    statusSection.innerHTML = state.error;
  }

  if (state.status === "success") {
    const place = state.place;
    const weather = state.weather;

    let list = `<ul>
        <li>Name: ${place.name}</li>
        <li>Country: ${place.country}</li>
        <li>Latitude: ${place.latitude}</li>
        <li>Longitude: ${place.longitude}</li>
        <li>Temperature: ${weather.temperature}</li>
        <li>Windspeed: ${weather.windspeed}</li>
        <li>Time: ${weather.time}</li>
    </ul>`;

    resultSection.innerHTML = list;
  }
}

async function searchWeather(city) {
  const myId = ++requestId;

  const cityCache = normalizeCity(city);
  if (cache.has(cityCache)) {
    const cached = cache.get(cityCache);
    setState({
      query: city,
      status: "success",
      error: "",
      place: cached.place,
      weather: cached.weather,
    });
    return;
  }

  try {
    const place = await getPlace(city);
    const weather = await getWeather(place.latitude, place.longitude);

    if (myId !== requestId) return;

    setState({
      query: city,
      status: "success",
      error: "",
      place: place,
      weather: weather,
    });
    cache.set(cityCache, { place, weather });
  } catch (error) {
    if (myId !== requestId) return;
    setState({ status: "error", error: error.message });
  }
}

async function getPlace(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP Error! status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.results || data.results.length <= 0) {
    throw new Error("City not found");
  }

  const results = data.results[0];

  return {
    name: results.name,
    country: results.country,
    latitude: results.latitude,
    longitude: results.longitude,
  };
}

async function getWeather(latitude, longitude) {
  const lat = encodeURIComponent(latitude);
  const lon = encodeURIComponent(longitude);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP Error! status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.current_weather) {
    throw new Error("Weather not found");
  }

  return {
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed,
    time: data.current_weather.time,
  };
}

function handleSearch() {
  clearTimeout(debounceTimer);

  const city = cityInput.value.trim();

  if (!city) {
    setState({
      status: "error",
      error: "City is required",
    });
    return;
  } else {
    setState({
      query: city,
      status: "loading",
      error: "",
    });

    searchWeather(city);
  }
}

function handleSearchDebounced() {
  clearTimeout(debounceTimer);

  const city = cityInput.value.trim();
  if (!city) {
    setState({
      query: "",
      status: "idle",
      error: "",
      place: null,
      weather: null,
    });
    return;
  }

  debounceTimer = setTimeout(() => {
    handleSearch();
  }, 500);
}

searchBtn.addEventListener("click", function () {
  handleSearch();
  cityInput.focus();
});

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleSearch();
  }
});

cityInput.addEventListener("input", function (event) {
  handleSearchDebounced();
});

render();
