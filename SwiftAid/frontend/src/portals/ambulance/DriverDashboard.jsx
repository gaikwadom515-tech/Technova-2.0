import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import AmbulanceLayout from "../../layouts/Ambulancelayout";
import "./DriverDashboard.css";

function DriverDashboard() {
  const [assignedIncident, setAssignedIncident] = useState(null);
  const [pastIncidents, setPastIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState("available");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [eta, setEta] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const ambulanceId = "ambulance1"; // Change if needed
  const driverName = "Rajesh Kumar";
  const driverBadge = "AMB-2024-001";

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Listen for assigned incidents
  useEffect(() => {
    setLoading(true);
    
    const incidentsQuery = query(
      collection(db, "incidents"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(incidentsQuery, (snapshot) => {
      const allIncidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      // Find currently assigned incident
      const currentAssigned = allIncidents.find(
        incident =>
          incident.assignedAmbulance === ambulanceId &&
          (incident.status === "assigned" || incident.status === "dispatched")
      );

      // Get past incidents for this ambulance
      const past = allIncidents.filter(
        incident =>
          incident.assignedAmbulance === ambulanceId &&
          (incident.status === "completed" || incident.status === "cancelled")
      ).slice(0, 5);

      setAssignedIncident(currentAssigned || null);
      setPastIncidents(past);
      
      if (currentAssigned) {
        setDriverStatus("on-duty");
        calculateETA(currentAssigned);
      } else {
        setDriverStatus("available");
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching incidents:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Calculate ETA based on location (simulated)
  const calculateETA = (incident) => {
    // Simulate ETA calculation based on distance
    const distance = Math.floor(Math.random() * 10) + 2; // 2-12 km
    const traffic = Math.floor(Math.random() * 10) + 5; // 5-15 mins
    const estimatedTime = distance * 2 + traffic; // Rough calculation
    
    setEta({
      distance: `${distance}.${Math.floor(Math.random() * 9)} km`,
      time: `${estimatedTime} mins`,
      traffic: traffic > 8 ? "Heavy" : traffic > 5 ? "Moderate" : "Light"
    });
  };

  const markCompleted = async () => {
    if (!assignedIncident) return;

    try {
      const ref = doc(db, "incidents", assignedIncident.id);
      await updateDoc(ref, { 
        status: "completed",
        completedAt: new Date(),
        completedBy: driverName,
        responseTime: eta?.time || "Unknown"
      });

      setShowConfirmModal(false);
      setDriverStatus("available");
      
      // Show success message
      alert("✅ Emergency Completed Successfully!");
      
    } catch (error) {
      console.error("Error completing incident:", error);
      alert("❌ Failed to complete incident. Please try again.");
    }
  };

  const updateStatus = async (newStatus) => {
    if (!assignedIncident) return;

    try {
      const ref = doc(db, "incidents", assignedIncident.id);
      await updateDoc(ref, { 
        status: newStatus,
        updatedAt: new Date()
      });
      
      setDriverStatus(newStatus === "dispatched" ? "on-route" : "on-duty");
      
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "available": return "#10b981";
      case "on-duty": return "#f59e0b";
      case "on-route": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  return (
    <AmbulanceLayout>
      <div className="driver-dashboard">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>🚑 Ambulance Driver Dashboard</h1>
            <div className="driver-info">
              <span className="driver-name">{driverName}</span>
              <span className="driver-badge">Badge: {driverBadge}</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="datetime-display">
              <div className="date">{formatDate(currentTime)}</div>
              <div className="time">{formatTime(currentTime)}</div>
            </div>
            
            <div className="status-badge" style={{ backgroundColor: getStatusColor(driverStatus) }}>
              {driverStatus === "available" && "✅ Available"}
              {driverStatus === "on-duty" && "🚑 On Duty"}
              {driverStatus === "on-route" && "🚨 On Route"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Assigned Incident Section */}
            {assignedIncident ? (
              <div className="assigned-incident-section">
                <h2>🚨 Current Emergency Assignment</h2>
                
                <div className="incident-card emergency">
                  <div className="incident-header">
                    <div className="incident-type">
                      <span className="type-icon">
                        {assignedIncident.emergencyType === "Cardiac" && "❤️"}
                        {assignedIncident.emergencyType === "Accident" && "🚗"}
                        {assignedIncident.emergencyType === "Fire" && "🔥"}
                        {assignedIncident.emergencyType === "Other" && "📞"}
                      </span>
                      <h3>{assignedIncident.emergencyType} Emergency</h3>
                    </div>
                    <span className={`priority-badge ${assignedIncident.priority?.toLowerCase()}`}>
                      {assignedIncident.priority || "High"} Priority
                    </span>
                  </div>

                  <div className="incident-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">👤 Caller</span>
                      <span className="detail-value">{assignedIncident.callerName}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📞 Phone</span>
                      <span className="detail-value">
                        <a href={`tel:${assignedIncident.callerPhone}`}>
                          {assignedIncident.callerPhone}
                        </a>
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📍 Location</span>
                      <span className="detail-value">
                        {assignedIncident.lat?.toFixed(4)}, {assignedIncident.lng?.toFixed(4)}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">⏰ Reported</span>
                      <span className="detail-value">
                        {assignedIncident.createdAt?.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {assignedIncident.description && (
                      <div className="detail-item full-width">
                        <span className="detail-label">📝 Description</span>
                        <span className="detail-value">{assignedIncident.description}</span>
                      </div>
                    )}
                  </div>

                  {/* ETA Section */}
                  {eta && (
                    <div className="eta-section">
                      <h4>Estimated Time of Arrival</h4>
                      <div className="eta-grid">
                        <div className="eta-item">
                          <span className="eta-label">Distance</span>
                          <span className="eta-value">{eta.distance}</span>
                        </div>
                        <div className="eta-item">
                          <span className="eta-label">ETA</span>
                          <span className="eta-value">{eta.time}</span>
                        </div>
                        <div className="eta-item">
                          <span className="eta-label">Traffic</span>
                          <span className={`eta-value traffic-${eta.traffic.toLowerCase()}`}>
                            {eta.traffic}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    {driverStatus === "on-duty" && (
                      <>
                        <button 
                          className="route-btn"
                          onClick={() => setShowRouteModal(true)}
                        >
                          🗺️ View Route
                        </button>
                        <button 
                          className="dispatch-btn"
                          onClick={() => updateStatus("dispatched")}
                        >
                          🚨 Dispatch Now
                        </button>
                      </>
                    )}
                    
                    {driverStatus === "on-route" && (
                      <>
                        <button 
                          className="emergency-btn"
                          onClick={() => window.open(`tel:${assignedIncident.callerPhone}`)}
                        >
                          📞 Contact Caller
                        </button>
                        <button 
                          className="complete-btn"
                          onClick={() => setShowConfirmModal(true)}
                        >
                          ✅ Mark Completed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="available-section">
                <div className="available-card">
                  <div className="available-icon">✅</div>
                  <h2>No Active Emergencies</h2>
                  <p>You are currently available for new assignments</p>
                  <div className="availability-status">
                    <span className="status-dot"></span>
                    <span className="status-text">Standing by for dispatch</span>
                  </div>
                </div>
              </div>
            )}

            {/* Past Incidents Section */}
            {pastIncidents.length > 0 && (
              <div className="past-incidents-section">
                <h2>📋 Recent Completed Incidents</h2>
                <div className="past-incidents-list">
                  {pastIncidents.map((incident) => (
                    <div key={incident.id} className="past-incident-card">
                      <div className="past-incident-icon">
                        {incident.emergencyType === "Cardiac" && "❤️"}
                        {incident.emergencyType === "Accident" && "🚗"}
                        {incident.emergencyType === "Fire" && "🔥"}
                        {incident.emergencyType === "Other" && "📞"}
                      </div>
                      <div className="past-incident-details">
                        <h4>{incident.emergencyType}</h4>
                        <p>{incident.callerName}</p>
                        <span className="past-incident-time">
                          {incident.createdAt?.toLocaleDateString()} at {incident.createdAt?.toLocaleTimeString()}
                        </span>
                      </div>
                      <span className={`past-status ${incident.status}`}>
                        {incident.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-icon">🚑</div>
                <div className="stat-content">
                  <h3>Ambulance ID</h3>
                  <p>{ambulanceId}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Responses</h3>
                  <p>{pastIncidents.length + (assignedIncident ? 1 : 0)}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <h3>Rating</h3>
                  <p>4.8/5.0</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <h3>Avg Response</h3>
                  <p>8.5 min</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <h2>Confirm Completion</h2>
              <p>Are you sure you want to mark this emergency as completed?</p>
              
              <div className="emergency-summary">
                <p><strong>Emergency:</strong> {assignedIncident?.emergencyType}</p>
                <p><strong>Caller:</strong> {assignedIncident?.callerName}</p>
                <p><strong>Response Time:</strong> {eta?.time}</p>
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  onClick={markCompleted}
                >
                  Confirm Completion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Route Modal */}
        {showRouteModal && (
          <div className="modal-overlay">
            <div className="route-modal">
              <h2>🗺️ Route Information</h2>
              
              <div className="route-details">
                <div className="route-point">
                  <span className="point-icon">📍</span>
                  <div className="point-details">
                    <strong>Current Location</strong>
                    <p>Ambulance Station, Main Road</p>
                  </div>
                </div>
                
                <div className="route-line">
                  <span className="distance">{eta?.distance}</span>
                </div>
                
                <div className="route-point">
                  <span className="point-icon">🏥</span>
                  <div className="point-details">
                    <strong>Destination</strong>
                    <p>{assignedIncident?.lat?.toFixed(4)}, {assignedIncident?.lng?.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div className="route-instructions">
                <h4>Directions</h4>
                <ol>
                  <li>Head north on Main Road</li>
                  <li>Turn right at the traffic signal</li>
                  <li>Continue for {eta?.distance}</li>
                  <li>Destination will be on your left</li>
                </ol>
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowRouteModal(false)}
                >
                  Close
                </button>
                <button 
                  className="navigate-btn"
                  onClick={() => window.open(`https://maps.google.com/?q=${assignedIncident?.lat},${assignedIncident?.lng}`)}
                >
                  Open in Maps
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AmbulanceLayout>
  );
}

export default DriverDashboard;