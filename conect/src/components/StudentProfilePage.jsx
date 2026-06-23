// src/components/StudentProfilePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { apiGet, apiPatch, apiPost } from '../services/api';
import {
  Code2,
  FileUser,
  Rocket,
  ArrowLeft,
  Video,
  Briefcase,
  Award,
  GraduationCap,
  Mail,
  Phone
} from 'lucide-react';

// Custom inline SVG brand icons
const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

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

function getHighlights(role) {
  const normalizedRole = (role || "").toLowerCase();

  if (normalizedRole.includes("ui") || normalizedRole.includes("front-end") || normalizedRole.includes("frontend") || normalizedRole.includes("design")) {
    return [
      "Interfaces digitais",
      "Experiência do utilizador",
      "Front-end moderno",
      "Design orientado a produto",
    ];
  }

  if (normalizedRole.includes("backend") || normalizedRole.includes("devops") || normalizedRole.includes("sistemas") || normalizedRole.includes("rede") || normalizedRole.includes("telecomunicações")) {
    return [
      "APIs e serviços",
      "Infraestrutura",
      "Automação de deploy",
      "Arquitetura escalável",
    ];
  }

  if (normalizedRole.includes("data") || normalizedRole.includes("ai") || normalizedRole.includes("dados") || normalizedRole.includes("analista")) {
    return [
      "Análise de dados",
      "Modelos inteligentes",
      "Visão computacional",
      "Decisão baseada em dados",
    ];
  }

  if (normalizedRole.includes("mobile") || normalizedRole.includes("móvel")) {
    return [
      "Aplicações móveis",
      "Experiência multiplataforma",
      "Performance",
      "Produto digital",
    ];
  }

  return [
    "Desenvolvimento de software",
    "Resolução de problemas",
    "Trabalho em equipa",
    "Entrega de valor",
  ];
}

function getSoftSkills(course) {
  const norm = (course || '').toLowerCase();
  if (norm.includes('informática') || norm.includes('telecomunicações') || norm.includes('redes')) {
    return ['Resolução de Problemas', 'Trabalho em Equipa', 'Pensamento Crítico', 'Autodidatismo', 'Comunicação Clara'];
  }
  if (norm.includes('contabilidade') || norm.includes('finanças') || norm.includes('gestão')) {
    return ['Atenção ao Detalhe', 'Raciocínio Analítico', 'Organização', 'Trabalho Sob Pressão', 'Ética Profissional'];
  }
  if (norm.includes('direito') || norm.includes('criminais')) {
    return ['Comunicação e Oratória', 'Pesquisa Jurídica', 'Negociação', 'Pensamento Crítico', 'Resolução de Conflitos'];
  }
  if (norm.includes('hotelaria') || norm.includes('turismo') || norm.includes('logística')) {
    return ['Orientação ao Cliente', 'Trabalho Sob Pressão', 'Comunicação Interpessoal', 'Flexibilidade', 'Resolução de Problemas'];
  }
  return ['Comunicação', 'Trabalho em Equipa', 'Proatividade', 'Resolução de Problemas', 'Organização'];
}

function getFeaturedProjects(student) {
  const projects = [];
  
  if (student.project) {
    projects.push({
      name: student.project,
      description: 'Trabalho de Conclusão de Curso / Projeto Académico Principal',
      url: student.portfolioUrl || '#'
    });
  }

  if (student.productionProjects && Array.isArray(student.productionProjects)) {
    student.productionProjects.forEach((proj) => {
      if (typeof proj === 'string') {
        projects.push({
          name: proj,
          description: 'Projeto em produção desenvolvido pelo estudante.',
          url: student.portfolioUrl || '#'
        });
      } else if (proj && typeof proj === 'object') {
        projects.push({
          name: proj.name || 'Projeto Sem Nome',
          description: proj.description || 'Projeto em produção desenvolvido pelo estudante.',
          url: proj.url || '#'
        });
      }
    });
  }

  return projects;
}

