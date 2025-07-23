import React from "react";
import SimpleTest from "../src/components/SimpleTest";
import Home from "../src/components/home";

export default function IndexPage() {
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