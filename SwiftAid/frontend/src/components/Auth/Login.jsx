import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const user = await loginUser(email, password);

      // Get user role from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;

        if (role === "citizen") navigate("/citizen-dashboard");
        if (role === "dispatcher") navigate("/dispatcher");
        if (role === "driver") navigate("/driver");
        if (role === "hospital") navigate("/hospital");
      } else {
        alert("User role not found.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Login 🔐</h2>

        <input
          className="auth-input"
          type="email"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={handleLogin}>
          Login
        </button>

        <div className="auth-link">
          Don't have an account?{" "}
          <Link to="/register">
            <span>Create Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;