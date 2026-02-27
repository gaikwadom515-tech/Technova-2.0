import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">

      {/* HERO SECTION */}
      <section className="hero">
        <h1>🚑 SwiftAid Emergency Response Platform</h1>
        <p>
          Smart real-time emergency coordination for Citizens,
          Ambulances, Hospitals & Dispatch Centers.
        </p>

        <button 
          className="primary-btn"
          onClick={() => navigate("/login")}
        >
          Access Platform
        </button>
      </section>

      {/* SYSTEM STATS */}
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
          <p>Daily Emergencies</p>
        </div>
        <div className="stat-card">
          <h2>98%</h2>
          <p>Response Efficiency</p>
        </div>
      </section>

      {/* CITIZEN FEATURES */}
      <section className="citizen-section">
        <h2>👤 Citizen Emergency Services</h2>

        <div className="citizen-features">

          <div className="feature-card">
            <h3>🚨 Instant SOS Alert</h3>
            <p>
              Send real-time emergency alerts directly to dispatcher.
              Location auto-detected for faster response.
            </p>
          </div>

          <div className="feature-card">
            <h3>📍 Live Ambulance Tracking</h3>
            <p>
              Track assigned ambulance in real-time with
              estimated arrival time.
            </p>
          </div>

          <div className="feature-card">
            <h3>🏥 Nearby Hospital Finder</h3>
            <p>
              View available beds, ICU capacity and
              emergency readiness instantly.
            </p>
          </div>

          <div className="feature-card">
            <h3>📊 Emergency History</h3>
            <p>
              Access past emergency records and
              response analytics securely.
            </p>
          </div>

        </div>

        <button
          className="secondary-btn"
          onClick={() => navigate("/citizen")}
        >
          Go to Citizen Portal →
        </button>
      </section>

      {/* HOW IT WORKS */}
      <section className="workflow-section">
        <h2>⚙ How SwiftAid Works</h2>

        <div className="workflow-grid">
          <div className="workflow-step">
            <span>1</span>
            <p>Citizen sends SOS</p>
          </div>
          <div className="workflow-step">
            <span>2</span>
            <p>Dispatcher assigns ambulance</p>
          </div>
          <div className="workflow-step">
            <span>3</span>
            <p>Hospital prepares emergency unit</p>
          </div>
          <div className="workflow-step">
            <span>4</span>
            <p>Patient receives timely care</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;