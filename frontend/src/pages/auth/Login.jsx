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












// // frontend/src/pages/Login.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../../api/api";

// export default function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // ✅ Backend now expects "email" directly
//       const res = await API.post("users/login/", {
//         email: formData.email,
//         password: formData.password,
//       });

//       // Store tokens in localStorage
//       localStorage.setItem("access", res.data.access);
//       localStorage.setItem("refresh", res.data.refresh);

//       // Store extra info (optional)
//       localStorage.setItem("email", res.data.email);
//       localStorage.setItem("role", res.data.role);

//       setMessage("✅ Login successful! Redirecting...");
//       setTimeout(() => navigate("/dashboard"), 1500);
//     } catch (err) {
//       setMessage("❌ Login failed. Check your email or password.");
//       console.error(err.response?.data || err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 px-4">
//       <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
//         <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
//           Welcome Back
//         </h2>

//         {message && (
//           <div
//             className={`mb-6 p-3 rounded-lg text-center text-sm font-medium ${
//               message.includes("✅")
//                 ? "bg-green-100 text-green-700 border border-green-200"
//                 : "bg-red-100 text-red-700 border border-red-200"
//             }`}
//           >
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
//             required
//           />

//           <button
//             type="submit"
//             className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-3.5 rounded-lg font-semibold hover:from-green-700 hover:to-yellow-600 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
//           >
//             Log In
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }