// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loginBackground from '../assets/imagem/rede_independente.png';
import './HomePage.css';

const RequiredMark = () => <span className="required-mark" aria-label="obrigatório">*</span>;

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');

    try {
      const session = await onLogin({ username, password });
      navigate(session.role === 'admin' ? '/admin' : session.role === 'student' ? '/vagas' : '/talentos');
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="homepage-main page-shell login-page">
      <section className="login-layout login-visual" style={{ backgroundImage: `url(${loginBackground})` }}>
        <div className="publish-copy">
          <p className="eyebrow">Acesso</p>
          <h2>Entrar na rede</h2>
          <p>
            Acede à tua conta para continuar para a área de estudante ou para a área da empresa.
          </p>
        </div>

        <form className="publish-form login-form" onSubmit={handleSubmit}>
          <label>
            <span>Username <RequiredMark /></span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="ex.: asobrinho"
              required
            />
          </label>
          <label>
            <span>Senha <RequiredMark /></span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="A tua senha"
              required
            />
          </label>
          <button type="submit">Entrar</button>
          {status && <p className="form-footnote">{status}</p>}
          <p className="form-footnote">
            Novo estudante? <Link to="/perfil/novo">Criar perfil</Link>. Empresa?{' '}
            <Link to="/perfil/novo">Criar conta</Link>.
          </p>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
