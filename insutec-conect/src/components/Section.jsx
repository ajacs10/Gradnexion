// src/components/Section.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Section.css';

const Section = ({ section }) => {
  if (!section.content || section.content.length === 0) {
    return null;
  }

  return (
    <section className="generic-section">
      <h2 className="section-title">{section.title}</h2>
      <div className="section-content">
        {section.content.map((item) => (
          <article key={item.id} className="content-card">
            <Link to={`/news/${item.id}`} className="card-link">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="card-image" />
              )}
              <div className="card-text-content">
                {item.category && <span className="card-category">{item.category}</span>}
                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>
              </div>
            </Link>
            {item.author && <p className="card-details">Por: {item.author}</p>}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Section;
