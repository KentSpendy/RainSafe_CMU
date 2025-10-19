import { createContext, useContext, useEffect, useState } from "react";

const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/weather/live/?lat=7.859&lon=125.0485");
        const data = await res.json();
        if (res.ok) {
          setCurrentWeather(data);
        } else {
          console.error("Error fetching weather:", data);
        }
      } catch (error) {
        console.error("Weather fetch failed:", error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
    // Optional: auto-refresh every 10 mins
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WeatherContext.Provider value={{ currentWeather, loadingWeather }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  return useContext(WeatherContext);
}
