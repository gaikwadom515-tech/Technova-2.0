import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import DispatcherLayout from "../../layouts/DispatcherLayout";
import "./EmergencyQueue.css";

function EmergencyQueue() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Real-time listener (NO orderBy to avoid index error)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "incidents"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort manually by createdAt if exists
        const sorted = data.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });

        setIncidents(sorted);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 🚑 Assign Ambulance
  const assignAmbulance = async (id) => {
    try {
      const ref = doc(db, "incidents", id);

      await updateDoc(ref, {
        status: "assigned",
        assignedAmbulance: "AMB-01",
      });

      console.log("Ambulance Assigned");
    } catch (error) {
      console.error("Assignment Error:", error);
      alert("Failed to assign ambulance");
    }
  };

  // ✅ Complete Case
  const markCompleted = async (id) => {
    try {
      const ref = doc(db, "incidents", id);

      await updateDoc(ref, {
        status: "completed",
      });

      console.log("Case Completed");
    } catch (error) {
      console.error("Completion Error:", error);
      alert("Failed to complete case");
    }
  };

  return (
    <DispatcherLayout>
      <div className="queue-container">
        <h2>🚨 Live Emergency Queue</h2>

        {loading ? (
          <p>Loading incidents...</p>
        ) : incidents.length === 0 ? (
          <p>No active emergencies</p>
        ) : (
          <div className="table-wrapper">
            <table className="emergency-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Caller</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Hospital</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>{incident.incidentId}</td>
                    <td>{incident.emergencyType}</td>
                    <td>{incident.callerName}</td>
                    <td>{incident.callerPhone}</td>

                    <td>
                      <span className={`status-badge ${incident.status}`}>
                        {incident.status}
                      </span>
                    </td>

                    <td>{incident.selectedHospital || "—"}</td>

                    <td>
                      {incident.status === "pending" && (
                        <button
                          className="assign-btn"
                          onClick={() => assignAmbulance(incident.id)}
                        >
                          Assign
                        </button>
                      )}

                      {incident.status === "assigned" && (
                        <button
                          className="complete-btn"
                          onClick={() => markCompleted(incident.id)}
                        >
                          Complete
                        </button>
                      )}

                      {incident.status === "completed" && (
                        <span className="done-text">✔ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DispatcherLayout>
  );
}

export default EmergencyQueue;