import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import "./DispatcherLayout.css";

function DispatcherLayout({ children }) {
  return (
    <div className="dispatcher-layout">
      <Navbar />
      <div className="dispatcher-body">
        <Sidebar />
        <div className="dispatcher-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DispatcherLayout;