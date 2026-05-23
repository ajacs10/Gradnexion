import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate, pool, query, seed } from './db.js';
import { generateUniqueUsername } from './username.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = process.env.UPLOAD_DIR ?? path.resolve(__dirname, '../uploads');
const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? 'http://localhost:4000';
const app = express();
const port = Number(process.env.PORT ?? 4000);

fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadRoot,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    cb(null, `${Date.now()}-${safeBase || 'upload'}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const toUrl = (file) => (file ? `${publicBaseUrl}/uploads/${file.filename}` : '');
const toSkills = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
const toInstitutions = (value, fallback = '') => {
  const source = Array.isArray(value) ? value : String(value ?? fallback ?? '');

  return source
    .toString()
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
};
const meetUrl = (companyId, studentId) =>
  `https://meet.jit.si/shecodeajacs-${companyId}-${studentId}-${Date.now()}`;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, salt, hash) => {
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), candidate);
};

const mapStudent = (row) => ({
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
});

const mapCompany = (row) => ({
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
});

const mapOpportunity = (row, options = {}) => ({
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
});

const mapApplication = (row) => ({
  id: row.application_id ?? row.id,
  status: row.application_status ?? row.status,
  createdAt: row.application_created_at ?? row.created_at,
  opportunity: {
    id: row.opportunity_id,
    title: row.opportunity_title,
    area: row.opportunity_area,
    mode: row.opportunity_mode,
    location: row.opportunity_location,
    deadline: row.opportunity_deadline,
    companyId: row.company_id,
    company: row.company_name,
  },
  student: row.student_id ? {
    id: row.student_id,
    name: row.student_name,
    course: row.student_course,
    role: row.student_role,
    email: row.student_email,
    phone: row.student_phone,
    university: row.student_university,
    photoUrl: row.student_photo_url,
    skills: row.student_skills ?? [],
  } : null,
  interview: row.interview_id ? {
    id: row.interview_id,
    mode: row.interview_mode,
    status: row.interview_status,
    meetingUrl: row.meeting_url,
    scheduledAt: row.scheduled_at,
  } : null,
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadRoot));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    if (req.path === '/health') return;
    query(
      `INSERT INTO request_logs (method, path, status_code, duration_ms, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.method,
        req.originalUrl,
        res.statusCode,
        Date.now() - startedAt,
        req.ip,
        req.get('user-agent') ?? '',
      ],
    ).catch((error) => console.error('Falha ao gravar log:', error));
  });
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const username = String(req.body.username ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');
    if (!username || !password) return res.status(400).json({ message: 'Username e senha obrigatorios.' });

    const user = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rowCount === 0) return res.status(404).json({ message: 'Utilizador nao encontrado.' });
    if (!verifyPassword(password, user.rows[0].password_salt, user.rows[0].password_hash)) {
      return res.status(401).json({ message: 'Senha invalida.' });
    }

    if (user.rows[0].role === 'admin') {
      return res.json({
        role: 'admin',
        isRegistered: true,
        profile: {
          id: user.rows[0].id,
          username: user.rows[0].username,
          name: 'Administrador',
        },
      });
    }

    if (user.rows[0].role === 'student') {
      const result = await query(
        `SELECT s.*, u.username FROM students s JOIN users u ON u.id = s.user_id WHERE s.user_id = $1`,
        [user.rows[0].id],
      );
      return res.json({ role: 'student', isRegistered: true, profile: mapStudent(result.rows[0]) });
    }

    const result = await query(
      `SELECT c.*, u.username,
        COUNT(i.id) FILTER (WHERE i.status = 'internship_started') AS internship_count
       FROM companies c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN interviews i ON i.company_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id, u.username`,
      [user.rows[0].id],
    );
    return res.json({ role: 'company', isRegistered: true, profile: mapCompany(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/students', async (req, res, next) => {
  try {
    const area = req.query.area ? String(req.query.area) : null;
    const search = req.query.search ? `%${String(req.query.search).toLowerCase()}%` : null;
    const params = [];
    const filters = [];

    if (area) {
      params.push(area);
      filters.push(`s.course = $${params.length}`);
    }
    if (search) {
      params.push(search);
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
      params,
    );
    res.json(result.rows.map(mapStudent));
  } catch (error) {
    next(error);
  }
});

app.get('/api/companies/:id/interns', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        i.id AS interview_id,
        i.status,
        i.mode,
        i.meeting_url,
        i.created_at,
        i.updated_at,
        s.*,
        u.username
       FROM interviews i
       JOIN students s ON s.id = i.student_id
       JOIN users u ON u.id = s.user_id
       WHERE i.company_id = $1 AND i.status = 'internship_started'
       ORDER BY i.updated_at DESC`,
      [req.params.id],
    );

    res.json(result.rows.map((row) => ({
      interviewId: row.interview_id,
      status: row.status,
      mode: row.mode,
      meetingUrl: row.meeting_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      student: mapStudent(row),
    })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/students/:id', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT s.*, u.username FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1',
      [req.params.id],
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Estudante nao encontrado.' });
    return res.json(mapStudent(result.rows[0]));
  } catch (error) {
    return next(error);
  }
});

