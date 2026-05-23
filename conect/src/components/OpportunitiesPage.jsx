// src/components/OpportunitiesPage.jsx
import React, { useMemo, useState } from 'react';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import { getDistanceInKm, radiusOptions } from '../utils/location';
import './HomePage.css';

function OpportunitiesPage({ graduates, opportunities, session }) {
  const studentCourse = session?.profile?.course;
  const [selectedCourse, setSelectedCourse] = useState(studentCourse || t.common.all);
  const [opportunitySearch, setOpportunitySearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(t.common.all);
  const [selectedMode, setSelectedMode] = useState(t.common.all);
  const [selectedRadius, setSelectedRadius] = useState(t.home.radiusAll);
  const [studentLocation, setStudentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const courses = journalContent.courseAreas.map((course) => course.name);
  const provinces = [...new Set(opportunities.map((opportunity) => opportunity.province))].sort();

  const countMatches = (area, requirements) => {
    return graduates.filter((graduate) => {
      const sameArea = graduate.course === area;
      const hasSkill = graduate.skills.some((skill) =>
        requirements.some((requirement) => skill.toLowerCase().includes(requirement.toLowerCase())),
      );

      return sameArea || hasSkill;
    }).length;
  };

  const filteredOpportunities = useMemo(() => {
    const normalizedSearch = opportunitySearch.trim().toLowerCase();
    const normalizedCompanySearch = companySearch.trim().toLowerCase();

    return opportunities
      .map((opportunity) => ({
        ...opportunity,
        distance:
          studentLocation && opportunity.coordinates
            ? getDistanceInKm(studentLocation, opportunity.coordinates)
            : null,
      }))
      .filter((opportunity) => {
        const matchesStudentArea = !studentCourse || opportunity.area === studentCourse;
        const matchesCourse = selectedCourse === t.common.all || opportunity.area === selectedCourse;
        const matchesProvince =
          selectedProvince === t.common.all || opportunity.province === selectedProvince;
        const matchesMode = selectedMode === t.common.all || opportunity.mode === selectedMode;
        const matchesCompany =
          !normalizedCompanySearch ||
          opportunity.company.toLowerCase().includes(normalizedCompanySearch);
        const matchesRadius =
          selectedRadius === t.home.radiusAll ||
          !studentLocation ||
          (opportunity.distance !== null && opportunity.distance <= Number(selectedRadius));
        const searchable = [
          opportunity.company,
          opportunity.title,
          opportunity.area,
          opportunity.province,
          opportunity.city,
          opportunity.location,
          opportunity.companyAddress,
          opportunity.linkedinUrl,
          opportunity.websiteUrl,
          opportunity.mode,
          opportunity.description,
          ...(opportunity.requirements ?? []),
        ]
          .join(' ')
          .toLowerCase();

        return (
          matchesStudentArea &&
          matchesCourse &&
          matchesProvince &&
          matchesMode &&
          matchesCompany &&
          matchesRadius &&
          (!normalizedSearch || searchable.includes(normalizedSearch))
        );
      })
      .sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }, [
    opportunities,
    companySearch,
    opportunitySearch,
    selectedCourse,
    selectedMode,
    selectedProvince,
    selectedRadius,
    studentLocation,
    studentCourse,
  ]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(t.home.locationStatusError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStudentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus(t.home.locationStatusReady);
      },
      () => {
        setLocationStatus(t.home.locationStatusError);
      },
    );
  };

  return (
    <main className="homepage-main page-shell">
      <section className="section-band">
        <div className="section-heading">
          <p className="eyebrow">{t.home.companiesEyebrow}</p>
          <h2>{t.home.companiesTitle}</h2>
          <p>{t.home.companiesDescription}</p>
        </div>

        <div className="company-search-row">
          <div className="linkedin-note">
            <strong>Empresas verificáveis</strong>
            <p>
              As vagas podem incluir endereço, LinkedIn e site oficial para facilitar a avaliação
              da oportunidade antes da candidatura.
            </p>
          </div>
          <label>
            <span>Pesquisar empresa</span>
            <input
              type="search"
              value={companySearch}
              onChange={(event) => setCompanySearch(event.target.value)}
              placeholder="Nome da empresa..."
            />
          </label>
        </div>

        <div className="opportunity-toolbar">
          <label>
            <span>Pesquisar vaga</span>
            <input
              type="search"
              value={opportunitySearch}
              onChange={(event) => setOpportunitySearch(event.target.value)}
              placeholder={t.home.opportunitySearchPlaceholder}
            />
          </label>
          <label>
            <span>{t.home.course}</span>
            <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}>
              {studentCourse ? (
                <option>{studentCourse}</option>
              ) : (
                <>
                  <option>{t.common.all}</option>
                  {courses.map((course) => (
                    <option key={course}>{course}</option>
                  ))}
                </>
              )}
            </select>
          </label>
          <label>
            <span>{t.home.province}</span>
            <select
              value={selectedProvince}
              onChange={(event) => setSelectedProvince(event.target.value)}
            >
              <option>{t.common.all}</option>
              {provinces.map((province) => (
                <option key={province}>{province}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{t.home.opportunityMode}</span>
            <select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}>
              <option>{t.common.all}</option>
              <option>Presencial</option>
              <option>Híbrido</option>
              <option>Remoto</option>
            </select>
          </label>
          <label>
            <span>{t.home.radius}</span>
            <select
              value={selectedRadius}
              onChange={(event) => setSelectedRadius(event.target.value)}
            >
              <option>{t.home.radiusAll}</option>
              {radiusOptions.map((radius) => (
                <option key={radius} value={radius}>
                  {radius} km
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={handleUseLocation}>
            {t.home.useMyLocation}
          </button>
        </div>

        <p className="opportunity-result-count">
          {filteredOpportunities.length} {t.home.vacanciesFound}
          {locationStatus && <span>{locationStatus}</span>}
        </p>

        <div className="opportunities-grid">
          {filteredOpportunities.map((opportunity) => (
            <article className="opportunity-card" key={opportunity.id}>
              <div className="opportunity-card-header">
                <span>{opportunity.company}</span>
                <strong>{countMatches(opportunity.area, opportunity.requirements)} matches</strong>
              </div>
              <h3>{opportunity.title}</h3>
              <p>{opportunity.description}</p>
              <dl>
                <div>
                  <dt>{t.home.opportunityArea}</dt>
                  <dd>{opportunity.area}</dd>
                </div>
                <div>
                  <dt>{t.home.opportunityLocation}</dt>
                  <dd>{opportunity.location}</dd>
                </div>
                {opportunity.companyAddress && (
                  <div>
                    <dt>Empresa</dt>
                    <dd>{opportunity.companyAddress}</dd>
                  </div>
                )}
                <div>
                  <dt>{t.home.opportunityMode}</dt>
                  <dd>{opportunity.mode}</dd>
                </div>
                <div>
                  <dt>{t.home.opportunityDuration}</dt>
                  <dd>{opportunity.duration}</dd>
                </div>
                <div>
                  <dt>{t.home.opportunityDeadline}</dt>
                  <dd>{opportunity.deadline}</dd>
                </div>
                {opportunity.distance !== null && (
                  <div>
                    <dt>{t.home.radius}</dt>
                    <dd>{Math.round(opportunity.distance)} km</dd>
                  </div>
                )}
              </dl>
              <div className="graduate-meta">
                {opportunity.requirements.map((requirement) => (
                  <span key={requirement}>{requirement}</span>
                ))}
                {opportunity.linkedinUrl && (
                  <a href={opportunity.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
                )}
                {opportunity.websiteUrl && (
                  <a href={opportunity.websiteUrl} target="_blank" rel="noreferrer">Site</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default OpportunitiesPage;
