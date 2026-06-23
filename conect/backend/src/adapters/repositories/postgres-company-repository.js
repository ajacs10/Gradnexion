// src/adapters/repositories/postgres-company-repository.js
import { CompanyPort } from '../../core/ports/company-port.js';
import { query } from '../../db.js';

export const mapCompany = (row) => row ? ({
  id: row.id,
  userId: row.user_id,
  username: row.username,
  company: row.name,
  name: row.name,
  contactName: row.contact_name,
  sector: row.sector,
  province: row.province,
  city: row.city,
  description: row.description,
  registrationNumber: row.registration_number,
  logoUrl: row.logo_url,
  websiteUrl: row.website_url,
  linkedinUrl: row.linkedin_url,
  internshipCount: Number(row.internship_count ?? 0),
}) : null;

export class PostgresCompanyRepository extends CompanyPort {
  async findById(id) {
    const result = await query(
      `SELECT c.*, u.username,
        COUNT(i.id) FILTER (WHERE i.status = 'internship_started') AS internship_count
       FROM companies c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN interviews i ON i.company_id = c.id
       WHERE c.id = $1
       GROUP BY c.id, u.username`,
      [id]
    );
    return mapCompany(result.rows[0]);
  }

  async findByUserId(userId) {
    const result = await query(
      `SELECT c.*, u.username,
        COUNT(i.id) FILTER (WHERE i.status = 'internship_started') AS internship_count
       FROM companies c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN interviews i ON i.company_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id, u.username`,
      [userId]
    );
    return mapCompany(result.rows[0]);
  }

  async create(companyData, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO companies (
        user_id, name, contact_name, sector, province, city, description,
        registration_number, logo_url, website_url, linkedin_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        companyData.userId,
        companyData.name,
        companyData.contactName,
        companyData.sector,
        companyData.province,
        companyData.city,
        companyData.description,
        companyData.registrationNumber,
        companyData.logoUrl || '',
        companyData.websiteUrl || '',
        companyData.linkedinUrl || ''
      ]
    );
    return mapCompany(result.rows[0]);
  }

  async update(id, companyData, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `UPDATE companies
       SET name = $1,
           contact_name = $2,
           sector = $3,
           province = $4,
           city = $5,
           description = $6,
           registration_number = $7,
           logo_url = $8,
           website_url = $9,
           linkedin_url = $10
       WHERE id = $11
       RETURNING *`,
      [
        companyData.name,
        companyData.contactName,
        companyData.sector,
        companyData.province,
        companyData.city,
        companyData.description,
        companyData.registrationNumber,
        companyData.logoUrl,
        companyData.websiteUrl,
        companyData.linkedinUrl,
        id
      ]
    );
    return mapCompany(result.rows[0]);
  }
}
