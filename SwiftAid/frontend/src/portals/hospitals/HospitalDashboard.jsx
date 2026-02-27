import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import HospitalLayout from "../../layouts/HospitalLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaHospital, 
  FaBed, 
  FaProcedures, 
  FaHeartbeat,
  FaPlusCircle,
  FaMinusCircle,
  FaAmbulance,
  FaUserMd,
  FaTint,
  FaClipboardList,
  FaStar,
  FaClock,
  FaCalendarAlt,
  FaFlask,
  FaSyringe,
  FaStethoscope,
  FaNotesMedical,
  FaPhoneAlt,
  FaEnvelope,
  FaGraduationCap,
  FaAward,
  FaUsers,
  FaBriefcaseMedical,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
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
  const [selectedWard, setSelectedWard] = useState('general');

  // Blood types
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Bed types data
  const bedTypes = [
    { id: 'general', name: 'General Ward', icon: <FaBed />, total: 200 },
    { id: 'icu', name: 'ICU', icon: <FaProcedures />, total: 20 },
    { id: 'ventilator', name: 'Ventilator', icon: <FaSyringe />, total: 15 },
    { id: 'hdu', name: 'HDU', icon: <FaFlask />, total: 12 },
    { id: 'isolation', name: 'Isolation', icon: <FaBriefcaseMedical />, total: 8 },
  ];

  // Chart data
  const occupancyData = [
    { time: '00:00', general: 45, icu: 8, ventilator: 4 },
    { time: '04:00', general: 38, icu: 6, ventilator: 3 },
    { time: '08:00', general: 52, icu: 10, ventilator: 5 },
    { time: '12:00', general: 58, icu: 12, ventilator: 6 },
    { time: '16:00', general: 55, icu: 11, ventilator: 5 },
    { time: '20:00', general: 48, icu: 9, ventilator: 4 },
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
        
        addRecentUpdate('Hospital data refreshed', 'info');
      } else {
        console.log("Hospital document not found!");
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
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();

    const doctorsRef = collection(db, "hospitals", hospitalId, "doctors");
    const unsubscribe = onSnapshot(doctorsRef, (snapshot) => {
      const doctorsList = [];
      snapshot.forEach((doc) => {
        doctorsList.push({ id: doc.id, ...doc.data() });
      });
      setDoctors(doctorsList);
    });

    return () => unsubscribe();
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

    const fieldMap = {
      'general': 'availableBeds',
      'icu': 'availableICU',
      'ventilator': 'ventilatorBeds',
      'hdu': 'hduBeds',
      'isolation': 'isolationBeds'
    };

    const field = fieldMap[type];
    const newValue = Math.max(0, (hospital[field] || 0) + value);
    
    try {
      const hospitalRef = doc(db, "hospitals", hospitalId);
      await updateDoc(hospitalRef, {
        [field]: newValue
      });
      
      toast.success(`${type === 'general' ? 'General Bed' : type === 'icu' ? 'ICU Bed' : type} ${value > 0 ? 'added' : 'removed'}!`, {
        icon: value > 0 ? '➕' : '➖',
        duration: 2000
      });

      addRecentUpdate(
        `${type === 'general' ? 'General Bed' : type === 'icu' ? 'ICU Bed' : type} ${value > 0 ? 'added' : 'removed'}. New count: ${newValue}`,
        'success'
      );
      
    } catch (error) {
      toast.error("Failed to update beds");
      addRecentUpdate('Failed to update bed count', 'error');
    }
  };

  // Update blood bank
  const updateBloodUnit = async (bloodType, value) => {
    if (!hospital) return;

    try {
      const hospitalRef = doc(db, "hospitals", hospitalId);
      const currentUnits = bloodInventory[bloodType] || 0;
      const newUnits = Math.max(0, currentUnits + value);
      
      await updateDoc(hospitalRef, {
        [`bloodBank.${bloodType}`]: newUnits
      });
      
      setBloodInventory(prev => ({
        ...prev,
        [bloodType]: newUnits
      }));
      
      toast.success(`${bloodType} ${value > 0 ? 'added' : 'removed'}!`, {
        icon: '🩸',
        duration: 2000
      });

      addRecentUpdate(
        `Blood bank updated: ${bloodType} ${value > 0 ? '+' : ''}${value} units`,
        'success'
      );
      
    } catch (error) {
      toast.error("Failed to update blood bank");
      addRecentUpdate('Failed to update blood bank', 'error');
    }
  };

  // Update doctor availability
  const toggleDoctorAvailability = async (doctorId, currentStatus) => {
    try {
      const doctorRef = doc(db, "hospitals", hospitalId, "doctors", doctorId);
      await updateDoc(doctorRef, {
        available: !currentStatus
      });
      
      toast.success(`Doctor availability updated!`, {
        icon: '👨‍⚕️'
      });

      addRecentUpdate(`Doctor availability toggled`, 'info');
      
    } catch (error) {
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
    const fieldMap = {
      'general': hospital?.availableBeds || 0,
      'icu': hospital?.availableICU || 0,
      'ventilator': hospital?.ventilatorBeds || 0,
      'hdu': hospital?.hduBeds || 0,
      'isolation': hospital?.isolationBeds || 0
    };
    return fieldMap[type];
  };

  // Get occupancy rate
  const getOccupancyRate = (type) => {
    const bed = bedTypes.find(b => b.id === type);
    const available = getAvailableCount(type);
    const total = bed?.total || 0;
    return total > 0 ? ((total - available) / total * 100).toFixed(1) : 0;
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

  // Calculate statistics
  const totalDoctors = doctors.length;
  const availableDoctors = doctors.filter(d => d.available).length;
  const avgSuccessRate = doctors.reduce((acc, d) => acc + (d.successRate || 0), 0) / totalDoctors || 0;
  const totalBeds = hospital?.totalBeds || 200;
  const occupiedBeds = totalBeds - (hospital?.availableBeds || 0);
  const bedOccupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);
  const totalBloodUnits = Object.values(bloodInventory).reduce((a, b) => a + b, 0);
  const criticalBloodTypes = bloodTypes.filter(type => (bloodInventory[type] || 0) < 10);

  return (
    <HospitalLayout>
      <Toaster position="top-right" />
      
      <motion.div 
        className="hospital-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with Dynamic Date */}
        <motion.div 
          className="hospital-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-left">
            <div className="greeting-section">
              <motion.h1
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FaHospital className="header-icon" />
                {getGreeting()}, Dr. Sharma!
              </motion.h1>
              <motion.p 
                className="hospital-name"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {hospital?.name || 'City Care Hospital'}
              </motion.p>
            </div>
          </div>
          <motion.div 
            className="header-right"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="date-time-card">
              <FaCalendarAlt className="calendar-icon" />
              <div className="date-time-info">
                <span className="date">{formatDate(currentDate)}</span>
                <span className="time">{currentDate.toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {[
            {
              id: 'beds',
              icon: <FaBed />,
              title: 'Available Beds',
              value: hospital?.availableBeds || 0,
              subtext: `Total: ${hospital?.totalBeds || 200}`,
              trend: '+12%',
              trendColor: 'positive',
              color: 'blue'
            },
            {
              id: 'icu',
              icon: <FaProcedures />,
              title: 'ICU Beds',
              value: hospital?.availableICU || 0,
              subtext: `Total ICU: ${hospital?.totalICU || 20}`,
              trend: '-5%',
              trendColor: 'warning',
              color: 'green'
            },
            {
              id: 'doctors',
              icon: <FaUserMd />,
              title: 'Total Doctors',
              value: totalDoctors,
              subtext: `${availableDoctors} Available`,
              trend: `${doctors.filter(d => d.specialization === 'Surgeon').length} Surgeons`,
              trendColor: 'positive',
              color: 'orange'
            },
            {
              id: 'blood',
              icon: <FaTint />,
              title: 'Blood Units',
              value: totalBloodUnits,
              subtext: `${criticalBloodTypes.length} Critical`,
              trend: `${bloodTypes.length} Types`,
              trendColor: criticalBloodTypes.length > 0 ? 'warning' : 'positive',
              color: 'purple'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.id}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredCard(stat.id)}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => {
                if (stat.id === 'beds') setActiveTab('beds');
                if (stat.id === 'icu') setActiveTab('beds');
                if (stat.id === 'doctors') setActiveTab('doctors');
                if (stat.id === 'blood') setActiveTab('blood');
              }}
            >
              <div className={`stat-icon ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-sub">{stat.subtext}</div>
                <span className={`stat-trend ${stat.trendColor}`}>{stat.trend}</span>
              </div>
              <motion.div 
                className="stat-arrow"
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: hoveredCard === stat.id ? 1 : 0,
                  x: hoveredCard === stat.id ? 0 : -10
                }}
              >
                <FaArrowRight />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Critical Blood Alert */}
        <AnimatePresence>
          {criticalBloodTypes.length > 0 && (
            <motion.div 
              className="critical-alert"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FaExclamationTriangle className="alert-icon" />
              <div className="alert-content">
                <h3>Critical Blood Stock Alert!</h3>
                <p>Low stock for: {criticalBloodTypes.join(', ')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div 
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            {[
              { id: 'beds', icon: <FaBed />, label: 'Manage Beds' },
              { id: 'blood', icon: <FaTint />, label: 'Blood Bank' },
              { id: 'doctors', icon: <FaUserMd />, label: 'View Doctors' },
              { id: 'report', icon: <FaClipboardList />, label: 'Generate Report' }
            ].map((action, index) => (
              <motion.button
                key={action.id}
                className="action-btn"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (action.id !== 'report') setActiveTab(action.id);
                  else toast.success('Report generation started!');
                }}
              >
                {action.icon} {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="hospital-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { id: 'overview', icon: <FaChartLine />, label: 'Overview' },
            { id: 'beds', icon: <FaBed />, label: 'Bed Management' },
            { id: 'blood', icon: <FaTint />, label: 'Blood Bank' },
            { id: 'doctors', icon: <FaUserMd />, label: `Doctors (${totalDoctors})` },
            { id: 'activities', icon: <FaClock />, label: 'Updates' }
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            className="tab-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="overview-grid">
                  {/* Bed Occupancy Chart */}
                  <motion.div 
                    className="chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <h3>
                      <FaBed className="card-icon" />
                      Bed Occupancy Overview
                    </h3>
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
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    <div className="bed-stats-mini">
                      {[
                        { label: 'Occupied', value: occupiedBeds },
                        { label: 'Available', value: hospital?.availableBeds || 0 },
                        { label: 'ICU', value: hospital?.availableICU || 0 }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          className="bed-stat-item"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="label">{item.label}</span>
                          <span className="value">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={occupancyData}>
                        <Line type="monotone" dataKey="general" stroke="#00e0ff" strokeWidth={2} />
                        <Line type="monotone" dataKey="icu" stroke="#4caf50" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Doctor Stats */}
                  <motion.div 
                    className="chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <h3>
                      <FaUserMd className="card-icon" />
                      Doctor Statistics
                    </h3>
                    <div className="doctor-stats-grid">
                      {[
                        { label: 'Total Doctors', value: totalDoctors, color: '' },
                        { label: 'Available', value: availableDoctors, color: 'success' },
                        { label: 'On Leave', value: totalDoctors - availableDoctors, color: 'warning' },
                        { label: 'Avg Experience', value: (doctors.reduce((acc, d) => acc + (d.experience || 0), 0) / totalDoctors || 0).toFixed(1) + 'y', color: '' }
                      ].map((stat, idx) => (
                        <motion.div 
                          key={idx}
                          className="doctor-stat-item"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="stat-label">{stat.label}</span>
                          <span className={`stat-number ${stat.color}`}>{stat.value}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="specialization-list">
                      <h4>By Specialization</h4>
                      {['Cardiologist', 'Surgeon', 'Physician', 'Pediatrician'].map(spec => {
                        const count = doctors.filter(d => d.specialization === spec).length;
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
                  </motion.div>

                  {/* Blood Bank Summary */}
                  <motion.div 
                    className="chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <h3>
                      <FaTint className="card-icon" />
                      Blood Bank Summary
                    </h3>
                    <div className="blood-summary">
                      <motion.div 
                        className="total-units"
                        whileHover={{ scale: 1.02 }}
                      >
                        <span>Total Units</span>
                        <span className="total-value">{totalBloodUnits}</span>
                      </motion.div>
                      <div className="critical-levels">
                        <h4>Critical Levels</h4>
                        {criticalBloodTypes.map(type => (
                          <motion.div 
                            key={type} 
                            className="critical-item"
                            whileHover={{ x: 5 }}
                          >
                            <span>{type}</span>
                            <span className="critical-value">{bloodInventory[type] || 0} units</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Recent Activities */}
                  <motion.div 
                    className="chart-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ y: -5 }}
                  >
                    <h3>
                      <FaClock className="card-icon" />
                      Recent Updates
                    </h3>
                    <div className="recent-updates-preview">
                      {recentUpdates.slice(0, 5).map((update, idx) => (
                        <motion.div 
                          key={update.id}
                          className={`update-item ${update.type}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <span className="update-message">{update.message}</span>
                          <span className="update-time">{update.time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Beds Tab */}
            {activeTab === 'beds' && (
              <div className="beds-tab">
                <div className="beds-grid">
                  {bedTypes.map((bed, index) => (
                    <motion.div 
                      key={bed.id}
                      className="bed-control-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <h3>
                        {bed.icon} {bed.name}
                      </h3>
                      <div className="current-status">
                        <span>Available</span>
                        <span className="status-number">{getAvailableCount(bed.id)}</span>
                      </div>
                      <div className="total-status">
                        <span>Total</span>
                        <span className="status-number">{bed.total}</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div 
                          className="progress-fill" 
                          initial={{ width: 0 }}
                          animate={{ width: `${getOccupancyRate(bed.id)}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <div className="bed-controls">
                        <motion.button 
                          className="control-btn minus"
                          whileHover={{ scale: 1.1, rotate: 180 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateBeds(bed.id, -1)}
                        >
                          <FaMinusCircle />
                        </motion.button>
                        <span className="bed-count">{getAvailableCount(bed.id)}</span>
                        <motion.button 
                          className="control-btn plus"
                          whileHover={{ scale: 1.1, rotate: 180 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateBeds(bed.id, 1)}
                        >
                          <FaPlusCircle />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Specialty Beds */}
                  <motion.div 
                    className="bed-types-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <h3>Specialty Beds</h3>
                    <div className="specialty-beds">
                      {[
                        { icon: <FaSyringe />, name: 'Ventilator', count: hospital?.ventilatorBeds || 8 },
                        { icon: <FaFlask />, name: 'HDU', count: hospital?.hduBeds || 12 },
                        { icon: <FaBriefcaseMedical />, name: 'Isolation', count: hospital?.isolationBeds || 5 }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          className="specialty-item"
                          whileHover={{ y: -3, scale: 1.02 }}
                        >
                          <div className="specialty-icon">{item.icon}</div>
                          <div className="specialty-info">
                            <span className="specialty-name">{item.name}</span>
                            <span className="specialty-count">{item.count}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Blood Bank Tab */}
            {activeTab === 'blood' && (
              <div className="blood-tab">
                <h3>
                  <FaTint className="section-icon" />
                  Blood Bank Inventory
                </h3>
                <div className="blood-grid">
                  {bloodTypes.map((type, index) => {
                    const units = bloodInventory[type] || 0;
                    const percentage = Math.min(100, (units / 50) * 100);
                    const isCritical = units < 10;
                    
                    return (
                      <motion.div 
                        key={type}
                        className={`blood-card ${isCritical ? 'critical' : ''}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                      >
                        <div className="blood-type-header">
                          <span className="blood-type">{type}</span>
                          <span className="blood-units">{units} units</span>
                        </div>
                        <div className="blood-controls">
                          <motion.button 
                            className="blood-btn minus"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateBloodUnit(type, -1)}
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
                        <div className="blood-status">
                          <div className="status-bar">
                            <motion.div 
                              className="status-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1 }}
                              style={{ background: isCritical ? '#ff5757' : '#00e0ff' }}
                            />
                          </div>
                          <span className="status-text">
                            {isCritical ? '⚠️ Critical Low' : `${Math.round(percentage)}% of capacity`}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Doctors Tab */}
            {activeTab === 'doctors' && (
              <div className="doctors-tab">
                <h3>
                  <FaUserMd className="section-icon" />
                  Medical Staff Directory
                </h3>
                <div className="doctors-grid">
                  {doctors.map((doctor, index) => (
                    <motion.div 
                      key={doctor.id}
                      className="doctor-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="doctor-header">
                        <div className="doctor-avatar">
                          {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div className="doctor-title">
                          <h4>Dr. {doctor.name}</h4>
                          <span className="doctor-specialization">{doctor.specialization}</span>
                        </div>
                        <motion.button 
                          className={`availability-badge ${doctor.available ? 'available' : 'unavailable'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleDoctorAvailability(doctor.id, doctor.available)}
                        >
                          {doctor.available ? '● Available' : '○ Unavailable'}
                        </motion.button>
                      </div>
                      
                      <div className="doctor-details">
                        {[
                          { icon: <FaGraduationCap />, label: 'Experience', value: `${doctor.experience || 12} years` },
                          { icon: <FaAward />, label: 'Success Rate', value: `${doctor.successRate || 95}%`, highlight: true },
                          { icon: <FaNotesMedical />, label: 'Operations', value: `${doctor.operations || 150}+` },
                          { icon: <FaPhoneAlt />, label: 'Contact', value: doctor.phone || '+91 98765 43210' },
                          { icon: <FaEnvelope />, label: 'Email', value: doctor.email || `dr.${doctor.name?.toLowerCase()}@hospital.com` }
                        ].map((detail, idx) => (
                          <motion.div 
                            key={idx}
                            className="detail-row"
                            whileHover={{ x: 5 }}
                          >
                            <span className="detail-icon">{detail.icon}</span>
                            <span className="detail-label">{detail.label}:</span>
                            <span className={`detail-value ${detail.highlight ? 'success-rate' : ''}`}>
                              {detail.value}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="doctor-footer">
                        <div className="rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FaStar 
                              key={star} 
                              className={`star ${star <= (doctor.rating || 4.5) ? 'filled' : ''}`}
                            />
                          ))}
                          <span className="rating-value">({doctor.rating || 4.5})</span>
                        </div>
                        <motion.button 
                          className="view-profile-btn"
                          whileHover={{ x: 5 }}
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
                  ))}
                </div>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="activities-tab">
                <h3>
                  <FaClock className="section-icon" />
                  Recent Hospital Updates
                </h3>
                <div className="timeline">
                  {recentUpdates.map((update, index) => (
                    <motion.div 
                      key={update.id}
                      className={`timeline-item ${update.type}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-time">{update.time}</span>
                          <span className={`timeline-badge ${update.type}`}>{update.type}</span>
                        </div>
                        <p className="timeline-message">{update.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

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
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setShowDoctorModal(false)}>×</button>
                
                <div className="doctor-profile">
                  <div className="profile-header">
                    <div className="profile-avatar-large">
                      {selectedDoctor.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-title">
                      <h2>Dr. {selectedDoctor.name}</h2>
                      <p>{selectedDoctor.specialization}</p>
                      <span className={`availability-status ${selectedDoctor.available ? 'available' : 'unavailable'}`}>
                        {selectedDoctor.available ? 'Currently Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>

                  <div className="profile-stats">
                    {[
                      { icon: <FaGraduationCap />, label: 'Experience', value: `${selectedDoctor.experience || 12} years` },
                      { icon: <FaAward />, label: 'Success Rate', value: `${selectedDoctor.successRate || 95}%` },
                      { icon: <FaNotesMedical />, label: 'Operations', value: `${selectedDoctor.operations || 150}+` },
                      { icon: <FaUsers />, label: 'Patients', value: `${selectedDoctor.patients || 500}+` }
                    ].map((stat, idx) => (
                      <motion.div 
                        key={idx}
                        className="profile-stat-item"
                        whileHover={{ y: -3 }}
                      >
                        {stat.icon}
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">{stat.value}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="profile-details">
                    <h3>Professional Information</h3>
                    <div className="details-grid">
                      {[
                        { label: 'Qualification', value: selectedDoctor.qualification || 'MBBS, MD, DM' },
                        { label: 'Medical License', value: selectedDoctor.license || 'MCI-12345' },
                        { label: 'Joined Hospital', value: selectedDoctor.joined || 'Jan 2020' },
                        { label: 'Languages', value: selectedDoctor.languages || 'English, Hindi' }
                      ].map((detail, idx) => (
                        <div key={idx} className="detail-item">
                          <span className="label">{detail.label}</span>
                          <span className="value">{detail.value}</span>
                        </div>
                      ))}
                    </div>

                    <h3>Contact Information</h3>
                    <div className="details-grid">
                      {[
                        { label: 'Phone', value: selectedDoctor.phone || '+91 98765 43210' },
                        { label: 'Email', value: selectedDoctor.email || `dr.${selectedDoctor.name?.toLowerCase()}@hospital.com` },
                        { label: 'Emergency', value: selectedDoctor.emergencyContact || '+91 98765 43211' },
                        { label: 'Room', value: selectedDoctor.room || 'Block A, Room 203' }
                      ].map((detail, idx) => (
                        <div key={idx} className="detail-item">
                          <span className="label">{detail.label}</span>
                          <span className="value">{detail.value}</span>
                        </div>
                      ))}
                    </div>

                    <h3>Schedule</h3>
                    <div className="schedule-grid">
                      {['Monday', 'Wednesday', 'Friday'].map((day, idx) => (
                        <div key={idx} className="schedule-item">
                          <span className="day">{day}</span>
                          <span className="time">9:00 AM - 5:00 PM</span>
                        </div>
                      ))}
                    </div>

                    <h3>Specializations & Expertise</h3>
                    <div className="expertise-tags">
                      {['Cardiac Surgery', 'Heart Transplant', 'Pediatric Cardiology', 'Interventional Cardiology'].map((tag, idx) => (
                        <motion.span 
                          key={idx}
                          className="expertise-tag"
                          whileHover={{ y: -2 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </HospitalLayout>
  );
}

export default HospitalDashboard;