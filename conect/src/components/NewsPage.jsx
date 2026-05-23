// src/components/NewsPage.jsx
import React from 'react';
import Section from './Section';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import './NewsPage.css';

const miniCourses = [
  {
    title: 'Marketing pessoal',
    category: 'Imagem profissional',
    duration: '25 min',
    description: 'Aprende a apresentar competências, projetos e objetivos com uma mensagem clara.',
  },
  {
    title: 'Comunicação para entrevistas',
    category: 'Comunicação',
    duration: '30 min',
    description: 'Prepara respostas, postura e perguntas para conversas com recrutadores.',
  },
  {
    title: 'Perfil profissional',
    category: 'Carreira',
    duration: '20 min',
    description: 'Organiza resumo, contactos, competências e evidências para ser encontrado.',
  },
  {
    title: 'LinkedIn para estudantes',
    category: 'Networking',
    duration: '35 min',
    description: 'Melhora o perfil, cria ligações e publica conteúdos simples sobre o teu percurso.',
  },
];

function NewsPage() {
  const newsSection = journalContent.sections.find((section) => section.type === 'news');
  const chartItems = newsSection?.graphData.labels.map((label, index) => ({
    label,
    value: newsSection.graphData.datasets[0].data[index],
  }));
  const maxValue = Math.max(...(chartItems?.map((item) => item.value) ?? [1]));

  return (
    <main className="news-page-container">
      {newsSection ? (
        <>
          <section className="news-intro-section">
            <p className="eyebrow">{t.news.eyebrow}</p>
            <h1 className="news-page-title">Guias e mini-cursos de carreira</h1>
            <p className="news-intro-text">
              Conteúdos práticos para estudantes prepararem perfil profissional, comunicação,
              marketing pessoal, entrevistas e presença digital.
            </p>
          </section>

          <section className="mini-course-section" aria-label="Mini-cursos">
            {miniCourses.map((course) => (
              <article className="mini-course-card" key={course.title}>
                <span>{course.category}</span>
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <strong>{course.duration}</strong>
              </article>
            ))}
          </section>

          <section className="news-graph-section" aria-label="Perfis publicados por área">
            <div>
              <p className="eyebrow">{t.news.metricsEyebrow}</p>
              <h2>{t.news.metricsTitle}</h2>
            </div>
            <div className="bar-chart">
              {chartItems.map((item) => (
                <div className="bar-row" key={item.label}>
                  <span>{item.label}</span>
                  <div>
                    <strong style={{ width: `${(item.value / maxValue) * 100}%` }} />
                  </div>
                  <b>{item.value}</b>
                </div>
              ))}
            </div>
          </section>

          <Section section={newsSection} />
        </>
      ) : (
        <h2>{t.news.empty}</h2>
      )}
    </main>
  );
}

export default NewsPage;
