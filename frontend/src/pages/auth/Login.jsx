import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/api";
import rainVideo from "../../assets/rain101.mp4";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "RainSafe | Login";
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("users/login/", formData);

      // Store auth data
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("role", res.data.role);

      // Show success message
      setMessage("✅ Login successful! Redirecting...");

      // Determine redirect path based on role
      const role = res.data.role;
      setTimeout(() => {
        if (role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/user");
        }
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Login failed. Check your email or password.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* 🌧️ Background Video */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={rainVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      </div>

      {/* Glassmorphism Login Form */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10 text-white">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌦️</div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-white/70 text-sm">Log in to RainSafe</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-center text-sm font-semibold text-white backdrop-blur-xl shadow-lg border ${
              message.includes("✅")
                ? "bg-green-600/70 border-green-400/70"
                : "bg-red-600/70 border-red-400/70"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg placeholder-white/70 text-white focus:ring-2 focus:ring-white/50 outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg placeholder-white/70 text-white focus:ring-2 focus:ring-white/50 outline-none"
            required
          />
          <button
            type="submit"
            className="w-full py-3.5 bg-white/20 border border-white/30 rounded-lg font-semibold text-white hover:bg-white/30 transition shadow-lg"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-white/80 text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-300 hover:text-blue-200 underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}