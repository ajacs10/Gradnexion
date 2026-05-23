// src/components/ProfilePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPatch } from '../services/api';
import './HomePage.css';

const getInitials = (name = '') =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const buildFormState = (profile = {}) => ({
  company:      profile.company      || profile.name || '',
  contactName:  profile.contactName  || '',
  sector:       profile.sector       || '',
  province:     profile.province     || '',
  city:         profile.city         || '',
  description:  profile.description  || '',
  registrationNumber: profile.registrationNumber || '',
  websiteUrl:   profile.websiteUrl   || '',
  email:        profile.email        || '',
  linkedinUrl:  profile.linkedinUrl  || '',
  phone:        profile.phone        || '',
  year:         profile.year         || '',
  university:   profile.university   || '',
  quote:        profile.quote        || '',
  role:         profile.role         || '',
  institutions: profile.institutions?.length
    ? profile.institutions
    : profile.university ? [profile.university] : [],
});

/* ── icons ── */
const PencilIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

/* ── generic single-value editable field ── */
function EditableField({ label, value, name, type = 'text', onSave, placeholder = '' }) {
  const [editing, setEditing]   = useState(false);
  const [localVal, setLocalVal] = useState(value);
  const [saving, setSaving]     = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setLocalVal(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = async () => {
    setSaving(true);
    await onSave(name, localVal);
    setSaving(false);
    setEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') commit();
    if (e.key === 'Escape') { setLocalVal(value); setEditing(false); }
  };

  const displayValue = value
    ? (type === 'url'
        ? <a href={value} target="_blank" rel="noreferrer" className="profile-link">{value}</a>
        : value)
    : <em className="empty-value">Não informado</em>;

  return (
    <div className="profile-detail-row">
      <dt className="profile-detail-label">{label}</dt>
      <dd className="profile-detail-value">
        {editing ? (
          <div className="inline-edit-wrapper">
            {type === 'textarea' ? (
              <textarea
                ref={inputRef}
                value={localVal}
                onChange={(e) => setLocalVal(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                rows={3}
                className="inline-edit-input inline-edit-textarea"
              />
            ) : (
              <input
                ref={inputRef}
                type={type}
                value={localVal}
                onChange={(e) => setLocalVal(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className="inline-edit-input"
              />
            )}
            <button type="button" className="inline-save-btn" onClick={commit} disabled={saving} aria-label="Salvar">
              {saving ? <span className="saving-spinner" /> : <CheckIcon />}
            </button>
          </div>
        ) : (
          <div className="inline-display-wrapper">
            <span className="inline-display-value">{displayValue}</span>
            <button
              type="button"
              className="inline-edit-trigger"
              onClick={() => setEditing(true)}
              aria-label={`Editar ${label}`}
            >
              <PencilIcon />
            </button>
          </div>
        )}
      </dd>
    </div>
  );
}

/* ── multi-value institutions field ── */
function InstitutionsField({ values, onSave }) {
  const [editing, setEditing] = useState(false);
  const [pills, setPills]     = useState(values);
  const [input, setInput]     = useState('');
  const [saving, setSaving]   = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setPills(values); }, [values]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const addFromInput = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newOnes = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    setPills((prev) => {
      const merged = [...prev];
      newOnes.forEach((n) => { if (!merged.includes(n)) merged.push(n); });
      return merged;
    });
    setInput('');
  };

  const removeAt = (idx) => setPills((prev) => prev.filter((_, i) => i !== idx));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addFromInput(); }
    if (e.key === 'Escape') { setPills(values); setInput(''); setEditing(false); }
    if ((e.key === 'Backspace') && input === '' && pills.length > 0) {
      setPills((prev) => prev.slice(0, -1));
    }
  };

  const commit = async () => {
    if (input.trim()) addFromInput();
    setSaving(true);
    await onSave('institutions', pills);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="profile-detail-row">
      <dt className="profile-detail-label">Instituições associadas</dt>
      <dd className="profile-detail-value">
        {editing ? (
          <div className="institutions-edit-wrapper">
            <div className="institutions-pill-input" onClick={() => inputRef.current?.focus()}>
              {pills.map((p, i) => (
                <span key={i} className="institution-pill institution-pill-editing">
                  {p}
                  <button
                    type="button"
                    className="pill-remove-btn"
                    onClick={(e) => { e.stopPropagation(); removeAt(i); }}
                    aria-label={`Remover ${p}`}
                  >
                    <XIcon />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={pills.length === 0 ? 'INSUTEC, ISPTEC, UAN...' : 'Adicionar...'}
                className="institutions-text-input"
              />
            </div>
            <div className="institutions-edit-actions">
              <button type="button" className="inst-add-btn" onClick={addFromInput} disabled={!input.trim()}>
                <PlusIcon /> Adicionar
              </button>
              <button type="button" className="inline-save-btn" onClick={commit} disabled={saving} aria-label="Salvar">
                {saving ? <span className="saving-spinner" /> : <CheckIcon />}
              </button>
            </div>
            <p className="inst-hint">Enter ou vírgula para adicionar. Backspace para remover a última.</p>
          </div>
        ) : (
          <div className="inline-display-wrapper" style={{ alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              {values.length > 0 ? (
                <div className="institution-pill-list">
                  {values.map((inst) => (
                    <span key={inst} className="institution-pill">{inst}</span>
                  ))}
                </div>
              ) : (
                <em className="empty-value">Não informado</em>
              )}
            </div>
            <button
              type="button"
              className="inline-edit-trigger"
              onClick={() => setEditing(true)}
              aria-label="Editar Instituições"
              style={{ marginTop: values.length > 0 ? '2px' : 0 }}
            >
              <PencilIcon />
            </button>
          </div>
        )}
      </dd>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
function ProfilePage({ session, onProfileUpdated }) {
  const { profile, role } = session;
  const isCompany   = role === 'company';
  const displayName = profile.name || profile.company;

  const [form, setForm]                 = useState(() => buildFormState(profile));
  const [photoPreview, setPhotoPreview] = useState(profile.photoUrl || profile.logoUrl || '');
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSaving, setIsSaving]         = useState(false);
  const [interns, setInterns]           = useState([]);
  const [internStatus, setInternStatus] = useState('');
  const photoInputRef = useRef(null);

  useEffect(() => {
    setForm(buildFormState(profile));
    setPhotoPreview(profile.photoUrl || profile.logoUrl || '');
    setSubmitStatus('');
  }, [profile]);

  useEffect(() => {
    if (!isCompany) return;

    apiGet(`/api/companies/${profile.id}/interns`)
      .then(setInterns)
      .catch((error) => setInternStatus(error.message));
  }, [isCompany, profile.id]);

  const saveProfile = async (formData) => {
    setIsSaving(true);
    setSubmitStatus('');
    try {
      if (onProfileUpdated) {
        await onProfileUpdated(formData);
      } else {
        await apiPatch(`/api/students/${profile.id}`, formData);
      }
      setSubmitStatus('Perfil atualizado com sucesso.');
    } catch (err) {
      setSubmitStatus(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const buildFormData = (updated) => {
    const fd = new FormData();
    if (isCompany) {
      fd.append('company', updated.company);
      fd.append('contactName', updated.contactName);
      fd.append('sector', updated.sector);
      fd.append('province', updated.province);
      fd.append('city', updated.city);
      fd.append('description', updated.description);
      fd.append('registrationNumber', updated.registrationNumber);
      fd.append('websiteUrl', updated.websiteUrl);
      fd.append('linkedinUrl', updated.linkedinUrl);
      return fd;
    }

    fd.append('email',        updated.email);
    fd.append('linkedinUrl',  updated.linkedinUrl);
    fd.append('phone',        updated.phone);
    fd.append('year',         updated.year);
    fd.append('university',   updated.university);
    fd.append('quote',        updated.quote);
    fd.append('role',         updated.role);
    fd.append('institutions', Array.isArray(updated.institutions)
      ? updated.institutions.join(', ')
      : updated.institutions);
    return fd;
  };

  const handleFieldSave = async (fieldName, newValue) => {
    const updated = { ...form, [fieldName]: newValue };
    setForm(updated);
    await saveProfile(buildFormData(updated));
  };

  const handleInstitutionsSave = async (_, pillArray) => {
    const updated = { ...form, institutions: pillArray };
    setForm(updated);
    await saveProfile(buildFormData(updated));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(window.URL.createObjectURL(file));
    const fd = buildFormData(form);
    fd.append(isCompany ? 'logo' : 'photo', file);
    await saveProfile(fd);
  };

  return (
    <main className="homepage-main page-shell">
      <section className="profile-dashboard">
        <article className="profile-hero-card">

          {/* ── avatar / photo ── */}
          <div className="profile-summary-header">
            <div className="profile-avatar-wrapper">
              {photoPreview ? (
                <img className={isCompany ? 'profile-logo' : 'profile-photo-preview'} src={photoPreview} alt={displayName} />
              ) : (
                <div className="avatar avatar-large" aria-hidden="true">{getInitials(displayName)}</div>
              )}

              <>
                <button
                  type="button"
                  className="photo-upload-overlay"
                  onClick={() => photoInputRef.current?.click()}
                  aria-label={isCompany ? 'Alterar logotipo' : 'Alterar foto de perfil'}
                  disabled={isSaving}
                >
                  <CameraIcon />
                  <span>{isCompany ? 'Alterar logo' : 'Alterar foto'}</span>
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </>
            </div>

            <div>
              <p className="eyebrow">{isCompany ? 'Perfil de empresa' : 'Perfil de estudante'}</p>
              <h2>{displayName}</h2>
              <p>{isCompany ? `${profile.sector} · ${profile.city}, ${profile.province}` : `${profile.course} · Turma ${profile.year}`}</p>
            </div>
          </div>
        </article>

          {submitStatus && (
            <p className={`profile-edit-status ${submitStatus.includes('sucesso') ? 'status-ok' : 'status-error'}`}>
              {submitStatus}
            </p>
          )}

        {isCompany ? (
          <div className="profile-layout profile-company-layout">
            <dl className="profile-details profile-details-editable profile-section-card">
                <div className="profile-section-title">
                  <h2>Informação da empresa</h2>
                  <span>{profile.internshipCount ?? 0} estágios iniciados</span>
                </div>

                <div className="editable-detail-row">
                  <EditableField label="Empresa" name="company" value={form.company} onSave={handleFieldSave} placeholder="Nome da empresa" />
                </div>

                <div className="editable-detail-row">
                  <EditableField label="Responsável" name="contactName" value={form.contactName} onSave={handleFieldSave} placeholder="Nome do responsável" />
                </div>

                <div className="editable-detail-row">
                  <EditableField label="Setor" name="sector" value={form.sector} onSave={handleFieldSave} placeholder="Ex: Tecnologia" />
                </div>

                <div className="editable-detail-row">
                  <EditableField label="Província" name="province" value={form.province} onSave={handleFieldSave} placeholder="Ex: Luanda" />
                </div>

                <div className="editable-detail-row">
                  <EditableField label="Cidade" name="city" value={form.city} onSave={handleFieldSave} placeholder="Ex: Talatona" />
                </div>

                <div className="editable-detail-row">
                  <EditableField label="NIF / Registo" name="registrationNumber" value={form.registrationNumber} onSave={handleFieldSave} placeholder="NIF ou registo comercial" />
                </div>

                <div className="editable-detail-row">
                  <EditableField label="Website" name="websiteUrl" type="url" value={form.websiteUrl} onSave={handleFieldSave} placeholder="https://..." />
                </div>

                <div className="editable-detail-row">
                  <EditableField label="LinkedIn" name="linkedinUrl" type="url" value={form.linkedinUrl} onSave={handleFieldSave} placeholder="https://linkedin.com/company/..." />
                </div>

                <div className="editable-detail-row profile-detail-wide">
                  <EditableField label="Sobre" name="description" type="textarea" value={form.description} onSave={handleFieldSave} placeholder="Resumo da empresa..." />
                </div>
              </dl>

              <article className="profile-section-card company-interns-card">
                <div className="profile-section-title">
                  <h2>Meus estagiários</h2>
                  <span>{interns.length} ativo{interns.length === 1 ? '' : 's'}</span>
                </div>
                {internStatus && <p className="profile-edit-status status-ok">{internStatus}</p>}
                {interns.length > 0 ? (
                  <div className="company-intern-list">
                    {interns.map(({ interviewId, student }) => (
                      <article className="company-intern-item" key={interviewId}>
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} />
                        ) : (
                          <span>{getInitials(student.name)}</span>
                        )}
                        <div>
                          <strong>{student.name}</strong>
                          <small>{student.course}</small>
                        </div>
                        <div className="company-intern-actions">
                          <Link to={`/talentos/${student.id}`} className="secondary-action">Ver perfil</Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Nenhum estagiário associado a esta empresa.</p>
                )}
              </article>
            </div>
          ) : (
            <>
              <dl className="profile-details profile-details-editable profile-section-card">
              <div className="profile-section-title">
                <h2>Informação pessoal</h2>
                <span>{profile.username}</span>
              </div>

              <div className="editable-detail-row">
                <EditableField label="Área atual" name="role" value={form.role} onSave={handleFieldSave} placeholder="Ex: Engenheiro de Software" />
              </div>

              <div className="editable-detail-row">
                <EditableField label="Email" name="email" type="email" value={form.email} onSave={handleFieldSave} placeholder="seu@email.com" />
              </div>

              <div className="editable-detail-row">
                <EditableField label="Telefone" name="phone" type="tel" value={form.phone} onSave={handleFieldSave} placeholder="+244 9xx xxx xxx" />
              </div>

              <div className="editable-detail-row">
                <EditableField label="Turma" name="year" value={form.year} onSave={handleFieldSave} placeholder="Ex: 2024" />
              </div>

              <div className="editable-detail-row">
                <EditableField label="Universidade" name="university" value={form.university} onSave={handleFieldSave} placeholder="Ex: UAN" />
              </div>

              <div className="editable-detail-row">
                <InstitutionsField values={form.institutions} onSave={handleInstitutionsSave} />
              </div>

              <div className="editable-detail-row">
                <EditableField
                  label="LinkedIn"
                  name="linkedinUrl"
                  type="url"
                  value={form.linkedinUrl}
                  onSave={handleFieldSave}
                  placeholder="https://linkedin.com/in/..."
                />
                {form.linkedinUrl && (
                  <a href={form.linkedinUrl} target="_blank" rel="noreferrer" className="linkedin-badge">
                    <LinkedInIcon /> Abrir LinkedIn
                  </a>
                )}
              </div>

              <div className="editable-detail-row">
                <EditableField
                  label="Destaque"
                  name="quote"
                  type="textarea"
                  value={form.quote}
                  onSave={handleFieldSave}
                  placeholder="Uma frase sobre você..."
                />
              </div>

              {profile.universityDeclarationUrl && (
                <div>
                  <dt>Declaração</dt>
                  <dd>
                    <a href={profile.universityDeclarationUrl} target="_blank" rel="noreferrer">
                      Ver declaração da universidade
                    </a>
                  </dd>
                </div>
              )}

            </dl>
            </>
          )}

        {!isCompany && (
        <div className="profile-layout">
          {!isCompany && (
            <article className="profile-section-card">
              <div className="profile-section-title">
                <h2>Endereço académico</h2>
                <span>{profile.course}</span>
              </div>
              <dl className="profile-details">
                <div><dt>Instituição principal</dt><dd>{profile.university}</dd></div>
                <div><dt>Curso</dt><dd>{profile.course}</dd></div>
                <div><dt>Turma</dt><dd>{profile.year}</dd></div>
              </dl>
            </article>
          )}

          {!isCompany && (
            <aside className="profile-actions">
              <h3>Área do estudante</h3>
              <p>Mantém o perfil completo para aparecer melhor nas pesquisas das empresas.</p>
              <Link to="/vagas" className="primary-action">Ver vagas</Link>
            </aside>
          )}
        </div>
        )}

      </section>
    </main>
  );
}

export default ProfilePage;
