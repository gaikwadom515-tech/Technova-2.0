import { useState } from "react";
import { registerUser } from "../../services/authService";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const user = await registerUser(email, password, role);

      // Store extra details
      await setDoc(doc(db, "users", user.uid), {
        name,
        phone,
        address,
        email,
        role
      });

      alert("Registration Successful!");

      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Register 📝</h2>

        <input
          className="auth-input"
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Phone Number"
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Address"
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="auth-select"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="citizen">Citizen</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="driver">Ambulance</option>
          <option value="hospital">Hospital</option>
        </select>

        <button className="auth-btn" onClick={handleRegister}>
          Register
        </button>

        <div className="auth-link">
          Already have an account?{" "}
          <Link to="/login">
            <span>Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;