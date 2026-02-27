import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import AmbulanceLayout from "../../layouts/Ambulancelayout";
import "./DriverDashboard.css";

function DriverDashboard() {
  const [assignedIncident, setAssignedIncident] = useState(null);
  const ambulanceId = "ambulance1"; // Change if needed

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const assigned = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find(
          incident =>
            incident.assignedAmbulance === ambulanceId &&
            incident.status === "assigned"
        );

      setAssignedIncident(assigned || null);
    });

    return () => unsubscribe();
  }, []);

  const markCompleted = async () => {
    if (!assignedIncident) return;

    const ref = doc(db, "incidents", assignedIncident.id);
    await updateDoc(ref, { status: "completed" });

    alert("Emergency Completed ✅");
  };

  return (
    <AmbulanceLayout>
      <h2>Ambulance Dashboard 🚑</h2>

      {assignedIncident ? (
        <div className="incident-card">
          <h3>Assigned Emergency</h3>
          <p><strong>Type:</strong> {assignedIncident.emergencyType}</p>
          <p><strong>Priority:</strong> {assignedIncident.priority}</p>
          <p><strong>Caller:</strong> {assignedIncident.callerName}</p>

          <button className="complete-btn" onClick={markCompleted}>
            Mark as Completed
          </button>
        </div>
      ) : (
        <div className="no-incident">
          <h3>No Assigned Emergencies</h3>
          <p>Status: Available</p>
        </div>
      )}
    </AmbulanceLayout>
  );
}

export default DriverDashboard;