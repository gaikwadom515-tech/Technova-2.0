import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">

      {/* HERO SECTION */}
      <section className="hero">
        <h1>🚑 SwiftAid Emergency Response System</h1>
        <p>
          Real-time smart coordination between Citizens,
          Dispatchers, Ambulances and Hospitals.
        </p>

        <button 
          className="primary-btn"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">

        <div className="stat-card">
          <h2>120+</h2>
          <p>Active Ambulances</p>
        </div>

        <div className="stat-card">
          <h2>75+</h2>
          <p>Connected Hospitals</p>
        </div>

        <div className="stat-card">
          <h2>350+</h2>
          <p>Emergencies Today</p>
        </div>

        <div className="stat-card">
          <h2>98%</h2>
          <p>Response Efficiency</p>
        </div>

      </section>

      {/* PORTAL SECTION */}
      <section className="portal-section">

        <div 
          className="portal-card"
          onClick={() => navigate("/citizen")}
        >
          <h3>👤 Citizen Portal</h3>
          <p>Send SOS & track ambulance in real-time.</p>
        </div>

        <div 
          className="portal-card"
          onClick={() => navigate("/dispatcher")}
        >
          <h3>🎧 Dispatcher Panel</h3>
          <p>Monitor and assign emergencies efficiently.</p>
        </div>

        <div 
          className="portal-card"
          onClick={() => navigate("/driver")}
        >
          <h3>🚑 Ambulance Dashboard</h3>
          <p>Receive live assignments & update status.</p>
        </div>

        <div 
          className="portal-card"
          onClick={() => navigate("/hospital")}
        >
          <h3>🏥 Hospital Management</h3>
          <p>Manage beds, ICU capacity & emergency intake.</p>
        </div>

      </section>

    </div>
  );
}

export default Home;