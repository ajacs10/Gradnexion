// src/components/AboutUs.jsx
import React from 'react';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import './AboutUs.css';

function AboutUs() {
  return (
    <main className="about-us-container">
      <p className="eyebrow">{t.about.eyebrow}</p>
      <h1>{t.about.title}</h1>
      <p className="about-us-text">{t.about.text}</p>

      <section className="about-grid" aria-label={t.about.principlesLabel}>
        <article>
          <h2>{t.about.visibilityTitle}</h2>
          <p>{t.about.visibilityText}</p>
        </article>
        <article>
          <h2>{t.about.communityTitle}</h2>
          <p>{t.about.communityText}</p>
        </article>
        <article>
          <h2>{t.about.organizationTitle}</h2>
          <p>{t.about.organizationText}</p>
        </article>
      </section>

      <section className="about-courses">
        <h2>Como a rede funciona</h2>
        <ol className="about-steps">
          <li>Finalistas criam perfis com curso, ano, competências e área de interesse.</li>
          <li>Empresas publicam vagas de estágio com requisitos e modelo de trabalho.</li>
          <li>A plataforma mostra oportunidades por área e indica quantos perfis combinam.</li>
        </ol>
      </section>

      <section className="about-courses">
        <h2>{t.about.areasTitle}</h2>
        <div>
          {journalContent.courseAreas.map((course) => (
            <span key={course.name}>{course.name}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

export default AboutUs;
