import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import AmbulanceLayout from "../../layouts/Ambulancelayout";
import "./DriverDashboard.css";

function DriverDashboard() {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState("available");
  const [currentTime, setCurrentTime] = useState(new Date());

  const ambulanceId = "AMB-01"; // MUST MATCH DISPATCHER

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "incidents"),
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .find(
            (item) =>
              item.assignedAmbulance === ambulanceId &&
              (item.status === "assigned" || item.status === "active")
          );

        setIncident(data || null);
        setDriverStatus(data ? "on-duty" : "available");
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching incidents:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const acceptCase = async () => {
    if (!incident) return;

    try {
      const ref = doc(db, "incidents", incident.id);
      await updateDoc(ref, {
        status: "active",
        acceptedAt: new Date(),
      });
      setDriverStatus("on-route");
    } catch (error) {
      console.error("Error accepting case:", error);
      alert("Failed to accept case. Please try again.");
    }
  };

  const completeCase = async () => {
    if (!incident) return;

    try {
      const ref = doc(db, "incidents", incident.id);
      await updateDoc(ref, {
        status: "completed",
        completedAt: new Date(),
      });
      setDriverStatus("available");
    } catch (error) {
      console.error("Error completing case:", error);
      alert("Failed to complete case. Please try again.");
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "available": return "#10b981";
      case "on-duty": return "#f59e0b";
      case "on-route": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "available": return "✅";
      case "on-duty": return "🚑";
      case "on-route": return "🚨";
      default: return "⏳";
    }
  };

  if (loading) {
    return (
      <AmbulanceLayout>
        <div className="driver-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AmbulanceLayout>
    );
  }

  return (
    <AmbulanceLayout>
      <div className="driver-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>
              <span className="ambulance-icon">🚑</span>
              Ambulance Driver Dashboard
            </h1>
            <div className="driver-info">
              <span className="driver-id">Vehicle: {ambulanceId}</span>
              <span className="driver-name">Driver: Rajesh Kumar</span>
            </div>
          </div>
          <div className="header-right">
            <div className="datetime-display">
              <span className="date">{formatDate(currentTime)}</span>
              <span className="time">{formatTime(currentTime)}</span>
            </div>
            <div 
              className="status-badge" 
              style={{ backgroundColor: getStatusColor(driverStatus) }}
            >
              <span className="status-icon">{getStatusIcon(driverStatus)}</span>
              <span className="status-text">
                {driverStatus === "available" && "Available"}
                {driverStatus === "on-duty" && "On Duty"}
                {driverStatus === "on-route" && "En Route"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {incident ? (
          <div className="incident-card">
            <div className="incident-header">
              <div className="incident-type">
                <span className="type-icon">
                  {incident.emergencyType === "Cardiac" && "❤️"}
                  {incident.emergencyType === "Accident" && "🚗"}
                  {incident.emergencyType === "Fire" && "🔥"}
                  {incident.emergencyType === "Other" && "📞"}
                </span>
                <h2>{incident.emergencyType} Emergency</h2>
              </div>
              <span className={`priority-badge ${incident.priority?.toLowerCase() || 'high'}`}>
                {incident.priority || "HIGH"} PRIORITY
              </span>
            </div>

            <div className="incident-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-icon">👤</span>
                  <div className="detail-content">
                    <label>Caller Name</label>
                    <strong>{incident.callerName || "Unknown"}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📞</span>
                  <div className="detail-content">
                    <label>Phone Number</label>
                    <strong>
                      <a href={`tel:${incident.callerPhone}`}>
                        {incident.callerPhone || "Not provided"}
                      </a>
                    </strong>
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <div className="detail-content">
                    <label>Location</label>
                    <strong>
                      {incident.lat?.toFixed(6)}, {incident.lng?.toFixed(6)}
                    </strong>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <div className="detail-content">
                    <label>Status</label>
                    <strong className={`status-${incident.status}`}>
                      {incident.status === "assigned" ? "ASSIGNED" : "ACTIVE"}
                    </strong>
                  </div>
                </div>
              </div>

              {incident.description && (
                <div className="detail-row full-width">
                  <div className="detail-item">
                    <span className="detail-icon">📝</span>
                    <div className="detail-content">
                      <label>Description</label>
                      <p>{incident.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {incident.locationAddress && (
                <div className="detail-row full-width">
                  <div className="detail-item">
                    <span className="detail-icon">🏠</span>
                    <div className="detail-content">
                      <label>Address</label>
                      <p>{incident.locationAddress}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {incident.status === "assigned" && (
                <button className="action-btn accept" onClick={acceptCase}>
                  <span className="btn-icon">✓</span>
                  Accept Case
                </button>
              )}

              {incident.status === "active" && (
                <>
                  <button 
                    className="action-btn navigate" 
                    onClick={() => window.open(`https://maps.google.com/?q=${incident.lat},${incident.lng}`)}
                  >
                    <span className="btn-icon">🗺️</span>
                    Navigate
                  </button>
                  <button 
                    className="action-btn contact" 
                    onClick={() => window.open(`tel:${incident.callerPhone}`)}
                  >
                    <span className="btn-icon">📞</span>
                    Contact
                  </button>
                  <button className="action-btn complete" onClick={completeCase}>
                    <span className="btn-icon">✓</span>
                    Complete Case
                  </button>
                </>
              )}
            </div>

            {/* Quick Info */}
            <div className="quick-info">
              <div className="info-item">
                <span>🚑 Ambulance ID</span>
                <strong>{ambulanceId}</strong>
              </div>
              <div className="info-item">
                <span>⏱️ Response Time</span>
                <strong>4.5 min avg</strong>
              </div>
              <div className="info-item">
                <span>📊 Today's Cases</span>
                <strong>3</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="available-state">
            <div className="available-icon">✅</div>
            <h2>No Active Emergencies</h2>
            <p>You are currently available for new assignments</p>
            <div className="availability-indicator">
              <span className="status-dot"></span>
              <span>Standing by for dispatch</span>
            </div>
            <div className="stats-preview">
              <div className="stat">
                <span>📊 Today</span>
                <strong>3 cases</strong>
              </div>
              <div className="stat">
                <span>⏱️ Avg Time</span>
                <strong>4.5 min</strong>
              </div>
              <div className="stat">
                <span>⭐ Rating</span>
                <strong>4.8</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </AmbulanceLayout>
  );
}

export default DriverDashboard;