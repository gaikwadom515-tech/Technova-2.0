import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../../components/Map/Map';
import Loader from '../../components/Loader/Loader';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [recentEmergencies, setRecentEmergencies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          fetchNearbyHospitals(position.coords.latitude, position.coords.longitude);
          fetchRecentEmergencies();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Mumbai
          setUserLocation({ lat: 19.0760, lng: 72.8777 });
          fetchNearbyHospitals(19.0760, 72.8777);
          fetchRecentEmergencies();
        }
      );
    } else {
      setUserLocation({ lat: 19.0760, lng: 72.8777 });
      fetchNearbyHospitals(19.0760, 72.8777);
      fetchRecentEmergencies();
    }
  }, []);

  const fetchNearbyHospitals = async (lat, lng) => {
    try {
      // Mock data - Replace with actual API call
      setTimeout(() => {
        setNearbyHospitals([
          { 
            id: 1, 
            name: 'City General Hospital', 
            distance: '1.2 km', 
            availableBeds: 8,
            totalBeds: 50,
            eta: '4 mins',
            address: 'MG Road, Camp Area',
            phone: '+91 98765 43210'
          },
          { 
            id: 2, 
            name: 'Apollo Medical Center', 
            distance: '2.5 km', 
            availableBeds: 3,
            totalBeds: 30,
            eta: '7 mins',
            address: 'FC Road, Shivajinagar',
            phone: '+91 98765 43211'
          },
          { 
            id: 3, 
            name: 'Lifeline Hospital', 
            distance: '3.1 km', 
            availableBeds: 12,
            totalBeds: 45,
            eta: '9 mins',
            address: 'JM Road, Deccan',
            phone: '+91 98765 43212'
          }
        ]);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchRecentEmergencies = () => {
    // Mock data
    setRecentEmergencies([
      { id: 1, type: 'Chest Pain', status: 'completed', time: 'Today, 10:30 AM', ambulance: 'AMB-101' },
      { id: 2, type: 'Accident', status: 'in-progress', time: 'Today, 11:45 AM', ambulance: 'AMB-203' },
      { id: 3, type: 'Fever', status: 'completed', time: 'Yesterday, 8:15 PM', ambulance: 'AMB-105' }
    ]);
  };

  const handleSOSClick = () => {
    navigate('/citizen/sos');
  };

  if (loading) return <Loader />;

  return (
    <div className="citizen-dashboard">
      {/* Hero Section with SOS */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Emergency Medical Assistance</h1>
          <p>Immediate help at your fingertips</p>
          <button onClick={handleSOSClick} className="sos-emergency-btn">
            <span className="sos-icon">🆘</span>
            SOS Emergency
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-details">
            <h3>{nearbyHospitals.length}</h3>
            <p>Nearby Hospitals</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚑</div>
          <div className="stat-details">
            <h3>5</h3>
            <p>Active Ambulances</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-details">
            <h3>4.5 min</h3>
            <p>Avg Response Time</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛏️</div>
          <div className="stat-details">
            <h3>23</h3>
            <p>Available Beds</p>
          </div>
        </div>
      </div>

      {/* Live Map Preview */}
      <div className="map-preview-section">
        <div className="section-header">
          <h2>Live Ambulance Tracking</h2>
          <button className="view-full-map" onClick={() => navigate('/citizen/search-hospital')}>
            View Full Map →
          </button>
        </div>
        <div className="map-wrapper">
          <Map 
            center={userLocation}
            hospitals={nearbyHospitals}
            userLocation={userLocation}
            height="250px"
          />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={handleSOSClick}>
            <div className="action-icon emergency">🆘</div>
            <h3>SOS Emergency</h3>
            <p>Immediate ambulance required</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/citizen/search-hospital')}>
            <div className="action-icon hospital">🏥</div>
            <h3>Find Hospital</h3>
            <p>Check bed availability</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/citizen/track-ambulance/live')}>
            <div className="action-icon ambulance">🚑</div>
            <h3>Track Ambulance</h3>
            <p>Live location tracking</p>
          </div>
          
          <div className="action-card">
            <div className="action-icon firstaid">📋</div>
            <h3>First Aid Guide</h3>
            <p>Emergency procedures</p>
          </div>
        </div>
      </div>

      {/* Nearby Hospitals List */}
      <div className="hospitals-section">
        <div className="section-header">
          <h2>Nearby Hospitals</h2>
          <button className="view-all" onClick={() => navigate('/citizen/search-hospital')}>
            View All
          </button>
        </div>
        
        <div className="hospitals-list">
          {nearbyHospitals.map(hospital => (
            <div key={hospital.id} className="hospital-item">
              <div className="hospital-main">
                <h3>{hospital.name}</h3>
                <p className="hospital-address">{hospital.address}</p>
                <div className="hospital-meta">
                  <span className="distance">📍 {hospital.distance}</span>
                  <span className="eta">🚑 {hospital.eta}</span>
                </div>
              </div>
              
              <div className="hospital-beds">
                <div className="bed-indicator">
                  <div className="bed-bar">
                    <div 
                      className="bed-fill" 
                      style={{ width: `${(hospital.availableBeds / hospital.totalBeds) * 100}%` }}
                    ></div>
                  </div>
                  <span className="bed-count">{hospital.availableBeds}/{hospital.totalBeds} beds</span>
                </div>
                <button className="call-btn" onClick={() => window.open(`tel:${hospital.phone}`)}>
                  📞 Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Emergency History */}
      <div className="recent-section">
        <h2>Recent Emergency Requests</h2>
        <div className="recent-list">
          {recentEmergencies.map(emergency => (
            <div key={emergency.id} className="recent-item">
              <div className="recent-status">
                <span className={`status-badge ${emergency.status}`}>
                  {emergency.status === 'completed' ? '✅' : '🟡'}
                </span>
              </div>
              <div className="recent-details">
                <h4>{emergency.type}</h4>
                <p>{emergency.time} • Ambulance: {emergency.ambulance}</p>
              </div>
              <button className="view-details">View</button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Tips Banner */}
      <div className="tips-banner">
        <div className="tips-content">
          <h3>🚑 Emergency Tips</h3>
          <p>Stay calm • Call for help • Provide clear location • Follow dispatcher instructions</p>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;