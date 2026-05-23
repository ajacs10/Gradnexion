// src/components/StudentProfilePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { apiGet, apiPatch, apiPost } from '../services/api';
import studentProfileBackground from '../assets/imagem/123.png';
import './HomePage.css';

const getConferenceUrl = (student) => {
  const roomName = `shecodeajacs-${student.id}-${student.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `https://meet.jit.si/${roomName}`;
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function StudentProfilePage({ graduates, onStudentMovedToInternship, session }) {
  const { id } = useParams();
  const [interviewMode, setInterviewMode] = useState('Presencial');
  const [interview, setInterview] = useState(null);
  const [activeInternship, setActiveInternship] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewMessage, setInterviewMessage] = useState('');

  const student = graduates.find((graduate) => String(graduate.id) === id);

  const fallbackConferenceUrl = useMemo(
    () => (student ? getConferenceUrl(student) : ''),
    [student]
  );

  const conferenceUrl = interview?.meeting_url || fallbackConferenceUrl;
  const hasOnlineInterview =
    interviewMode === 'Via plataforma' && Boolean(conferenceUrl);

  useEffect(() => {
    if (!student || !session?.profile?.id) return;

    apiGet(`/api/companies/${session.profile.id}/interns`)
      .then((items) => {
        const match = items.find(
          (item) => String(item.student.id) === String(student.id)
        );
        setActiveInternship(match ?? null);
      })
      .catch(() => setActiveInternship(null));
  }, [session?.profile?.id, student]);

  if (!student) {
    return <Navigate to="/talentos" replace />;
  }

  const handleSchedule = async (mode) => {
    setInterviewMode(mode);

    try {
      const createdInterview = await apiPost('/api/interviews', {
        studentId: student.id,
        companyId: session.profile.id,
        mode,
        scheduledDate: interviewDate || null,
        message: interviewMessage || null,
      });

      setInterview(createdInterview);
      setInterviewDate('');
      setInterviewMessage('');
    } catch (error) {
      console.error('Erro ao marcar entrevista:', error.message);
    }
  };

  const handleStartInternship = async () => {
    if (!interview) return;

    try {
      await apiPatch(`/api/interviews/${interview.id}/status`, {
        status: 'internship_started',
      });

      setActiveInternship({
        interviewId: interview.id,
        student,
      });

      onStudentMovedToInternship?.(student.id);
    } catch (error) {
      console.error('Erro ao marcar internship:', error.message);
    }
  };

  const handleCancelInternship = async () => {
    if (!activeInternship) return;

    try {
      await apiPatch(
        `/api/interviews/${activeInternship.interviewId}/status`,
        { status: 'rejected' }
      );

      setActiveInternship(null);
    } catch (error) {
      console.error('Erro ao cancelar internship:', error.message);
    }
  };

  return (
    <main className={`homepage-main page-shell ${session?.role === 'company' ? 'student-profile-page-shell' : ''}`}>
      <section
        className={`student-profile-hero ${session?.role === 'company' ? 'student-profile-hero-company' : ''}`}
        style={session?.role === 'company' ? { backgroundImage: `url(${studentProfileBackground})` } : undefined}
      >
        <div className="student-photo-status-wrapper">
          {student.photoUrl ? (
            <img
              className="student-profile-photo"
              src={student.photoUrl}
              alt={student.name}
            />
          ) : (
            <span className="student-profile-photo student-profile-photo-fallback">
              {getInitials(student.name)}
            </span>
          )}

          <span className="student-online-status photo-status">
            <span className="online-indicator"></span>
            Online
          </span>
        </div>

        <div className="student-profile-header-row">
          <div>
            <p className="eyebrow">Perfil de estudante</p>

            <h2>{student.name}</h2>

            <p className="student-profile-role">
              {student.role} · {student.course}
            </p>

            <p>{student.quote}</p>

            <div className="graduate-meta">
              <span>{student.university}</span>
              <span>Turma {student.year}</span>

              {student.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            {/* CV-like summary visible to all viewers */}
            <div className="profile-cv">
              {student.languages && student.languages.length > 0 && (
                <div className="cv-row">
                  <strong>Línguas:</strong>
                  {student.languages.map((lang) => (
                    <span key={lang} className="pill">{lang}</span>
                  ))}
                </div>
              )}

              {student.technologies && student.technologies.length > 0 && (
                <div className="cv-row">
                  <strong>Tecnologias:</strong>
                  {student.technologies.map((tech) => (
                    <span key={tech} className="pill">{tech}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="profile-link-row">
              {student.portfolioUrl && (
                <a
                  href={student.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-action"
                >
                  Portfólio
                </a>
              )}

              {student.linkedinUrl && (
                <a
                  href={student.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-action"
                >
                  LinkedIn
                </a>
              )}

              {student.universityDeclarationUrl && (
                <a
                  href={student.universityDeclarationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-action"
                >
                  Declaração
                </a>
              )}
            </div>

            {session?.role === 'company' && (
              <div className="company-only-info">
                {student.email && (
                  <div className="company-info-row"><strong>Email:</strong> <span>{student.email}</span></div>
                )}
                {student.phone && (
                  <div className="company-info-row"><strong>Telefone:</strong> <span>{student.phone}</span></div>
                )}
                {student.location && (
                  <div className="company-info-row"><strong>Localização:</strong> <span>{student.location}</span></div>
                )}
                {student.domains && student.domains.length > 0 && (
                  <div className="company-info-row">
                    <strong>Domínios:</strong>
                    <div className="domains-list">
                      {student.domains.map((d) => (
                        <span key={d} className="domain-pill">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {student.projects && student.projects.length > 0 && (
                  <div className="company-info-row">
                    <strong>Projetos:</strong>
                    <ul>
                      {student.projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="profile-actions conference-panel">
            <h3>Conferência</h3>

            <div className="interview-mode-selection">
              <p>Tipo de entrevista:</p>

              <button
                type="button"
                className={`mode-button ${
                  interviewMode === 'Presencial' ? 'active' : ''
                }`}
                onClick={() => setInterviewMode('Presencial')}
              >
                Presencial
              </button>

              <button
                type="button"
                className={`mode-button ${
                  interviewMode === 'Via plataforma' ? 'active' : ''
                }`}
                onClick={() => setInterviewMode('Via plataforma')}
              >
                Via plataforma
              </button>
            </div>

            <p>
              <strong>Modo:</strong> {interviewMode}
            </p>

            <div className="interview-form">
              <label>
                <span>Data da entrevista</span>

                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </label>

              <label>
                <span>Mensagem</span>

                <textarea
                  value={interviewMessage}
                  onChange={(e) =>
                    setInterviewMessage(e.target.value)
                  }
                  placeholder="Detalhes..."
                  rows="2"
                />
              </label>

              <button
                type="button"
                className="primary-action action-button"
                onClick={() => handleSchedule(interviewMode)}
              >
                Marcar entrevista
              </button>
            </div>

            {interview && interview.scheduledDate && (
              <div className="interview-info">
                <p>
                  <strong>Data:</strong>{' '}
                  {new Date(
                    interview.scheduledDate
                  ).toLocaleDateString('pt-AO')}
                </p>

                {interview.message && (
                  <p>
                    <strong>Msg:</strong> {interview.message}
                  </p>
                )}
              </div>
            )}

            {interviewMode === 'Via plataforma' &&
              hasOnlineInterview && (
                <a
                  href={conferenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-action action-button"
                >
                  Abrir sala de conferência
                </a>
              )}

            <button
              type="button"
              className="secondary-action action-button"
              onClick={handleStartInternship}
              disabled={!interview || Boolean(activeInternship)}
            >
              {activeInternship
                ? 'Estágio ativo'
                : 'Aprovar para estágio'}
            </button>

            {activeInternship && (
              <button
                type="button"
                className="secondary-action action-button"
                onClick={handleCancelInternship}
              >
                Cancelar
              </button>
            )}

            <Link to="/talentos" className="secondary-action">
              Voltar
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default StudentProfilePage;