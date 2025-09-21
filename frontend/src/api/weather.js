import API from "./api";

export const getWeather = async () => {
    const response = await API.get("weather/");
    return response.data;
}