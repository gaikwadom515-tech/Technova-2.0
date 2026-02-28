import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import HospitalLayout from "../../layouts/HospitalLayout";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
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
  FaArrowRight,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStethoscope,
  FaSyringe,
  FaPills,
  FaUserNurse,
  FaAmbulance,
  FaChartLine
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
  const [showBloodAlert, setShowBloodAlert] = useState(true);
  const [selectedBedType, setSelectedBedType] = useState('general');

  // Blood types
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Bed types data with correct field names
  const bedTypes = [
    { id: 'general', name: 'General Ward', icon: '🛏️', total: 200, field: 'availableBeds', color: '#3b82f6' },
    { id: 'icu', name: 'ICU', icon: '💉', total: 20, field: 'availableICU', color: '#8b5cf6' },
    { id: 'ventilator', name: 'Ventilator', icon: '🫁', total: 15, field: 'ventilatorBeds', color: '#ec4899' },
    { id: 'hdu', name: 'HDU', icon: '🏥', total: 12, field: 'hduBeds', color: '#f59e0b' },
    { id: 'isolation', name: 'Isolation', icon: '🔬', total: 8, field: 'isolationBeds', color: '#ef4444' },
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
          phone: "+919876543210",
          email: "contact@citycare.com",
          emergency: "108"
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
              email: "dr.rajesh@citycare.com",
              qualification: "MBBS, MD, DM Cardiology",
              license: "MCI-12345",
              joined: "Jan 2018",
              languages: "English, Hindi, Gujarati",
              room: "Block A, Room 203",
              rating: 4.8,
              patients: 1200,
              education: "AIIMS Delhi",
              department: "Cardiology"
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
              email: "dr.priya@citycare.com",
              qualification: "MBBS, MS Surgery",
              license: "MCI-12346",
              joined: "Mar 2019",
              languages: "English, Hindi",
              room: "Block B, Room 105",
              rating: 4.7,
              patients: 800,
              education: "KEM Hospital",
              department: "Surgery"
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
              email: "dr.amit@citycare.com",
              qualification: "MBBS, MD Medicine",
              license: "MCI-12347",
              joined: "Jun 2020",
              languages: "English, Hindi",
              room: "Block C, Room 301",
              rating: 4.5,
              patients: 600,
              education: "Grant Medical College",
              department: "Medicine"
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
            email: "dr.rajesh@citycare.com",
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
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get available count for bed type
  const getAvailableCount = (type) => {
    if (!hospital) return 0;
    const bedType = bedTypes.find(b => b.id === type);
    if (!bedType) return 0;
    return hospital[bedType.field] || 0;
  };

  // Get bed occupancy color
  const getOccupancyColor = (rate) => {
    if (rate >= 90) return '#ef4444';
    if (rate >= 70) return '#f59e0b';
    return '#10b981';
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
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Times New Roman, Times, serif',
          },
        }}
      />
      
      <div className="hospital-dashboard">
        {/* Header with Dynamic Date */}
        <div className="hospital-header">
          <div className="header-left">
            <div className="greeting-section">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FaHospital className="header-icon" />
                {getGreeting()}, Dr. Sharma!
              </motion.h1>
              <motion.p 
                className="hospital-name"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {hospital?.name || 'City Care Hospital'}
              </motion.p>
              <motion.div 
                className="hospital-meta"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span><FaMapMarkerAlt /> {hospital?.address || 'City Central'}</span>
                <span><FaPhoneAlt /> {hospital?.phone || '+91 98765 43210'}</span>
                <span><FaEnvelope /> {hospital?.email || 'contact@citycare.com'}</span>
              </motion.div>
            </div>
          </div>
          <motion.div 
            className="header-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="date-time-card">
              <FaCalendarAlt className="calendar-icon" />
              <div className="date-time-info">
                <span className="date">{formatDate(currentDate)}</span>
                <span className="time">{currentDate.toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="emergency-badge">
              <FaAmbulance />
              <span>Emergency: {hospital?.emergency || '108'}</span>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ y: -8, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.2)' }}
            onHoverStart={() => setHoveredCard('beds')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => setActiveTab('beds')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="stat-icon blue">
              <FaBed />
            </div>
            <div className="stat-content">
              <h3>Available Beds</h3>
              <div className="stat-value">{hospital?.availableBeds || 0}</div>
              <div className="stat-sub">
                <span>Total: {hospital?.totalBeds || 200}</span>
                <span className="occupancy" style={{ color: getOccupancyColor(bedOccupancyRate) }}>
                  {bedOccupancyRate}% occupied
                </span>
              </div>
            </div>
            {hoveredCard === 'beds' && (
              <motion.span 
                className="stat-hint"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Click to manage beds <FaArrowRight />
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -8, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.2)' }}
            onHoverStart={() => setHoveredCard('icu')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => setActiveTab('beds')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="stat-icon purple">
              <FaProcedures />
            </div>
            <div className="stat-content">
              <h3>ICU Beds</h3>
              <div className="stat-value">{hospital?.availableICU || 0}</div>
              <div className="stat-sub">
                <span>Total: {hospital?.totalICU || 20}</span>
                <span>Available: {hospital?.availableICU || 0}</span>
              </div>
            </div>
            {hoveredCard === 'icu' && (
              <motion.span 
                className="stat-hint"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Click to manage ICU <FaArrowRight />
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -8, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.2)' }}
            onHoverStart={() => setHoveredCard('doctors')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => setActiveTab('doctors')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="stat-icon orange">
              <FaUserMd />
            </div>
            <div className="stat-content">
              <h3>Medical Staff</h3>
              <div className="stat-value">{totalDoctors}</div>
              <div className="stat-sub">
                <span>Available: {availableDoctors}</span>
                <span className={availableDoctors < 3 ? 'warning' : ''}>
                  {availableDoctors < 3 ? '⚠️ Low' : '✓ Good'}
                </span>
              </div>
            </div>
            {hoveredCard === 'doctors' && (
              <motion.span 
                className="stat-hint"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                View all doctors <FaArrowRight />
              </motion.span>
            )}
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -8, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.2)' }}
            onHoverStart={() => setHoveredCard('blood')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => setActiveTab('blood')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="stat-icon red">
              <FaTint />
            </div>
            <div className="stat-content">
              <h3>Blood Bank</h3>
              <div className="stat-value">{totalBloodUnits}</div>
              <div className="stat-sub">
                <span>Total Units</span>
                <span className={criticalBloodTypes.length > 0 ? 'danger' : ''}>
                  {criticalBloodTypes.length} critical
                </span>
              </div>
            </div>
            {hoveredCard === 'blood' && (
              <motion.span 
                className="stat-hint"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Manage blood bank <FaArrowRight />
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Critical Blood Alert */}
        <AnimatePresence>
          {criticalBloodTypes.length > 0 && showBloodAlert && (
            <motion.div 
              className="critical-alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FaExclamationTriangle className="alert-icon" />
              <div className="alert-content">
                <h3>⚠️ Critical Blood Stock Alert!</h3>
                <p>Low stock for: <strong>{criticalBloodTypes.join(', ')}</strong></p>
                <p className="alert-action">Please arrange for immediate restocking.</p>
              </div>
              <button 
                className="alert-close"
                onClick={() => setShowBloodAlert(false)}
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div 
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <motion.button 
              className="action-btn"
              whileHover={{ y: -3, boxShadow: '0 10px 20px -5px rgba(59,130,246,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('beds')}
            >
              <span className="btn-icon">🛏️</span>
              <span className="btn-text">Manage Beds</span>
            </motion.button>
            <motion.button 
              className="action-btn"
              whileHover={{ y: -3, boxShadow: '0 10px 20px -5px rgba(239,68,68,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('blood')}
            >
              <span className="btn-icon">🩸</span>
              <span className="btn-text">Blood Bank</span>
            </motion.button>
            <motion.button 
              className="action-btn"
              whileHover={{ y: -3, boxShadow: '0 10px 20px -5px rgba(245,158,11,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('doctors')}
            >
              <span className="btn-icon">👨‍⚕️</span>
              <span className="btn-text">View Doctors</span>
            </motion.button>
            <motion.button 
              className="action-btn"
              whileHover={{ y: -3, boxShadow: '0 10px 20px -5px rgba(16,185,129,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                toast.success('📄 Report generation started!');
                addRecentUpdate('📄 Report generated', 'success');
              }}
            >
              <span className="btn-icon">📋</span>
              <span className="btn-text">Generate Report</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="hospital-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine className="tab-icon" />
            <span>Overview</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'beds' ? 'active' : ''}`}
            onClick={() => setActiveTab('beds')}
          >
            <FaBed className="tab-icon" />
            <span>Bed Management</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'blood' ? 'active' : ''}`}
            onClick={() => setActiveTab('blood')}
          >
            <FaTint className="tab-icon" />
            <span>Blood Bank</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            <FaUserMd className="tab-icon" />
            <span>Doctors ({totalDoctors})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            <FaClipboardList className="tab-icon" />
            <span>Updates</span>
          </button>
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          className="tab-content"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                {/* Bed Occupancy Card */}
                <motion.div 
                  className="info-card"
                  whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.15)' }}
                >
                  <h3><FaBed /> Bed Occupancy</h3>
                  <div className="progress-container">
                    <div className="progress-info">
                      <span>Occupancy Rate</span>
                      <span className="progress-value" style={{ color: getOccupancyColor(bedOccupancyRate) }}>
                        {bedOccupancyRate}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill" 
                        initial={{ width: 0 }}
                        animate={{ width: `${bedOccupancyRate}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ backgroundColor: getOccupancyColor(bedOccupancyRate) }}
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
                  <div className="bed-breakdown">
                    <h4>Bed Breakdown</h4>
                    {bedTypes.map(bed => {
                      const count = getAvailableCount(bed.id);
                      return (
                        <div key={bed.id} className="breakdown-item">
                          <span>{bed.icon} {bed.name}</span>
                          <div className="breakdown-bar">
                            <motion.div 
                              className="breakdown-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / bed.total) * 100}%` }}
                              style={{ backgroundColor: bed.color }}
                            />
                          </div>
                          <span className="breakdown-count">{count}/{bed.total}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Doctor Stats Card */}
                <motion.div 
                  className="info-card"
                  whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.15)' }}
                >
                  <h3><FaUserMd /> Doctor Statistics</h3>
                  <div className="stats-mini-grid">
                    <div className="stat-mini-box">
                      <FaUserMd className="box-icon" />
                      <span>Total</span>
                      <strong>{totalDoctors}</strong>
                    </div>
                    <div className="stat-mini-box">
                      <FaUserNurse className="box-icon success" />
                      <span>Available</span>
                      <strong className="success">{availableDoctors}</strong>
                    </div>
                    <div className="stat-mini-box">
                      <FaClock className="box-icon warning" />
                      <span>On Leave</span>
                      <strong>{totalDoctors - availableDoctors}</strong>
                    </div>
                  </div>
                  <div className="specialization-list">
                    <h4>By Specialization</h4>
                    {['Cardiologist', 'Surgeon', 'Physician', 'Pediatrician', 'Neurologist'].map(spec => {
                      const count = doctors.filter(d => d?.specialization === spec).length;
                      return count > 0 && (
                        <motion.div 
                          key={spec} 
                          className="spec-item"
                          whileHover={{ x: 5 }}
                        >
                          <span>{spec}</span>
                          <span className="spec-count">{count}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="department-distribution">
                    <h4>Department Distribution</h4>
                    <div className="department-chart">
                      {['Cardiology', 'Surgery', 'Medicine'].map(dept => {
                        const percentage = Math.floor(Math.random() * 40) + 20;
                        return (
                          <div key={dept} className="chart-item">
                            <span>{dept}</span>
                            <div className="chart-bar">
                              <motion.div 
                                className="chart-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                style={{ 
                                  backgroundColor: 
                                    dept === 'Cardiology' ? '#3b82f6' : 
                                    dept === 'Surgery' ? '#8b5cf6' : '#ec4899'
                                }}
                              />
                            </div>
                            <span>{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Blood Bank Card */}
                <motion.div 
                  className="info-card"
                  whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.15)' }}
                >
                  <h3><FaTint /> Blood Bank Summary</h3>
                  <div className="total-units">
                    <span>Total Units</span>
                    <strong>{totalBloodUnits}</strong>
                  </div>
                  <div className="blood-grid-mini">
                    {bloodTypes.map(type => {
                      const units = bloodInventory[type] || 0;
                      const isCritical = units < 10;
                      return (
                        <motion.div 
                          key={type} 
                          className={`blood-mini-item ${isCritical ? 'critical' : ''}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="blood-type">{type}</span>
                          <span className="blood-units">{units}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="critical-levels">
                    <h4>⚠️ Critical Levels</h4>
                    {criticalBloodTypes.length > 0 ? (
                      criticalBloodTypes.map(type => (
                        <motion.div 
                          key={type} 
                          className="critical-item"
                          whileHover={{ x: 5 }}
                        >
                          <span>{type}</span>
                          <span className="critical-count">{bloodInventory[type] || 0} units</span>
                          <span className="critical-badge">Urgent</span>
                        </motion.div>
                      ))
                    ) : (
                      <p className="no-critical">✓ All blood types at safe levels</p>
                    )}
                  </div>
                </motion.div>

                {/* Recent Updates Card */}
                <motion.div 
                  className="info-card"
                  whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.15)' }}
                >
                  <h3><FaClipboardList /> Recent Updates</h3>
                  <div className="recent-updates">
                    {recentUpdates.length > 0 ? (
                      recentUpdates.slice(0, 5).map(update => (
                        <motion.div 
                          key={update.id} 
                          className={`update-item ${update.type}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ x: 5 }}
                        >
                          <span className="update-message">{update.message}</span>
                          <span className="update-time">{update.time}</span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="no-updates">
                        <FaClipboardList />
                        <p>No recent updates</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Beds Tab */}
          {activeTab === 'beds' && (
            <div className="beds-tab">
              <div className="bed-type-selector">
                {bedTypes.map(bed => (
                  <motion.button
                    key={bed.id}
                    className={`type-btn ${selectedBedType === bed.id ? 'active' : ''}`}
                    onClick={() => setSelectedBedType(bed.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{bed.icon}</span>
                    <span>{bed.name}</span>
                  </motion.button>
                ))}
              </div>

              <div className="beds-grid">
                {bedTypes.map(bed => {
                  const count = getAvailableCount(bed.id);
                  const occupancyRate = Math.round(((bed.total - count) / bed.total) * 100);
                  return (
                    <motion.div 
                      key={bed.id} 
                      className="bed-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.15)' }}
                    >
                      <div className="bed-header" style={{ backgroundColor: bed.color }}>
                        <span className="bed-icon">{bed.icon}</span>
                        <h3>{bed.name}</h3>
                      </div>
                      <div className="bed-content">
                        <div className="bed-stats">
                          <div className="bed-stat">
                            <span>Available</span>
                            <strong className="available-count">{count}</strong>
                          </div>
                          <div className="bed-stat">
                            <span>Total</span>
                            <strong>{bed.total}</strong>
                          </div>
                        </div>
                        <div className="bed-progress">
                          <div className="progress-label">
                            <span>Occupancy</span>
                            <span className="progress-value">{occupancyRate}%</span>
                          </div>
                          <div className="progress-bar">
                            <motion.div 
                              className="progress-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${occupancyRate}%` }}
                              style={{ backgroundColor: bed.color }}
                            />
                          </div>
                        </div>
                        <div className="bed-actions">
                          <motion.button 
                            className="bed-btn minus"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateBeds(bed.id, -1)}
                            disabled={count <= 0}
                          >
                            <FaMinusCircle />
                          </motion.button>
                          <span className="bed-current">{count}</span>
                          <motion.button 
                            className="bed-btn plus"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateBeds(bed.id, 1)}
                          >
                            <FaPlusCircle />
                          </motion.button>
                        </div>
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
              <div className="blood-header">
                <h3><FaTint /> Blood Bank Inventory</h3>
                <div className="blood-summary">
                  <span>Total Units: <strong>{totalBloodUnits}</strong></span>
                  <span>Critical Types: <strong className={criticalBloodTypes.length > 0 ? 'danger' : ''}>
                    {criticalBloodTypes.length}
                  </strong></span>
                </div>
              </div>
              <div className="blood-grid">
                {bloodTypes.map(type => {
                  const units = bloodInventory[type] || 0;
                  const isCritical = units < 10;
                  const isLow = units < 20 && units >= 10;
                  return (
                    <motion.div 
                      key={type} 
                      className={`blood-card ${isCritical ? 'critical' : ''} ${isLow ? 'low' : ''}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0,0,0,0.15)' }}
                    >
                      <div className="blood-header">
                        <span className="blood-type">{type}</span>
                        <span className="blood-units">{units} units</span>
                      </div>
                      <div className="blood-progress">
                        <motion.div 
                          className="blood-progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((units / 30) * 100, 100)}%` }}
                          style={{ 
                            backgroundColor: isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#10b981'
                          }}
                        />
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
                      {isCritical && (
                        <motion.span 
                          className="critical-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          ⚠️ Critical
                        </motion.span>
                      )}
                      {isLow && !isCritical && (
                        <motion.span 
                          className="low-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          ⚠️ Low Stock
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="doctors-tab">
              <div className="doctors-header">
                <h3><FaUserMd /> Medical Staff Directory</h3>
                <div className="doctors-summary">
                  <span>Total: <strong>{totalDoctors}</strong></span>
                  <span>Available: <strong className="success">{availableDoctors}</strong></span>
                  <span>On Leave: <strong>{totalDoctors - availableDoctors}</strong></span>
                </div>
              </div>
              <div className="doctors-grid">
                {doctors.length > 0 ? (
                  doctors.map((doctor, index) => (
                    <motion.div 
                      key={doctor.id} 
                      className="doctor-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.15)' }}
                    >
                      <div className="doctor-header">
                        <div className="doctor-avatar" style={{
                          background: doctor.available 
                            ? 'linear-gradient(135deg, #10b981, #059669)' 
                            : 'linear-gradient(135deg, #9ca3af, #6b7280)'
                        }}>
                          {doctor.name ? doctor.name.charAt(0).toUpperCase() : '👨‍⚕️'}
                        </div>
                        <div className="doctor-info">
                          <h4>Dr. {doctor.name}</h4>
                          <p className="specialization">{doctor.specialization}</p>
                        </div>
                        <motion.button 
                          className={`availability-badge ${doctor.available ? 'available' : 'unavailable'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleDoctorAvailability(doctor.id, doctor.available)}
                        >
                          {doctor.available ? '✓ Available' : '✗ Unavailable'}
                        </motion.button>
                      </div>
                      
                      <div className="doctor-details">
                        <div className="detail-row">
                          <span><FaClock /> Experience:</span>
                          <strong>{doctor.experience || 12} years</strong>
                        </div>
                        <div className="detail-row">
                          <span><FaHeartbeat /> Success Rate:</span>
                          <strong className="success">{doctor.successRate || 95}%</strong>
                        </div>
                        <div className="detail-row">
                          <span><FaProcedures /> Operations:</span>
                          <strong>{doctor.operations || 150}+</strong>
                        </div>
                        <div className="detail-row">
                          <span><FaPhoneAlt /> Contact:</span>
                          <strong>{doctor.phone || '+91 98765 43210'}</strong>
                        </div>
                        <div className="detail-row">
                          <span><FaEnvelope /> Email:</span>
                          <strong>{doctor.email || 'doctor@hospital.com'}</strong>
                        </div>
                      </div>

                      <div className="doctor-footer">
                        <div className="rating">
                          <span className="stars">
                            {'★'.repeat(Math.floor(doctor.rating || 4.5))}
                            {'☆'.repeat(5 - Math.floor(doctor.rating || 4.5))}
                          </span>
                          <span className="rating-value">{doctor.rating || 4.5}</span>
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
                  <div className="no-doctors">
                    <FaUserMd />
                    <p>No doctors found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="activities-tab">
              <h3><FaClipboardList /> Recent Hospital Updates</h3>
              <div className="activities-list">
                {recentUpdates.length > 0 ? (
                  recentUpdates.map((update, index) => (
                    <motion.div 
                      key={update.id} 
                      className={`activity-item ${update.type}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="activity-time">{update.time}</div>
                      <div className="activity-message">{update.message}</div>
                      <div className="activity-type">{update.type}</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="no-activities">
                    <FaClipboardList />
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Doctor Profile Modal */}
        <AnimatePresence>
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
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setShowDoctorModal(false)}>×</button>
                
                <div className="doctor-profile">
                  <div className="profile-header">
                    <div className="profile-avatar-large" style={{
                      background: selectedDoctor.available 
                        ? 'linear-gradient(135deg, #10b981, #059669)' 
                        : 'linear-gradient(135deg, #9ca3af, #6b7280)'
                    }}>
                      {selectedDoctor.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-title">
                      <h2>Dr. {selectedDoctor.name}</h2>
                      <p className="specialization">{selectedDoctor.specialization}</p>
                      <div className="profile-badges">
                        <span className={`availability-badge ${selectedDoctor.available ? 'available' : 'unavailable'}`}>
                          {selectedDoctor.available ? '✅ Available' : '❌ Unavailable'}
                        </span>
                        <span className="experience-badge">
                          <FaClock /> {selectedDoctor.experience || 12} years
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-stats">
                    <div className="profile-stat">
                      <FaHeartbeat />
                      <span>Success Rate</span>
                      <strong>{selectedDoctor.successRate || 95}%</strong>
                    </div>
                    <div className="profile-stat">
                      <FaProcedures />
                      <span>Operations</span>
                      <strong>{selectedDoctor.operations || 150}+</strong>
                    </div>
                    <div className="profile-stat">
                      <FaUserMd />
                      <span>Patients</span>
                      <strong>{selectedDoctor.patients || 500}+</strong>
                    </div>
                    <div className="profile-stat">
                      <FaStar />
                      <span>Rating</span>
                      <strong>{selectedDoctor.rating || 4.5}</strong>
                    </div>
                  </div>

                  <div className="profile-details">
                    <div className="details-section">
                      <h4>📋 Professional Information</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span>Qualification:</span>
                          <strong>{selectedDoctor.qualification || 'MBBS, MD'}</strong>
                        </div>
                        <div className="detail-item">
                          <span>License:</span>
                          <strong>{selectedDoctor.license || 'MCI-12345'}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Education:</span>
                          <strong>{selectedDoctor.education || 'AIIMS Delhi'}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Department:</span>
                          <strong>{selectedDoctor.department || selectedDoctor.specialization}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Joined:</span>
                          <strong>{selectedDoctor.joined || 'Jan 2020'}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Languages:</span>
                          <strong>{selectedDoctor.languages || 'English, Hindi'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>📞 Contact Information</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span><FaPhoneAlt /> Phone:</span>
                          <strong>
                            <a href={`tel:${selectedDoctor.phone}`}>
                              {selectedDoctor.phone || '+91 98765 43210'}
                            </a>
                          </strong>
                        </div>
                        <div className="detail-item">
                          <span><FaEnvelope /> Email:</span>
                          <strong>
                            <a href={`mailto:${selectedDoctor.email}`}>
                              {selectedDoctor.email || `dr.${selectedDoctor.name?.toLowerCase()}@hospital.com`}
                            </a>
                          </strong>
                        </div>
                        <div className="detail-item">
                          <span><FaMapMarkerAlt /> Room:</span>
                          <strong>{selectedDoctor.room || 'Block A, Room 203'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>📊 Performance Metrics</h4>
                      <div className="metrics-grid">
                        <div className="metric-item">
                          <span>Weekly Patients</span>
                          <strong>{Math.floor(Math.random() * 20) + 30}</strong>
                        </div>
                        <div className="metric-item">
                          <span>Monthly Surgeries</span>
                          <strong>{Math.floor(Math.random() * 10) + 15}</strong>
                        </div>
                        <div className="metric-item">
                          <span>Patient Satisfaction</span>
                          <strong>{Math.floor(Math.random() * 10) + 85}%</strong>
                        </div>
                        <div className="metric-item">
                          <span>On-Time Performance</span>
                          <strong>{Math.floor(Math.random() * 10) + 88}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <motion.button 
                      className="modal-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDoctorModal(false)}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HospitalLayout>
  );
}

export default HospitalDashboard;