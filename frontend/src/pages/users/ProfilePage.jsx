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

  // Online icon assets URLs
  const iconUrls = {
    profile: "https://img.icons8.com/ios-filled/100/ffffff/user.png",
    email: "https://img.icons8.com/ios-filled/50/94a3b8/email.png",
    phone: "https://img.icons8.com/ios-filled/50/94a3b8/phone.png",
    location: "https://img.icons8.com/ios-filled/50/94a3b8/map-pin.png",
    calendar: "https://img.icons8.com/ios-filled/50/94a3b8/calendar.png",
    shield: "https://img.icons8.com/ios-filled/50/06b6d4/shield.png",
    edit: "https://img.icons8.com/ios-filled/50/ffffff/edit.png",
    save: "https://img.icons8.com/ios-filled/50/ffffff/save.png",
    cancel: "https://img.icons8.com/ios-filled/50/ffffff/close.png",
    success: "https://img.icons8.com/ios-filled/50/10b981/ok.png",
    error: "https://img.icons8.com/ios-filled/50/ef4444/error.png",
    user: "https://img.icons8.com/ios-filled/100/ffffff/user-male.png",
    joined: "https://img.icons8.com/ios-filled/50/3b82f6/calendar.png",
    login: "https://img.icons8.com/ios-filled/50/10b981/clock.png",
    personal: "https://img.icons8.com/ios-filled/50/ffffff/name.png",
    address: "https://img.icons8.com/ios-filled/50/ffffff/address.png"
  };

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
      setMessage({ type: "success", text: "Profile updated successfully!" });

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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/80 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navbar */}
      <UserNavbar unreadNotifications={0} />

      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={weatherImg}
          alt="Weather Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      </div>

      {/* Subtle Grid Overlay */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <img 
                src={iconUrls.profile} 
                alt="Profile" 
                className="w-8 h-8"
              />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                My Profile
              </h1>
              <p className="text-white/60 text-lg mt-2">
                Manage your account information and settings
              </p>
            </div>
          </div>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div
            className={`mb-6 p-4 rounded-2xl border backdrop-blur-xl shadow-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-emerald-600/20 border-emerald-400/30 text-emerald-300"
                : "bg-red-600/20 border-red-400/30 text-red-300"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <img 
              src={message.type === "success" ? iconUrls.success : iconUrls.error} 
              alt={message.type} 
              className="w-5 h-5" 
            />
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary */}
          <motion.div
            className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-center mb-6">
              <motion.div
                className="w-28 h-28 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl border-4 border-white/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src={iconUrls.user} 
                  alt="User" 
                  className="w-12 h-12 filter brightness-0 invert"
                />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-white/70 text-sm mb-3">{user?.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-xl">
                <img src={iconUrls.shield} alt="Role" className="w-4 h-4" />
                <span className="text-white font-medium capitalize text-sm">
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <StatItem
                icon={iconUrls.joined}
                label="Member Since"
                value={new Date(user?.date_joined).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              />
              <StatItem
                icon={iconUrls.login}
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
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <img src={iconUrls.personal} alt="Personal" className="w-6 h-6" />
                  <h2 className="text-2xl font-bold text-white">
                    Personal Information
                  </h2>
                </div>
                {!editing ? (
                  <motion.button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl hover:bg-blue-600/40 transition-all duration-300 font-semibold shadow-lg flex items-center gap-3 backdrop-blur-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src={iconUrls.edit} alt="Edit" className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-white/10 text-white/80 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold shadow-lg flex items-center gap-3 backdrop-blur-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img src={iconUrls.cancel} alt="Cancel" className="w-4 h-4" />
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/40 transition-all duration-300 font-semibold shadow-lg flex items-center gap-3 backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: saving ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {saving ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <img src={iconUrls.save} alt="Save" className="w-4 h-4" />
                          Save Changes
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
                  icon={iconUrls.personal}
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                  icon={iconUrls.personal}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  disabled={true}
                  helperText="Email cannot be changed"
                  icon={iconUrls.email}
                />
                <InputField
                  label="Contact Number"
                  name="contact_number"
                  value={formData.contact_number || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., 09123456789"
                  icon={iconUrls.phone}
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
                  icon={iconUrls.calendar}
                />
                <SelectField
                  label="Sex"
                  name="sex"
                  value={formData.sex || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  options={[
                    { value: "", label: "Select sex" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  icon={iconUrls.personal}
                />
              </div>
            </motion.div>

            {/* Address Information Card */}
            <motion.div
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <img src={iconUrls.address} alt="Address" className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-white">
                  Address Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Purok"
                  name="purok"
                  value={formData.purok || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Purok 1"
                  icon={iconUrls.location}
                />
                <InputField
                  label="Barangay"
                  name="barangay"
                  value={formData.barangay || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Poblacion"
                  icon={iconUrls.location}
                />
                <InputField
                  label="Municipal"
                  name="municipal"
                  value={formData.municipal || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Maramag"
                  icon={iconUrls.location}
                />
                <InputField
                  label="Province"
                  name="province"
                  value={formData.province || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g., Bukidnon"
                  icon={iconUrls.location}
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
    <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <span className="flex items-center gap-3 text-white/80">
        <img src={icon} alt={label} className="w-4 h-4" />
        <span className="font-medium text-sm">{label}</span>
      </span>
      <span className="text-white font-semibold text-sm">{value}</span>
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
  icon
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-white/70 text-sm mb-2 font-medium">
        {icon && <img src={icon} alt={label} className="w-4 h-4" />}
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
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
          className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none transition-all duration-300 ${
            disabled
              ? "opacity-50 cursor-not-allowed border-white/10"
              : "border-white/10 focus:border-blue-500/50 focus:bg-white/10"
          }`}
        />
        {icon && (
          <img 
            src={icon} 
            alt={label} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-60" 
          />
        )}
      </div>
      {helperText && (
        <p className="text-white/50 text-xs mt-1.5">{helperText}</p>
      )}
    </div>
  );
}

function SelectField({ label, name, value, onChange, disabled, options, icon }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-white/70 text-sm mb-2 font-medium">
        {icon && <img src={icon} alt={label} className="w-4 h-4" />}
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none transition-all duration-300 appearance-none ${
            disabled
              ? "opacity-50 cursor-not-allowed border-white/10"
              : "border-white/10 focus:border-blue-500/50 focus:bg-white/10"
          }`}>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-slate-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
        {icon && (
          <img 
            src={icon} 
            alt={label} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-60" 
          />
        )}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;