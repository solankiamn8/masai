import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    if (online) {
      setLoading(true);
      axios
        .get("https://jsonplaceholder.typicode.com/posts")
        .then((res) => setData(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [online]);

  // Detect online/offline changes
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      {!online && (
        <div style={{ color: "red", fontWeight: "bold", marginBottom: "1rem" }}>
          🔴 Currently you are offline. Connect to a network to see the data.
        </div>
      )}

      {online && loading && <p>Loading data...</p>}

      {online && !loading && (
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          {data.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}
            >
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
