// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import './Header.css';

const publicLinks = [
  { name: 'Entrar', path: '/login' },
];

const studentLinks = [
  { name: 'Vagas', path: '/vagas' },
];

const companyLinks = [
  { name: 'Talentos', path: '/talentos' },
  { name: 'Publicar vaga', path: '/empresas/vagas/nova' },
];

const adminLinks = [
  { name: 'Admin', path: '/admin' },
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function Header({ session, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { title } = journalContent.header;
  const homePath = !session?.isRegistered
    ? '/'
    : session.role === 'admin'
      ? '/admin'
      : session.role === 'company'
        ? '/talentos'
        : '/vagas';
  const navLinks = !session?.isRegistered
    ? publicLinks
    : session.role === 'admin'
      ? adminLinks
      : session.role === 'company'
        ? companyLinks
        : studentLinks;
  const profileName = session?.profile?.name || session?.profile?.company;

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout?.();
    navigate('/');
  };

  const handleNavigate = (event, path) => {
    if (!path.includes('#')) {
      setMenuOpen(false);
      return;
    }

    event.preventDefault();
    const [, hash] = path.split('#');

    const scrollToTarget = () => {
      const target = document.getElementById(hash);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    setMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(scrollToTarget, 80);
      return;
    }

    scrollToTarget();
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to={homePath} className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">FC</span>
          <span>
            <strong>{title}</strong>
            <small>Rede de estágios</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label={t.common.openMenu}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={menuOpen ? 'nav is-open' : 'nav'} aria-label="Navegação principal">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.path} onClick={(event) => handleNavigate(event, link.path)}>
                  {link.name}
                </Link>
              </li>
            ))}
            {session?.isRegistered && (
              <li>
                <Link
                  to={session.role === 'admin' ? '/admin' : '/perfil'}
                  className="profile-chip"
                  onClick={(event) => handleNavigate(event, session.role === 'admin' ? '/admin' : '/perfil')}
                >
                  <span className="profile-avatar">{getInitials(profileName)}</span>
                  <span className="profile-name">{profileName}</span>
                </Link>
              </li>
            )}
            {session?.isRegistered && (
              <li>
                <button type="button" className="nav-logout" onClick={handleLogout}>
                  Sair
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
