// src/components/ProfileCreatePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import journalContent from '../data/journalContent';
import { t } from '../i18n';
import companyBackground from '../assets/imagem/emoresa.png';
import studentBackground from '../assets/imagem/perfil_estudante.png';
import './HomePage.css';

const initialForm = {
  name: '',
  course: 'Informática e Sistemas de Informação',
  year: '2026',
  role: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  company: '',
  university: '',
  portfolioUrl: '',
  linkedinUrl: '',
  quote: '',
  skills: '',
};

const initialCompanyForm = {
  company: '',
  contactName: '',
  password: '',
  confirmPassword: '',
  sector: 'Tecnologia',
  province: 'Luanda',
  city: '',
  description: '',
  registrationNumber: '',
  logoUrl: '',
  websiteUrl: '',
  linkedinUrl: '',
};

const RequiredMark = () => <span className="required-mark" aria-label="obrigatório">*</span>;

function ProfileCreatePage({ onCreateCompany, onCreateGraduate }) {
  const [profileType, setProfileType] = useState('');
  const [form, setForm] = useState(initialForm);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [submitStatus, setSubmitStatus] = useState('');
  const navigate = useNavigate();
  const courses = journalContent.courseAreas.map((course) => course.name);
  const selectedCourse = journalContent.courseAreas.find((course) => course.name === form.course);
  const backgroundImage = profileType === 'company' ? companyBackground : studentBackground;
  const createCopy = !profileType
    ? {
        eyebrow: 'Cadastro',
        title: 'Escolhe o tipo de utilizador',
        description:
          'Começa por escolher se queres cadastrar um estudante ou uma empresa. Depois mostramos apenas o formulário certo.',
      }
    : profileType === 'student'
      ? {
        eyebrow: 'Cadastro de estudante',
        title: 'Mostra o teu talento às empresas certas',
        description:
          'Cria um perfil com provas reais do teu percurso, destaca o teu portfólio e recebe oportunidades alinhadas com a tua área de formação.',
      }
      : {
        eyebrow: 'Cadastro de empresa',
        title: 'Encontra finalistas prontos para entrevista',
        description:
          'Cadastre a empresa, publique vagas e fale diretamente com estudantes validados por universidade, competências e links profissionais.',
      };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCompanyChange = (event) => {
    const { name, value } = event.target;
    setCompanyForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitStatus('');

    try {
      const formData = new FormData(event.currentTarget);
      if (formData.get('password') !== formData.get('confirmPassword')) {
        setSubmitStatus('A senha e a confirmação devem ser iguais.');
        return;
      }
      const session = await onCreateGraduate(formData);
      setSubmitStatus(`Perfil criado. Username: ${session.profile.username}`);
      navigate('/vagas');
    } catch (error) {
      setSubmitStatus(error.message);
    }
  };

  const handleCompanySubmit = async (event) => {
    event.preventDefault();
    setSubmitStatus('');

    try {
      const formData = new FormData(event.currentTarget);
      if (formData.get('password') !== formData.get('confirmPassword')) {
        setSubmitStatus('A senha e a confirmação devem ser iguais.');
        return;
      }
      const session = await onCreateCompany(formData);
      setSubmitStatus(`Empresa criada. Username: ${session.profile.username}`);
      navigate('/talentos');
    } catch (error) {
      setSubmitStatus(error.message);
    }
  };

  return (
    <main className="homepage-main profile-create-page">
      <section
        className="split-section profile-create-visual"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="publish-copy">
          <p className="eyebrow">{createCopy.eyebrow}</p>
          <h2>{createCopy.title}</h2>
          <p>{createCopy.description}</p>
        </div>

        <div className="publish-form">
          {!profileType && (
            <div className="account-choice-grid" aria-label="Escolher tipo de utilizador">
              <button
                type="button"
                className="account-choice-card"
                onClick={() => setProfileType('student')}
              >
                <span>Estudante</span>
              </button>
              <button
                type="button"
                className="account-choice-card"
                onClick={() => setProfileType('company')}
              >
                <span>Empresa</span>
              </button>
            </div>
          )}

          {profileType === 'student' ? (
            <form className="embedded-form" onSubmit={handleSubmit}>
              <button type="button" className="switch-account-button" onClick={() => setProfileType('')}>
                Trocar tipo de utilizador
              </button>
              <label>
                <span>{t.home.fullName} <RequiredMark /></span>
                <input name="name" value={form.name} onChange={handleFormChange} required />
              </label>
              <label>
                <span>{t.home.course} <RequiredMark /></span>
                <select name="course" value={form.course} onChange={handleFormChange} required>
                  {courses.map((course) => (
                    <option key={course}>{course}</option>
                  ))}
                </select>
              </label>
              {selectedCourse && (
                <div className="course-preview">
                  <span>{selectedCourse.theme}</span>
                  <strong>{selectedCourse.name}</strong>
                  <small>{selectedCourse.summary}</small>
                </div>
              )}
              <div className="form-row">
                <label>
                  <span>{t.home.year} <RequiredMark /></span>
                  <input
                    name="year"
                    type="number"
                    min="2000"
                    max="2035"
                    value={form.year}
                    onChange={handleFormChange}
                    required
                  />
                </label>
                <label>
                  <span>{t.home.currentArea} <RequiredMark /></span>
                  <input name="role" value={form.role} onChange={handleFormChange} required />
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>Email <RequiredMark /></span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                  />
                </label>
                <label>
                  <span>Telefone <RequiredMark /></span>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFormChange}
                    required
                  />
                </label>
              </div>
              <label>
                <span>Senha <RequiredMark /></span>
                <input
                  name="password"
                  type="password"
                  minLength="6"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </label>
              <label>
                <span>Confirmar senha <RequiredMark /></span>
                <input
                  name="confirmPassword"
                  type="password"
                  minLength="6"
                  value={form.confirmPassword}
                  onChange={handleFormChange}
                  placeholder="Repete a senha"
                  required
                />
              </label>
              <label>
                {t.home.companyOrProject}
                <input
                  name="company"
                  value={form.company}
                  onChange={handleFormChange}
                  placeholder={t.home.companyOrProjectPlaceholder}
                />
              </label>
              <div className="form-row">
                <label>
                  <span>Universidade <RequiredMark /></span>
                  <input
                    name="university"
                    value={form.university}
                    onChange={handleFormChange}
                    placeholder="Ex.: INSUTEC, ISPTEC, UAN..."
                    required
                  />
                </label>
                <label>
                  Fotografia
                  <input
                    name="photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                  />
                </label>
              </div>
              <label>
                <span>Declaração da universidade <RequiredMark /></span>
                <input
                  name="declaration"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  required
                />
              </label>
              <div className="form-row">
                <label>
                  Portfólio
                  <input
                    name="portfolioUrl"
                    type="url"
                    value={form.portfolioUrl}
                    onChange={handleFormChange}
                    placeholder="https://..."
                  />
                </label>
                <label>
                  LinkedIn
                  <input
                    name="linkedinUrl"
                    type="url"
                    value={form.linkedinUrl}
                    onChange={handleFormChange}
                    placeholder="https://linkedin.com/in/..."
                  />
                </label>
              </div>
              <label>
                <span>{t.home.quote} <RequiredMark /></span>
                <textarea name="quote" value={form.quote} onChange={handleFormChange} required />
              </label>
              <label>
                {t.home.skills}
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleFormChange}
                  placeholder={t.home.skillsPlaceholder}
                />
              </label>
              <button type="submit" className="compact-submit">Criar perfil de estudante</button>
              {submitStatus && <p className="form-footnote">{submitStatus}</p>}
            </form>
          ) : profileType === 'company' ? (
            <form className="embedded-form" onSubmit={handleCompanySubmit}>
              <button type="button" className="switch-account-button" onClick={() => setProfileType('')}>
                Trocar tipo de utilizador
              </button>
              <label>
                <span>Nome da empresa <RequiredMark /></span>
                <input
                  name="company"
                  value={companyForm.company}
                  onChange={handleCompanyChange}
                  required
                />
              </label>
              <label>
                <span>NIF ou número de registo comercial <RequiredMark /></span>
                <input
                  name="registrationNumber"
                  value={companyForm.registrationNumber}
                  onChange={handleCompanyChange}
                  placeholder="Identificador fiscal/comercial da empresa"
                  required
                />
              </label>
              <label>
                Logótipo da empresa
                <input
                  name="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                />
              </label>
              <div className="form-row">
                <label>
                  Site da empresa
                  <input
                    name="websiteUrl"
                    type="url"
                    value={companyForm.websiteUrl}
                    onChange={handleCompanyChange}
                    placeholder="https://empresa.com"
                  />
                </label>
                <label>
                  LinkedIn
                  <input
                    name="linkedinUrl"
                    type="url"
                    value={companyForm.linkedinUrl}
                    onChange={handleCompanyChange}
                    placeholder="https://linkedin.com/company/..."
                  />
                </label>
              </div>
              <label>
                <span>Responsável <RequiredMark /></span>
                <input
                  name="contactName"
                  value={companyForm.contactName}
                  onChange={handleCompanyChange}
                  required
                />
              </label>
              <label>
                <span>Senha <RequiredMark /></span>
                <input
                  name="password"
                  type="password"
                  minLength="6"
                  value={companyForm.password}
                  onChange={handleCompanyChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </label>
              <label>
                <span>Confirmar senha <RequiredMark /></span>
                <input
                  name="confirmPassword"
                  type="password"
                  minLength="6"
                  value={companyForm.confirmPassword}
                  onChange={handleCompanyChange}
                  placeholder="Repete a senha"
                  required
                />
              </label>
              <div className="form-row">
                <label>
                  <span>Setor <RequiredMark /></span>
                  <input
                    name="sector"
                    value={companyForm.sector}
                    onChange={handleCompanyChange}
                    required
                  />
                </label>
                <label>
                  <span>Província <RequiredMark /></span>
                  <input
                    name="province"
                    value={companyForm.province}
                    onChange={handleCompanyChange}
                    required
                  />
                </label>
              </div>
              <label>
                <span>Cidade <RequiredMark /></span>
                <input
                  name="city"
                  value={companyForm.city}
                  onChange={handleCompanyChange}
                  required
                />
              </label>
              <label>
                <span>Sobre a empresa <RequiredMark /></span>
                <textarea
                  name="description"
                  value={companyForm.description}
                  onChange={handleCompanyChange}
                  required
                />
              </label>
              <button type="submit" className="compact-submit">Criar perfil de empresa</button>
              {submitStatus && <p className="form-footnote">{submitStatus}</p>}
            </form>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default ProfileCreatePage;
