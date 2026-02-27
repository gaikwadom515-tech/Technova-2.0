import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import CitizenLayout from "../../layouts/CitizenLayout";
import "./SOS.css";

function SOS() {
  // Form state
  const [formData, setFormData] = useState({
    emergencyType: "Cardiac",
    callerName: "",
    callerPhone: "",
    alternatePhone: "",
    address: "",
    description: "",
    priority: "High",
    status: "active",
    assignedAmbulance: "",
    assignedHospital: ""
  });

  // Location state
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
    isLoading: false,
    error: null
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get user's location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        isLoading: false,
        error: "Geolocation is not supported by your browser"
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates (reverse geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          setLocation({
            lat: latitude,
            lng: longitude,
            address: data.display_name || "Address not found",
            isLoading: false,
            error: null
          });

          // Auto-fill address field
          setFormData(prev => ({
            ...prev,
            address: data.display_name || ""
          }));
        } catch (error) {
          setLocation({
            lat: latitude,
            lng: longitude,
            address: "Address lookup failed",
            isLoading: false,
            error: null
          });
        }
      },
      (error) => {
        let errorMessage = "Failed to get your location";
        // eslint-disable-next-line default-case
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Please allow location access to send SOS";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocation(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update priority based on emergency type
    if (name === "emergencyType") {
      setFormData(prev => ({
        ...prev,
        priority: value === "Cardiac" ? "Critical" : 
                 value === "Accident" ? "High" : "Medium"
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.callerName.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!formData.callerPhone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (!/^\d{10}$/.test(formData.callerPhone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!location.lat || !location.lng) {
      setError("Unable to get your location. Please try again.");
      return false;
    }
    return true;
  };

  // Handle SOS submission
  const handleSOS = async () => {
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSOS = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare incident data
      const incidentData = {
        ...formData,
        callerPhone: formData.callerPhone.replace(/\D/g, ''),
        lat: location.lat,
        lng: location.lng,
        locationAddress: location.address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        incidentId: `INC${Date.now()}`,
        notificationsSent: false,
        responseTime: null
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "incidents"), incidentData);

      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setShowConfirmation(false);
        setFormData({
          emergencyType: "Cardiac",
          callerName: "",
          callerPhone: "",
          alternatePhone: "",
          address: location.address || "",
          description: "",
          priority: "Critical",
          status: "active",
          assignedAmbulance: "",
          assignedHospital: ""
        });
      }, 3000);

      // Optional: Send SMS/Email notifications
      // await sendNotifications(incidentData);

      console.log("Incident created with ID:", docRef.id);

    } catch (error) {
      console.error("Error sending SOS:", error);
      setError("Failed to send SOS. Please try again or call emergency services directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSOS = () => {
    setShowConfirmation(false);
    setError(null);
  };

  // Emergency contacts
  const emergencyContacts = [
    { name: "Ambulance", number: "108" },
    { name: "Police", number: "100" },
    { name: "Fire", number: "101" },
    { name: "Disaster Management", number: "1070" }
  ];

  return (
    <CitizenLayout>
      <div className="sos-container">
        <h1>🚨 Emergency SOS</h1>
        <p className="sos-subtitle">Immediate medical assistance will be dispatched to your location</p>

        {/* Location Status */}
        <div className="location-status">
          {location.isLoading ? (
            <div className="location-loading">
              <span className="spinner"></span>
              Getting your location...
            </div>
          ) : location.error ? (
            <div className="location-error">
              ⚠️ {location.error}
              <button onClick={getCurrentLocation} className="retry-btn">
                Retry
              </button>
            </div>
          ) : (
            <div className="location-success">
              📍 Location detected: {location.address?.substring(0, 50)}...
            </div>
          )}
        </div>

        {/* Emergency Type Selection */}
        <div className="emergency-type-section">
          <label>Emergency Type *</label>
          <div className="emergency-buttons">
            {["Cardiac", "Accident", "Fire", "Other"].map(type => (
              <button
                key={type}
                type="button"
                className={`emergency-btn ${formData.emergencyType === type ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  emergencyType: type,
                  priority: type === "Cardiac" ? "Critical" : 
                           type === "Accident" ? "High" : 
                           type === "Fire" ? "High" : "Medium"
                }))}
              >
                {type === "Cardiac" && "❤️ "}
                {type === "Accident" && "🚗 "}
                {type === "Fire" && "🔥 "}
                {type === "Other" && "📞 "}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="callerName"
              value={formData.callerName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              disabled={isSubmitting || success}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="callerPhone"
                value={formData.callerPhone}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                disabled={isSubmitting || success}
              />
            </div>

            <div className="form-group">
              <label>Alternate Phone</label>
              <input
                type="tel"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleInputChange}
                placeholder="Alternate contact number"
                maxLength="10"
                disabled={isSubmitting || success}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Briefly describe the emergency situation..."
              rows="3"
              disabled={isSubmitting || success}
            />
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="emergency-contacts">
          <h3>📞 Emergency Helplines</h3>
          <div className="contacts-grid">
            {emergencyContacts.map(contact => (
              <div key={contact.name} className="contact-card">
                <strong>{contact.name}</strong>
                <a href={`tel:${contact.number}`}>{contact.number}</a>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="success-message">
            ✅ SOS Sent Successfully! Help is on the way.
          </div>
        )}

        {/* SOS Button */}
        <button 
          className={`sos-button ${isSubmitting ? 'submitting' : ''}`}
          onClick={handleSOS}
          disabled={isSubmitting || success || location.isLoading}
        >
          {isSubmitting ? '🚑 SENDING...' : '🚨 SEND SOS'}
        </button>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <h2>Confirm Emergency SOS</h2>
              <p>Are you sure you want to send an emergency alert?</p>
              
              <div className="emergency-summary">
                <p><strong>Type:</strong> {formData.emergencyType}</p>
                <p><strong>Name:</strong> {formData.callerName}</p>
                <p><strong>Phone:</strong> {formData.callerPhone}</p>
                <p><strong>Location:</strong> {location.address?.substring(0, 100)}</p>
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={cancelSOS}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  onClick={confirmSOS}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Confirm SOS'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}

export default SOS;