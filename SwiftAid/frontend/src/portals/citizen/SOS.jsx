import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import CitizenLayout from "../../layouts/CitizenLayout";
import "./SOS.css";

function SOS() {
  const [type, setType] = useState("Cardiac");

  const handleSOS = async () => {
    await addDoc(collection(db, "incidents"), {
      emergencyType: type,
      callerName: "Om",
      callerPhone: "7896526425",
      priority: type === "Cardiac" ? "High" : "Medium",
      status: "active",
      assignedAmbulance: "",
      assignedHospital: "",
      lat: 18.5204,
      lng: 73.8567,
      createdAt: new Date()
    });

    alert("🚑 Emergency Sent Successfully!");
  };

  return (
    <CitizenLayout>
      <div className="sos-container">
        <h1>Emergency SOS</h1>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Cardiac">Cardiac</option>
          <option value="Accident">Accident</option>
          <option value="Other">Other</option>
        </select>

        <button className="sos-button" onClick={handleSOS}>
          SEND SOS
        </button>
      </div>
    </CitizenLayout>
  );
}

export default SOS;