import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import CitizenLayout from "../../layouts/CitizenLayout";
import { motion, AnimatePresence } from "framer-motion";
import "./SOS.css";

function SOS() {
  const [formData, setFormData] = useState({
    emergencyType: "Cardiac",
    callerName: "",
    callerPhone: "",
    description: ""
  });

  const [location, setLocation] = useState({
    lat: 18.5204,
    lng: 73.8567,
    address: "",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411029",
    country: "India",
    isLoading: false,
    error: null,
    source: "gps"
  });

  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        isLoading: false,
        error: "Geolocation is not supported by your browser",
        address: "बाल शिक्षण मंदिर, व. कृ. धामगोकर पथ, Kothrud, Anandnagar, पुणे शहर, Pune District, Maharashtra, 411029, India"
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          const address = data.address || {};
          
          setLocation({
            lat: latitude,
            lng: longitude,
            address: data.display_name || "बाल शिक्षण मंदिर, व. कृ. धामगोकर पथ, Kothrud, Anandnagar, पुणे शहर, Pune District, Maharashtra, 411029, India",
            city: address.city || address.town || address.village || "Pune",
            state: address.state || "Maharashtra",
            pincode: address.postcode || "411029",
            country: address.country || "India",
            isLoading: false,
            error: null,
            source: "gps"
          });

          findNearbyHospitals(latitude, longitude);
          
        } catch (error) {
          setLocation({
            lat: latitude,
            lng: longitude,
            address: "बाल शिक्षण मंदिर, व. कृ. धामगोकर पथ, Kothrud, Anandnagar, पुणे शहर, Pune District, Maharashtra, 411029, India",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411029",
            country: "India",
            isLoading: false,
            error: null,
            source: "gps"
          });
        }
      },
      (error) => {
        setLocation(prev => ({
          ...prev,
          isLoading: false,
          error: "Using default location",
          address: "बाल शिक्षण मंदिर, व. कृ. धामगोकर पथ, Kothrud, Anandnagar, पुणे शहर, Pune District, Maharashtra, 411029, India"
        }));
      }
    );
  };

  const findNearbyHospitals = (lat, lng) => {
    const mockHospitals = [
      { 
        id: 1, 
        name: "City General Hospital", 
        distance: "1.2", 
        eta: "4 mins", 
        beds: 45, 
        emergency: true,
        rating: 4.5,
        phone: "108",
        address: "Near Pune Station, Pune"
      },
      { 
        id: 2, 
        name: "St. Mary's Medical Center", 
        distance: "2.5", 
        eta: "8 mins", 
        beds: 28, 
        emergency: true,
        rating: 4.3,
        phone: "108",
        address: "FC Road, Shivajinagar, Pune"
      },
      { 
        id: 3, 
        name: "Apollo Clinic", 
        distance: "3.8", 
        eta: "12 mins", 
        beds: 15, 
        emergency: false,
        rating: 4.7,
        phone: "108",
        address: "Kothrud, Pune"
      },
      { 
        id: 4, 
        name: "KEM Hospital", 
        distance: "4.2", 
        eta: "15 mins", 
        beds: 60, 
        emergency: true,
        rating: 4.8,
        phone: "108",
        address: "Rasta Peth, Pune"
      }
    ];
    
    setNearbyHospitals(mockHospitals);
  };

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
  };

  const handleSOS = async () => {
  if (!formData.callerName || !formData.callerPhone) {
    setError("Please enter your name and phone number.");
    return;
  }

  setIsSubmitting(true);

  try {
    const incidentData = {
      ...formData,
      lat: location.lat,
      lng: location.lng,
      locationAddress: location.address,
      selectedHospital: selectedHospital?.name,
      hospitalAddress: selectedHospital?.address,
      createdAt: serverTimestamp(),
      incidentId: `INC${Date.now()}`,
      status: "pending",
      priority: "high",
      assignedAmbulance: null,
    };

    await addDoc(collection(db, "incidents"), incidentData);

    setSuccess(true);
    setFormData({
      emergencyType: "Cardiac",
      callerName: "",
      callerPhone: "",
      description: ""
    });

    setTimeout(() => {
      setSuccess(false);
      setIsSubmitting(false);
    }, 3000);
  } catch (error) {
    setError("Failed to send SOS");
    setIsSubmitting(false);
  }
};
  const clearSelection = () => {
    setSelectedHospital(null);
  };

  return (
    <CitizenLayout>
      <div className="sos-container">
        {/* Header */}
        <div className="sos-header">
          <h1>
            <span className="emergency-pulse">🚨</span>
            Emergency SOS
          </h1>
          <p className="sos-subtitle">Immediate medical assistance will be dispatched to your location</p>
        </div>

        {/* Location Status */}
        <div className="location-status">
          {location.isLoading ? (
            <div className="location-loading">
              <div className="pulse-loader"></div>
              <div className="loading-text">
                <strong>Detecting your location...</strong>
                <span>Please wait while we get your precise location</span>
              </div>
            </div>
          ) : location.error ? (
            <div className="location-error">
              <span className="error-icon">⚠️</span>
              <div className="error-details">
                <strong>Using Default Location</strong>
                <p>{location.address.substring(0, 100)}...</p>
              </div>
              <button onClick={getCurrentLocation} className="retry-btn">
                🔄 Retry GPS
              </button>
            </div>
          ) : (
            <div className="location-success">
              <div className="location-header">
                <div className="header-left">
                  <span className="success-icon">📍</span>
                  <div className="location-badges">
                    <span className="source-badge" style={{ backgroundColor: '#10b981' }}>
                      {location.source === 'gps' ? 'GPS' : 'Network'}
                    </span>
                    <span className="accuracy-badge">
                      Accuracy: ±10m
                    </span>
                  </div>
                </div>
                <div className="location-actions">
                  <button className="refresh-btn" onClick={getCurrentLocation} title="Refresh location">
                    🔄
                  </button>
                  <button className="share-btn" title="Share location">
                    📤
                  </button>
                </div>
              </div>
              
              <div className="location-details">
                <div className="detail-row">
                  <strong>📍 Address:</strong>
                  <p>{location.address || "बाल शिक्षण मंदिर, व. कृ. धामगोकर पथ, Kothrud, Anandnagar, पुणे शहर, Pune District, Maharashtra, 411029, India"}</p>
                </div>
                
                <div className="detail-row grid">
                  <div className="detail-item">
                    <span>🏙️ City:</span>
                    <strong>{location.city}</strong>
                  </div>
                  <div className="detail-item">
                    <span>🗺️ State:</span>
                    <strong>{location.state}</strong>
                  </div>
                  <div className="detail-item">
                    <span>📮 Pincode:</span>
                    <strong>{location.pincode}</strong>
                  </div>
                </div>

                <div className="coordinates">
                  <span className="coord-item">Lat: {location.lat?.toFixed(6)}</span>
                  <span className="coord-item">Lng: {location.lng?.toFixed(6)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Type */}
        <div className="emergency-type-section">
          <label>Emergency Type <span className="required">*</span></label>
          <div className="emergency-buttons">
            {[
              { type: "Cardiac", icon: "❤️", color: "#ef4444" },
              { type: "Accident", icon: "🚗", color: "#f59e0b" },
              { type: "Fire", icon: "🔥", color: "#f97316" },
              { type: "Other", icon: "📞", color: "#6b7280" }
            ].map(item => (
              <button
                key={item.type}
                className={`emergency-btn ${formData.emergencyType === item.type ? 'active' : ''}`}
                style={{ '--btn-color': item.color }}
                onClick={() => setFormData(prev => ({ ...prev, emergencyType: item.type }))}
              >
                <span className="emergency-icon">{item.icon}</span>
                <span className="emergency-label">{item.type}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Caller Information */}
<div className="caller-section">
  <h3>👤 Caller Information</h3>

  <div className="caller-grid">
    <div className="input-group">
      <label>Full Name *</label>
      <input
        type="text"
        placeholder="Enter your name"
        value={formData.callerName}
        onChange={(e) =>
          setFormData({ ...formData, callerName: e.target.value })
        }
      />
    </div>

    <div className="input-group">
      <label>Phone Number *</label>
      <input
        type="tel"
        placeholder="Enter phone number"
        value={formData.callerPhone}
        onChange={(e) =>
          setFormData({ ...formData, callerPhone: e.target.value })
        }
      />
    </div>
  </div>

  <div className="input-group">
    <label>Description (Optional)</label>
    <textarea
      rows="3"
      placeholder="Describe the emergency..."
      value={formData.description}
      onChange={(e) =>
        setFormData({ ...formData, description: e.target.value })
      }
    />
  </div>
</div>

        {/* Nearby Hospitals */}
        <div className="nearby-hospitals">
          <h3>🏥 Nearest Hospitals (Click to select for SOS)</h3>
          <div className="hospital-list">
            {nearbyHospitals.map((hospital, index) => (
              <motion.div 
                key={hospital.id}
                className={`hospital-item ${selectedHospital?.id === hospital.id ? 'selected-for-sos' : ''}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleHospitalSelect(hospital)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="hospital-rank">{index + 1}</div>
                <div className="hospital-info">
                  <div className="hospital-name">
                    <strong>{hospital.name}</strong>
                    <div className="hospital-rating">⭐ {hospital.rating}</div>
                  </div>
                  <div className="hospital-meta">
                    <span>📍 {hospital.distance} km</span>
                    <span>⏱️ {hospital.eta}</span>
                    <span>🛏️ {hospital.beds} beds</span>
                  </div>
                  <div className="hospital-address">{hospital.address}</div>
                </div>
                {hospital.emergency && (
                  <span className="emergency-badge">24/7</span>
                )}
                <button 
                  className="select-hospital-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHospitalSelect(hospital);
                  }}
                >
                  {selectedHospital?.id === hospital.id ? '✓ Selected' : 'Select'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hospital Selection Indicator */}
        <AnimatePresence>
          {selectedHospital && (
            <motion.div 
              className="hospital-selection-indicator"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="selected-hospital-info">
                <span>🏥</span>
                <strong>{selectedHospital.name}</strong>
                <span>selected for SOS</span>
              </div>
              <button 
                className="clear-selection"
                onClick={clearSelection}
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS Button */}
        <div className="sos-button-container">
          <motion.button 
            className={`sos-button ${!selectedHospital ? 'pulsing' : ''} ${isSubmitting ? 'submitting' : ''}`}
            onClick={handleSOS}
            disabled={isSubmitting || success}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="sos-icon">🚨</span>
            {isSubmitting ? 'SENDING...' : 'SEND SOS'}
            {selectedHospital && !isSubmitting && ` to ${selectedHospital.name}`}
          </motion.button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div 
              className="success-message"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="success-check">✅</div>
              <div className="success-content">
                <h4>SOS Sent Successfully!</h4>
                <p>Help is on the way from {selectedHospital?.name}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="error-message"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
            >
              ❌ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Section */}
        <div className="map-section">
          <div className="map-container">
            <iframe
              title="Current Location Map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.01}%2C${location.lat-0.01}%2C${location.lng+0.01}%2C${location.lat+0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
              className="map-iframe"
              allowFullScreen
              loading="lazy"
            />
            <div className="map-overlay">
              📍 Your Location
            </div>
          </div>
          <a 
            href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=16/${location.lat}/${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-link"
          >
            View Larger Map →
          </a>
        </div>

        {/* Quick Tips Toggle */}
        <button 
          className="tips-toggle"
          onClick={() => setShowTips(!showTips)}
        >
          {showTips ? '▼' : '▶'} First Aid Tips
        </button>

        <AnimatePresence>
          {showTips && (
            <motion.div 
              className="quick-tips"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="tips-grid">
                <div className="tip-card">
                  <span className="tip-icon">❤️</span>
                  <h4>Cardiac Arrest</h4>
                  <p>Start CPR immediately. Push hard and fast in center of chest.</p>
                </div>
                <div className="tip-card">
                  <span className="tip-icon">🩸</span>
                  <h4>Bleeding</h4>
                  <p>Apply direct pressure to wound. Elevate if possible.</p>
                </div>
                <div className="tip-card">
                  <span className="tip-icon">🔥</span>
                  <h4>Burns</h4>
                  <p><b>Cool with running water for 20 minutes. Cover with clean cloth</b> .</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Contacts */}
        <div className="emergency-contacts">
          <h3>📞 Emergency Helplines</h3>
          <div className="contacts-grid">
            <a href="tel:108" className="contact-card">
              <span className="contact-icon">🚑</span>
              <div className="contact-info">
                <strong>Ambulance</strong>
                <span>108</span>
              </div>
            </a>
            <a href="tel:100" className="contact-card">
              <span className="contact-icon">👮</span>
              <div className="contact-info">
                <strong>Police</strong>
                <span>100</span>
              </div>
            </a>
            <a href="tel:101" className="contact-card">
              <span className="contact-icon">🔥</span>
              <div className="contact-info">
                <strong>Fire</strong>
                <span>101</span>
              </div>
            </a>
            <a href="tel:1070" className="contact-card">
              <span className="contact-icon">🌊</span>
              <div className="contact-info">
                <strong>Disaster</strong>
                <span>1070</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}

export default SOS;