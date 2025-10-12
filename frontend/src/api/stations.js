import API from "./api";

export const getStations = () => API.get("weather/stations/");
export const createStation = (data) => API.post("weather/stations/", data);
export const updateStation = (id, data) => API.put(`weather/stations/${id}/`, data);
export const deleteStation = (id) => API.delete(`weather/stations/${id}/`);
