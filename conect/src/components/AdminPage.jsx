// src/components/AdminPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../services/api';
import './HomePage.css';

const tabs = [
  { id: 'students', label: 'Estudantes' },
  { id: 'companies', label: 'Empresas' },
  { id: 'opportunities', label: 'Vagas' },
  { id: 'interviews', label: 'Entrevistas' },
  { id: 'logs', label: 'Logs' },
];

const statusLabel = {
  requested: 'Solicitada',
  scheduled: 'Marcada',
  internship_started: 'Estágio iniciado',
  rejected: 'Rejeitada',
  completed: 'Concluída',
};

function formatDate(value) {
  if (!value) return 'Sem data';
  return new Intl.DateTimeFormat('pt-AO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function AdminPage() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [loadingStatus, setLoadingStatus] = useState('A carregar painel...');

  useEffect(() => {
    apiGet('/api/admin/overview')
      .then((payload) => {
        setData(payload);
        setLoadingStatus('');
      })
      .catch((error) => setLoadingStatus(error.message));
  }, []);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    const rows = data[activeTab] ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        Object.values(row)
          .flat()
          .filter((value) => value !== null && value !== undefined)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === 'Todos' ||
        row.status === statusFilter ||
        String(row.statusCode) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, data, searchTerm, statusFilter]);

  const statuses = useMemo(() => {
    if (!data) return [];
    return [...new Set((data[activeTab] ?? []).map((row) => row.status ?? row.statusCode).filter(Boolean))];
  }, [activeTab, data]);

  if (!data) {
    return (
      <main className="admin-shell">
        <section className="admin-loading">{loadingStatus}</section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">metro<span>cery</span></div>
        <nav aria-label="Administração">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'is-active' : ''}
              onClick={() => {
                setActiveTab(tab.id);
                setStatusFilter('Todos');
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Pesquisar em todo o painel"
          />
          <span>{formatDate(new Date().toISOString())}</span>
        </div>

        <div className="admin-title-row">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Painel geral</h1>
          </div>
          <strong>{filteredRows.length} registos</strong>
        </div>

        <div className="admin-stat-grid">
          <article><span>Estudantes</span><strong>{data.totals.students}</strong></article>
          <article><span>Empresas</span><strong>{data.totals.companies}</strong></article>
          <article><span>Vagas</span><strong>{data.totals.opportunities}</strong></article>
          <article><span>Entrevistas</span><strong>{data.totals.interviews}</strong></article>
          <article><span>Logs</span><strong>{data.totals.logs}</strong></article>
        </div>

        <div className="admin-filter-row">
          <div className="admin-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'is-active' : ''}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatusFilter('Todos');
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>Todos</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel[status] ?? status}
              </option>
            ))}
          </select>
        </div>

        <AdminTable activeTab={activeTab} rows={filteredRows} />
      </section>
    </main>
  );
}

function AdminTable({ activeTab, rows }) {
  if (rows.length === 0) {
    return <p className="empty-state">Nenhum registo encontrado para estes filtros.</p>;
  }

  if (activeTab === 'students') {
    return (
      <div className="admin-card-list">
        {rows.map((student) => (
          <article className="admin-profile-card" key={student.id}>
            <span className="admin-avatar">{student.name?.slice(0, 2).toUpperCase()}</span>
            <div>
              <h2>{student.name}</h2>
              <p>{student.course} · Turma {student.year}</p>
              <small>{student.email} · {student.university}</small>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (activeTab === 'companies') {
    return (
      <div className="admin-table">
        {rows.map((company) => (
          <article key={company.id}>
            <strong>{company.company}</strong>
            <span>{company.sector}</span>
            <span>{company.city}, {company.province}</span>
            <span>{company.internshipCount} estágios</span>
          </article>
        ))}
      </div>
    );
  }

  if (activeTab === 'opportunities') {
    return (
      <div className="admin-opportunity-grid">
        {rows.map((opportunity) => (
          <article className="admin-opportunity-card" key={opportunity.id}>
            <span>{opportunity.company}</span>
            <h2>{opportunity.title}</h2>
            <p>{opportunity.area} · {opportunity.mode} · {opportunity.location}</p>
            <small>Prazo: {opportunity.deadline}</small>
          </article>
        ))}
      </div>
    );
  }

  if (activeTab === 'interviews') {
    return (
      <div className="admin-table">
        {rows.map((interview) => (
          <article key={interview.id}>
            <strong>{interview.studentName}</strong>
            <span>{interview.companyName}</span>
            <span>{interview.mode}</span>
            <span>{statusLabel[interview.status] ?? interview.status}</span>
            {interview.meetingUrl && <a href={interview.meetingUrl} target="_blank" rel="noreferrer">Meet</a>}
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-log-list">
      {rows.map((log) => (
        <article key={log.id}>
          <strong>{log.method} {log.path}</strong>
          <span>{log.statusCode} · {log.durationMs}ms · {formatDate(log.createdAt)}</span>
          <small>{log.userAgent || 'Sem user-agent'}</small>
        </article>
      ))}
    </div>
  );
}

export default AdminPage;
