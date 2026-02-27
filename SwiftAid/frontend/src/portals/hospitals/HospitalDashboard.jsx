import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import HospitalLayout from "../../layouts/HospitalLayout";
import "./HospitalDashboard.css";

function HospitalDashboard() {
  const hospitalId = "citycare1";
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const hospitalRef = doc(db, "hospitals", hospitalId);

    const unsubscribe = onSnapshot(hospitalRef, (snapshot) => {
      if (snapshot.exists()) {
        setHospital(snapshot.data());
      } else {
        console.log("Hospital document not found!");
      }
    });

    return () => unsubscribe();
  }, [hospitalId]);

  const updateBeds = async (type, value) => {
    if (!hospital) return;

    const hospitalRef = doc(db, "hospitals", hospitalId);

    await updateDoc(hospitalRef, {
      [type]: Math.max(0, hospital[type] + value)
    });
  };

  if (!hospital) {
    return (
      <HospitalLayout>
        <h2>Loading Hospital Data...</h2>
      </HospitalLayout>
    );
  }

  return (
    <HospitalLayout>
      <h2>Hospital Management 🏥</h2>

      <div className="hospital-card">
        <h3>{hospital.name}</h3>

        <div className="bed-section">
          <h4>Available Beds: {hospital.availableBeds}</h4>
          <button onClick={() => updateBeds("availableBeds", 1)}>+ Add</button>
          <button onClick={() => updateBeds("availableBeds", -1)}>- Remove</button>
        </div>

        <div className="bed-section">
          <h4>Available ICU: {hospital.availableICU}</h4>
          <button onClick={() => updateBeds("availableICU", 1)}>+ Add</button>
          <button onClick={() => updateBeds("availableICU", -1)}>- Remove</button>
        </div>
      </div>
    </HospitalLayout>
  );
}

export default HospitalDashboard;