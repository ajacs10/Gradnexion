// src/components/SportsSection.jsx
import React from 'react';
import './SportsSection.css';

function SportsSection({ section }) {
  const { podcast, interview, featuredArticle } = section.content;

  return (
    <section className="sports-section">
      <h2 className="section-title">{section.title}</h2>
      <div className="section-content">
        <div className="content-item">
          <h3 className="item-title">{podcast.title}</h3>
          <p className="item-description">{podcast.description}</p>
          <span className="item-time">{podcast.time}</span>
        </div>
        <div className="content-item">
          <h3 className="item-title">{interview.title}</h3>
          <p className="item-description">{interview.description}</p>
          <span className="item-time">{interview.time}</span>
        </div>
        <div className="content-item">
          <h3 className="item-title">{featuredArticle.title}</h3>
          <p className="item-description">{featuredArticle.description}</p>
          <span className="item-time">{featuredArticle.time}</span>
        </div>
      </div>
    </section>
  );
}

export default SportsSection;