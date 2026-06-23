// src/adapters/repositories/postgres-opportunity-repository.js
import { OpportunityPort } from '../../core/ports/opportunity-port.js';
import { query } from '../../db.js';

export const mapOpportunity = (row, options = {}) => row ? ({
  id: row.id,
  companyId: row.company_id,
  company: row.company_name,
  title: row.title,
  area: row.area,
  province: row.province,
  city: row.city,
  location: row.location,
  companyAddress: row.company_address,
  mode: row.mode,
  visibility: row.visibility,
  duration: row.duration,
  deadline: row.deadline,
  requirements: row.requirements ?? [],
  description: row.description,
  coordinates: row.latitude && row.longitude ? { lat: Number(row.latitude), lng: Number(row.longitude) } : null,
  linkedinUrl: row.company_linkedin_url,
  websiteUrl: row.company_website_url,
  ...(options.includeApplicationsCount ? { applicationsCount: Number(row.applications_count ?? 0) } : {}),
  isApplied: Boolean(row.is_applied),
}) : null;

export class PostgresOpportunityRepository extends OpportunityPort {
  async findAll({ area, studentId }) {
    const params = [];
    const filters = [];

    if (area) {
      params.push(area);
      filters.push(`o.area = $${params.length}`);
    }

    params.push(studentId);
    const studentIdParam = params.length;

    const result = await query(
      `SELECT o.*, c.name AS company_name, c.linkedin_url AS company_linkedin_url, c.website_url AS company_website_url,
        COUNT(a.id) AS applications_count,
        BOOL_OR(a.student_id = $${studentIdParam}) AS is_applied
       FROM opportunities o
       JOIN companies c ON c.id = o.company_id
       LEFT JOIN applications a ON a.opportunity_id = o.id
       ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
       GROUP BY o.id, c.name, c.linkedin_url, c.website_url
       ORDER BY o.created_at DESC`,
      params
    );

    return result.rows.map((row) =>
      mapOpportunity(row, { includeApplicationsCount: !studentId })
    );
  }

  async findById(id) {
    const result = await query(
      `SELECT o.*, c.name AS company_name, c.linkedin_url AS company_linkedin_url, c.website_url AS company_website_url
       FROM opportunities o
       JOIN companies c ON c.id = o.company_id
       WHERE o.id = $1`,
      [id]
    );
    return mapOpportunity(result.rows[0]);
  }

  async create(opportunityData) {
    const result = await query(
      `INSERT INTO opportunities (
        company_id, title, area, province, city, location, company_address, mode,
        visibility, duration, deadline, requirements, description, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        opportunityData.companyId,
        opportunityData.title,
        opportunityData.area,
        opportunityData.province,
        opportunityData.city,
        opportunityData.location,
        opportunityData.companyAddress,
        opportunityData.mode,
        opportunityData.visibility,
        opportunityData.duration,
        opportunityData.deadline,
        opportunityData.requirements ?? [],
        opportunityData.description,
        opportunityData.latitude || null,
        opportunityData.longitude || null
      ]
    );

    const companyResult = await query(
      'SELECT name AS company_name, linkedin_url AS company_linkedin_url, website_url AS company_website_url FROM companies WHERE id = $1',
      [opportunityData.companyId]
    );

    return mapOpportunity({ ...result.rows[0], ...companyResult.rows[0] });
  }
}
