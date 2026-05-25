// src/components/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import journalContent from '../data/journalContent';
import heroBackground from '../assets/imagem/rede_independente.png';
import './HomePage.css';

const iconProps = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const TargetIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M16 8l3-3" />
    <path d="M19 5h-3V2" />
  </svg>
);

const VideoIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <rect x="3" y="6" width="12" height="12" rx="2" />
    <path d="M15 10l5-3v10l-5-3" />
  </svg>
);

const ProfileIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M8 7a4 4 0 118 0 4 4 0 01-8 0z" />
    <path d="M4 21a8 8 0 0116 0" />
    <path d="M17 14l2 2 4-4" />
  </svg>
);

const StatusIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M9 11l2 2 4-5" />
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 17h8" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M3 12h18" />
  </svg>
);

const GrowthIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M4 19V5" />
    <path d="M4 19h17" />
    <path d="M8 16v-5" />
    <path d="M13 16V8" />
    <path d="M18 16v-9" />
    <path d="M7 9l4-4 4 3 5-5" />
  </svg>
);

const ShieldIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-5" />
  </svg>
);

function HomePage({ graduates, opportunities, session }) {
  const isLoggedIn = session?.isRegistered;
  const isCompany = session?.role === 'company';
  const partnerCount = new Set(opportunities.map((opportunity) => opportunity.companyId).filter(Boolean)).size;
  const supporters = ['SheCodeAjacs'];
  const featuredAreas = journalContent.courseAreas
    .map((area) => ({
      ...area,
      vacancies: opportunities.filter((opportunity) => opportunity.area === area.name).length,
    }))
    .sort((a, b) => b.vacancies - a.vacancies || a.name.localeCompare(b.name))
    .slice(0, 6);

  return (
    <main className="homepage-main home-template-main">
      <section className="home-template-hero">
        <img className="home-template-bg" src={heroBackground} alt="" aria-hidden="true" />
        <div className="home-template-network" aria-hidden="true">
          <span className="network-node node-a"><StatusIcon /></span>
          <span className="network-node node-b"><BriefcaseIcon /></span>
          <span className="network-node node-c"><VideoIcon /></span>
          <span className="network-node node-d"><ProfileIcon /></span>
        </div>

        <div className="home-template-content">
          <div className="home-template-copy">
            {isLoggedIn && <p className="home-template-eyebrow">Sessão ativa</p>}
            <h1>
              {isLoggedIn ? (
                `Bem-vindo${session?.profile?.name ? `, ${session.profile.name}` : ''}`
              ) : (
                <>
                  Conecte <span>finalistas</span> às empresas certas.
                </>
              )}
            </h1>
            <p>
              {isLoggedIn
                ? isCompany
                  ? 'A tua empresa já está pronta para publicar vagas e acompanhar talentos.'
                  : 'A tua conta já está ativa. Podes abrir o perfil, atualizar os dados e consultar vagas.'
                : 'Encontre vagas, talentos e oportunidades de estágio em uma rede simples e direta.'}
            </p>
            <div className="home-template-actions">
              {isLoggedIn ? (
                <>
                  <Link to={isCompany ? '/talentos' : '/vagas'} className="home-template-primary">
                    {isCompany ? 'Ver talentos' : 'Ver vagas'}
                  </Link>
                  <Link to={isCompany ? '/empresas/vagas/nova' : '/perfil'} className="home-template-secondary">
                    {isCompany ? 'Publicar vaga' : 'Meu perfil'}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/perfil/novo" className="home-template-primary">Sou estudante</Link>
                  <Link to="/perfil/novo" className="home-template-secondary">Sou empresa</Link>
                </>
              )}
            </div>
          </div>

          <div className="home-template-card" aria-label="Oportunidades em destaque">
            <strong className="home-template-card-title">Oportunidades em destaque</strong>
            <div className="home-template-stats">
              <article>
                <span className="stat-copy">
                  <strong>{graduates.length}</strong>
                  <small>Finalistas</small>
                  <em>ativos na plataforma</em>
                </span>
                <span className="stat-icon"><ProfileIcon /></span>
              </article>
              <article>
                <span className="stat-copy">
                  <strong>{opportunities.length}</strong>
                  <small>Vagas</small>
                  <em>nacionais abertas</em>
                </span>
                <span className="stat-icon"><BriefcaseIcon /></span>
              </article>
              <article>
                <span className="stat-copy">
                  <strong>{journalContent.courseAreas.length}</strong>
                  <small>Áreas</small>
                  <em>de atuação</em>
                </span>
                <span className="stat-icon"><GrowthIcon /></span>
              </article>
              <article>
                <span className="stat-copy">
                  <strong>{partnerCount}</strong>
                  <small>Empresas</small>
                  <em>parceiras</em>
                </span>
                <span className="stat-icon"><StatusIcon /></span>
              </article>
            </div>
            <p>Conectando talentos e empresas para construir o futuro, juntos.</p>
          </div>
        </div>
      </section>

      {!isLoggedIn && (
        <>
          <section className="home-template-features" aria-label="Benefícios">
            <article>
              <span className="feature-symbol feature-symbol-match"><TargetIcon /></span>
              <div>
                <h3>Match inteligente</h3>
                <p>Conectamos você com vagas que combinam com o seu perfil e objetivos.</p>
              </div>
            </article>
            <article>
              <span className="feature-symbol feature-symbol-video"><VideoIcon /></span>
              <div>
                <h3>Entrevistas online</h3>
                <p>Participe de entrevistas por videoconferência de onde estiver.</p>
              </div>
            </article>
            <article>
              <span className="feature-symbol feature-symbol-profile"><GrowthIcon /></span>
              <div>
                <h3>Desenvolva-se</h3>
                <p>Acesse conteúdos exclusivos e impulsione sua carreira desde já.</p>
              </div>
            </article>
            <article>
              <span className="feature-symbol feature-symbol-status"><ShieldIcon /></span>
              <div>
                <h3>Processo seguro</h3>
                <p>Ambiente confiável e dados protegidos em todas as etapas.</p>
              </div>
            </article>
          </section>

          <section className="home-template-areas">
            <div className="home-template-section-heading">
              <div>
                <h2>Áreas em alta</h2>
                <p>Descubra as áreas com mais oportunidades para você.</p>
              </div>
              <Link to="/perfil/novo">Ver todas as áreas →</Link>
            </div>

            <div className="home-template-area-grid">
              {featuredAreas.map((area, index) => (
                <article key={area.name}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{area.name}</strong>
                    <small>{area.vacancies} {area.vacancies === 1 ? 'vaga' : 'vagas'} disponíveis</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="home-template-trust home-template-supporters" aria-label="Empresas que apoiam a plataforma">
            <p>Empresas que apoiam a GradNeXion</p>
            <div>
              {supporters.map((company) => (
                <span key={company}>{company}</span>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default HomePage;
