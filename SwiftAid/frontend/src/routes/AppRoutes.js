import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SOS from "../portals/citizen/SOS";
import EmergencyQueue from "../portals/dispatcher/EmergencyQueue";
import DriverDashboard from "../portals/ambulance/DriverDashboard";
import HospitalDashboard from "../portals/hospitals/HospitalDashboard";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SOS />} />
        <Route path="/dispatcher" element={<EmergencyQueue />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;