function getHost(url) {
  if (!url) return "";
  try {
    if (/^https?:\/\//.test(url)) return new URL(url).hostname;
  } catch {
    return "";
  }
  return "";
}

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
  const isStudentOnline = Boolean(student?.isOnline || student?.online || student?.is_online);

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
        scheduledAt: interviewDate || null,
        notes: interviewMessage || null,
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
      console.error('Erro ao marcar estágio:', error.message);
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
      console.error('Erro ao cancelar estágio:', error.message);
    }
  };

  const isPortfolioExternal =
    !!student.portfolioUrl && /^https?:\/\//.test(student.portfolioUrl);

  const highlights = getHighlights(student.role);
  const softSkills = getSoftSkills(student.course);
  const featuredProjects = getFeaturedProjects(student);
  const slug = student.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <main className="min-h-dvh bg-white font-sans">
      <header className="pt-0">
        <div className="relative w-full overflow-hidden">
          <div className="grid min-h-[30rem] items-stretch grid-cols-1 pot:grid-cols-[40%_60%]">
            
            {/* Left Photo Column */}
            <div className="h-full bg-zinc-900">
              <div className="relative h-full min-h-[22rem]">
                {student.photoUrl ? (
                  <div
                    style={{
                      backgroundImage: `url("${student.photoUrl}")`,
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center center',
                    }}
                    className="h-full min-h-[22rem] bg-center bg-cover rounded-none"
                  />
                ) : (
                  <div className="h-full min-h-[22rem] bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center text-white p-6">
                    <span className="text-7xl font-bold tracking-wider">{getInitials(student.name)}</span>
                    <span className="mt-4 text-xs text-white/50 font-semibold uppercase tracking-widest text-center">{student.university}</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4 bg-zinc-950/85 text-white rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                  <span className={`size-2 rounded-full ${isStudentOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                  <span>{isStudentOnline ? 'Disponível' : 'Offline'}</span>
                </div>
              </div>
            </div>

            {/* Right Student Info Column */}
            <section className="relative flex items-center h-full bg-zinc-950 px-6 pt-12 pb-10 pot:px-16 pot:pt-16 pot:pb-14">
              <Link
                to="/talentos"
                className="absolute top-4 right-4 pot:top-6 pot:right-8 z-30 inline-flex items-center gap-2 rounded-lg bg-design px-4 py-2.5 text-sm font-semibold text-design-1 hover:bg-design-dark transition-colors shadow-sm"
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Link>
              
              <div className="max-w-3xl w-full">
                <div className="flex items-center gap-2 text-design font-semibold text-sm tracking-wider uppercase">
                  <GraduationCap className="size-4" />
                  <span>{student.university} · Turma de {student.year}</span>
                </div>
                
                <h1 className="mt-3 pot:text-5xl text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {student.name}
                </h1>
                <p className="mt-2.5 text-xl font-medium text-white/80">{student.role} · <span className="text-white/60">{student.course}</span></p>
                
                {slug === "ana-sobrinho" ? (
                  <div className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-350">
                    <p className="text-sm font-semibold text-white/80">
                      Idade: 21 anos
                    </p>
                    <p className="mt-2">
                      Profissional dinâmica com excelente ritmo de entrega,
                      pensamento crítico e foco em resultados práticos.
                      Adaptável e comunicativa, pronta para contribuir em várias
                      áreas da tecnologia.
                    </p>
                    <p className="mt-4 text-sm font-medium">
                      <a
                        href="https://insutec.ao/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-white hover:text-white underline decoration-design underline-offset-4"
                      >
                        Bacharel em Engenharia Informática e Sistemas de Informação — INSUTEC
                      </a>
                    </p>
                  </div>
                ) : (
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
                    {student.quote ||
                      "Perfil com base prática, pensamento crítico e ritmo de entrega. Forte capacidade de adaptação, comunicação clara e foco em resultados úteis para equipas que precisam avançar."}
                  </p>
                )}

                {/* Contacts Row */}
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
                  {student.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-4 text-design" />
                      {student.email}
                    </span>
                  )}
                  {student.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-4 text-design" />
                      {student.phone}
                    </span>
                  )}
                </div>
                
                {/* Social/CV Actions Row */}
                <div className="mt-8 flex flex-wrap gap-3">
                  {student.linkedinUrl && (
                    <a
                      href={student.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition-colors bg-white/5 hover:bg-white/10"
                    >
                      <LinkedinIcon className="size-4 text-sky-400" />
                      LinkedIn
                    </a>
                  )}
                  {student.portfolioUrl &&
                    (isPortfolioExternal ? (
                      <a
                        href={student.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition-colors bg-white/5 hover:bg-white/10"
                      >
                        <Rocket className="size-4 text-design" />
                        Portfólio
                      </a>
                    ) : (
                      <Link
                        to={student.portfolioUrl}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition-colors bg-white/5 hover:bg-white/10"
                      >
                        <Rocket className="size-4 text-design" />
                        Portfólio
                      </Link>
                    ))}
                  {student.githubUrl && (
                    <a
                      href={student.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition-colors bg-white/5 hover:bg-white/10"
                    >
                      <GithubIcon className="size-4" />
                      GitHub
                    </a>
                  )}
                  {student.universityDeclarationUrl && (
                    <a
                      href={student.universityDeclarationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition-colors bg-white/5 hover:bg-white/10"
                    >
                      <FileUser className="size-4 text-design" />
                      Declaração Académica
                    </a>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </header>

      {/* Main Grid Content Section */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 ret:grid-cols-[2fr_1fr] gap-8 items-start">
          
          {/* Left Grid Area: Skills, Projects, Domínios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            
            {/* Featured Projects Card */}
            <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-6 flex flex-col h-full shadow-sm">
              <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2 mb-4 border-b border-zinc-100 pb-2">
                <Code2 className="size-5 text-design" />
                Projetos em destaque
              </h2>
              <div className="flex-1">
                {featuredProjects.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {featuredProjects.map((project) => (
                      <a
                        key={project.name}
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group block rounded-lg p-3 bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <Code2 className="size-4 text-design mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-zinc-950 truncate group-hover:text-design transition-colors">
                              {project.name}
                            </h3>
                            <p className="mt-1 text-xs text-zinc-500 m-0 line-clamp-3 leading-relaxed">
                              {project.description}
                            </p>
                            {getHost(project.url) && (
                              <p className="mt-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                {getHost(project.url)}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-zinc-400">Sem projetos em destaque.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hard Skills Card */}
            <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-6 flex flex-col h-full shadow-sm">
              <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2 mb-4 border-b border-zinc-100 pb-2">
                <Award className="size-5 text-design" />
                Hard skills
              </h2>
              <div className="flex-1">
                {student.skills && student.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-white border border-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-zinc-400">Sem hard skills listadas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Soft Skills Card */}
            <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-6 flex flex-col h-full shadow-sm">
              <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2 mb-4 border-b border-zinc-100 pb-2">
                <Award className="size-5 text-design" />
                Soft skills
              </h2>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-white border border-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Áreas de Domínio Card */}
            <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-6 flex flex-col h-full shadow-sm">
              <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2 mb-4 border-b border-zinc-100 pb-2">
                <Code2 className="size-5 text-design" />
                Áreas de domínio
              </h2>
              <div className="flex-1 flex flex-col gap-2.5">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg bg-white border border-zinc-200 p-3 flex items-start gap-2.5 shadow-sm"
                  >
                    <Code2 className="size-4 text-design mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-zinc-800 m-0">{item}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Grid Area: Recruitment / Jitsi panel for companies */}
          {session?.role === 'company' ? (
            <aside className="w-full">
              <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-6 flex flex-col gap-5 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2 border-b border-zinc-200 pb-3">
                  <Briefcase className="size-5 text-design" />
                  Painel de Recrutamento
                </h2>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tipo de Entrevista</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                        interviewMode === 'Presencial'
                          ? 'bg-design border-design text-white shadow-sm'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                      onClick={() => setInterviewMode('Presencial')}
                    >
                      Presencial
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                        interviewMode === 'Via plataforma'
                          ? 'bg-design border-design text-white shadow-sm'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                      onClick={() => setInterviewMode('Via plataforma')}
                    >
                      Via plataforma
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Data da entrevista</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-sm text-zinc-800 focus:border-design focus:outline-none focus:ring-1 focus:ring-design"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Mensagem / Notas</label>
                    <textarea
                      className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-sm text-zinc-800 focus:border-design focus:outline-none focus:ring-1 focus:ring-design resize-none"
                      value={interviewMessage}
                      onChange={(e) => setInterviewMessage(e.target.value)}
                      placeholder="Detalhes sobre a entrevista..."
                      rows={3}
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-zinc-950 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                    onClick={() => handleSchedule(interviewMode)}
                  >
                    Marcar Entrevista
                  </button>
                </div>

                {interview && (interview.scheduled_at || interview.scheduledAt) && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3.5 text-sm text-emerald-800 flex flex-col gap-1 shadow-sm">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Entrevista Agendada
                    </div>
                    <div>
                      <strong>Data:</strong> {new Date(interview.scheduled_at || interview.scheduledAt).toLocaleDateString('pt-AO')}
                    </div>
                    {(interview.notes || interview.message) && (
                      <div>
                        <strong>Msg:</strong> {interview.notes || interview.message}
                      </div>
                    )}
                  </div>
                )}

                {interviewMode === 'Via plataforma' && hasOnlineInterview && (
                  <a
                    href={conferenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-lg bg-design py-2.5 text-sm font-semibold text-white hover:bg-design-dark transition-colors shadow-sm text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="size-4" />
                    Abrir Sala de Conferência
                  </a>
                )}

                <div className="border-t border-zinc-200 pt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    className={`w-full rounded-lg py-2.5 text-sm font-bold border transition-all cursor-pointer ${
                      activeInternship
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                    onClick={handleStartInternship}
                    disabled={!interview && !activeInternship}
                  >
                    {activeInternship ? 'Estágio Ativo' : 'Aprovar para Estágio'}
                  </button>

                  {activeInternship && (
                    <button
                      type="button"
                      className="w-full rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                      onClick={handleCancelInternship}
                    >
                      Cancelar Estágio
                    </button>
                  )}
                </div>
              </div>
            </aside>
          ) : (
            <aside className="w-full">
              <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-6 flex flex-col gap-4 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-950 border-b border-zinc-200 pb-2">
                  Estado do Perfil
                </h2>
                <div className="text-sm text-zinc-600 leading-relaxed flex flex-col gap-3">
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 rounded-lg p-3 border border-emerald-100">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">Mural active & visível</span>
                  </div>
                  <p>
                    Este perfil universitário está publicado de forma síncrona na plataforma e disponível para análise de empresas parceiras (Bancos, Telecomunicações e Oil & Gas) do ecossistema corporativo angolano.
                  </p>
                </div>
              </div>
            </aside>
          )}

        </div>
      </section>
    </main>
  );
}

export default StudentProfilePage;
