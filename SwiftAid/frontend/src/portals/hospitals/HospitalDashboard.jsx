import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import HospitalLayout from "../../layouts/HospitalLayout";
import { motion } from "framer-motion";
import { 
  FaHospital, 
  FaBed, 
  FaProcedures, 
  FaHeartbeat,
  FaPlusCircle,
  FaMinusCircle,
  FaUserMd,
  FaTint,
  FaClipboardList,
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaArrowRight
} from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import "./HospitalDashboard.css";

function HospitalDashboard() {
  const hospitalId = "citycare1";
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bloodInventory, setBloodInventory] = useState({});
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Blood types
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Bed types data with correct field names
  const bedTypes = [
    { id: 'general', name: 'General Ward', icon: '🛏️', total: 200, field: 'availableBeds' },
    { id: 'icu', name: 'ICU', icon: '💉', total: 20, field: 'availableICU' },
    { id: 'ventilator', name: 'Ventilator', icon: '🫁', total: 15, field: 'ventilatorBeds' },
    { id: 'hdu', name: 'HDU', icon: '🏥', total: 12, field: 'hduBeds' },
    { id: 'isolation', name: 'Isolation', icon: '🔬', total: 8, field: 'isolationBeds' },
  ];

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch hospital data with real-time updates
  useEffect(() => {
    const hospitalRef = doc(db, "hospitals", hospitalId);

    const unsubscribe = onSnapshot(hospitalRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setHospital(data);
        setBloodInventory(data.bloodBank || {});
        setLoading(false);
        addRecentUpdate('📊 Hospital data refreshed', 'info');
      } else {
        console.log("Hospital document not found!");
        // Set default hospital data if not exists
        const defaultHospital = {
          name: "City Care Hospital",
          availableBeds: 156,
          availableICU: 8,
          ventilatorBeds: 5,
          hduBeds: 6,
          isolationBeds: 3,
          totalBeds: 200,
          totalICU: 20,
          bloodBank: {},
          address: "City Central, Main Street",
          phone: "+919876543210"
        };
        setHospital(defaultHospital);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching hospital:", error);
      toast.error("Failed to load hospital data");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hospitalId]);

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, "hospitals", hospitalId, "doctors");
        const doctorsSnapshot = await getDocs(doctorsRef);
        const doctorsList = [];
        doctorsSnapshot.forEach((doc) => {
          doctorsList.push({ id: doc.id, ...doc.data() });
        });
        
        // If no doctors, add sample data
        if (doctorsList.length === 0) {
          const sampleDoctors = [
            {
              id: "doc1",
              name: "Rajesh Sharma",
              specialization: "Cardiologist",
              available: true,
              experience: 15,
              successRate: 98,
              operations: 500,
              phone: "+91 98765 43210",
              email: "dr.rajesh@hospital.com",
              qualification: "MBBS, MD, DM Cardiology",
              license: "MCI-12345",
              joined: "Jan 2018",
              languages: "English, Hindi, Gujarati",
              room: "Block A, Room 203",
              rating: 4.8,
              patients: 1200
            },
            {
              id: "doc2",
              name: "Priya Patel",
              specialization: "Surgeon",
              available: true,
              experience: 12,
              successRate: 96,
              operations: 350,
              phone: "+91 98765 43211",
              email: "dr.priya@hospital.com",
              qualification: "MBBS, MS Surgery",
              license: "MCI-12346",
              joined: "Mar 2019",
              languages: "English, Hindi",
              room: "Block B, Room 105",
              rating: 4.7,
              patients: 800
            },
            {
              id: "doc3",
              name: "Amit Kumar",
              specialization: "Physician",
              available: false,
              experience: 8,
              successRate: 94,
              operations: 200,
              phone: "+91 98765 43212",
              email: "dr.amit@hospital.com",
              qualification: "MBBS, MD Medicine",
              license: "MCI-12347",
              joined: "Jun 2020",
              languages: "English, Hindi",
              room: "Block C, Room 301",
              rating: 4.5,
              patients: 600
            }
          ];
          setDoctors(sampleDoctors);
        } else {
          setDoctors(doctorsList);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        // Set sample doctors on error
        setDoctors([
          {
            id: "doc1",
            name: "Rajesh Sharma",
            specialization: "Cardiologist",
            available: true,
            experience: 15,
            successRate: 98,
            operations: 500,
            phone: "+91 98765 43210",
            email: "dr.rajesh@hospital.com",
            qualification: "MBBS, MD, DM Cardiology",
            license: "MCI-12345",
            joined: "Jan 2018",
            languages: "English, Hindi, Gujarati",
            room: "Block A, Room 203",
            rating: 4.8,
            patients: 1200
          }
        ]);
      }
    };

    fetchDoctors();

    // Real-time listener for doctors
    try {
      const doctorsRef = collection(db, "hospitals", hospitalId, "doctors");
      const unsubscribe = onSnapshot(doctorsRef, (snapshot) => {
        const doctorsList = [];
        snapshot.forEach((doc) => {
          doctorsList.push({ id: doc.id, ...doc.data() });
        });
        if (doctorsList.length > 0) {
          setDoctors(doctorsList);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up doctors listener:", error);
    }
  }, [hospitalId]);

  const addRecentUpdate = (message, type = 'info') => {
    setRecentUpdates(prev => [
      { id: Date.now(), message, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9)
    ]);
  };

  // Update bed count
  const updateBeds = async (type, value) => {
    if (!hospital) return;

    const bedType = bedTypes.find(b => b.id === type);
    if (!bedType) return;

    const field = bedType.field;
    const currentValue = hospital[field] || 0;
    const newValue = Math.max(0, currentValue + value);
    
    try {
      const hospitalRef = doc(db, "hospitals", hospitalId);
      await updateDoc(hospitalRef, {
        [field]: newValue
      });
      
      toast.success(`${bedType.name} ${value > 0 ? 'added' : 'removed'}!`);

      addRecentUpdate(
        `${bedType.icon} ${bedType.name} bed ${value > 0 ? 'added' : 'removed'} (${newValue} available)`,
        'success'
      );
      
    } catch (error) {
      console.error("Error updating beds:", error);
      toast.error("Failed to update beds");
    }
  };

  // Update blood bank
  const updateBloodUnit = async (bloodType, value) => {
    if (!hospital) return;

    try {
      const hospitalRef = doc(db, "hospitals", hospitalId);
      const currentUnits = bloodInventory[bloodType] || 0;
      const newUnits = Math.max(0, currentUnits + value);
      
      // Create updated blood inventory
      const updatedBloodInventory = {
        ...bloodInventory,
        [bloodType]: newUnits
      };
      
      await updateDoc(hospitalRef, {
        [`bloodBank.${bloodType}`]: newUnits
      });
      
      setBloodInventory(updatedBloodInventory);
      
      toast.success(`🩸 ${bloodType} ${value > 0 ? 'added' : 'removed'}!`);

      addRecentUpdate(
        `🩸 Blood bank: ${bloodType} ${value > 0 ? '+' : ''}${value} units (${newUnits} total)`,
        'success'
      );
      
    } catch (error) {
      console.error("Error updating blood bank:", error);
      toast.error("Failed to update blood bank");
    }
  };

  // Update doctor availability
  const toggleDoctorAvailability = async (doctorId, currentStatus) => {
    try {
      const doctorRef = doc(db, "hospitals", hospitalId, "doctors", doctorId);
      await updateDoc(doctorRef, {
        available: !currentStatus
      });
      
      // Update local state
      setDoctors(prevDoctors =>
        prevDoctors.map(doc =>
          doc.id === doctorId ? { ...doc, available: !currentStatus } : doc
        )
      );
      
      toast.success(`👨‍⚕️ Doctor availability updated!`);
      addRecentUpdate(`👨‍⚕️ Doctor availability toggled`, 'info');
      
    } catch (error) {
      console.error("Error updating doctor status:", error);
      toast.error("Failed to update doctor status");
    }
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 18) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  // Get available count for bed type
  const getAvailableCount = (type) => {
    if (!hospital) return 0;
    const bedType = bedTypes.find(b => b.id === type);
    if (!bedType) return 0;
    return hospital[bedType.field] || 0;
  };

  if (loading) {
    return (
      <HospitalLayout>
        <div className="hospital-loading">
          <div className="hospital-spinner"></div>
          <h2>Loading Hospital Dashboard...</h2>
          <p>Please wait while we fetch your data</p>
        </div>
      </HospitalLayout>
    );
  }

  // Calculate statistics with null checks
  const totalDoctors = doctors?.length || 0;
  const availableDoctors = doctors?.filter(d => d?.available).length || 0;
  const totalBeds = hospital?.totalBeds || 200;
  const occupiedBeds = totalBeds - (hospital?.availableBeds || 0);
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const totalBloodUnits = Object.values(bloodInventory || {}).reduce((a, b) => a + b, 0);
  const criticalBloodTypes = bloodTypes.filter(type => (bloodInventory[type] || 0) < 10);

  return (
    <HospitalLayout>
      <Toaster position="top-right" />
      
      <div className="hospital-dashboard">
        {/* Header with Dynamic Date */}
        <div className="hospital-header">
          <div className="header-left">
            <div className="greeting-section">
              <h1>
                <FaHospital className="header-icon" />
                {getGreeting()}, Dr. Sharma!
              </h1>
              <p className="hospital-name">{hospital?.name || 'City Care Hospital'}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="date-time-card">
              <FaCalendarAlt className="calendar-icon" />
              <div className="date-time-info">
                <span className="date">{formatDate(currentDate)}</span>
                <span className="time">{currentDate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only showing counts */}
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5 }}
            onHoverStart={() => setHoveredCard('beds')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => setActiveTab('beds')}
          >
            <div className="stat-icon blue">🛏️</div>
            <div className="stat-content">
              <h3>Available Beds</h3>
              <div className="stat-value">{hospital?.availableBeds || 0}</div>
              <div className="stat-sub">Total: {hospital?.totalBeds || 200}</div>
            </div>
            {hoveredCard === 'beds' && (
              <motion.span 
                className="stat-hint"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Click to manage <FaArrowRight />
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -5 }}
            onHoverStart={() => setHoveredCard('icu')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => setActiveTab('beds')}
          >
            <div className="stat-icon green">💉</div>
            <div className="stat-content">
              <h3>ICU Beds</h3>
              <div className="stat-value">{hospital?.availableICU || 0}</div>
              <div className="stat-sub">Total ICU: {hospital?.totalICU || 20}</div>
            </div>
            {hoveredCard === 'icu' && (
              <motion.span 
                className="stat-hint"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Click to manage <FaArrowRight />
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -5 }}
            onHoverStart={() => setHoveredCard('doctors')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => setActiveTab('doctors')}
          >
            <div className="stat-icon orange">👨‍⚕️</div>
            <div className="stat-content">
              <h3>Total Doctors</h3>
              <div className="stat-value">{totalDoctors}</div>
              <div className="stat-sub">Available: {availableDoctors}</div>
            </div>
            {hoveredCard === 'doctors' && (
              <motion.span 
                className="stat-hint"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Click to view <FaArrowRight />
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -5 }}
            onHoverStart={() => setHoveredCard('blood')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => setActiveTab('blood')}
          >
            <div className="stat-icon purple">🩸</div>
            <div className="stat-content">
              <h3>Blood Units</h3>
              <div className="stat-value">{totalBloodUnits}</div>
              <div className="stat-sub">Critical: {criticalBloodTypes.length}</div>
            </div>
            {hoveredCard === 'blood' && (
              <motion.span 
                className="stat-hint"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Click to manage <FaArrowRight />
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Critical Blood Alert */}
        {criticalBloodTypes.length > 0 && (
          <motion.div 
            className="critical-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaExclamationTriangle className="alert-icon" />
            <div className="alert-content">
              <h3>⚠️ Critical Blood Stock Alert!</h3>
              <p>Low stock for: {criticalBloodTypes.join(', ')}</p>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <motion.button 
              className="action-btn"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('beds')}
            >
              🛏️ Manage Beds
            </motion.button>
            <motion.button 
              className="action-btn"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('blood')}
            >
              🩸 Blood Bank
            </motion.button>
            <motion.button 
              className="action-btn"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('doctors')}
            >
              👨‍⚕️ View Doctors
            </motion.button>
            <motion.button 
              className="action-btn"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toast.success('📄 Report generation started!')}
            >
              📋 Generate Report
            </motion.button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="hospital-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'beds' ? 'active' : ''}`}
            onClick={() => setActiveTab('beds')}
          >
            🛏️ Bed Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'blood' ? 'active' : ''}`}
            onClick={() => setActiveTab('blood')}
          >
            🩸 Blood Bank
          </button>
          <button 
            className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ Doctors ({totalDoctors})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            📋 Recent Updates
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                {/* Bed Occupancy Card */}
                <div className="info-card">
                  <h3>🛏️ Bed Occupancy</h3>
                  <div className="progress-container">
                    <div className="progress-info">
                      <span>Occupancy Rate</span>
                      <span className="progress-value">{bedOccupancyRate}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill" 
                        initial={{ width: 0 }}
                        animate={{ width: `${bedOccupancyRate}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="stats-mini">
                    <div className="stat-mini-item">
                      <span>Occupied</span>
                      <strong>{occupiedBeds}</strong>
                    </div>
                    <div className="stat-mini-item">
                      <span>Available</span>
                      <strong>{hospital?.availableBeds || 0}</strong>
                    </div>
                    <div className="stat-mini-item">
                      <span>ICU</span>
                      <strong>{hospital?.availableICU || 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Doctor Stats Card */}
                <div className="info-card">
                  <h3>👨‍⚕️ Doctor Statistics</h3>
                  <div className="stats-mini-grid">
                    <div className="stat-mini-box">
                      <span>Total</span>
                      <strong>{totalDoctors}</strong>
                    </div>
                    <div className="stat-mini-box">
                      <span>Available</span>
                      <strong className="success">{availableDoctors}</strong>
                    </div>
                    <div className="stat-mini-box">
                      <span>On Leave</span>
                      <strong>{totalDoctors - availableDoctors}</strong>
                    </div>
                  </div>
                  <div className="specialization-list">
                    <h4>By Specialization</h4>
                    {['Cardiologist', 'Surgeon', 'Physician'].map(spec => {
                      const count = doctors.filter(d => d?.specialization === spec).length;
                      return count > 0 && (
                        <div key={spec} className="spec-item">
                          <span>{spec}</span>
                          <span className="spec-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Blood Bank Card */}
                <div className="info-card">
                  <h3>🩸 Blood Bank Summary</h3>
                  <div className="total-units">
                    <span>Total Units</span>
                    <strong>{totalBloodUnits}</strong>
                  </div>
                  <div className="critical-levels">
                    <h4>Critical Levels</h4>
                    {criticalBloodTypes.length > 0 ? (
                      criticalBloodTypes.map(type => (
                        <div key={type} className="critical-item">
                          <span>{type}</span>
                          <span>{bloodInventory[type] || 0} units</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-critical">No critical levels</p>
                    )}
                  </div>
                </div>

                {/* Recent Updates Card */}
                <div className="info-card">
                  <h3>📋 Recent Updates</h3>
                  <div className="recent-updates">
                    {recentUpdates.length > 0 ? (
                      recentUpdates.slice(0, 5).map(update => (
                        <div key={update.id} className={`update-item ${update.type}`}>
                          <span>{update.message}</span>
                          <span className="update-time">{update.time}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-updates">No recent updates</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Beds Tab */}
          {activeTab === 'beds' && (
            <div className="beds-tab">
              <div className="beds-grid">
                {bedTypes.map(bed => {
                  const count = getAvailableCount(bed.id);
                  return (
                    <motion.div 
                      key={bed.id} 
                      className="bed-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                    >
                      <h3>{bed.icon} {bed.name}</h3>
                      <div className="bed-count-display">
                        <span>Available</span>
                        <strong>{count}</strong>
                      </div>
                      <div className="bed-total">
                        <span>Total</span>
                        <span>{bed.total}</span>
                      </div>
                      <div className="bed-actions">
                        <motion.button 
                          className="bed-btn minus"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateBeds(bed.id, -1)}
                          disabled={count <= 0}
                        >
                          <FaMinusCircle /> -
                        </motion.button>
                        <span className="bed-current">{count}</span>
                        <motion.button 
                          className="bed-btn plus"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateBeds(bed.id, 1)}
                        >
                          <FaPlusCircle /> +
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blood Bank Tab */}
          {activeTab === 'blood' && (
            <div className="blood-tab">
              <h3>🩸 Blood Bank Inventory</h3>
              <div className="blood-grid">
                {bloodTypes.map(type => {
                  const units = bloodInventory[type] || 0;
                  const isCritical = units < 10;
                  return (
                    <motion.div 
                      key={type} 
                      className={`blood-card ${isCritical ? 'critical' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                    >
                      <div className="blood-header">
                        <span className="blood-type">{type}</span>
                        <span className="blood-units">{units} units</span>
                      </div>
                      <div className="blood-actions">
                        <motion.button 
                          className="blood-btn minus"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateBloodUnit(type, -1)}
                          disabled={units <= 0}
                        >
                          <FaMinusCircle /> Remove
                        </motion.button>
                        <motion.button 
                          className="blood-btn plus"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateBloodUnit(type, 1)}
                        >
                          <FaPlusCircle /> Add
                        </motion.button>
                      </div>
                      {isCritical && <span className="critical-badge">⚠️ Critical</span>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="doctors-tab">
              <h3>👨‍⚕️ Medical Staff Directory</h3>
              <div className="doctors-grid">
                {doctors.length > 0 ? (
                  doctors.map(doctor => (
                    <motion.div 
                      key={doctor.id} 
                      className="doctor-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                    >
                      <div className="doctor-header">
                        <div className="doctor-avatar">
                          {doctor.name ? doctor.name.charAt(0).toUpperCase() : '👨‍⚕️'}
                        </div>
                        <div>
                          <h4>Dr. {doctor.name}</h4>
                          <p>{doctor.specialization}</p>
                        </div>
                        <motion.button 
                          className={`availability-badge ${doctor.available ? 'available' : 'unavailable'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleDoctorAvailability(doctor.id, doctor.available)}
                        >
                          {doctor.available ? '✅ Available' : '❌ Unavailable'}
                        </motion.button>
                      </div>
                      <div className="doctor-details">
                        <p><span>📅 Experience:</span> {doctor.experience || 12} years</p>
                        <p><span>⭐ Success Rate:</span> {doctor.successRate || 95}%</p>
                        <p><span>📋 Operations:</span> {doctor.operations || 150}+</p>
                        <p><span>📞 Contact:</span> {doctor.phone || '+91 98765 43210'}</p>
                      </div>
                      <div className="doctor-footer">
                        <div className="rating">
                          <span>⭐ {doctor.rating || 4.5}</span>
                        </div>
                        <motion.button 
                          className="view-profile-btn"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowDoctorModal(true);
                          }}
                        >
                          View Profile
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="no-doctors">No doctors found</p>
                )}
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="activities-tab">
              <h3>📋 Recent Hospital Updates</h3>
              <div className="activities-list">
                {recentUpdates.length > 0 ? (
                  recentUpdates.map(update => (
                    <motion.div 
                      key={update.id} 
                      className={`activity-item ${update.type}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <span className="activity-time">{update.time}</span>
                      <span className="activity-message">{update.message}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="no-activities">No recent activities</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Profile Modal */}
        {showDoctorModal && selectedDoctor && (
          <motion.div 
            className="modal-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDoctorModal(false)}
          >
            <motion.div 
              className="modal-content" 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowDoctorModal(false)}>×</button>
              
              <div className="doctor-profile">
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    {selectedDoctor.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2>Dr. {selectedDoctor.name}</h2>
                    <p>{selectedDoctor.specialization}</p>
                    <span className={`availability-badge ${selectedDoctor.available ? 'available' : 'unavailable'}`}>
                      {selectedDoctor.available ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                </div>

                <div className="profile-stats">
                  <div className="profile-stat">
                    <span>📅 Experience</span>
                    <strong>{selectedDoctor.experience || 12} years</strong>
                  </div>
                  <div className="profile-stat">
                    <span>⭐ Success Rate</span>
                    <strong>{selectedDoctor.successRate || 95}%</strong>
                  </div>
                  <div className="profile-stat">
                    <span>📋 Operations</span>
                    <strong>{selectedDoctor.operations || 150}+</strong>
                  </div>
                  <div className="profile-stat">
                    <span>👥 Patients</span>
                    <strong>{selectedDoctor.patients || 500}+</strong>
                  </div>
                </div>

                <div className="profile-details">
                  <h3>📋 Professional Information</h3>
                  <p><span>Qualification:</span> {selectedDoctor.qualification || 'MBBS, MD'}</p>
                  <p><span>License:</span> {selectedDoctor.license || 'MCI-12345'}</p>
                  <p><span>Joined:</span> {selectedDoctor.joined || 'Jan 2020'}</p>
                  <p><span>Languages:</span> {selectedDoctor.languages || 'English, Hindi'}</p>

                  <h3>📞 Contact Information</h3>
                  <p><span>Phone:</span> {selectedDoctor.phone || '+91 98765 43210'}</p>
                  <p><span>Email:</span> {selectedDoctor.email || `dr.${selectedDoctor.name?.toLowerCase()}@hospital.com`}</p>
                  <p><span>Room:</span> {selectedDoctor.room || 'Block A, Room 203'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </HospitalLayout>
  );
}

export default HospitalDashboard;