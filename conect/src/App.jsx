// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import ArticlePage from './components/ArticlePage';
import NewsPage from './components/NewsPage';
import ProfileCreatePage from './components/ProfileCreatePage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import StudentProfilePage from './components/StudentProfilePage';
import TalentsPage from './components/TalentsPage';
import CompanyProfilePage from './components/CompanyProfilePage';
import OpportunitiesPage from './components/OpportunitiesPage';
import CompanyOpportunityPage from './components/CompanyOpportunityPage';
import AdminPage from './components/AdminPage';
import { apiGet, apiPatch, apiPost, apiDelete } from './services/api';
import './App.css';
import Footer from './components/Footer';

const getHomePath = (role) => {
  if (role === 'admin') return '/admin';
  return role === 'company' ? '/talentos' : '/vagas';
};

function ProtectedRoute({ children, session, allowedRoles }) {
  const location = useLocation();

  if (!session.isRegistered) {
    return <Navigate to="/perfil/novo" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to={getHomePath(session.role)} replace />;
  }

  return children;
}

function AppContent({
  graduates,
  handleCreateCompany,
  handleCreateGraduate,
  handleLogin,
  handleCreateOpportunity,
  handleApplyOpportunity,
  handleWithdrawOpportunity,
  handleStudentMovedToInternship,
  handleUpdateProfile,
  handleLogout,
  opportunities,
  session,
}) {
  const location = useLocation();
  const showFooter = location.pathname === '/';
  const homePath = session.isRegistered ? (session.role === 'company' ? '/talentos' : '/vagas') : '/';

  const footerSections = [
    {
      title: 'Sobre a plataforma',
      links: ['Sobre nós', 'Missão e visão', 'Como funciona', 'Verificação de perfis', 'Privacidade'],
    },
    {
      title: 'Para estudantes',
      links: ['Criar perfil', 'Vagas por área', 'Portfólio', 'LinkedIn', 'Declaração universitária'],
    },
    {
      title: 'Para empresas',
      links: ['Pesquisar talentos', 'Publicar vagas', 'Marcar entrevista', 'Conferência online'],
    },
    {
      title: 'Comunidade',
      links: ['Guias de carreira', 'Eventos', 'Notícias', 'Ajuda'],
    },
  ];

  const [companySearch, setCompanySearch] = useState('');

  useEffect(() => {
    if (session.role !== 'student' || location.pathname !== '/vagas') {
      setCompanySearch('');
    }
  }, [location.pathname, session.role]);

  return (
    <div className="app-container">
      <Header
        session={session}
        onLogout={handleLogout}
        companySearch={companySearch}
        onCompanySearchChange={setCompanySearch}
      />
      <Routes>
        <Route
          path="/"
          element={session.isRegistered ? <Navigate to={homePath} replace /> : <HomePage graduates={graduates} opportunities={opportunities} session={session} />}
        />
        <Route
          path="/login"
          element={session.isRegistered ? <Navigate to={homePath} replace /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/perfil/novo"
          element={session.isRegistered ? <Navigate to={homePath} replace /> : (
            <ProfileCreatePage
              onCreateCompany={handleCreateCompany}
              onCreateGraduate={handleCreateGraduate}
            />
          )}
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute session={session}>
              <ProfilePage
                session={session}
                onProfileUpdated={handleUpdateProfile}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/talentos"
          element={
            <ProtectedRoute session={session} allowedRoles={['company']}>
              <TalentsPage graduates={graduates} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/talentos/:id"
          element={
            <ProtectedRoute session={session} allowedRoles={['company']}>
              <StudentProfilePage
                graduates={graduates}
                session={session}
                onStudentMovedToInternship={handleStudentMovedToInternship}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vagas"
          element={
            <ProtectedRoute session={session} allowedRoles={['student']}>
              <OpportunitiesPage
                graduates={graduates}
                opportunities={opportunities}
                session={session}
                companySearch={companySearch}
                onApplyOpportunity={handleApplyOpportunity}
                onWithdrawOpportunity={handleWithdrawOpportunity}
              />
            </ProtectedRoute>
          }
        />
          <Route
            path="/empresas/:id"
            element={
              <ProtectedRoute session={session} allowedRoles={['student']}>
                <CompanyProfilePage opportunities={opportunities} />
              </ProtectedRoute>
            }
          />
        <Route
          path="/empresas/vagas/nova"
          element={
            <ProtectedRoute session={session} allowedRoles={['company']}>
              <CompanyOpportunityPage onCreateOpportunity={handleCreateOpportunity} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute session={session} allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<ArticlePage />} />
      </Routes>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  const [graduates, setGraduates] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [session, setSession] = useState({
    role: null,
    isRegistered: false,
    profile: null,
  });

  const refreshNetwork = async (currentSession = session) => {
    const studentArea = currentSession.role === 'student' ? currentSession.profile?.course : '';
    const studentId = currentSession.role === 'student' ? currentSession.profile?.id : '';
    const companyId = currentSession.role === 'company' ? currentSession.profile?.id : '';
    const opportunityParams = new URLSearchParams();
    if (studentArea) opportunityParams.set('area', studentArea);
    if (studentId) opportunityParams.set('studentId', studentId);
    const [students, vacancies] = await Promise.all([
      apiGet(`/api/students${companyId ? `?companyId=${companyId}` : ''}`),
      apiGet(`/api/opportunities${opportunityParams.toString() ? `?${opportunityParams.toString()}` : ''}`),
    ]);
    setGraduates(students);
    setOpportunities(vacancies);
  };

  useEffect(() => {
    const savedSession = window.localStorage.getItem('gradnexion-session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      setSession(parsed);
      refreshNetwork(parsed).catch(console.error);
      return;
    }
    refreshNetwork({ role: null, profile: null }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeRegistration = async (newSession) => {
    setSession(newSession);
    window.localStorage.setItem('gradnexion-session', JSON.stringify(newSession));
    await refreshNetwork(newSession);
  };

  const handleLogin = async ({ username, password }) => {
    const newSession = await apiPost('/api/auth/login', { username, password });
    await completeRegistration(newSession);
    return newSession;
  };

  const handleCreateGraduate = async (formData) => {
    const newSession = await apiPost('/api/students', formData);
    await completeRegistration(newSession);
    return newSession;
  };

  const handleCreateCompany = async (formData) => {
    const newSession = await apiPost('/api/companies', formData);
    await completeRegistration(newSession);
    return newSession;
  };

  const handleLogout = () => {
    setSession({ role: null, isRegistered: false, profile: null });
    window.localStorage.removeItem('gradnexion-session');
    setGraduates([]);
    setOpportunities([]);
    refreshNetwork({ role: null, profile: null }).catch(console.error);
  };

  const handleUpdateProfile = async (formData) => {
    const endpoint = session.role === 'company'
      ? `/api/companies/${session.profile.id}`
      : `/api/students/${session.profile.id}`;
    const newSession = await apiPatch(endpoint, formData);
    await completeRegistration(newSession);
    return newSession;
  };

  const handleCreateOpportunity = async (opportunity) => {
    await apiPost('/api/opportunities', {
      ...opportunity,
      companyId: session.profile.id,
    });
    await refreshNetwork(session);
  };

  const handleApplyOpportunity = async (opportunityId) => {
    if (session.role !== 'student' || !session.profile?.id) return;
    await apiPost(`/api/opportunities/${opportunityId}/applications`, {
      studentId: session.profile.id,
    });
    await refreshNetwork(session);
  };

  const handleWithdrawOpportunity = async (opportunityId) => {
    if (session.role !== 'student' || !session.profile?.id) return;
    await apiDelete(`/api/opportunities/${opportunityId}/applications`, {
      studentId: session.profile.id,
    });
    await refreshNetwork(session);
  };

  const handleStudentMovedToInternship = () => {
    setSession((current) => {
      if (current.role !== 'company') return current;
      const next = {
        ...current,
        profile: {
          ...current.profile,
          internshipCount: Number(current.profile.internshipCount ?? 0) + 1,
        },
      };
      window.localStorage.setItem('gradnexion-session', JSON.stringify(next));
      return next;
    });
  };

  return (
    <Router>
      <AppContent
        graduates={graduates}
        handleCreateCompany={handleCreateCompany}
        handleCreateGraduate={handleCreateGraduate}
        handleLogin={handleLogin}
        handleCreateOpportunity={handleCreateOpportunity}
        handleApplyOpportunity={handleApplyOpportunity}
        handleWithdrawOpportunity={handleWithdrawOpportunity}
        handleStudentMovedToInternship={handleStudentMovedToInternship}
        handleUpdateProfile={handleUpdateProfile}
        handleLogout={handleLogout}
        opportunities={opportunities}
        session={session}
      />
    </Router>
  );
}

export default App;
