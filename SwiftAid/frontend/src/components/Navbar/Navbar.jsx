import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      
      {/* LEFT SIDE (Brand) */}
      <div className="navbar-left">
        <div className="navbar-brand-icon">🚑</div>
        SwiftAid
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        className={`menu-toggle ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* RIGHT SIDE LINKS */}
      <ul className={`navbar-right ${menuOpen ? "active" : ""}`}>

        <li className="nav-item">
          <NavLink to="/citizen" className="nav-link" onClick={closeMenu}>
            <span className="nav-icon">👤</span> Citizen
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/dispatcher" className="nav-link" onClick={closeMenu}>
            <span className="nav-icon">🎧</span> Dispatcher
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/driver" className="nav-link" onClick={closeMenu}>
            <span className="nav-icon">🚑</span> Ambulance
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/hospital" className="nav-link" onClick={closeMenu}>
            <span className="nav-icon">🏥</span> Hospital
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/Login" className="nav-link" onClick={closeMenu}>
            <span className="nav-icon">🔐</span> Login
          </NavLink>
        </li>

      </ul>
    </nav>
  );
}

export default Navbar;