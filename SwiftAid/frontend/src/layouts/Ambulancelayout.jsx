import Navbar from "../components/Navbar/Navbar";
import "./Ambulancelayout.css";

function Ambulancelayout({ children }) {
  return (
    <div className="ambulance-layout">
      <Navbar />
      <div className="ambulance-content">
        {children}
      </div>
    </div>
  );
}

export default Ambulancelayout;