import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";

function App() {

  useEffect(() => {
    const test = async () => {
      const snapshot = await getDocs(collection(db, "incidents"));
      snapshot.forEach(doc => {
        console.log("Incident:", doc.data());
      });
    };

    test();
  }, []);

  return (
    <div>
      <h1>SwiftAid Running 🚑</h1>
    </div>
  );
}

export default App;