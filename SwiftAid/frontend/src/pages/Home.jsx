import "./Home.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar"; // Import is correct

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🚨",
      title: "Instant SOS Alert",
      description: "Send real-time emergency alerts directly to dispatcher. Location auto-detected for faster response.",
      color: "#ff5757"
    },
    {
      icon: "📍",
      title: "Live Ambulance Tracking",
      description: "Track assigned ambulance in real-time with estimated arrival time and route optimization.",
      color: "#00e0ff"
    },
    {
      icon: "🏥",
      title: "Nearby Hospital Finder",
      description: "View available beds, ICU capacity, blood bank status and emergency readiness instantly.",
      color: "#4caf50"
    },
    {
      icon: "📊",
      title: "Emergency History",
      description: "Access past emergency records, response analytics, and health reports securely.",
      color: "#ff9800"
    }
  ];



  const workflowSteps = [
    { number: "1", title: "SOS Alert", description: "Citizen sends emergency alert with auto-location", icon: "🆘" },
    { number: "2", title: "Smart Dispatch", description: "Dispatcher assigns nearest available ambulance", icon: "📡" },
    { number: "3", title: "Hospital Alert", description: "Emergency department prepares for arrival", icon: "🏨" },
    { number: "4", title: "Care Delivered", description: "Patient receives immediate medical attention", icon: "❤️" }
  ];

  return (
    <>
      {/* Add Navbar here - This was missing! */}
      <Navbar />
      
      <div className="home-wrapper">
        {/* Hero Section */}
        <section className="hero-section">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <h1>
              <span className="gradient-text">SwiftAid</span>
              <br />
              Emergency Response Platform
            </h1>
            <p className="hero-description">
              Smart real-time emergency coordination for Citizens,
              Ambulances, Hospitals & Dispatch Centers. When every second counts,
              we make every second matter.
            </p>
            
            <div className="hero-buttons">
              <motion.button 
                className="primary-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
              >
                Access Platform 🚀
              </motion.button>
              <motion.button 
                className="secondary-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
              >
                Register Now →
              </motion.button>
            </div>

            <div className="hero-stats-preview">
              <div className="preview-item">
                <span className="preview-value">2.5 min</span>
                <span className="preview-label">Avg Response</span>
              </div>
              <div className="preview-divider"></div>
              <div className="preview-item">
                <span className="preview-value">5000+</span>
                <span className="preview-label">Lives Saved</span>
              </div>
              <div className="preview-divider"></div>
              <div className="preview-item">
                <span className="preview-value">24/7</span>
                <span className="preview-label">Support</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-image"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="floating-card card-1">
              <span>🚑</span>
              <div>
                <strong>Ambulance En Route  </strong>
                <small>ETA: 4 mins</small>
              </div>
            </div>
            <div className="floating-card card-2">
              <span>🏥</span>
              <div>
                <strong>City Hospital  </strong>
                <small>ICU: 3 beds available</small>
              </div>
            </div>
            <div className="floating-card card-3">
              <span>🩸</span>
              <div>
                <strong>Blood Bank      </strong>
                <small>O+ : 12 units</small>
              </div>
            </div>
          </motion.div>
        </section>

       

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <h2>👤 Citizen Emergency Services</h2>
            <p className="section-subtitle">Comprehensive emergency features designed for citizens</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                style={{ borderTop: `4px solid ${feature.color}` }}
              >
                <div className="feature-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <motion.div 
                  className="feature-hover"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  style={{ background: feature.color }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="section-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="primary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/citizen")}
            >
              Go to Citizen Portal →
            </motion.button>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="workflow-section">
          <div className="section-header">
            <h2>⚙ How SwiftAid Works</h2>
            <p className="section-subtitle">From emergency alert to medical care in minutes</p>
          </div>

          <div className="workflow-grid">
            {workflowSteps.map((step, index) => (
              <motion.div 
                key={index}
                className="workflow-step"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                {index < workflowSteps.length - 1 && (
                  <div className="step-connector">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Portal Access Section */}
        <section className="portal-section">
          <h2>🚀 Access Different Portals</h2>
          <div className="portal-grid">
            <motion.div 
              className="portal-card citizen"
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate("/citizen")}
            >
              <div className="portal-icon">👤</div>
              <h3>Citizen Portal</h3>
              <p>Send SOS, track ambulances, find hospitals</p>
              <div className="portal-stats">
                <span>🚑 120+ ambulances</span>
                <span>🏥 75+ hospitals</span>
              </div>
            </motion.div>

            <motion.div 
              className="portal-card hospital"
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate("/hospital")}
            >
              <div className="portal-icon">🏥</div>
              <h3>Hospital Portal</h3>
              <p>Manage beds, blood bank, doctor availability</p>
              <div className="portal-stats">
                <span>🛏️ Real-time bed tracking</span>
                <span>🩸 Blood inventory</span>
              </div>
            </motion.div>

            <motion.div 
              className="portal-card dispatcher"
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate("/dispatcher")}
            >
              <div className="portal-icon">📡</div>
              <h3>Dispatcher Portal</h3>
              <p>Assign ambulances, manage emergencies</p>
              <div className="portal-stats">
                <span>🚨 Live emergency queue</span>
                <span>📍 Real-time tracking</span>
              </div>
            </motion.div>

            <motion.div 
              className="portal-card ambulance"
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate("/ambulance")}
            >
              <div className="portal-icon">🚑</div>
              <h3>Ambulance Portal</h3>
              <p>Navigation, emergency details, patient info</p>
              <div className="portal-stats">
                <span>🧭 GPS navigation</span>
                <span>📋 Patient details</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to revolutionize emergency response?</h2>
            <p>Join thousands of hospitals and emergency services using SwiftAid</p>
            <div className="cta-buttons">
              <motion.button
                className="cta-btn primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
              >
                Get Started Now
              </motion.button>
              <motion.button
                className="cta-btn secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/contact")}
              >
                Contact Sales
              </motion.button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;