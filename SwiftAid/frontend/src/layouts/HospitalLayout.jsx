import Navbar from "../components/Navbar/Navbar";
import "./HospitalLayout.css";

function HospitalLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="hospital-content">
        {children}
      </div>
    </div>
  );
}

export default HospitalLayout;