app.patch(
  '/api/students/:id',
  upload.fields([{ name: 'photo', maxCount: 1 }]),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existingResult = await client.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
      if (existingResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Estudante nao encontrado.' });
      }

      const existing = existingResult.rows[0];
      const existingInstitutions = existing.institutions?.length ? existing.institutions : [existing.university];
      const institutions = toInstitutions(req.body.institutions, existing.university);
      const university = institutions[0] ?? existing.university;
      const photoUrl = req.files?.photo?.[0] ? toUrl(req.files.photo[0]) : existing.photo_url;

      await client.query(
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
          String(req.body.email ?? existing.email).trim(),
          String(req.body.linkedinUrl ?? existing.linkedin_url ?? '').trim(),
          photoUrl,
          institutions.length ? institutions : existingInstitutions,
          university,
          String(req.body.phone ?? existing.phone).trim(),
          Number(req.body.year ?? existing.graduation_year),
          String(req.body.role ?? existing.current_area).trim(),
          String(req.body.quote ?? existing.quote).trim(),
          req.params.id,
        ],
      );

      await client.query('COMMIT');

      const reloaded = await query(
        'SELECT s.*, u.username FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1',
        [req.params.id],
      );
      return res.json({ role: 'student', isRegistered: true, profile: mapStudent(reloaded.rows[0]) });
    } catch (error) {
      await client.query('ROLLBACK');
      return next(error);
    } finally {
      client.release();
    }
  },
);

app.patch('/api/companies/:id', upload.single('logo'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existingResult = await client.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    if (existingResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Empresa nao encontrada.' });
    }

    const existing = existingResult.rows[0];
    const logoUrl = req.file ? toUrl(req.file) : existing.logo_url;

    await client.query(
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
        String(req.body.company ?? req.body.name ?? existing.name).trim(),
        String(req.body.contactName ?? existing.contact_name).trim(),
        String(req.body.sector ?? existing.sector).trim(),
        String(req.body.province ?? existing.province).trim(),
        String(req.body.city ?? existing.city).trim(),
        String(req.body.description ?? existing.description).trim(),
        String(req.body.registrationNumber ?? existing.registration_number).trim(),
        logoUrl,
        String(req.body.websiteUrl ?? existing.website_url ?? '').trim(),
        String(req.body.linkedinUrl ?? existing.linkedin_url ?? '').trim(),
        req.params.id,
      ],
    );

    await client.query('COMMIT');

    const reloaded = await query(
      `SELECT c.*, u.username,
        COUNT(i.id) FILTER (WHERE i.status = 'internship_started') AS internship_count
       FROM companies c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN interviews i ON i.company_id = c.id
       WHERE c.id = $1
       GROUP BY c.id, u.username`,
      [req.params.id],
    );
    return res.json({ role: 'company', isRegistered: true, profile: mapCompany(reloaded.rows[0]) });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
});

