// frontend/src/pages/Register.jsx
import { useState, useEffect } from "react";
import API from "../../api/api";

export default function Register() {
  const [formData, setFormData] = useState({
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    email: "",
    age: "",
    contact_number: "",
    purok: "",
    barangay: "",
    municipal: "",
    province: "",
    sex: "male",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedForm = localStorage.getItem("registerForm");
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
    }
  }, []);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem("registerForm", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error when typing
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.password2)
      newErrors.password2 = "Passwords do not match.";
    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required.";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (formData.age && (formData.age < 1 || formData.age > 120))
      newErrors.age = "Please enter a valid age.";
    if (
      formData.contact_number &&
      !/^\d{10,11}$/.test(formData.contact_number)
    )
      newErrors.contact_number = "Contact number must be 10–11 digits.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setMessage("Please fix the highlighted errors.");
      return;
    }

    try {
      const res = await API.post("users/register/", formData);
      setMessage("✅ Registration successful! You can now log in.");
      setErrors({});
      console.log(res.data);

      // Clear form + localStorage after success
      setFormData({
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        email: "",
        age: "",
        contact_number: "",
        purok: "",
        barangay: "",
        municipal: "",
        province: "",
        sex: "male",
      });
      localStorage.removeItem("registerForm");
    } catch (err) {
      if (err.response?.data) {
        const backendErrors = {};
        for (const key in err.response.data) {
          backendErrors[key] = err.response.data[key].join
            ? err.response.data[key].join(", ")
            : err.response.data[key];
        }
        setErrors(backendErrors);
      }
      setMessage("❌ Registration failed. Please check your inputs.");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg border border-secondary/20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-6">
          Create Account
        </h2>

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-center text-sm font-medium ${
              message.includes("✅")
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.first_name ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
              />
              {errors.first_name && (
                <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.last_name ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
              />
              {errors.last_name && (
                <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
              required
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
              required
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Repeat Password */}
          <div>
            <input
              type="password"
              name="password2"
              placeholder="Repeat Password"
              value={formData.password2}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.password2 ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
              required
            />
            {errors.password2 && (
              <p className="text-xs text-red-600 mt-1">{errors.password2}</p>
            )}
          </div>

          {/* Age & Sex */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.age ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
              />
              {errors.age && (
                <p className="text-xs text-red-600 mt-1">{errors.age}</p>
              )}
            </div>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Contact Number */}
          <div>
            <input
              type="text"
              name="contact_number"
              placeholder="Contact Number"
              value={formData.contact_number}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.contact_number ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-primary outline-none`}
            />
            {errors.contact_number && (
              <p className="text-xs text-red-600 mt-1">
                {errors.contact_number}
              </p>
            )}
          </div>

          {/* Address fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="purok"
              placeholder="Purok"
              value={formData.purok}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              type="text"
              name="barangay"
              placeholder="Barangay"
              value={formData.barangay}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="municipal"
              placeholder="Municipal"
              value={formData.municipal}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <input
              type="text"
              name="province"
              placeholder="Province"
              value={formData.province}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3.5 rounded-lg font-semibold hover:bg-secondary transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}