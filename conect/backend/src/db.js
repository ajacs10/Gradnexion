import pg from 'pg';
import crypto from 'node:crypto';

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgres://insutec_connect:insutec_connect@localhost:5432/insutec_connect',
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('student', 'company', 'admin')),
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL DEFAULT '',
      password_salt TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt TEXT NOT NULL DEFAULT '';

    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'company', 'admin'));

    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      course TEXT NOT NULL,
      graduation_year INTEGER NOT NULL,
      current_area TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      project TEXT,
      university TEXT NOT NULL,
      institutions TEXT[] NOT NULL DEFAULT '{}',
      university_declaration_url TEXT NOT NULL,
      photo_url TEXT,
      portfolio_url TEXT,
      linkedin_url TEXT,
      quote TEXT NOT NULL,
      skills TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE students ADD COLUMN IF NOT EXISTS institutions TEXT[] NOT NULL DEFAULT '{}';

    UPDATE students
    SET institutions = ARRAY[university]
    WHERE COALESCE(array_length(institutions, 1), 0) = 0;

    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      sector TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      description TEXT NOT NULL,
      registration_number TEXT NOT NULL UNIQUE,
      logo_url TEXT,
      website_url TEXT,
      linkedin_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      area TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      location TEXT NOT NULL,
      company_address TEXT NOT NULL,
      mode TEXT NOT NULL,
      visibility TEXT NOT NULL,
      duration TEXT NOT NULL,
      deadline TEXT NOT NULL,
      requirements TEXT[] NOT NULL DEFAULT '{}',
      description TEXT NOT NULL,
      latitude NUMERIC,
      longitude NUMERIC,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted', 'reviewing', 'accepted', 'rejected')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (student_id, opportunity_id)
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      mode TEXT NOT NULL CHECK (mode IN ('Presencial', 'Via plataforma')),
      status TEXT NOT NULL DEFAULT 'requested'
        CHECK (status IN ('requested', 'scheduled', 'internship_started', 'rejected', 'completed')),
      meeting_url TEXT,
      scheduled_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS request_logs (
      id SERIAL PRIMARY KEY,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function seed() {
  const passwordHash = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { hash, salt };
  };

  const seedStudent = async () => {
    const existing = await query('SELECT id FROM users WHERE username = $1', ['asobrinho']);
    if (existing.rowCount > 0) return;

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync('ana12345', salt, 64).toString('hex');
    const user = await query(
      'INSERT INTO users (role, username, password_hash, password_salt) VALUES ($1, $2, $3, $4) RETURNING id',
      ['student', 'asobrinho', hash, salt],
    );

    await query(
      `INSERT INTO students (
        user_id, full_name, course, graduation_year, current_area, email, phone, project,
        university, institutions, university_declaration_url, photo_url, portfolio_url, linkedin_url, quote, skills
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )`,
      [
        user.rows[0].id,
        'Ana Sobrinho',
        'Informática e Sistemas de Informação',
        2026,
        'Frontend Developer',
        'ana.sobrinho@example.com',
        '+244 900 000 000',
        'Portfólio próprio',
        'INSUTEC',
        ['INSUTEC'],
        'https://www.anasobrinho.me/',
        '',
        'https://www.anasobrinho.me/',
        'https://www.linkedin.com/',
        'Estudante cadastrada na rede para oportunidades de estágio e entrevistas.',
        ['React', 'UI', 'Comunidade'],
      ],
    );
  };

  const seedCompany = async () => {
    const existing = await query('SELECT id FROM users WHERE username = $1', ['shecodeajacs']);
    if (existing.rowCount > 0) return;

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync('empresa123', salt, 64).toString('hex');
    const user = await query(
      'INSERT INTO users (role, username, password_hash, password_salt) VALUES ($1, $2, $3, $4) RETURNING id',
      ['company', 'shecodeajacs', hash, salt],
    );

    await query(
      `INSERT INTO companies (
        user_id, name, contact_name, sector, province, city, description,
        registration_number, logo_url, website_url, linkedin_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )`,
      [
        user.rows[0].id,
        'SheCodeAjacs',
        'Ana Sobrinho',
        'Tecnologia',
        'Luanda',
        'Talatona',
        'Plataforma digital para ligar estudantes e empresas com foco em recrutamento e estágio.',
        'NIF-2026-0001',
        '',
        'https://www.anasobrinho.me/',
        'https://www.linkedin.com/company/shecodeajacs',
      ],
    );
  };

  const seedOpportunity = async () => {
    const company = await query('SELECT id FROM companies WHERE name = $1', ['SheCodeAjacs']);
    if (company.rowCount === 0) return;

    const existing = await query(
      'SELECT id FROM opportunities WHERE company_id = $1 AND title = $2',
      [company.rows[0].id, 'Estágio em Desenvolvimento Frontend'],
    );
    if (existing.rowCount > 0) return;

    await query(
      `INSERT INTO opportunities (
        company_id, title, area, province, city, location, company_address, mode,
        visibility, duration, deadline, requirements, description, latitude, longitude
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )`,
      [
        company.rows[0].id,
        'Estágio em Desenvolvimento Frontend',
        'Informática e Sistemas de Informação',
        'Luanda',
        'Talatona',
        'Talatona, Luanda',
        'Talatona, próximo ao centro empresarial',
        'Híbrido',
        'Mostrar no perfil dos estudantes compatíveis',
        '3 meses',
        '30 Jun 2026',
        ['React', 'UI', 'Comunicação'],
        'Apoio na criação de interfaces web, integração com APIs e melhoria da experiência dos estudantes na plataforma.',
        -8.8390,
        13.2894,
      ],
    );
  };

  const seedAdmin = async () => {
    const existing = await query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (existing.rowCount > 0) return;

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync('admin123', salt, 64).toString('hex');
    await query(
      'INSERT INTO users (role, username, password_hash, password_salt) VALUES ($1, $2, $3, $4)',
      ['admin', 'admin', hash, salt],
    );
  };

  const seedTalentStudents = async () => {
    const talents = [
      {
        username: 'edmilson-uan',
        name: 'Edmilson Paulo',
        course: 'Informática e Sistemas de Informação',
        year: 2026,
        role: 'Desenvolvedor Web',
        email: 'edmilson.paulo@talentos.ao',
        phone: '+244 923 110 201',
        project: 'Sistema de gestão académica',
        university: 'Universidade Agostinho Neto',
        portfolio: 'https://portfolio.example.com/edmilson',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Constrói interfaces web e APIs para resolver problemas administrativos nas instituições.',
        skills: ['React', 'Node.js', 'PostgreSQL'],
      },
      {
        username: 'marcia-isptec',
        name: 'Márcia Cangombe',
        course: 'Contabilidade & Finanças',
        year: 2025,
        role: 'Analista Financeira Júnior',
        email: 'marcia.cangombe@talentos.ao',
        phone: '+244 923 110 202',
        project: 'Modelo de controlo orçamental',
        university: 'ISPTEC',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Tem foco em análise de custos, reconciliação bancária e relatórios financeiros.',
        skills: ['Excel', 'Power BI', 'Contabilidade'],
      },
      {
        username: 'nelson-ucan',
        name: 'Nelson Kiala',
        course: 'Direito',
        year: 2026,
        role: 'Assistente Jurídico',
        email: 'nelson.kiala@talentos.ao',
        phone: '+244 923 110 203',
        project: 'Clínica jurídica comunitária',
        university: 'Universidade Católica de Angola',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Interessa-se por direito laboral, contratos e apoio jurídico a pequenas empresas.',
        skills: ['Contratos', 'Pesquisa jurídica', 'Mediação'],
      },
      {
        username: 'helena-uma',
        name: 'Helena Chissingui',
        course: 'Gestão de Recursos Humanos',
        year: 2025,
        role: 'Técnica de RH',
        email: 'helena.chissingui@talentos.ao',
        phone: '+244 923 110 204',
        project: 'Plano de onboarding para estagiários',
        university: 'Universidade Mandume ya Ndemufayo',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Organiza processos de recrutamento, integração e acompanhamento de desempenho.',
        skills: ['Recrutamento', 'Onboarding', 'Comunicação'],
      },
      {
        username: 'adriano-ukb',
        name: 'Adriano Samacaca',
        course: 'Redes e Telecomunicações',
        year: 2026,
        role: 'Técnico de Redes',
        email: 'adriano.samacaca@talentos.ao',
        phone: '+244 923 110 205',
        project: 'Monitorização de rede local',
        university: 'Universidade Katyavala Bwila',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Configura redes locais, documenta infraestruturas e apoia equipas de suporte técnico.',
        skills: ['Cisco', 'Linux', 'Suporte'],
      },
      {
        username: 'ruth-ujes',
        name: 'Ruth Cassoma',
        course: 'Hotelaria & Turismo',
        year: 2025,
        role: 'Assistente de Operações Turísticas',
        email: 'ruth.cassoma@talentos.ao',
        phone: '+244 923 110 206',
        project: 'Roteiro turístico local',
        university: 'Universidade José Eduardo dos Santos',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Foca-se em atendimento, planeamento de roteiros e experiência do cliente.',
        skills: ['Atendimento', 'Eventos', 'Inglês'],
      },
      {
        username: 'miguel-isutic',
        name: 'Miguel Teca',
        course: 'Logística e Gestão Comercial',
        year: 2026,
        role: 'Assistente de Logística',
        email: 'miguel.teca@talentos.ao',
        phone: '+244 923 110 207',
        project: 'Controlo de inventário para PMEs',
        university: 'ISUTIC',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Trabalha com inventário, compras, distribuição e organização de processos comerciais.',
        skills: ['Inventário', 'Compras', 'Excel'],
      },
      {
        username: 'beatriz-isced',
        name: 'Beatriz Capita',
        course: 'Ciências Criminais',
        year: 2025,
        role: 'Assistente de Investigação',
        email: 'beatriz.capita@talentos.ao',
        phone: '+244 923 110 208',
        project: 'Mapeamento de prevenção comunitária',
        university: 'ISCED Luanda',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Interessa-se por análise documental, prevenção e estudos sociais aplicados.',
        skills: ['Investigação', 'Relatórios', 'Ética'],
      },
      {
        username: 'carlos-metodista',
        name: 'Carlos Manuel',
        course: 'Informática e Sistemas de Informação',
        year: 2026,
        role: 'Analista de Dados Júnior',
        email: 'carlos.manuel@talentos.ao',
        phone: '+244 923 110 209',
        project: 'Dashboard de indicadores académicos',
        university: 'Universidade Metodista de Angola',
        portfolio: 'https://portfolio.example.com/carlos',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Cria dashboards e modelos simples para apoiar decisões com dados.',
        skills: ['SQL', 'Power BI', 'Python'],
      },
      {
        username: 'sofia-lusiada',
        name: 'Sofia Domingos',
        course: 'Gestão de Recursos Humanos',
        year: 2025,
        role: 'Assistente Administrativa',
        email: 'sofia.domingos@talentos.ao',
        phone: '+244 923 110 210',
        project: 'Digitalização de processos internos',
        university: 'Universidade Lusíada de Angola',
        portfolio: '',
        linkedin: 'https://www.linkedin.com/',
        quote: 'Apoia rotinas administrativas, comunicação interna e organização documental.',
        skills: ['Administração', 'Arquivo', 'Comunicação'],
      },
    ];

    for (const talent of talents) {
      const existing = await query('SELECT id FROM users WHERE username = $1', [talent.username]);
      if (existing.rowCount > 0) continue;

      const credentials = passwordHash('estudante123');
      const user = await query(
        'INSERT INTO users (role, username, password_hash, password_salt) VALUES ($1, $2, $3, $4) RETURNING id',
        ['student', talent.username, credentials.hash, credentials.salt],
      );

      await query(
        `INSERT INTO students (
          user_id, full_name, course, graduation_year, current_area, email, phone, project,
          university, institutions, university_declaration_url, photo_url, portfolio_url, linkedin_url, quote, skills
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )`,
        [
          user.rows[0].id,
          talent.name,
          talent.course,
          talent.year,
          talent.role,
          talent.email,
          talent.phone,
          talent.project,
          talent.university,
          [talent.university],
          'https://www.anasobrinho.me/',
          '',
          talent.portfolio,
          talent.linkedin,
          talent.quote,
          talent.skills,
        ],
      );
    }
  };

  await seedStudent();
  await seedCompany();
  await seedTalentStudents();
  await seedOpportunity();
  await seedAdmin();
}