app.post(
  '/api/students',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'declaration', maxCount: 1 },
  ]),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const username = await generateUniqueUsername(req.body.name);
      const password = String(req.body.password ?? '');
      if (password.length < 6) return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
      const passwordHash = hashPassword(password);
      const photoUrl = toUrl(req.files?.photo?.[0]);
      const declarationUrl = toUrl(req.files?.declaration?.[0]);
      if (!declarationUrl) return res.status(400).json({ message: 'Declaracao da universidade obrigatoria.' });
      const institutions = toInstitutions(req.body.institutions, req.body.university);

      await client.query('BEGIN');
      const user = await client.query(
        'INSERT INTO users (role, username, password_hash, password_salt) VALUES ($1, $2, $3, $4) RETURNING id, username',
        ['student', username, passwordHash.hash, passwordHash.salt],
      );
      const student = await client.query(
        `INSERT INTO students (
          user_id, full_name, course, graduation_year, current_area, email, phone, project,
          university, institutions, university_declaration_url, photo_url, portfolio_url, linkedin_url, quote, skills
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          user.rows[0].id,
          req.body.name,
          req.body.course,
          Number(req.body.year),
          req.body.role,
          req.body.email,
          req.body.phone,
          req.body.company || '',
          req.body.university,
          institutions.length ? institutions : [req.body.university],
          declarationUrl,
          photoUrl,
          req.body.portfolioUrl || '',
          req.body.linkedinUrl || '',
          req.body.quote,
          toSkills(req.body.skills),
        ],
      );
      await client.query('COMMIT');
      res.status(201).json({
        role: 'student',
        isRegistered: true,
        profile: mapStudent({ ...student.rows[0], username }),
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },
);

app.post('/api/companies', upload.single('logo'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const username = await generateUniqueUsername(req.body.company);
    const password = String(req.body.password ?? '');
    if (password.length < 6) return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    const passwordHash = hashPassword(password);
    await client.query('BEGIN');
    const user = await client.query(
      'INSERT INTO users (role, username, password_hash, password_salt) VALUES ($1, $2, $3, $4) RETURNING id',
      ['company', username, passwordHash.hash, passwordHash.salt],
    );
    const company = await client.query(
      `INSERT INTO companies (
        user_id, name, contact_name, sector, province, city, description,
        registration_number, logo_url, website_url, linkedin_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *, 0 AS internship_count`,
      [
        user.rows[0].id,
        req.body.company,
        req.body.contactName,
        req.body.sector,
        req.body.province,
        req.body.city,
        req.body.description,
        req.body.registrationNumber,
        toUrl(req.file),
        req.body.websiteUrl || '',
        req.body.linkedinUrl || '',
      ],
    );
    await client.query('COMMIT');
    res.status(201).json({
      role: 'company',
      isRegistered: true,
      profile: mapCompany({ ...company.rows[0], username }),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

app.get('/api/opportunities', async (req, res, next) => {
  try {
    const area = req.query.area ? String(req.query.area) : null;
    const studentId = req.query.studentId ? Number(req.query.studentId) : null;
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
      params,
    );
    res.json(result.rows.map((row) => mapOpportunity(row, { includeApplicationsCount: !studentId })));
  } catch (error) {
    next(error);
  }
});

app.post('/api/opportunities/:id/applications', async (req, res, next) => {
  try {
    const studentId = Number(req.body.studentId);
    const opportunityId = Number(req.params.id);
    if (!studentId || !opportunityId) {
      return res.status(400).json({ message: 'Estudante e vaga obrigatorios.' });
    }

    const result = await query(
      `INSERT INTO applications (student_id, opportunity_id)
       VALUES ($1, $2)
       ON CONFLICT (student_id, opportunity_id)
       DO UPDATE SET status = applications.status
       RETURNING *`,
      [studentId, opportunityId],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/opportunities/:id/applications', async (req, res, next) => {
  try {
    const studentId = Number(req.body?.studentId ?? req.query.studentId);
    const opportunityId = Number(req.params.id);
    if (!studentId || !opportunityId) {
      return res.status(400).json({ message: 'Estudante e vaga obrigatorios.' });
    }

    const result = await query(
      `DELETE FROM applications
       WHERE student_id = $1 AND opportunity_id = $2
       RETURNING *`,
      [studentId, opportunityId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Candidatura nao encontrada.' });
    }

    return res.status(200).json({ message: 'Candidatura removida.' });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/students/:id/applications', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        a.id AS application_id,
        a.status AS application_status,
        a.created_at AS application_created_at,
        o.id AS opportunity_id,
        o.title AS opportunity_title,
        o.area AS opportunity_area,
        o.mode AS opportunity_mode,
        o.location AS opportunity_location,
        o.deadline AS opportunity_deadline,
        c.id AS company_id,
        c.name AS company_name,
        i.id AS interview_id,
        i.mode AS interview_mode,
        i.status AS interview_status,
        i.meeting_url,
        i.scheduled_at
       FROM applications a
       JOIN opportunities o ON o.id = a.opportunity_id
       JOIN companies c ON c.id = o.company_id
       LEFT JOIN interviews i ON i.student_id = a.student_id AND i.company_id = c.id
       WHERE a.student_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.id],
    );
    res.json(result.rows.map(mapApplication));
  } catch (error) {
    next(error);
  }
});

app.get('/api/companies/:id/applications', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        a.id AS application_id,
        a.status AS application_status,
        a.created_at AS application_created_at,
        o.id AS opportunity_id,
        o.title AS opportunity_title,
        o.area AS opportunity_area,
        o.mode AS opportunity_mode,
        o.location AS opportunity_location,
        o.deadline AS opportunity_deadline,
        c.id AS company_id,
        c.name AS company_name,
        s.id AS student_id,
        s.full_name AS student_name,
        s.course AS student_course,
        s.current_area AS student_role,
        s.email AS student_email,
        s.phone AS student_phone,
        s.university AS student_university,
        s.photo_url AS student_photo_url,
        s.skills AS student_skills,
        i.id AS interview_id,
        i.mode AS interview_mode,
        i.status AS interview_status,
        i.meeting_url,
        i.scheduled_at
       FROM applications a
       JOIN opportunities o ON o.id = a.opportunity_id
       JOIN companies c ON c.id = o.company_id
       JOIN students s ON s.id = a.student_id
       LEFT JOIN interviews i ON i.student_id = s.id AND i.company_id = c.id
       WHERE o.company_id = $1
       ORDER BY o.created_at DESC, a.created_at DESC`,
      [req.params.id],
    );
    res.json(result.rows.map(mapApplication));
  } catch (error) {
    next(error);
  }
});

