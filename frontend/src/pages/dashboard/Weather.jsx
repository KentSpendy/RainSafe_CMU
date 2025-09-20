import { useEffect, useState } from "react";
import API from "../../api/api";

export default function Weather() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await API.get("weather/latest/");
        setWeather(res.data);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    };
    fetchWeather();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">🌤️ Current Weather (CMU)</h1>
        {weather ? (
          <div className="space-y-3 text-lg">
            <p><strong>Time:</strong> {new Date(weather.timestamp).toLocaleString()}</p>
            <p><strong>Temperature:</strong> {weather.temperature} °C</p>
            <p><strong>Rainfall Probability:</strong> {weather.rainfall_probability}%</p>
            <p><strong>Wind Speed:</strong> {weather.wind_speed} m/s</p>
          </div>
        ) : (
          <p>Loading weather data...</p>
        )}
      </div>
    </div>
  );
}
