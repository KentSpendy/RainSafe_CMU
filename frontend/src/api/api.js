import axios from "axios";

// Change this to match your Django backend URL
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// If user is logged in, automatically attach JWT access token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");  // use the access token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
