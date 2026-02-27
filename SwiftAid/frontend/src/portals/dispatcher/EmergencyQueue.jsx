import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import DispatcherLayout from "../../layouts/DispatcherLayout";
import "./EmergencyQueue.css";

function EmergencyQueue() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncidents(data);
    });

    return () => unsubscribe();
  }, []);

  const assignAmbulance = async (id) => {
    const ref = doc(db, "incidents", id);

    await updateDoc(ref, {
      status: "assigned",
      assignedAmbulance: "ambulance1"
    });

    alert("Ambulance Assigned 🚑");
  };

  return (
    <DispatcherLayout>
      <h2>Live Emergency Queue 🚨</h2>

      <table className="emergency-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td>{incident.emergencyType}</td>
              <td>
                <span className={`priority ${incident.priority}`}>
                  {incident.priority}
                </span>
              </td>
              <td>{incident.status}</td>
              <td>
                {incident.status === "active" && (
                  <button
                    className="assign-btn"
                    onClick={() => assignAmbulance(incident.id)}
                  >
                    Assign
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DispatcherLayout>
  );
}

export default EmergencyQueue;