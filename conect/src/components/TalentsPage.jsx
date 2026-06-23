// src/components/TalentsPage.jsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import { Search, Rocket, ExternalLink, GraduationCap, Award, BookOpen } from 'lucide-react';

// Custom inline SVG brand icon
const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

function getCourseGradient(course) {
  const norm = (course || '').toLowerCase();
  if (norm.includes('informática') || norm.includes('sistemas')) {
    return 'from-blue-600 to-indigo-955';
  }
  if (norm.includes('redes') || norm.includes('telecomunicações')) {
    return 'from-purple-650 to-indigo-955';
  }
  if (norm.includes('contabilidade') || norm.includes('finanças')) {
    return 'from-emerald-600 to-teal-950';
  }
  if (norm.includes('direito') || norm.includes('criminais')) {
    return 'from-rose-800 to-zinc-955';
  }
  if (norm.includes('recursos humanos') || norm.includes('gestão')) {
    return 'from-pink-650 to-purple-950';
  }
  return 'from-zinc-700 to-zinc-950';
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function TalentsPage({ graduates }) {
  const [selectedCourse, setSelectedCourse] = useState(t.common.all);
  const [searchTerm, setSearchTerm] = useState('');
  const courses = journalContent.courseAreas.map((course) => course.name);

  const filteredGraduates = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return graduates.filter((graduate) => {
      const matchesCourse = selectedCourse === t.common.all || graduate.course === selectedCourse;
      const searchable = [
        graduate.name,
        graduate.course,
        graduate.role,
        graduate.company,
        graduate.quote,
        ...(graduate.skills ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return matchesCourse && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [graduates, searchTerm, selectedCourse]);

  return (
    <main className="min-h-screen bg-zinc-50 py-10 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <header className="mb-10 text-center pot:text-left flex flex-col pot:flex-row pot:items-end pot:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              Talentos Universitários
            </h1>
            <p className="mt-2 text-zinc-500 text-base leading-relaxed">
              Descobre e conecta-te com finalistas e recém-licenciados preparados para estágios e projetos reais.
            </p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full pot:w-80 flex-shrink-0">
            <Search className="absolute left-3.5 top-3 size-4 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar nome, curso, skill..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:border-design focus:outline-none focus:ring-1 focus:ring-design shadow-sm"
            />
          </div>
        </header>

        {/* Course Filters */}
        <section className="mb-10" aria-label="Filtro de Cursos">
          <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setSelectedCourse(t.common.all)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
                selectedCourse === t.common.all
                  ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
              }`}
            >
              {t.common.all}
            </button>
            {courses.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap ${
                  selectedCourse === course
                    ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300'
                }`}
              >
                {course}
              </button>
            ))}
          </div>
        </section>

        {/* Graduates Grid */}
        <section aria-label="Mural de Talentos">
          {filteredGraduates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGraduates.map((graduate) => {
                const hasCompanyLogo = !!(graduate.companyLogo || graduate.companyLogoUrl || (graduate.company && graduate.company.logo));
                const companyLogo = graduate.companyLogo || graduate.companyLogoUrl || (graduate.company && graduate.company.logo);
                const isStudentOnline = Boolean(graduate.isOnline || graduate.online || graduate.is_online);

                return (
                  <article
                    className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all"
                    key={graduate.id}
                  >
                    
                    {/* Cover Gradient Area */}
                    <div className={`h-28 bg-gradient-to-br ${getCourseGradient(graduate.course)} relative p-4 flex justify-between items-start`}>
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest bg-white/10 backdrop-blur-md rounded-md px-2 py-1">
                        {graduate.course.split(' ')[0]}
                      </span>
                      {isStudentOnline && (
                        <div className="bg-zinc-950/80 text-white rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm border border-white/10 flex items-center gap-1 shadow-sm">
                          <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Online</span>
                        </div>
                      )}
                    </div>

                    {/* Avatar Wrapper */}
                    <div className="relative -mt-10 px-4 flex items-end justify-between">
                      <div className="size-16 rounded-xl border-4 border-white bg-zinc-100 overflow-hidden shadow-sm flex items-center justify-center">
                        {graduate.photoUrl ? (
                          <img
                            className="size-full object-cover"
                            src={graduate.photoUrl}
                            alt={graduate.name}
                          />
                        ) : (
                          <span className="text-xl font-extrabold text-zinc-500">{getInitials(graduate.name)}</span>
                        )}
                      </div>

                      {graduate.company && (
                        <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm max-w-[55%]">
                          {hasCompanyLogo ? (
                            <img src={companyLogo} alt={graduate.company} className="size-3.5 rounded object-contain flex-shrink-0" />
                          ) : (
                            <BookOpen className="size-3 text-design flex-shrink-0" />
                          )}
                          <span className="truncate">{graduate.company}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-design uppercase tracking-wider">{graduate.course}</span>
                        <h3 className="mt-1 text-base font-extrabold text-zinc-900 group-hover:text-design transition-colors truncate">
                          {graduate.name}
                        </h3>
                        <p className="text-sm text-zinc-600 font-medium truncate mt-0.5">
                          {graduate.role}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                          <GraduationCap className="size-3.5" />
                          <span className="truncate">{graduate.university} · Turma {graduate.year}</span>
                        </div>

                        {/* Skills preview tags */}
                        {graduate.skills && graduate.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {graduate.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center rounded-md bg-zinc-50 border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-600"
                              >
                                {skill}
                              </span>
                            ))}
                            {graduate.skills.length > 3 && (
                              <span className="text-[10px] font-bold text-zinc-400 px-1 self-center">
                                +{graduate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {graduate.linkedinUrl && (
                            <a
                              href={graduate.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="size-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-sky-600 hover:border-sky-200 transition-colors bg-zinc-50/50 hover:bg-sky-50"
                              aria-label={`LinkedIn de ${graduate.name}`}
                            >
                              <LinkedinIcon className="size-4" />
                            </a>
                          )}
                          {graduate.portfolioUrl && (
                            <a
                              href={graduate.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="size-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-design hover:border-red-200 transition-colors bg-zinc-50/50 hover:bg-red-50"
                              aria-label={`Portfólio de ${graduate.name}`}
                            >
                              <Rocket className="size-4" />
                            </a>
                          )}
                        </div>

                        <Link
                          to={`/talentos/${graduate.id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          Ver perfil
                          <ExternalLink className="size-3" />
                        </Link>
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl shadow-sm">
              <p className="text-zinc-500 font-medium">Nenhum talento disponível para estes filtros.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default TalentsPage;
