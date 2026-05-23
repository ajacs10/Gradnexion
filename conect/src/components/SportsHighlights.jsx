// src/components/SportsHighlights.jsx
import React from 'react';
import './SportsHighlights.css';

function SportsHighlights({ title, text }) {
  return (
    <div className="highlights-container">
      <h2 className="highlights-title">{title}</h2>
      <p className="highlights-text">{text}</p>
    </div>
  );
}

export default SportsHighlights;