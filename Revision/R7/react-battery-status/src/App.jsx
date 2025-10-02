import { useEffect, useState } from "react";

function App() {
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    let battery = null;

    const updateBatteryInfo = () => {
      setBatteryLevel(Math.floor(battery.level * 100));
      setCharging(battery.charging);
    };

    const setupBattery = async () => {
      if (navigator.getBattery) {
        battery = await navigator.getBattery();

        updateBatteryInfo();

        // Add event listeners
        battery.addEventListener("levelchange", updateBatteryInfo);
        battery.addEventListener("chargingchange", updateBatteryInfo);
      } else {
        // Fallback simulation if API is not supported
        let simulatedLevel = 100;
        let simulatedCharging = false;

        const interval = setInterval(() => {
          simulatedLevel -= 1;
          if (simulatedLevel <= 0) simulatedLevel = 100;
          simulatedCharging = simulatedLevel % 10 === 0;

          setBatteryLevel(simulatedLevel);
          setCharging(simulatedCharging);
        }, 1000);

        return () => clearInterval(interval);
      }
    };

    setupBattery();
  }, []);

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial",
        textAlign: "center",
      }}
    >
      <h1>Battery Status</h1>

      <div style={{ fontSize: "2rem", margin: "1rem 0" }}>
        {charging && <span style={{ color: "green", marginRight: "0.5rem" }}>⚡</span>}
        {batteryLevel < 20 && !charging && <span style={{ color: "red", marginRight: "0.5rem" }}>🔴</span>}
        {batteryLevel}%
      </div>

      <div style={{ fontSize: "1.2rem" }}>
        Status: {charging ? "Charging" : "Not Charging"}
      </div>
    </div>
  );
}

export default App;