app.post('/api/opportunities', async (req, res, next) => {
  try {
    const result = await query(
      `INSERT INTO opportunities (
        company_id, title, area, province, city, location, company_address, mode,
        visibility, duration, deadline, requirements, description, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        req.body.companyId,
        req.body.title,
        req.body.area,
        req.body.province,
        req.body.city,
        req.body.location,
        req.body.companyAddress,
        req.body.mode,
        req.body.visibility,
        req.body.duration,
        req.body.deadline,
        req.body.requirements ?? [],
        req.body.description,
        req.body.latitude || null,
        req.body.longitude || null,
      ],
    );
    const company = await query('SELECT name AS company_name, linkedin_url AS company_linkedin_url, website_url AS company_website_url FROM companies WHERE id = $1', [req.body.companyId]);
    res.status(201).json(mapOpportunity({ ...result.rows[0], ...company.rows[0] }));
  } catch (error) {
    next(error);
  }
});

app.post('/api/interviews', async (req, res, next) => {
  try {
    const meetingUrl = req.body.mode === 'Via plataforma' ? meetUrl(req.body.companyId, req.body.studentId) : '';
    const result = await query(
      `INSERT INTO interviews (student_id, company_id, mode, status, meeting_url, scheduled_at, notes)
       VALUES ($1, $2, $3, 'scheduled', $4, $5, $6)
       RETURNING *`,
      [
        req.body.studentId,
        req.body.companyId,
        req.body.mode,
        meetingUrl,
        req.body.scheduledAt || null,
        req.body.notes || '',
      ],
    );
    await query(
      `UPDATE applications a
       SET status = 'reviewing'
       FROM opportunities o
       WHERE a.opportunity_id = o.id
         AND a.student_id = $1
         AND o.company_id = $2`,
      [req.body.studentId, req.body.companyId],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post('/api/interviews/bulk', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const studentIds = Array.isArray(req.body.studentIds)
      ? req.body.studentIds.map(Number).filter(Boolean)
      : [];
    const companyId = Number(req.body.companyId);
    const mode = req.body.mode === 'Via plataforma' ? 'Via plataforma' : 'Presencial';

    if (!studentIds.length || !companyId) {
      return res.status(400).json({ message: 'Seleciona pelo menos um estudante.' });
    }

    await client.query('BEGIN');
    const created = [];

    for (const studentId of studentIds) {
      const meetingUrl = mode === 'Via plataforma' ? meetUrl(companyId, studentId) : '';
      const result = await client.query(
        `INSERT INTO interviews (student_id, company_id, mode, status, meeting_url, scheduled_at, notes)
         VALUES ($1, $2, $3, 'scheduled', $4, $5, $6)
         RETURNING *`,
        [
          studentId,
          companyId,
          mode,
          meetingUrl,
          req.body.scheduledAt || null,
          req.body.notes || '',
        ],
      );
      created.push(result.rows[0]);
    }

    await client.query(
      `UPDATE applications a
       SET status = 'reviewing'
       FROM opportunities o
       WHERE a.opportunity_id = o.id
         AND o.company_id = $1
         AND a.student_id = ANY($2::int[])`,
      [companyId, studentIds],
    );

    await client.query('COMMIT');
    res.status(201).json(created);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

app.patch('/api/interviews/:id/status', async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE interviews SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [req.body.status, req.params.id],
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Entrevista nao encontrada.' });
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.get('/api/companies/:id/stats', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT COUNT(*) AS internship_count
       FROM interviews
       WHERE company_id = $1 AND status = 'internship_started'`,
      [req.params.id],
    );
    res.json({ internshipCount: Number(result.rows[0].internship_count) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/overview', async (_req, res, next) => {
  try {
    const [
      totals,
      students,
      companies,
      opportunities,
      interviews,
      logs,
    ] = await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*) FROM students) AS students,
          (SELECT COUNT(*) FROM companies) AS companies,
          (SELECT COUNT(*) FROM opportunities) AS opportunities,
          (SELECT COUNT(*) FROM interviews) AS interviews,
          (SELECT COUNT(*) FROM request_logs) AS logs
      `),
      query('SELECT s.*, u.username FROM students s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 100'),
      query(`
        SELECT c.*, u.username,
          COUNT(i.id) FILTER (WHERE i.status = 'internship_started') AS internship_count
        FROM companies c
        JOIN users u ON u.id = c.user_id
        LEFT JOIN interviews i ON i.company_id = c.id
        GROUP BY c.id, u.username
        ORDER BY c.created_at DESC
        LIMIT 100
      `),
      query(`
        SELECT o.*, c.name AS company_name, c.linkedin_url AS company_linkedin_url, c.website_url AS company_website_url
        FROM opportunities o
        JOIN companies c ON c.id = o.company_id
        ORDER BY o.created_at DESC
        LIMIT 100
      `),
      query(`
        SELECT i.*, s.full_name AS student_name, c.name AS company_name
        FROM interviews i
        JOIN students s ON s.id = i.student_id
        JOIN companies c ON c.id = i.company_id
        ORDER BY i.created_at DESC
        LIMIT 100
      `),
      query('SELECT * FROM request_logs ORDER BY created_at DESC LIMIT 150'),
    ]);

    res.json({
      totals: {
        students: Number(totals.rows[0].students),
        companies: Number(totals.rows[0].companies),
        opportunities: Number(totals.rows[0].opportunities),
        interviews: Number(totals.rows[0].interviews),
        logs: Number(totals.rows[0].logs),
      },
      students: students.rows.map(mapStudent),
      companies: companies.rows.map(mapCompany),
      opportunities: opportunities.rows.map(mapOpportunity),
      interviews: interviews.rows.map((row) => ({
        id: row.id,
        studentId: row.student_id,
        studentName: row.student_name,
        companyId: row.company_id,
        companyName: row.company_name,
        mode: row.mode,
        status: row.status,
        meetingUrl: row.meeting_url,
        scheduledAt: row.scheduled_at,
        createdAt: row.created_at,
      })),
      logs: logs.rows.map((row) => ({
        id: row.id,
        method: row.method,
        path: row.path,
        statusCode: row.status_code,
        durationMs: row.duration_ms,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  const duplicate = error.code === '23505';
  res.status(duplicate ? 409 : 500).json({
    message: duplicate ? 'Ja existe um registo com esses dados.' : 'Erro interno do servidor.',
  });
});

await migrate();
await seed();

app.listen(port, () => {
  console.log(`API pronta em ${publicBaseUrl}`);
});
