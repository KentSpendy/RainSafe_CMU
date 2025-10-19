import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "leaflet/dist/leaflet.css";
import { WeatherProvider } from "./context/WeatherContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WeatherProvider>
      <App />
    </WeatherProvider>
  </StrictMode>
);
