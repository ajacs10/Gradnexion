// src/components/TalentsPage.jsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import journalContent from '../data/journalContent';
import talentsBackground from '../assets/imagem/background.jpg';
import { t } from '../i18n';
import './HomePage.css';

function TalentsPage({ graduates }) {
  const [selectedCourse, setSelectedCourse] = useState(t.common.all);
  const [searchTerm, setSearchTerm] = useState('');
  const courses = journalContent.courseAreas.map((course) => course.name);

  const filteredGraduates = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return graduates.filter((graduate) => {
      const matchesCourse = selectedCourse === t.common.all || graduate.course === selectedCourse;
      const searchable = [
        graduate.name,
        graduate.course,
        graduate.role,
        graduate.company,
        graduate.quote,
        ...(graduate.skills ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return matchesCourse && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [graduates, searchTerm, selectedCourse]);

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <main className="homepage-main page-shell">
      <section className="section-band talents-section" style={{ backgroundImage: `url(${talentsBackground})` }}>
        <div className="section-heading">
          <p className="eyebrow">{t.home.wallEyebrow}</p>
          <h2>{t.home.wallTitle}</h2>
          <p>{t.home.wallDescription}</p>
        </div>

        <div className="mural-toolbar">
          <label>
            <span>{t.home.search}</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t.home.searchPlaceholder}
            />
          </label>

          <label>
            <span>{t.home.course}</span>
            <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}>
              <option>{t.common.all}</option>
              {courses.map((course) => (
                <option key={course}>{course}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="graduate-grid">
          {filteredGraduates.map((graduate, index) => (
            <article className="graduate-card graduate-card-clickable" key={graduate.id}>
              <Link to={`/talentos/${graduate.id}`} className="graduate-card-link" aria-label={`Ver perfil de ${graduate.name}`}>
                <span className="graduate-ribbon">{index + 1}</span>
                <span className="graduate-score">{graduate.year}</span>
                <div className="graduate-photo-wrap">
                  {graduate.photoUrl ? (
                    <img className="graduate-photo" src={graduate.photoUrl} alt={graduate.name} />
                  ) : (
                    <span className="graduate-photo graduate-photo-fallback">{getInitials(graduate.name)}</span>
                  )}
                </div>
                <div className="graduate-card-body">
                  <p className="graduate-course">{graduate.course}</p>
                  <h3>{graduate.name}</h3>
                  <p className="graduate-role">
                    {graduate.role} · {graduate.company}
                  </p>
                  <p className="graduate-university">{graduate.university}</p>
                  <div className="graduate-card-footer">
                    <dl>
                      <div>
                        <dt>{t.home.classPrefix}</dt>
                        <dd>{graduate.year}</dd>
                      </div>
                      <div>
                        <dt>Competências</dt>
                        <dd>{graduate.skills?.length ?? 0}</dd>
                      </div>
                    </dl>
                    <span className="graduate-action">Ver perfil</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
          {filteredGraduates.length === 0 && (
            <p className="empty-state">Nenhum talento disponível para estes filtros.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default TalentsPage;
