import React, { useState } from "react";
import axios from "axios";
import './index.css';
import './responsive.css';

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const API_KEY = "ce17d4720af67872f01b5e80451d8d21"; // Replace with your API key
  const API_URL = "https://api.openweathermap.org/data/2.5/weather";
  const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
  const AQI_URL = "https://api.openweathermap.org/data/2.5/air_pollution";
  const UV_URL = "https://api.openweathermap.org/data/2.5/uvi";

  const fetchWeather = async () => {
    if (!city) return;
    try {
      setError(null);
      const response = await axios.get(API_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: "metric",
        },
      });
      setWeather(response.data);

      const forecastResponse = await axios.get(FORECAST_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: "metric",
        },
      });
      setForecast(forecastResponse.data.list.filter((_, index) => index % 8 === 0));

      const { coord } = response.data;
      const aqiResponse = await axios.get(AQI_URL, {
        params: {
          lat: coord.lat,
          lon: coord.lon,
          appid: API_KEY,
        },
      });
      setAqi(aqiResponse.data.list[0].main.aqi);

      const uvResponse = await axios.get(UV_URL, {
        params: {
          lat: coord.lat,
          lon: coord.lon,
          appid: API_KEY,
        },
      });
      setUvIndex(uvResponse.data.value);
    } catch (err) {
      setError("City not found. Please try again.");
      setWeather(null);
      setForecast([]);
      setAqi(null);
      setUvIndex(null);
    }
  };

  const capitalizeDescription = (description) => {
    return description
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Weather App</h1>
        <button className="help-icon" onClick={() => setShowHelp(!showHelp)}>?</button>
        {showHelp && <div className="help-text">Created by: Eric Bulala</div>}
      </header>
      <input
        type="text"
        className="city-input"
        placeholder="Enter city name e.g. Tagbilaran City, Bohol"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button className="fetch-button" onClick={fetchWeather}>Get Weather</button>
      {error && <div className="error">{error}</div>}
      {weather && (
        <div className="weather-card">
          <div className="weather-info">
            <h2>{weather.name}</h2>
            <p>{capitalizeDescription(weather.weather[0].description)}</p>
            <p>{weather.main.temp}°C</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind Speed: {weather.wind.speed} m/s</p>
            {aqi && (
              <p className="aqi">
                Air Quality Index (AQI): {aqi}
              </p>
            )}
            {uvIndex && (
              <p className="uv-index">
                UV Index: {uvIndex}
              </p>
            )}
            <p>Sunrise: {formatTime(weather.sys.sunrise)}</p>
            <p>Sunset: {formatTime(weather.sys.sunset)}</p>
          </div>
        </div>
      )}
      {forecast.length > 0 && (
        <div className="forecast">
          <h3 className="forecast-title">5-Day Forecast</h3>
          <table className="forecast-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Temperature (°C)</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((day, index) => (
                <tr key={index}>
                  <td>{new Date(day.dt_txt).toLocaleDateString()}</td>
                  <td>{capitalizeDescription(day.weather[0].description)}</td>
                  <td>{day.main.temp}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );  
};

export default WeatherApp;
