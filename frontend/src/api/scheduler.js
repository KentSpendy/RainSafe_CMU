import API from "./api";

export const getSchedules = async () => {
    const response = await API.get("scheduler/");
    return response.data;
}