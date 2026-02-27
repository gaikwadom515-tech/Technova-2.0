import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import SOS from "../portals/citizen/SOS";
import EmergencyQueue from "../portals/dispatcher/EmergencyQueue";
import DriverDashboard from "../portals/ambulance/DriverDashboard";
import HospitalDashboard from "../portals/hospitals/HospitalDashboard";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";




function AppRoutes() {
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<Home />} />
        <Route path="/citizen" element={<SOS />} />
        <Route path="/dispatcher" element={<EmergencyQueue />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />   

      </Routes>
    </Router>
  );
}

export default AppRoutes;