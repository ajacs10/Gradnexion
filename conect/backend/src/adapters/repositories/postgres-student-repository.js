// src/adapters/repositories/postgres-student-repository.js
import { StudentPort } from '../../core/ports/student-port.js';
import { query } from '../../db.js';

export const mapStudent = (row) => row ? ({
  id: row.id,
  userId: row.user_id,
  username: row.username,
  name: row.full_name,
  course: row.course,
  year: row.graduation_year,
  role: row.current_area,
  email: row.email,
  phone: row.phone,
  company: row.project,
  university: row.university,
  institutions: row.institutions?.length ? row.institutions : row.university ? [row.university] : [],
  universityDeclarationUrl: row.university_declaration_url,
  photoUrl: row.photo_url,
  portfolioUrl: row.portfolio_url,
  linkedinUrl: row.linkedin_url,
  quote: row.quote,
  skills: row.skills ?? [],
}) : null;

export class PostgresStudentRepository extends StudentPort {
  async findAll({ area, search }) {
    const params = [];
    const filters = [];

    if (area) {
      params.push(area);
      filters.push(`s.course = $${params.length}`);
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      filters.push(`(
        LOWER(s.full_name) LIKE $${params.length}
        OR LOWER(s.course) LIKE $${params.length}
        OR LOWER(s.current_area) LIKE $${params.length}
        OR LOWER(s.university) LIKE $${params.length}
      )`);
    }

    const result = await query(
      `SELECT s.*, u.username
       FROM students s
       JOIN users u ON u.id = s.user_id
       ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
       ORDER BY s.created_at DESC`,
      params
    );
    return result.rows.map(mapStudent);
  }

  async findById(id) {
    const result = await query(
      'SELECT s.*, u.username FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1',
      [id]
    );
    return mapStudent(result.rows[0]);
  }

  async findByUserId(userId) {
    const result = await query(
      'SELECT s.*, u.username FROM students s JOIN users u ON u.id = s.user_id WHERE s.user_id = $1',
      [userId]
    );
    return mapStudent(result.rows[0]);
  }

  async create(studentData, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO students (
        user_id, full_name, course, graduation_year, current_area, email, phone, project,
        university, institutions, university_declaration_url, photo_url, portfolio_url, linkedin_url, quote, skills
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        studentData.userId,
        studentData.name,
        studentData.course,
        studentData.year,
        studentData.role,
        studentData.email,
        studentData.phone,
        studentData.company || '',
        studentData.university,
        studentData.institutions,
        studentData.universityDeclarationUrl,
        studentData.photoUrl || '',
        studentData.portfolioUrl || '',
        studentData.linkedinUrl || '',
        studentData.quote,
        studentData.skills ?? []
      ]
    );
    return mapStudent(result.rows[0]);
  }

  async update(id, studentData, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `UPDATE students
       SET email = $1,
           linkedin_url = $2,
           photo_url = $3,
           institutions = $4,
           university = $5,
           phone = $6,
           graduation_year = $7,
           current_area = $8,
           quote = $9
       WHERE id = $10
       RETURNING *`,
      [
        studentData.email,
        studentData.linkedinUrl,
        studentData.photoUrl,
        studentData.institutions,
        studentData.university,
        studentData.phone,
        studentData.year,
        studentData.role,
        studentData.quote,
        id
      ]
    );
    return mapStudent(result.rows[0]);
  }
}
