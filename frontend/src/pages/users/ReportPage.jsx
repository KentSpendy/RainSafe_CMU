import { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
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

export default function ReportPage() {
  const [selectedPos, setSelectedPos] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    contact_number: "",
    description: "",
    image: null,
  });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const mapRef = useRef();

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
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Submit report to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPos) return;

    const payload = new FormData();
    payload.append("name", formData.full_name);
    payload.append("contact", formData.contact_number);
    payload.append("description", formData.description);
    payload.append("latitude", selectedPos.lat);
    payload.append("longitude", selectedPos.lng);
    if (formData.image) payload.append("image", formData.image);

    try {
      setSubmitting(true);
      setStatus("");
      await API.post("reports/create/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("✅ Report submitted successfully!");
      setFormData({
        full_name: "",
        contact_number: "",
        description: "",
        image: null,
      });
      setSelectedPos(null);
    } catch (error) {
      setStatus("❌ Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 text-white flex flex-col">
      {/* Navbar */}
      <UserNavbar unreadNotifications={0} />

      <div className="flex-grow relative">
        <MapContainer
          center={[7.859, 125.0485]}
          zoom={13}
          className="w-full h-[85vh]"
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
          <MapClickHandler />

          <AnimatePresence>
            {selectedPos && (
              <Marker position={selectedPos}>
                <Popup>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-3 text-sm w-64 bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl shadow-2xl">
                    <h3 className="font-bold text-lg mb-3 text-white">
                      Submit Report
                    </h3>
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Full Name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      name="contact_number"
                      placeholder="Contact Number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Describe the situation..."
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full p-2.5 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required></textarea>
                    <div className="relative">
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold mt-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? "Submitting..." : "Submit Report"}
                    </button>
                  </form>
                </Popup>
              </Marker>
            )}
          </AnimatePresence>
        </MapContainer>

        {/* Status message */}
        {status && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`absolute top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-sm font-medium backdrop-blur-xl border ${
              status.startsWith("✅")
                ? "bg-green-600/70 border-green-400/70"
                : "bg-red-600/70 border-red-400/70"
            }`}>
            {status}
          </motion.div>
        )}
      </div>
    </div>
  );
}
