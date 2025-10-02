import { useState, useEffect } from "react";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);

  let recognition;

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep recording until stopped
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptChunk + " ");
        } else {
          interimTranscript += transcriptChunk;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event);
    };

    // Cleanup
    return () => {
      recognition.stop();
    };
  }, []);

  const handleStart = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcriptChunk + " ");
        } else {
          interimTranscript += transcriptChunk;
        }
      }
    };

    recognition.start();
    setIsRecording(true);
  };

  const handleStop = () => {
    recognition.stop();
    setIsRecording(false);
  };

  if (!supported) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>SpeechRecognition is not supported in your browser.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "Arial" }}>
      <h1>Speech-to-Text App</h1>
      <button
        onClick={isRecording ? handleStop : handleStart}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          cursor: "pointer",
          margin: "1rem 0",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <div style={{ fontSize: "2rem" }}>{isRecording ? "🔴" : "🟢"}</div>
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          border: "1px solid #ccc",
          minHeight: "100px",
          width: "60%",
          margin: "1rem auto",
          borderRadius: "5px",
          textAlign: "left",
        }}
      >
        {transcript || "Your speech will appear here..."}
      </div>
    </div>
  );
}

export default App;
  