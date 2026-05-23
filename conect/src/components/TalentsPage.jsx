// src/components/TalentsPage.jsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import journalContent from '../data/journalContent';
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
      <section className="section-band talents-section">
        <div className="graduate-grid">
          {filteredGraduates.map((graduate, index) => (
            <article className="graduate-card graduate-card-clickable" key={graduate.id}>
              <Link to={`/talentos/${graduate.id}`} className="graduate-card-link" aria-label={`Ver perfil de ${graduate.name}`}>
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
                    {graduate.role} ·{' '}
                    { (graduate.companyLogo || graduate.companyLogoUrl || (graduate.company && graduate.company.logo)) ? (
                      <span className="company-inline">
                        <img
                          src={graduate.companyLogo || graduate.companyLogoUrl || (graduate.company && graduate.company.logo)}
                          alt={graduate.company || 'Empresa'}
                          className="company-logo-inline"
                        />
                        <span className="company-name-inline">{graduate.company}</span>
                      </span>
                    ) : (
                      <span>{graduate.company}</span>
                    )}
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
                  </div>
                </div>
              </Link>

              {/* Quick access links so companies can preview portfolio without opening full profile */}
              <div className="graduate-quick-links">
                <div className="quick-links-left">
                  {graduate.portfolioUrl && (
                    <a
                      href={graduate.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-action quick-link"
                      aria-label={`Abrir portfólio de ${graduate.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zM7 11h10v2H7z"/></svg>
                      Portfólio
                    </a>
                  )}

                  {graduate.linkedinUrl && (
                    <a
                      href={graduate.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-action quick-link"
                      aria-label={`Abrir LinkedIn de ${graduate.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5A2.5 2.5 0 102 6a2.5 2.5 0 002.98-2.5zM3 8.98h4v10H3v-10zM9 8.98h3.84v1.36h.05c.54-.99 1.86-2.03 3.84-2.03 4.1 0 4.86 2.7 4.86 6.2v5.47h-4v-4.84c0-1.16-.02-2.66-1.62-2.66-1.62 0-1.87 1.27-1.87 2.58v4.92H9v-10z"/></svg>
                      LinkedIn
                    </a>
                  )}

                  {graduate.productionProjects && graduate.productionProjects.length > 0 && (
                    <a
                      href={typeof graduate.productionProjects[0] === 'string' ? graduate.productionProjects[0] : graduate.productionProjects[0].url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-action quick-link"
                      aria-label={`Abrir projeto em produção de ${graduate.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5v-5h2v5h-2zm-6 0v-7h2v7H7z"/></svg>
                      Projeto
                    </a>
                  )}
                </div>

                <div className="quick-links-right">
                  <Link to={`/talentos/${graduate.id}`} className="primary-action profile-link-button" aria-label={`Ver perfil de ${graduate.name}`} onClick={(e) => e.stopPropagation()}>
                    Ver perfil
                  </Link>
                </div>
              </div>
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
