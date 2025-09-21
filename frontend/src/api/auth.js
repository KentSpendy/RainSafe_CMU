import API from "./api";

export const loginUser = async (credentials) => {
  const response = await API.post("users/login/", credentials);
  if (response.data.access) {
    localStorage.setItem("token", response.data.access);
  }
  return response.data;
};

export const registerUser = async (userData) => {
  return API.post("users/register/", userData);
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
