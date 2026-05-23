import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '../services/api';
import './HomePage.css';

function CompanyProfilePage({ opportunities }) {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);

  useEffect(() => {
    // Try to find company from passed opportunities (client-side) first
    if (opportunities && opportunities.length > 0) {
      const match = opportunities.find((o) => String(o.companyId) === String(id) || String(o.company) === String(id));
      if (match) {
        setCompany({
          id: match.companyId || id,
          name: match.company,
          address: match.companyAddress,
          website: match.websiteUrl,
          linkedin: match.linkedinUrl,
          description: match.companyDescription,
          logo: match.companyLogo || match.logo || null,
        });

        setCompanyJobs(opportunities.filter((o) => String(o.companyId) === String(match.companyId)));
        return;
      }
    }

    // Fallback: try API
    let mounted = true;
    apiGet(`/api/companies/${id}`)
      .then((data) => {
        if (!mounted) return;
        setCompany(data.company || data);
        setCompanyJobs(data.jobs || []);
      })
      .catch(() => {
        // ignore
      });

    return () => {
      mounted = false;
    };
  }, [id, opportunities]);

  if (!company) {
    return (
      <main className="homepage-main page-shell">
        <p>Empresa não encontrada.</p>
        <Link to="/vagas">Voltar às vagas</Link>
      </main>
    );
  }

  return (
    <main className="homepage-main page-shell">
      <section className="section-band">
        <div className="section-heading">
          <h2>{company.name}</h2>
        </div>

        <div className="company-profile">
          {company.logo && (
            <img src={company.logo} alt={company.name} className="company-profile-logo" />
          )}

          {company.description && <p>{company.description}</p>}

          <dl>
            {company.address && (
              <div>
                <dt>Endereço</dt>
                <dd>{company.address}</dd>
              </div>
            )}

            {company.website && (
              <div>
                <dt>Website</dt>
                <dd>
                  <a href={company.website} target="_blank" rel="noreferrer">
                    {company.website}
                  </a>
                </dd>
              </div>
            )}

            {company.linkedin && (
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  <a href={company.linkedin} target="_blank" rel="noreferrer">
                    Perfil
                  </a>
                </dd>
              </div>
            )}
          </dl>

          <h3>Vagas desta empresa</h3>
          <div className="opportunities-grid">
            {companyJobs.length > 0 ? (
              companyJobs.map((job) => (
                <article className="opportunity-card graduate-card company-job" key={job.id}>
                  <div className="company-job-header">
                    <h4>{job.title}</h4>
                    <div className="company-job-meta">
                      {job.location && <span className="job-location">{job.location}</span>}
                      {job.deadline && <span className="job-deadline">Prazo: {new Date(job.deadline).toLocaleDateString('pt-AO')}</span>}
                    </div>
                  </div>

                  <p>{job.description}</p>

                  <div className="opportunity-apply-row">
                    <button className="opportunity-apply-button">Ver vaga</button>
                  </div>
                </article>
              ))
            ) : (
              <p>Sem vagas públicas no momento.</p>
            )}
          </div>

          <Link to="/vagas" className="secondary-action" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Voltar às vagas
          </Link>
        </div>
      </section>
    </main>
  );
}

export default CompanyProfilePage;
