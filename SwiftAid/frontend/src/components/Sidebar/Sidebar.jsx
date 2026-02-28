import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h3>Control Panel</h3>

      <NavLink to="/dispatcher" className="sidebar-link">
        Emergency Queue
      </NavLink>

      
    </div>
  );
}

export default Sidebar;