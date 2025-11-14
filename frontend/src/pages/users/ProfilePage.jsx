import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaEdit,
  FaTimes,
  FaCalendar,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../../api/api";
import UserNavbar from "../../components/UserNavbar";
import weatherImg from "../../assets/weather.jpg";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/me/");
      setUser(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({
        type: "error",
        text: "Failed to load profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.first_name?.trim()) {
      setMessage({ type: "error", text: "First name is required" });
      return false;
    }
    if (!formData.last_name?.trim()) {
      setMessage({ type: "error", text: "Last name is required" });
      return false;
    }
    if (
      formData.contact_number &&
      !/^\d{10,15}$/.test(formData.contact_number.replace(/\s+/g, ""))
    ) {
      setMessage({
        type: "error",
        text: "Please enter a valid contact number",
      });
      return false;
    }
    if (formData.age && (formData.age < 1 || formData.age > 150)) {
      setMessage({ type: "error", text: "Please enter a valid age" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const response = await api.patch("/users/me/update/", formData);
      setUser(response.data);
      setFormData(response.data);
      setEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully! 🎉" });

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-950 to-blue-800">
        <motion.div
          className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <UserNavbar unreadNotifications={0} />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={weatherImg}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 opacity-20">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-5xl">👤</span>
            My Profile
          </h1>
          <p className="text-white/70 text-lg">
            Manage your account information and settings
          </p>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div
            className={`mb-6 p-4 rounded-2xl border ${
              message.type === "success"
                ? "bg-green-500/20 border-green-500/50 text-green-300"
                : "bg-red-500/20 border-red-500/50 text-red-300"
            } backdrop-blur-xl shadow-lg`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              <span className="font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}>
            <div className="text-center mb-8">
              <motion.div
                className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}>
                <FaUser className="text-white text-5xl" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-white/70 text-lg mb-1">{user?.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mt-3">
                <FaShieldAlt className="text-cyan-400" />
                <span className="text-white font-medium capitalize">
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <StatItem
                icon={<FaCalendar className="text-blue-400" />}
                label="Member Since"
                value={new Date(user?.date_joined).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              />
              <StatItem
                icon={<FaCalendar className="text-green-400" />}
                label="Last Login"
                value={new Date(user?.last_login).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </div>
          </motion.div>

          {/* Right Column - Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                  Personal Information
                </h2>
                {!editing ? (
                  <motion.button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <FaEdit /> Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      <FaTimes /> Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: saving ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      {saving ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave /> Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  disabled={true}
                  helperText="Email cannot be changed"
                />
                <InputField
                  label="Contact Number"
                  name="contact_number"
                  value={formData.contact_number || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., 09123456789"
                />
                <InputField
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  min="1"
                  max="150"
                />
                <SelectField
                  label="Sex"
                  name="sex"
                  value={formData.sex || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                />
              </div>
            </motion.div>

            {/* Address Information Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-400" />
                Address Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Purok"
                  name="purok"
                  value={formData.purok || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Purok 1"
                />
                <InputField
                  label="Barangay"
                  name="barangay"
                  value={formData.barangay || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Poblacion"
                />
                <InputField
                  label="Municipal"
                  name="municipal"
                  value={formData.municipal || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Maramag"
                />
                <InputField
                  label="Province"
                  name="province"
                  value={formData.province || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Bukidnon"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatItem({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/10">
      <span className="flex items-center gap-3 text-white/80">
        <span className="text-xl">{icon}</span>
        <span className="font-medium">{label}</span>
      </span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  required,
  helperText,
  placeholder,
  min,
  max,
}) {
  return (
    <div>
      <label className="text-white/70 text-sm mb-2 block font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 ${
          disabled
            ? "opacity-50 cursor-not-allowed border-white/10"
            : "border-white/20 focus:border-white/40 focus:bg-white/15"
        }`}
      />
      {helperText && (
        <p className="text-white/50 text-xs mt-1.5">{helperText}</p>
      )}
    </div>
  );
}

function SelectField({ label, name, value, onChange, disabled, options }) {
  return (
    <div>
      <label className="text-white/70 text-sm mb-2 block font-medium">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none transition-all duration-300 ${
          disabled
            ? "opacity-50 cursor-not-allowed border-white/10"
            : "border-white/20 focus:border-white/40 focus:bg-white/15"
        }`}>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-800">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProfilePage;
