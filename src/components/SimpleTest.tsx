import React from "react";

const SimpleTest = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      border: '2px solid #333',
      margin: '20px'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>🔴 SIMPLE TEST COMPONENT WORKING 🔴</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click Me
      </button>
    </div>
  );
};

export default SimpleTest;