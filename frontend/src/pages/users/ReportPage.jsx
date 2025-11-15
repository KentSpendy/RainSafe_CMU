import { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../api/api";
import UserNavbar from "../../components/UserNavbar";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/ios-filled/50/FF6B6B/map-pin.png",
  iconRetinaUrl: "https://img.icons8.com/ios-filled/100/FF6B6B/map-pin.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [35, 46],
  iconAnchor: [17, 46],
  popupAnchor: [1, -34],
  shadowSize: [46, 46]
});

export default function ReportPage() {
  const [selectedPos, setSelectedPos] = useState(null);
  const [formData, setFormData] = useState({
    name: "",              // Changed from full_name to name
    number: "",            // Changed from contact_number to number
    description: "",
    image: null,
  });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const mapRef = useRef();

  // Icon URLs
  const iconUrls = {
    user: "https://img.icons8.com/ios-filled/50/94a3b8/user.png",
    phone: "https://img.icons8.com/ios-filled/50/94a3b8/phone.png",
    description: "https://img.icons8.com/ios-filled/50/94a3b8/comments.png",
    image: "https://img.icons8.com/ios-filled/50/94a3b8/image.png",
    location: "https://img.icons8.com/ios-filled/50/FF6B6B/map-pin.png",
    success: "https://img.icons8.com/ios-filled/50/10b981/ok.png",
    error: "https://img.icons8.com/ios-filled/50/ef4444/error.png",
    close: "https://img.icons8.com/ios-filled/50/ffffff/close.png",
    upload: "https://img.icons8.com/ios-filled/50/3b82f6/upload.png",
    weather: "https://img.icons8.com/ios-filled/50/ffffff/partly-cloudy-day.png"
  };

  // Colorful map style options
  const mapStyles = [
    {
      name: "Vibrant",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
    },
    {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    },
    {
      name: "Topographic",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>'
    },
  ];

  const [currentMapStyle, setCurrentMapStyle] = useState(mapStyles[0]);

  // Capture map click event
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setSelectedPos(e.latlng);
        setStatus("");
      },
    });
    return null;
  }

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "image" && files && files[0]) {
      const file = files[0];
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setStatus("error");
        alert("Image size should be less than 10MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStatus("error");
        alert("Please upload an image file");
        return;
      }
      
      setFormData({
        ...formData,
        image: file
      });
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedPos(null);
    setImagePreview(null);
    setFormData({
      name: "",              // Changed from full_name
      number: "",            // Changed from contact_number
      description: "",
      image: null,
    });
  };

  // Submit report to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPos) return;

    const payload = new FormData();
    payload.append("name", formData.name);           // Changed from full_name
    payload.append("number", formData.number);       // Changed from contact_number (but backend expects "number")
    payload.append("description", formData.description);
    payload.append("latitude", selectedPos.lat);
    payload.append("longitude", selectedPos.lng);
    if (formData.image) {
      payload.append("image", formData.image);
    }

    try {
      setSubmitting(true);
      setStatus("");
      
      // Updated endpoint to match your ViewSet
      await API.post("reports/", payload, {  // Changed from "reports/create/" to "reports/"
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setStatus("success");
      setFormData({
        name: "",              // Changed from full_name
        number: "",            // Changed from contact_number
        description: "",
        image: null,
      });
      setImagePreview(null);
      setSelectedPos(null);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setStatus(""), 5000);
    } catch (error) {
      console.error("Submit error:", error);
      setStatus("error");
      
      // Show specific error message if available
      if (error.response?.data) {
        console.error("Error details:", error.response.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-800 flex flex-col">
      {/* Navbar */}
      <UserNavbar unreadNotifications={0} />

      <div className="flex flex-1 relative">
        {/* Sidebar Form */}
        <motion.div 
          className="w-full lg:w-96 bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-xl p-6 overflow-y-auto"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <img 
                  src={iconUrls.weather} 
                  alt="Weather Report" 
                  className="w-6 h-6 filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Weather Report</h1>
                <p className="text-slate-600 text-sm">Report weather incidents in your area</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-6 border border-blue-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              How to Report
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Click on the map to select location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                <span>Fill out the form with incident details</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                <span>Upload photos if available (max 10MB)</span>
              </div>
            </div>
          </div>

          {/* Selected Location Info */}
          {selectedPos && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-4 mb-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">📍 Selected Location</h4>
                  <p className="text-white/90 text-sm">
                    {selectedPos.lat.toFixed(4)}, {selectedPos.lng.toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={clearSelection}
                  type="button"
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <img src={iconUrls.close} alt="Clear" className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Report Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <img src={iconUrls.user} alt="Name" className="w-4 h-4" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"    
                placeholder="Enter your full name"
                value={formData.name} 
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                required
                disabled={!selectedPos}
              />
            </div>

            {/* Contact Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <img src={iconUrls.phone} alt="Phone" className="w-4 h-4" />
                Contact Number *
              </label>
              <input
                type="text"
                name="number"           
                placeholder="Enter your contact number"
                value={formData.number}  
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                required
                disabled={!selectedPos}
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <img src={iconUrls.description} alt="Description" className="w-4 h-4" />
                Incident Description *
              </label>
              <textarea
                name="description"
                placeholder="Describe the weather situation, damage, or incident in detail..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none"
                required
                disabled={!selectedPos}
              ></textarea>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <img src={iconUrls.image} alt="Image" className="w-4 h-4" />
                Upload Photo (Optional, max 10MB)
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedPos}
                />
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 relative"
                >
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-xl border border-slate-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({...formData, image: null});
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                  >
                    <img src={iconUrls.close} alt="Remove" className="w-2 h-2 filter brightness-0 invert" />
                  </button>
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting || !selectedPos}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-semibold mt-4 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              whileHover={(!submitting && selectedPos) ? { scale: 1.02 } : {}}
              whileTap={(!submitting && selectedPos) ? { scale: 0.98 } : {}}
            >
              {submitting ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Submitting Report...
                </>
              ) : (
                <>
                  <img src={iconUrls.upload} alt="Submit" className="w-5 h-5 filter brightness-0 invert" />
                  {selectedPos ? "Submit Weather Report" : "Select Location First"}
                </>
              )}
            </motion.button>
          </form>

          {/* Status Message */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-4 rounded-2xl border flex items-center gap-3 ${
                  status === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <img 
                  src={status === "success" ? iconUrls.success : iconUrls.error} 
                  alt="Status" 
                  className="w-5 h-5" 
                />
                <div>
                  <div className="font-semibold text-sm">
                    {status === "success" ? "Report Submitted!" : "Submission Failed"}
                  </div>
                  <div className="text-xs opacity-80">
                    {status === "success" 
                      ? "Your weather report has been submitted successfully. Images are being uploaded to cloud storage." 
                      : "Failed to submit report. Please check your connection and try again."
                    }
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={[7.859, 125.0485]}
            zoom={13}
            className="w-full h-full"
            whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
          >
            <TileLayer
              url={currentMapStyle.url}
              attribution={currentMapStyle.attribution}
            />
            <MapClickHandler />

            {/* Selected Position Marker */}
            {selectedPos && (
              <Marker position={selectedPos} icon={customIcon} />
            )}
          </MapContainer>

          {/* Map Style Selector */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-slate-200">
            <div className="flex flex-wrap gap-2">
              {mapStyles.map((style, index) => (
                <motion.button
                  key={style.name}
                  onClick={() => setCurrentMapStyle(style)}
                  type="button"
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    currentMapStyle.name === style.name
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {style.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Map Instructions Overlay */}
          {!selectedPos && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-lg max-w-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-slate-800 font-medium text-sm">Click on the map</span>
              </div>
              <p className="text-slate-600 text-xs">
                Select the location where the weather incident occurred by clicking anywhere on the map.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}