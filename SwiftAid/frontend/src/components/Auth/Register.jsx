import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    role: "citizen"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    const { name, phone, address, email, password } = formData;
    
    if (!name || !phone || !address || !email || !password) {
      setError("All fields are required");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    // Phone number validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit Indian phone number");
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
        uid: user.uid,
        isActive: true
      });

      setSuccess(true);
      
      // Show success message and redirect
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      
      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError("Email already in use. Please use a different email or login.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address format.");
          break;
        case 'auth/weak-password':
          setError("Password is too weak. Please use a stronger password.");
          break;
        default:
          setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      citizen: "👤",
      hospital: "🏥",
      dispatcher: "📡",
      ambulance: "🚑"
    };
    return icons[role] || "👤";
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">🚑 SwiftAid</div>
          <h2>Create New Account</h2>
          <p>Join SwiftAid emergency response network</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="auth-success">
            <div className="success-icon">✅</div>
            <div className="success-content">
              <h4>Registration Successful!</h4>
              <p>Redirecting to login page...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="auth-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">
              <span className="label-icon">👤</span>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="auth-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phone">
              <span className="label-icon">📱</span>
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="auth-input"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">
              <span className="label-icon">📍</span>
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="auth-input"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || success}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="auth-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || success}
            />
            <small className="input-hint">Use 6 or more characters</small>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">
              <span className="label-icon">🎯</span>
              Register as
            </label>
            <select
              id="role"
              name="role"
              className="auth-select"
              value={formData.role}
              onChange={handleChange}
              disabled={loading || success}
            >
              <option value="citizen">👤 Citizen / Patient</option>
              <option value="hospital">🏥 Hospital Staff</option>
              <option value="dispatcher">📡 Emergency Dispatcher</option>
              <option value="ambulance">🚑 Ambulance Driver</option>
            </select>
          </div>

          {/* Role Preview */}
          <div className="role-preview">
            <span className="preview-label">You are registering as:</span>
            <span className="preview-value">
              {getRoleIcon(formData.role)} {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
            </span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`auth-btn ${loading ? 'loading' : ''}`}
            disabled={loading || success}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="auth-footer">
          <div className="auth-link">
            Already have an account?{" "}
            <Link to="/login">
              <span>Login here</span>
            </Link>
          </div>
          
          <div className="auth-terms">
            By registering, you agree to our{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>

        {/* Quick Role Info */}
        <div className="role-info">
          <p>
            <span className="info-icon">ℹ️</span>
            Choose the correct role. This determines your dashboard access.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;