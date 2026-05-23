// src/components/CompanyOpportunityPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import './HomePage.css';

const initialOpportunityForm = {
  company: '',
  title: '',
  area: 'Informática e Sistemas de Informação',
  province: 'Luanda',
  city: '',
  location: 'Luanda',
  companyAddress: '',
  linkedinUrl: '',
  websiteUrl: '',
  latitude: '-8.8390',
  longitude: '13.2894',
  mode: 'Presencial',
  visibility: 'Mostrar no perfil dos estudantes compatíveis',
  duration: '3 meses',
  deadline: '30 Jun 2026',
  requirements: '',
  description: '',
};

const RequiredMark = () => <span className="required-mark" aria-label="obrigatório">*</span>;

function CompanyOpportunityPage({ onCreateOpportunity }) {
  const [opportunityForm, setOpportunityForm] = useState(initialOpportunityForm);
  const navigate = useNavigate();
  const courses = journalContent.courseAreas.map((course) => course.name);

  const handleOpportunityChange = (event) => {
    const { name, value } = event.target;
    setOpportunityForm((current) => ({ ...current, [name]: value }));
  };

  const handleOpportunitySubmit = (event) => {
    event.preventDefault();

    onCreateOpportunity({
      id: Date.now(),
      company: opportunityForm.company.trim(),
      title: opportunityForm.title.trim(),
      area: opportunityForm.area,
      province: opportunityForm.province,
      city: opportunityForm.city.trim(),
      location: opportunityForm.location.trim(),
      companyAddress: opportunityForm.companyAddress.trim(),
      linkedinUrl: opportunityForm.linkedinUrl.trim(),
      websiteUrl: opportunityForm.websiteUrl.trim(),
      latitude: Number(opportunityForm.latitude),
      longitude: Number(opportunityForm.longitude),
      mode: opportunityForm.mode,
      visibility: opportunityForm.visibility,
      duration: opportunityForm.duration.trim(),
      deadline: opportunityForm.deadline.trim(),
      requirements: opportunityForm.requirements
        .split(',')
        .map((requirement) => requirement.trim())
        .filter(Boolean)
        .slice(0, 5),
      description: opportunityForm.description.trim(),
    });

    navigate('/talentos');
  };

  return (
    <main className="homepage-main page-shell">
      <section className="split-section">
        <div className="publish-copy">
          <p className="eyebrow">{t.home.companiesEyebrow}</p>
          <h2>Publicar vaga com dados completos da empresa</h2>
          <p>
            Adiciona os dados da oportunidade, a localização da empresa e os canais oficiais para
            que os estudantes possam avaliar e contactar a organização com confiança.
          </p>
          <div className="company-form-highlights">
            <div>
              <strong>Perfil verificado</strong>
              <span>Website, LinkedIn e endereço ajudam a validar a empresa.</span>
            </div>
            <div>
              <strong>Matching por curso</strong>
              <span>A vaga aparece para estudantes com formação compatível.</span>
            </div>
          </div>
        </div>

        <form className="publish-form" onSubmit={handleOpportunitySubmit}>
          <label>
            <span>{t.home.companyName} <RequiredMark /></span>
            <input
              name="company"
              value={opportunityForm.company}
              onChange={handleOpportunityChange}
              required
            />
          </label>
          <label>
            <span>{t.home.opportunityTitle} <RequiredMark /></span>
            <input
              name="title"
              value={opportunityForm.title}
              onChange={handleOpportunityChange}
              required
            />
          </label>
          <div className="form-row">
            <label>
              <span>LinkedIn da empresa <RequiredMark /></span>
              <input
                name="linkedinUrl"
                type="url"
                value={opportunityForm.linkedinUrl}
                onChange={handleOpportunityChange}
                placeholder="https://www.linkedin.com/company/..."
                required
              />
            </label>
            <label>
              <span>Site da empresa <RequiredMark /></span>
              <input
                name="websiteUrl"
                type="url"
                value={opportunityForm.websiteUrl}
                onChange={handleOpportunityChange}
                placeholder="https://empresa.com"
                required
              />
            </label>
          </div>
          <label>
            <span>{t.home.opportunityArea} <RequiredMark /></span>
            <select name="area" value={opportunityForm.area} onChange={handleOpportunityChange} required>
              {courses.map((course) => (
                <option key={course}>{course}</option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              <span>{t.home.province} <RequiredMark /></span>
              <input
                name="province"
                value={opportunityForm.province}
                onChange={handleOpportunityChange}
                required
              />
            </label>
            <label>
              <span>{t.home.city} <RequiredMark /></span>
              <input
                name="city"
                value={opportunityForm.city}
                onChange={handleOpportunityChange}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>{t.home.location} <RequiredMark /></span>
              <input
                name="location"
                value={opportunityForm.location}
                onChange={handleOpportunityChange}
                required
              />
            </label>
            <label>
              <span>{t.home.mode} <RequiredMark /></span>
              <select name="mode" value={opportunityForm.mode} onChange={handleOpportunityChange} required>
                <option>Presencial</option>
                <option>Híbrido</option>
                <option>Remoto</option>
              </select>
            </label>
          </div>
          <label>
            <span>Localização da empresa <RequiredMark /></span>
            <input
              name="companyAddress"
              value={opportunityForm.companyAddress}
              onChange={handleOpportunityChange}
              placeholder="Rua, bairro, edifício ou referência"
              required
            />
          </label>
          <label>
            <span>Visibilidade no perfil do estudante <RequiredMark /></span>
            <select
              name="visibility"
              value={opportunityForm.visibility}
              onChange={handleOpportunityChange}
              required
            >
              <option>Mostrar no perfil dos estudantes compatíveis</option>
              <option>Mostrar apenas na página de vagas</option>
            </select>
          </label>
          <div className="form-row">
            <label>
              <span>Latitude <RequiredMark /></span>
              <input
                name="latitude"
                type="number"
                step="0.0001"
                value={opportunityForm.latitude}
                onChange={handleOpportunityChange}
                required
              />
            </label>
            <label>
              <span>Longitude <RequiredMark /></span>
              <input
                name="longitude"
                type="number"
                step="0.0001"
                value={opportunityForm.longitude}
                onChange={handleOpportunityChange}
                required
              />
            </label>
          </div>
          <label>
            <span>{t.home.duration} <RequiredMark /></span>
            <input
              name="duration"
              value={opportunityForm.duration}
              onChange={handleOpportunityChange}
              required
            />
          </label>
          <label>
            <span>{t.home.opportunityDeadline} <RequiredMark /></span>
            <input
              name="deadline"
              value={opportunityForm.deadline}
              onChange={handleOpportunityChange}
              required
            />
          </label>
          <label>
            <span>{t.home.requirements} <RequiredMark /></span>
            <input
              name="requirements"
              value={opportunityForm.requirements}
              onChange={handleOpportunityChange}
              placeholder="React, Excel, Comunicação..."
              required
            />
          </label>
          <label>
            <span>{t.home.description} <RequiredMark /></span>
            <textarea
              name="description"
              value={opportunityForm.description}
              onChange={handleOpportunityChange}
              required
            />
          </label>
          <button type="submit">{t.home.addOpportunity}</button>
        </form>
      </section>
    </main>
  );
}

export default CompanyOpportunityPage;
