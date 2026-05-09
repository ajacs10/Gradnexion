// src/components/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import journalContent from '../data/journalContent';
import heroBackground from '../assets/imagem/rede_independente.png';
import './HomePage.css';

function HomePage({ graduates, opportunities, session }) {
  const isLoggedIn = session?.isRegistered;
  const isCompany = session?.role === 'company';

  return (
    <main className="homepage-main">
      <section className="hero-section hero-section-visual" style={{ backgroundImage: `url(${heroBackground})` }}>
        <div className="hero-copy">
          <p className="eyebrow">{isLoggedIn ? 'Sessão ativa' : journalContent.hero.label}</p>
          <h1>{isLoggedIn ? `Bem-vindo${session?.profile?.name ? `, ${session.profile.name}` : ''}` : journalContent.hero.title}</h1>
          <p className="hero-subtitle">
            {isLoggedIn
              ? isCompany
                ? 'A tua empresa já está pronta para publicar vagas e acompanhar talentos.'
                : 'A tua conta já está ativa. Podes abrir o perfil, atualizar os dados e consultar vagas.'
              : journalContent.hero.subtitle}
          </p>
          <div className="hero-actions">
            {isLoggedIn ? (
              <>
                <Link to={isCompany ? '/talentos' : '/vagas'} className="primary-action">
                  {isCompany ? 'Ver talentos' : 'Ver vagas'}
                </Link>
                <Link to={isCompany ? '/empresas/vagas/nova' : '/vagas'} className="secondary-action">
                  {isCompany ? 'Publicar vaga' : 'Ver vagas'}
                </Link>
              </>
            ) : (
              <Link to="/perfil/novo" className="primary-action">
                Criar perfil
              </Link>
            )}
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="hero-panel" aria-label="Resumo do projeto">
            <div className="stat-card">
              <strong>{graduates.length}</strong>
              <span>finalistas</span>
            </div>
            <div className="stat-card">
              <strong>{opportunities.length}</strong>
              <span>vagas nacionais</span>
            </div>
            <div className="stat-card">
              <strong>{journalContent.courseAreas.length}</strong>
              <span>áreas</span>
            </div>
            <p>{journalContent.home?.projectSummary ?? 'Rede independente para aproximar finalistas, recém-formados e empresas com vagas de estágio.'}</p>
          </div>
        ) : (
          <div className="hero-panel hero-panel-auth" aria-label="Acesso rápido">
            <div className="stat-card">
              <strong>{isCompany ? 'Empresa' : 'Estudante'}</strong>
              <span>perfil ativo</span>
            </div>
            <div className="stat-card">
              <strong>{isCompany ? opportunities.length : graduates.length}</strong>
              <span>{isCompany ? 'vagas disponíveis' : 'talentos na rede'}</span>
            </div>
            <div className="stat-card">
              <strong>{journalContent.courseAreas.length}</strong>
              <span>áreas</span>
            </div>
            <p>O acesso público fica escondido depois do login para evitar confusão entre cadastro e navegação da conta.</p>
          </div>
        )}
      </section>

      {!isLoggedIn && (
        <section className="section-band">
          <div className="courses-grid">
            <article className="course-card">
              <span>Acesso</span>
              <h3>Entrar na rede certa</h3>
              <p>Estudantes ganham visibilidade profissional e empresas entram numa base de talento organizada.</p>
              <Link to="/perfil/novo" className="inline-action">Começar</Link>
            </article>
            <article className="course-card">
              <span>Vagas</span>
              <h3>Oportunidades compatíveis</h3>
              <p>As vagas aparecem para quem tem a área certa, reduzindo ruído e aumentando as chances de resposta.</p>
              <Link to="/vagas" className="inline-action">Procurar vagas</Link>
            </article>
            <article className="course-card">
              <span>Empresas</span>
              <h3>Recrutamento mais rápido</h3>
              <p>Empresas encontram perfis com universidade, declaração, portfólio e LinkedIn no mesmo lugar.</p>
              <Link to="/perfil/novo" className="inline-action">Cadastrar empresa</Link>
            </article>
            <article className="course-card">
              <span>Talentos</span>
              <h3>Entrevista sem fricção</h3>
              <p>Do perfil à chamada de vídeo, a empresa consegue avaliar e avançar para estágio sem perder contexto.</p>
              <Link to="/talentos" className="inline-action">Ver talentos</Link>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}

export default HomePage;
