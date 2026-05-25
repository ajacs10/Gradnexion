// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import './Header.css';

const publicLinks = [
  { name: 'Entrar', path: '/login', variant: 'primary' },
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

function Header({ session, onLogout, companySearch, onCompanySearchChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
  const showCompanySearch = session?.isRegistered && session.role === 'student' && location.pathname === '/vagas';

  useEffect(() => {
    if (session?.isRegistered) {
      setIsScrolled(false);
      return undefined;
    }

    const transparentTopPages = new Set(['/', '/login', '/perfil/novo']);
    if (!transparentTopPages.has(location.pathname)) {
      setIsScrolled(true);
      return undefined;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 520);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, session?.isRegistered]);

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
    <header
      className={
        session?.isRegistered
          ? 'site-header'
          : `site-header site-header-public${isScrolled ? ' is-scrolled' : ''}`
      }
    >
      <div className="header-container">
        <Link to={homePath} className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <img src="/src/assets/imagem/favicon.svg" alt="GradNeXion" />
          </span>
          <span>
            <strong>{title}</strong>
            <small>Rede de estágios</small>
          </span>
        </Link>

        {showCompanySearch && (
          <form
            className="header-search"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              aria-label="Pesquisar empresa"
              type="search"
              value={companySearch || ''}
              onChange={(e) => onCompanySearchChange?.(e.target.value)}
              placeholder="Pesquisar empresa..."
            />
          </form>
        )}

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
                <Link
                  to={link.path}
                  className={link.variant === 'primary' ? 'nav-primary-link' : undefined}
                  onClick={(event) => handleNavigate(event, link.path)}
                >
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
