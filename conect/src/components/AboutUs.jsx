// src/components/AboutUs.jsx
import React from 'react';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import heroBackground from '../assets/imagem/rede_independente.png';
import './AboutUs.css';

function AboutUs() {
  const principles = [
    {
      title: t.about.visibilityTitle,
      text: t.about.visibilityText,
      value: '01',
    },
    {
      title: t.about.communityTitle,
      text: t.about.communityText,
      value: '02',
    },
    {
      title: t.about.organizationTitle,
      text: t.about.organizationText,
      value: '03',
    },
  ];

  return (
    <main className="about-us-container">
      <section className="about-hero" style={{ backgroundImage: `url(${heroBackground})` }}>
        <div>
          <p className="about-eyebrow">{t.about.eyebrow}</p>
          <h1>{t.about.title}</h1>
          <p className="about-us-text">{t.about.text}</p>
        </div>

        <div className="about-hero-panel">
          <aside className="about-summary" aria-label="Resumo da rede">
            <strong>{journalContent.courseAreas.length}</strong>
            <span>áreas de formação organizadas para talentos e vagas</span>
          </aside>

          <div className="about-grid" aria-label={t.about.principlesLabel}>
            {principles.map((principle) => (
              <article key={principle.title}>
                <span>{principle.value}</span>
                <h2>{principle.title}</h2>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

export default AboutUs;
