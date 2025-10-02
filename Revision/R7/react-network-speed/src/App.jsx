import { useState } from "react";

function App() {
  const [speedStatus, setSpeedStatus] = useState(null);
  const [icon, setIcon] = useState("");

  const checkSpeed = async () => {
    const url = "https://jsonplaceholder.typicode.com/todos/1"; // small file
    const startTime = performance.now();

    try {
      await fetch(url);
      const endTime = performance.now();
      const duration = endTime - startTime; // in milliseconds

      // Threshold: Fast if < 300ms, Slow otherwise
      if (duration < 300) {
        setSpeedStatus("Fast");
        setIcon("🚀");
      } else {
        setSpeedStatus("Slow");
        setIcon("🐢");
      }
    } catch (error) {
      setSpeedStatus("Error");
      setIcon("⚠️");
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h1>Network Speed Checker</h1>
      <button
        onClick={checkSpeed}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          margin: "1rem 0",
          cursor: "pointer",
        }}
      >
        Check Speed
      </button>

      {speedStatus && (
        <div style={{ fontSize: "1.5rem", marginTop: "1rem" }}>
          {icon} {speedStatus}
        </div>
      )}
    </div>
  );
}

export default App;
