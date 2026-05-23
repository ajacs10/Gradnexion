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

function HomePage({ graduates, opportunities, session }) {
  const isLoggedIn = session?.isRegistered;
  const isCompany = session?.role === 'company';
  const partnerCount = new Set(opportunities.map((opportunity) => opportunity.companyId).filter(Boolean)).size;
  const companyNames = [...new Set(opportunities.map((opportunity) => opportunity.company).filter(Boolean))];
  const featuredAreas = journalContent.courseAreas
    .map((area) => ({
      ...area,
      vacancies: opportunities.filter((opportunity) => opportunity.area === area.name).length,
    }))
    .sort((a, b) => b.vacancies - a.vacancies || a.name.localeCompare(b.name))
    .slice(0, 6);

  return (
    <main className="homepage-main home-template-main">
      <section
        className="home-template-hero"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(2, 6, 23, 0.96), rgba(3, 18, 64, 0.92)),
            url(${heroBackground})
          `,
        }}
      >
        <div className="home-template-network" aria-hidden="true">
          <span className="network-node node-a">ED</span>
          <span className="network-node node-b">MT</span>
          <span className="network-node node-c">VG</span>
          <span className="network-node node-d">PF</span>
        </div>

        <div className="home-template-content">
          <div className="home-template-copy">
            <p className="home-template-eyebrow">{isLoggedIn ? 'Sessão ativa' : journalContent.hero.label}</p>
            <h1>
              {isLoggedIn ? (
                `Bem-vindo${session?.profile?.name ? `, ${session.profile.name}` : ''}`
              ) : (
                <>
                  <span>Finalistas</span> e empresas conectados para estágio.
                </>
              )}
            </h1>
            <p>
              {isLoggedIn
                ? isCompany
                  ? 'A tua empresa já está pronta para publicar vagas e acompanhar talentos.'
                  : 'A tua conta já está ativa. Podes abrir o perfil, atualizar os dados e consultar vagas.'
                : 'Conectamos finalistas universitários às melhores oportunidades de estágio e desenvolvimento profissional.'}
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
                <strong>{graduates.length}</strong>
                <span>Finalistas ativos na plataforma</span>
              </article>
              <article>
                <strong>{opportunities.length}</strong>
                <span>Vagas nacionais abertas</span>
              </article>
              <article>
                <strong>{journalContent.courseAreas.length}</strong>
                <span>Áreas de atuação</span>
              </article>
              <article>
                <strong>{partnerCount}</strong>
                <span>Empresas parceiras</span>
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
                <strong>Compatibilidade</strong>
                <h3>Vagas alinhadas ao perfil</h3>
                <p>O estudante vê oportunidades da sua área e com requisitos próximos das suas competências.</p>
              </div>
            </article>
            <article>
              <span className="feature-symbol feature-symbol-video"><VideoIcon /></span>
              <div>
                <strong>Entrevistas</strong>
                <h3>Reuniões presenciais ou online</h3>
                <p>A empresa pode marcar entrevistas com candidatos selecionados e usar sala de videoconferência.</p>
              </div>
            </article>
            <article>
              <span className="feature-symbol feature-symbol-profile"><ProfileIcon /></span>
              <div>
                <strong>Perfil validável</strong>
                <h3>Dados úteis para decisão</h3>
                <p>Curso, instituição, contactos, declaração, portfólio e LinkedIn ficam organizados no perfil.</p>
              </div>
            </article>
            <article>
              <span className="feature-symbol feature-symbol-status"><StatusIcon /></span>
              <div>
                <strong>Acompanhamento</strong>
                <h3>Estado da candidatura</h3>
                <p>O estudante acompanha se a inscrição está aguardando análise ou se já tem entrevista marcada.</p>
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

          {companyNames.length > 0 && (
            <section className="home-template-trust" aria-label="Empresas com vagas publicadas">
              <p>Empresas com vagas publicadas</p>
              <div>
                {companyNames.map((company) => (
                  <span key={company}>{company}</span>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default HomePage;
