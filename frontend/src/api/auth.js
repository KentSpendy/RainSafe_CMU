import axios from "axios";
import { jwtDecode } from "jwt-decode";


const API_URL = "http://127.0.0.1:8000/api/users/";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}login/`, { email, password });
    const { access, refresh } = response.data;

    // Store tokens consistently
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    // Decode role and return user info
    const decoded = jwtDecode(access);
    return { token: access, role: decoded.role, email: decoded.email };
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const registerUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}register/`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};
