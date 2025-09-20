import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "../src/pages/auth/Register";
import Login from "../src/pages/auth/Login";
import LandingPage from "../src/pages/landing/LangdingPage"
import "../src/index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
