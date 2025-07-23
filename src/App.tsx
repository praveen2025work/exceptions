import React from "react";
import SimpleTest from "./components/SimpleTest";
import Home from "./components/home";

function App() {
  return (
    <div>
      <SimpleTest />
      <div style={{
        padding: '20px',
        backgroundColor: '#ffffcc',
        border: '2px solid #ffcc00',
        margin: '20px'
      }}>
        <h2 style={{ color: '#cc6600' }}>🟡 TESTING HOME COMPONENT BELOW 🟡</h2>
      </div>
      <Home />
    </div>
  );
}

export default App;