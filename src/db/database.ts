import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd(), 'db');
const DB_PATH = path.join(DB_DIR, 'servixoo.db');

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
    initializeDatabase();
  }
});

function runQuery(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

async function initializeDatabase() {
  try {
    // Enable WAL mode for concurrency
    db.serialize(() => {
      db.run('PRAGMA journal_mode = WAL');
    });

    // Create tables
    await runQuery(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        required_skills TEXT, -- comma-separated list
        district TEXT,
        source TEXT,
        scraped_at TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        demand_score REAL DEFAULT 0,
        trend_direction TEXT -- 'UP', 'DOWN', 'STABLE'
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS curricula (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institution_name TEXT NOT NULL,
        course_name TEXT NOT NULL,
        topics TEXT, -- comma-separated list of topics
        last_updated TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        top_demand_skills TEXT, -- comma-separated
        gap_score REAL DEFAULT 0
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS skill_gap_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        curriculum_id INTEGER,
        missing_skills TEXT, -- comma-separated
        recommendation_text TEXT,
        created_at TEXT,
        FOREIGN KEY (curriculum_id) REFERENCES curricula(id)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS ai_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        curriculum_id INTEGER,
        inaccuracy_type TEXT NOT NULL,
        incorrect_section TEXT,
        explanation TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES skill_gap_reports(id),
        FOREIGN KEY (curriculum_id) REFERENCES curricula(id)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS roadmaps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT,
        college_taught TEXT,
        target_role TEXT,
        gap_summary TEXT,
        bridge_strategy TEXT,
        milestones TEXT,
        avoid_list TEXT,
        checklist TEXT,
        generated_at TEXT
      )
    `);

    // Course selections, subjects and market demand mapping
    await runQuery(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        stream TEXT NOT NULL,
        typical_university TEXT,
        duration TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS syllabus_units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        subject_name TEXT NOT NULL,
        unit_topics TEXT NOT NULL,
        semester INTEGER,
        credit_hours INTEGER,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS market_skills_by_field (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        field TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        demand_score REAL DEFAULT 0,
        is_trending INTEGER DEFAULT 0,
        typical_job_roles TEXT,
        UNIQUE(field, skill_name)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS curriculum_gap_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        matched_skills TEXT,
        missing_skills TEXT,
        outdated_topics TEXT,
        gap_score REAL DEFAULT 0,
        generated_at TEXT,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS student_readiness (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT,
        dream_job TEXT,
        readiness_score REAL,
        matched_skills TEXT,
        missing_skills TEXT,
        institution TEXT,
        created_at TEXT
      )
    `);

    console.log('Database tables verified/created successfully.');
    await seedDatabase();
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
}

async function seedDatabase() {
  try {
    const existingCourses = await getQuery('SELECT COUNT(*) as count FROM courses');
    if (!existingCourses[0] || existingCourses[0].count === 0) {
      console.log('Seeding courses, syllabus_units, and market_skills_by_field...');

      // 1. Courses
      const coursesToSeed = [
        { name: 'B.Tech Computer Science', stream: 'Engineering', typical_university: 'State Technological University', duration: '4 Years' },
        { name: 'B.Tech Mechanical Engineering', stream: 'Engineering', typical_university: 'State Technological University', duration: '4 Years' },
        { name: 'B.Tech Electronics & Communication', stream: 'Engineering', typical_university: 'State Technological University', duration: '4 Years' },
        { name: 'MBA (Marketing)', stream: 'Marketing', typical_university: 'Bangalore University', duration: '2 Years' },
        { name: 'B.Com (Honours)', stream: 'Commerce', typical_university: 'Delhi University', duration: '3 Years' },
        { name: 'B.Sc Mathematics', stream: 'Science', typical_university: 'Indian Institute of Science (IISc)', duration: '3 Years' },
        { name: 'BCA (Bachelor of Computer Applications)', stream: 'Others', typical_university: 'Bangalore University', duration: '3 Years' }
      ];

      for (const course of coursesToSeed) {
        await runQuery(
          'INSERT OR IGNORE INTO courses (name, stream, typical_university, duration) VALUES (?, ?, ?, ?)',
          [course.name, course.stream, course.typical_university, course.duration]
        );
      }

      // Fetch course IDs to map syllabus units
      const coursesInDb = await getQuery<{ id: number, name: string }>('SELECT id, name FROM courses');
      const courseIdMap: Record<string, number> = {};
      for (const c of coursesInDb) {
        courseIdMap[c.name] = c.id;
      }

      // 2. Syllabus Units
      const syllabusToSeed = [
        // B.Tech CS
        { course: 'B.Tech Computer Science', subject: 'Data Structures & Algorithms', topics: 'Arrays, Linked Lists, Stacks, Queues, Binary Trees, Graph Traversals, Sorting Algorithms, Big-O Notation', semester: 3, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Database Management Systems', topics: 'Relational Algebra, SQL Queries, Schema Normalization, Relational Models, Indexing, Transaction ACID properties', semester: 4, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Operating Systems', topics: 'Process Scheduling, Thread Synchronization, Virtual Memory, Paging, Deadlock Avoidance, File Systems', semester: 5, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Software Engineering', topics: 'Waterfall Model, Agile Scrum, Software Architecture, UML Diagrams, Unit Testing, Git Basics', semester: 6, credits: 3 },
        { course: 'B.Tech Computer Science', subject: 'Legacy Architecture Foundations', topics: 'C Programming with Turbo C Header files, COBOL file structures, XML Database parsers, Corba architecture', semester: 2, credits: 3 },

        // B.Tech Mechanical
        { course: 'B.Tech Mechanical Engineering', subject: 'Thermodynamics & Heat Transfer', topics: 'Laws of Thermodynamics, Carnot cycle, Conduction, Convection, Radiation, Heat exchangers', semester: 3, credits: 4 },
        { course: 'B.Tech Mechanical Engineering', subject: 'Design of Machine Elements', topics: 'Stress analysis, Shafts, Gears, Bearings, Fasteners, Fatigue failure, AutoCAD sketching', semester: 5, credits: 4 },
        { course: 'B.Tech Mechanical Engineering', subject: 'Manufacturing Processes', topics: 'Casting, Welding, Metal forming, Machining, CNC programming, Lathe operations', semester: 4, credits: 3 },
        { course: 'B.Tech Mechanical Engineering', subject: 'Legacy Drafting Methods', topics: 'Manual board drawing, T-square geometric projections, Hand-filing workshop practices, Steam engine linkage calculations', semester: 1, credits: 2 },

        // B.Tech Electronics
        { course: 'B.Tech Electronics & Communication', subject: 'Analog & Digital Circuits', topics: 'Semiconductor diodes, Transistors, Operational Amplifiers, Logic Gates, Flip Flops, Counters', semester: 3, credits: 4 },
        { course: 'B.Tech Electronics & Communication', subject: 'Microprocessors & Microcontrollers', topics: '8085 architecture, Assembly Language programming, Interfacing 8255, Timers, Interrupts, 8051 basics', semester: 5, credits: 4 },
        { course: 'B.Tech Electronics & Communication', subject: 'Signals & Systems', topics: 'Continuous and Discrete signals, Fourier Transform, Laplace Transform, Z-Transform, Linear Time-Invariant systems', semester: 4, credits: 4 },
        { course: 'B.Tech Electronics & Communication', subject: 'Outdated Component Layouts', topics: 'Manual circuit board etching, Breadboard prototyping, Vacuum tube amplification, CRT display deflection', semester: 2, credits: 2 },

        // MBA Marketing
        { course: 'MBA (Marketing)', subject: 'Consumer Behaviour', topics: 'Buyer psychology, decision-making process, perception, motivation, brand loyalty, demographics', semester: 1, credits: 3 },
        { course: 'MBA (Marketing)', subject: 'Traditional Marketing & PR', topics: '4Ps of Marketing, Brand Positioning, Print Advertising, Billboard campaigns, Press releases', semester: 2, credits: 3 },
        { course: 'MBA (Marketing)', subject: 'Sales & Distribution', topics: 'Retail channel strategy, wholesale distribution, sales force management, CRM pipelines', semester: 2, credits: 3 },
        { course: 'MBA (Marketing)', subject: 'Outdated Communication Strategy', topics: 'Direct mail paper flyers, Yellow pages business directories, Cold calling scripts, Telemarketing lists, Fax broadcasting', semester: 1, credits: 2 },

        // B.Com Honours
        { course: 'B.Com (Honours)', subject: 'Financial Accounting', topics: 'Double entry bookkeeping, Balance sheet preparation, Ledger accounts, Trial balance, Depreciation accounting', semester: 1, credits: 4 },
        { course: 'B.Com (Honours)', subject: 'Corporate Tax & Law', topics: 'Direct Tax codes, GST computation, Income tax slabs, Business law regulations', semester: 3, credits: 4 },
        { course: 'B.Com (Honours)', subject: 'Auditing & Costing', topics: 'Auditing standards, Cost sheet preparation, Inventory valuation LIFO FIFO, internal control audits', semester: 4, credits: 4 },
        { course: 'B.Com (Honours)', subject: 'Outdated Bookkeeping', topics: 'Manual ledger writing on paper books, Single entry ledger storage, Physical voucher file cabinets', semester: 2, credits: 2 },

        // B.Sc Mathematics
        { course: 'B.Sc Mathematics', subject: 'Real Analysis & Calculus', topics: 'Limits, Convergence, Derivatives, Integrals, Taylor Series, Sequences, Metric Spaces', semester: 1, credits: 4 },
        { course: 'B.Sc Mathematics', subject: 'Linear Algebra', topics: 'Vector Spaces, Matrices, Determinants, Eigenvalues, Eigenvectors, Linear Transformations', semester: 3, credits: 4 },
        { course: 'B.Sc Mathematics', subject: 'Probability & Statistics', topics: 'Random variables, Probability distributions, Bayes theorem, Hypothesis testing, ANOVA, Regression', semester: 4, credits: 4 },
        { course: 'B.Sc Mathematics', subject: 'Outdated Math Tools', topics: 'Logarithmic slide rules, Manual log table interpolation, Fortran 77 matrix operations', semester: 2, credits: 2 },

        // BCA
        { course: 'BCA (Bachelor of Computer Applications)', subject: 'Core Java Programming', topics: 'Object-oriented concepts, Classes and objects, Inheritance, Polymorphism, Exceptions, Basic file I/O', semester: 3, credits: 4 },
        { course: 'BCA (Bachelor of Computer Applications)', subject: 'Web Technology Basics', topics: 'HTML5 tags, CSS style declarations, Basic Javascript forms validation, PHP scripting', semester: 4, credits: 3 },
        { course: 'BCA (Bachelor of Computer Applications)', subject: 'Computer Networks', topics: 'OSI Layer model, TCP/IP protocols, IP addressing subnetting, DNS routing, HTTP protocol', semester: 5, credits: 4 },
        { course: 'BCA (Bachelor of Computer Applications)', subject: 'Outdated Scripting Module', topics: 'VBScript form styling, Flash animation scripting, ActionScript 2.0, FrontPage tables', semester: 2, credits: 2 }
      ];

      for (const item of syllabusToSeed) {
        const courseId = courseIdMap[item.course];
        if (courseId) {
          await runQuery(
            'INSERT INTO syllabus_units (course_id, subject_name, unit_topics, semester, credit_hours) VALUES (?, ?, ?, ?, ?)',
            [courseId, item.subject, item.topics, item.semester, item.credits]
          );
        }
      }

      // 3. Market Skills by Field
      const marketSkillsToSeed = [
        // Engineering
        { field: 'Engineering', skill: 'Python', score: 95.0, trend: 1, roles: 'Machine Learning Engineer, Data Scientist' },
        { field: 'Engineering', skill: 'React', score: 88.0, trend: 1, roles: 'Frontend Developer, UI Developer' },
        { field: 'Engineering', skill: 'Cloud Computing (AWS/Azure)', score: 91.0, trend: 1, roles: 'Cloud Solutions Architect, DevOps Engineer' },
        { field: 'Engineering', skill: 'Docker', score: 84.0, trend: 1, roles: 'DevOps Engineer, Platform Engineer' },
        { field: 'Engineering', skill: 'TypeScript', score: 82.0, trend: 1, roles: 'Fullstack Engineer' },
        { field: 'Engineering', skill: 'Node.js', score: 80.0, trend: 0, roles: 'Backend Developer' },
        { field: 'Engineering', skill: 'Machine Learning', score: 96.0, trend: 1, roles: 'AI Researcher' },
        { field: 'Engineering', skill: 'SQL', score: 75.0, trend: 0, roles: 'Database Administrator' },

        // Marketing
        { field: 'Marketing', skill: 'Digital Marketing', score: 93.0, trend: 1, roles: 'Digital Growth Specialist' },
        { field: 'Marketing', skill: 'SEO/SEM', score: 88.0, trend: 1, roles: 'SEO Strategist' },
        { field: 'Marketing', skill: 'Google Analytics', score: 91.0, trend: 1, roles: 'Marketing Analyst' },
        { field: 'Marketing', skill: 'Social Media Ads', score: 85.0, trend: 1, roles: 'Campaign Manager' },
        { field: 'Marketing', skill: 'Marketing Automation (HubSpot)', score: 80.0, trend: 0, roles: 'Growth Marketer' },
        { field: 'Marketing', skill: 'Content Strategy', score: 82.0, trend: 0, roles: 'Content Director' },

        // Commerce
        { field: 'Commerce', skill: 'Tally Prime ERP', score: 90.0, trend: 1, roles: 'Junior Accountant' },
        { field: 'Commerce', skill: 'Advanced Excel (VBA/PowerQuery)', score: 95.0, trend: 1, roles: 'Financial Analyst' },
        { field: 'Commerce', skill: 'GST & Tax Filing', score: 92.0, trend: 1, roles: 'Tax Consultant' },
        { field: 'Commerce', skill: 'Data Auditing', score: 80.0, trend: 0, roles: 'Corporate Auditor' },
        { field: 'Commerce', skill: 'SAP FICO', score: 85.0, trend: 0, roles: 'SAP Finance Consultant' },

        // Science
        { field: 'Science', skill: 'Python Data Science', score: 96.0, trend: 1, roles: 'Quantitative Analyst' },
        { field: 'Science', skill: 'R Programming', score: 78.0, trend: 0, roles: 'Data Scientist' },
        { field: 'Science', skill: 'Statistical Modeling', score: 92.0, trend: 1, roles: 'Biostatistician' },
        { field: 'Science', skill: 'Machine Learning', score: 95.0, trend: 1, roles: 'AI Specialist' },
        { field: 'Science', skill: 'SQL', score: 84.0, trend: 0, roles: 'Data Engineer' },

        // Others
        { field: 'Others', skill: 'React', score: 89.0, trend: 1, roles: 'Web Developer' },
        { field: 'Others', skill: 'TypeScript', score: 80.0, trend: 1, roles: 'Software Engineer' },
        { field: 'Others', skill: 'Tailwind CSS', score: 85.0, trend: 1, roles: 'UI Engineer' },
        { field: 'Others', skill: 'Git & GitHub Version Control', score: 92.0, trend: 1, roles: 'Junior Developer' },
        { field: 'Others', skill: 'REST API Integration', score: 88.0, trend: 0, roles: 'Application Developer' }
      ];

      for (const item of marketSkillsToSeed) {
        await runQuery(
          'INSERT OR IGNORE INTO market_skills_by_field (field, skill_name, demand_score, is_trending, typical_job_roles) VALUES (?, ?, ?, ?, ?)',
          [item.field, item.skill, item.score, item.trend, item.roles]
        );
      }
      console.log('Seeded courses, syllabus_units, and market_skills_by_field successfully.');
    }

    // Check if jobs already seeded
    const existingJobs = await getQuery('SELECT COUNT(*) as count FROM jobs');
    if (existingJobs[0] && existingJobs[0].count > 0) {
      console.log('Database already seeded. Skipping.');
      return;
    }

    console.log('Seeding database with realistic mock data...');

    // 1. Seed Skills (18 skills)
    const skillsToSeed = [
      { name: 'Python', category: 'Programming', demand_score: 88.5, trend_direction: 'UP' },
      { name: 'React', category: 'Frontend', demand_score: 82.0, trend_direction: 'UP' },
      { name: 'Machine Learning', category: 'AI/ML', demand_score: 95.0, trend_direction: 'UP' },
      { name: 'SQL', category: 'Database', demand_score: 75.0, trend_direction: 'STABLE' },
      { name: 'Cloud Computing', category: 'Cloud/DevOps', demand_score: 84.5, trend_direction: 'UP' },
      { name: 'Docker', category: 'Cloud/DevOps', demand_score: 78.0, trend_direction: 'UP' },
      { name: 'TypeScript', category: 'Frontend', demand_score: 80.5, trend_direction: 'UP' },
      { name: 'Data Analysis', category: 'AI/ML', demand_score: 85.0, trend_direction: 'STABLE' },
      { name: 'Java', category: 'Backend', demand_score: 68.0, trend_direction: 'DOWN' },
      { name: 'Kubernetes', category: 'Cloud/DevOps', demand_score: 89.0, trend_direction: 'UP' },
      { name: 'UI/UX Design', category: 'Design', demand_score: 72.0, trend_direction: 'STABLE' },
      { name: 'Project Management', category: 'Management', demand_score: 65.0, trend_direction: 'STABLE' },
      { name: 'Cybersecurity', category: 'Security', demand_score: 91.0, trend_direction: 'UP' },
      { name: 'DevOps', category: 'Cloud/DevOps', demand_score: 86.0, trend_direction: 'UP' },
      { name: 'Node.js', category: 'Backend', demand_score: 79.5, trend_direction: 'UP' },
      { name: 'Natural Language Processing', category: 'AI/ML', demand_score: 93.0, trend_direction: 'UP' },
      { name: 'Deep Learning', category: 'AI/ML', demand_score: 96.2, trend_direction: 'UP' },
      { name: 'C++', category: 'Programming', demand_score: 60.5, trend_direction: 'DOWN' }
    ];

    for (const sk of skillsToSeed) {
      await runQuery(
        'INSERT OR IGNORE INTO skills (name, category, demand_score, trend_direction) VALUES (?, ?, ?, ?)',
        [sk.name, sk.category, sk.demand_score, sk.trend_direction]
      );
    }

    // 2. Seed Districts (5 districts)
    const districtsToSeed = [
      { name: 'North Bangalore Tech Zone', top_demand_skills: 'Machine Learning,Python,Cloud Computing,Docker', gap_score: 78.5 },
      { name: 'Whitefield Industrial Area', top_demand_skills: 'Java,SQL,React,Project Management,Node.js', gap_score: 42.0 },
      { name: 'Electronic City Core', top_demand_skills: 'C++,Embedded Systems,Cybersecurity,Cloud Computing', gap_score: 61.2 },
      { name: 'Outer Ring Road Corridor', top_demand_skills: 'React,TypeScript,Node.js,UI/UX Design,DevOps', gap_score: 55.4 },
      { name: 'Central District Hub', top_demand_skills: 'Data Analysis,SQL,Python,Project Management', gap_score: 35.0 }
    ];

    for (const dist of districtsToSeed) {
      await runQuery(
        'INSERT OR IGNORE INTO districts (name, top_demand_skills, gap_score) VALUES (?, ?, ?)',
        [dist.name, dist.top_demand_skills, dist.gap_score]
      );
    }

    // 3. Seed Curricula (6 curricula)
    const curriculaToSeed = [
      {
        institution_name: 'State Institute of Engineering',
        course_name: 'B.Tech in Computer Science',
        topics: 'Java,C++,SQL,Database Systems,HTML,CSS,Basic Data Structures,Operating Systems',
        last_updated: '2024-06-15'
      },
      {
        institution_name: 'Tech University Bangalore',
        course_name: 'M.Tech in Artificial Intelligence',
        topics: 'Python,Linear Algebra,Probability,Basic Statistics,Data Warehousing,Introduction to Neural Networks',
        last_updated: '2025-01-10'
      },
      {
        institution_name: 'Metropolitan Polytechnic',
        course_name: 'Diploma in Software Engineering',
        topics: 'HTML,CSS,JavaScript,PHP,SQL,Basic Programming in C',
        last_updated: '2023-09-20'
      },
      {
        institution_name: 'Global Business School',
        course_name: 'MBA in Business Analytics',
        topics: 'Excel,Statistics,SQL,Project Management,Business Communication',
        last_updated: '2025-03-01'
      },
      {
        institution_name: 'Vikas College of Design',
        course_name: 'B.Des in Interaction Design',
        topics: 'Graphic Design,Design Thinking,Photoshop,Basic HTML',
        last_updated: '2024-11-12'
      },
      {
        institution_name: 'Silicon Valley Academy',
        course_name: 'Post Graduate Diploma in DevOps',
        topics: 'Linux,Shell Scripting,AWS Basics,Docker,SQL,Basic Python',
        last_updated: '2025-05-22'
      }
    ];

    for (const curr of curriculaToSeed) {
      await runQuery(
        'INSERT INTO curricula (institution_name, course_name, topics, last_updated) VALUES (?, ?, ?, ?)',
        [curr.institution_name, curr.course_name, curr.topics, curr.last_updated]
      );
    }

    // 4. Seed Jobs (25 jobs across districts with rich descriptions)
    const jobsToSeed = [
      {
        title: 'Senior Machine Learning Engineer',
        description: 'Seeking an experienced engineer to build deep learning models for NLP. Must be proficient in Python, TensorFlow, PyTorch, and deploying models using Docker on Cloud Computing infrastructure.',
        required_skills: 'Python,Machine Learning,Natural Language Processing,Deep Learning,Docker,Cloud Computing',
        district: 'North Bangalore Tech Zone',
        source: 'LinkedIn Jobs',
        scraped_at: '2026-09-18'
      },
      {
        title: 'Full Stack React Developer',
        description: 'We are hiring a React developer with TypeScript expertise. You will build high-quality user interfaces and integrate them with Node.js and SQL backends. UI/UX Design knowledge is a major plus.',
        required_skills: 'React,TypeScript,Node.js,SQL,UI/UX Design',
        district: 'Outer Ring Road Corridor',
        source: 'Indeed',
        scraped_at: '2026-09-17'
      },
      {
        title: 'Cloud DevOps Architect',
        description: 'Looking for a specialist in Cloud Computing, Kubernetes, and DevOps. Experience with Docker, CI/CD pipelines, and infrastructure as code is required.',
        required_skills: 'Cloud Computing,Kubernetes,DevOps,Docker',
        district: 'North Bangalore Tech Zone',
        source: 'Glassdoor',
        scraped_at: '2026-09-18'
      },
      {
        title: 'Data Analyst & Visualization Expert',
        description: 'Analyze large-scale corporate data using SQL, Python, and Excel. Design executive dashboards. Must have a strong background in Data Analysis.',
        required_skills: 'Data Analysis,SQL,Python',
        district: 'Central District Hub',
        source: 'Naukri',
        scraped_at: '2026-09-19'
      },
      {
        title: 'Lead Java Software Engineer',
        description: 'Develop enterprise-grade secure banking backends. Expertise in Java, SQL, and database transaction optimization. Experience leading agile software projects.',
        required_skills: 'Java,SQL,Project Management',
        district: 'Whitefield Industrial Area',
        source: 'LinkedIn Jobs',
        scraped_at: '2026-09-15'
      },
      {
        title: 'Cybersecurity Threat Analyst',
        description: 'Monitor, detect, and respond to security threats. Skills in network firewalls, system hardening, and Cybersecurity protocols are required.',
        required_skills: 'Cybersecurity,Cloud Computing',
        district: 'Electronic City Core',
        source: 'CyberJobs',
        scraped_at: '2026-09-18'
      },
      {
        title: 'Senior Embedded Software Developer',
        description: 'Design and write kernel-level C++ code for IoT devices. Solid understanding of hardware registers and embedded systems.',
        required_skills: 'C++',
        district: 'Electronic City Core',
        source: 'Indeed',
        scraped_at: '2026-09-16'
      },
      {
        title: 'UX/UI Product Designer',
        description: 'Create user journeys, wireframes, and prototypes using Figma. Work with front-end React developers to translate sketches into beautiful responsive applications.',
        required_skills: 'UI/UX Design,React',
        district: 'Outer Ring Road Corridor',
        source: 'Dribbble',
        scraped_at: '2026-09-19'
      },
      {
        title: 'Python Backend Developer',
        description: 'Build fast API services using Python, Flask, and PostgreSQL. Familiarity with Docker and basic Cloud Computing platforms is needed.',
        required_skills: 'Python,SQL,Docker,Cloud Computing',
        district: 'North Bangalore Tech Zone',
        source: 'Naukri',
        scraped_at: '2026-09-18'
      },
      {
        title: 'Frontend Engineer (React & TypeScript)',
        description: 'Join our product team to build a collaborative canvas interface. Heavy use of React hooks, context, and custom state management with TypeScript.',
        required_skills: 'React,TypeScript',
        district: 'Outer Ring Road Corridor',
        source: 'LinkedIn Jobs',
        scraped_at: '2026-09-19'
      },
      {
        title: 'AI Researcher (NLP & LLMs)',
        description: 'Advance our proprietary AI capabilities. Conduct research on transformer architectures, Natural Language Processing, and Deep Learning models using Python.',
        required_skills: 'Python,Machine Learning,Natural Language Processing,Deep Learning',
        district: 'North Bangalore Tech Zone',
        source: 'Indeed',
        scraped_at: '2026-09-19'
      },
      {
        title: 'DevOps and Platform Engineer',
        description: 'Automate build pipelines. Maintain production clusters running on Kubernetes in Google Cloud. Deep knowledge of Docker and DevOps practices.',
        required_skills: 'DevOps,Kubernetes,Docker,Cloud Computing',
        district: 'Outer Ring Road Corridor',
        source: 'Glassdoor',
        scraped_at: '2026-09-18'
      },
      {
        title: 'Business Intelligence Analyst',
        description: 'Translate raw sales data into actionable metrics. Strong SQL skills, Data Analysis techniques, and dashboard visual design proficiency.',
        required_skills: 'SQL,Data Analysis,UI/UX Design',
        district: 'Central District Hub',
        source: 'Indeed',
        scraped_at: '2026-09-17'
      },
      {
        title: 'Technical Project Manager',
        description: 'Coordinate cross-functional development teams. Track project milestones, manage backlogs, and ensure release dates. Ideal candidate has software development roots.',
        required_skills: 'Project Management,Java',
        district: 'Whitefield Industrial Area',
        source: 'LinkedIn Jobs',
        scraped_at: '2026-09-14'
      },
      {
        title: 'Backend Node.js Developer',
        description: 'Develop high-performance REST APIs. Integrate relational and document databases. Experience with Node.js and SQL is essential.',
        required_skills: 'Node.js,SQL',
        district: 'Whitefield Industrial Area',
        source: 'Indeed',
        scraped_at: '2026-09-18'
      },
      {
        title: 'Cybersecurity Consultant',
        description: 'Conduct security audits, penetration testing, and recommend protocols. Deep expert in Cybersecurity, cloud architecture, and network firewalls.',
        required_skills: 'Cybersecurity,Cloud Computing',
        district: 'Electronic City Core',
        source: 'Naukri',
        scraped_at: '2026-09-18'
      },
      {
        title: 'Machine Learning Software Developer',
        description: 'Integrate pre-trained scikit-learn classifiers and PyTorch models into web APIs. Python development, SQL database integration, and Docker deployment.',
        required_skills: 'Machine Learning,Python,SQL,Docker',
        district: 'North Bangalore Tech Zone',
        source: 'Glassdoor',
        scraped_at: '2026-09-19'
      },
      {
        title: 'Systems C++ Programmer',
        description: 'Develop low-level network drivers and firmware. Strong knowledge of multi-threading, memory optimization, and C++.',
        required_skills: 'C++',
        district: 'Electronic City Core',
        source: 'LinkedIn Jobs',
        scraped_at: '2026-09-13'
      },
      {
        title: 'Data Science Specialist',
        description: 'Utilize predictive modelling, machine learning algorithms, and deep analysis of unstructured customer data. Python and SQL are mandatory.',
        required_skills: 'Machine Learning,Python,SQL,Data Analysis',
        district: 'Central District Hub',
        source: 'Indeed',
        scraped_at: '2026-09-18'
      },
      {
        title: 'Web Application UI Developer',
        description: 'Create fluid user interfaces. Collaborate with designers. Solid understanding of React, TypeScript, and modern CSS layout engines.',
        required_skills: 'React,TypeScript,UI/UX Design',
        district: 'Outer Ring Road Corridor',
        source: 'Naukri',
        scraped_at: '2026-09-19'
      }
    ];

    for (const job of jobsToSeed) {
      await runQuery(
        'INSERT INTO jobs (title, description, required_skills, district, source, scraped_at) VALUES (?, ?, ?, ?, ?, ?)',
        [job.title, job.description, job.required_skills, job.district, job.source, job.scraped_at]
      );
    }

    // 5. Seed some initial reports to make the UI look alive
    const initialReportsToSeed = [
      {
        curriculum_id: 1,
        missing_skills: 'React,TypeScript,Node.js,Python,Machine Learning',
        recommendation_text: 'The B.Tech in Computer Science curriculum is heavily focused on traditional systems programming (Java, C++) and database fundamentals (SQL). However, it is completely missing modern web development technologies (React, TypeScript, Node.js) and high-growth AI competencies (Python, Machine Learning). Recommend introducing elective modules in "Modern Web Architectures" and "Applied Artificial Intelligence" to align with Electronic City and Outer Ring Road employer needs.',
        created_at: '2026-09-19 01:30:00'
      },
      {
        curriculum_id: 3,
        missing_skills: 'React,Node.js,TypeScript,SQL',
        recommendation_text: 'The Diploma in Software Engineering contains older technologies (PHP, Basic C) and is missing modern framework standards. We recommend adding a core component on Modern Full Stack Development using React for frontend and Node.js with SQL/TypeScript for backend services to boost student employability in the Outer Ring Road Corridor.',
        created_at: '2026-09-19 02:00:00'
      }
    ];

    for (const rep of initialReportsToSeed) {
      await runQuery(
        'INSERT INTO skill_gap_reports (curriculum_id, missing_skills, recommendation_text, created_at) VALUES (?, ?, ?, ?)',
        [rep.curriculum_id, rep.missing_skills, rep.recommendation_text, rep.created_at]
      );
    }

    // Seed student readiness assessments for authentic peer benchmarking
    const existingAssessments = await getQuery('SELECT COUNT(*) as count FROM student_readiness');
    if (!existingAssessments[0] || existingAssessments[0].count === 0) {
      console.log('Seeding student readiness benchmarks...');
      const studentAssessmentsToSeed = [
        { student_id: 'student_1', dream_job: 'Frontend Engineer', readiness_score: 65, matched_skills: 'React,HTML,CSS', missing_skills: 'TypeScript,Tailwind', institution: 'State Technological University', created_at: '2026-09-18' },
        { student_id: 'student_2', dream_job: 'Backend Developer', readiness_score: 55, matched_skills: 'Node.js,SQL', missing_skills: 'TypeScript,Docker', institution: 'State Technological University', created_at: '2026-09-18' },
        { student_id: 'student_3', dream_job: 'Full Stack Engineer', readiness_score: 42, matched_skills: 'HTML,CSS,JavaScript', missing_skills: 'React,Node.js,SQL,Git', institution: 'Anna University', created_at: '2026-09-19' },
        { student_id: 'student_4', dream_job: 'Data Analyst', readiness_score: 72, matched_skills: 'Python,SQL,Excel', missing_skills: 'Tableau,Machine Learning', institution: 'Bangalore University', created_at: '2026-09-19' },
        { student_id: 'student_5', dream_job: 'DevOps Engineer', readiness_score: 38, matched_skills: 'Linux,Git', missing_skills: 'Docker,Kubernetes,AWS,CI/CD', institution: 'State Technological University', created_at: '2026-09-19' },
        { student_id: 'student_6', dream_job: 'Frontend Engineer', readiness_score: 81, matched_skills: 'React,TypeScript,HTML,CSS,Tailwind,Git', missing_skills: 'Redux,Next.js', institution: 'IIT Bombay', created_at: '2026-09-19' },
        { student_id: 'student_7', dream_job: 'Machine Learning Engineer', readiness_score: 48, matched_skills: 'Python,Linear Algebra', missing_skills: 'PyTorch,Scikit-Learn,MLOps', institution: 'NIT Trichy', created_at: '2026-09-19' },
        { student_id: 'student_8', dream_job: 'Full Stack Engineer', readiness_score: 61, matched_skills: 'React,Node.js,SQL,Git', missing_skills: 'TypeScript,Docker,GraphQL', institution: 'DTU', created_at: '2026-09-19' },
        { student_id: 'student_9', dream_job: 'Android Developer', readiness_score: 52, matched_skills: 'Java,XML', missing_skills: 'Kotlin,Jetpack Compose', institution: 'Anna University', created_at: '2026-09-19' },
        { student_id: 'student_10', dream_job: 'Product Manager', readiness_score: 68, matched_skills: 'Communication,Agile,Wireframing', missing_skills: 'Product Analytics,SQL', institution: 'Bangalore University', created_at: '2026-09-19' },
        { student_id: 'student_11', dream_job: 'Frontend Engineer', readiness_score: 30, matched_skills: 'HTML', missing_skills: 'CSS,JavaScript,React', institution: 'State Technological University', created_at: '2026-09-19' },
        { student_id: 'student_12', dream_job: 'Backend Developer', readiness_score: 45, matched_skills: 'SQL', missing_skills: 'Node.js,Express,Git', institution: 'Anna University', created_at: '2026-09-19' },
        { student_id: 'student_13', dream_job: 'Data Analyst', readiness_score: 58, matched_skills: 'Excel,SQL', missing_skills: 'Python,PowerBI', institution: 'Bangalore University', created_at: '2026-09-19' },
        { student_id: 'student_14', dream_job: 'Software Engineer', readiness_score: 67, matched_skills: 'Java,Data Structures,SQL', missing_skills: 'Spring Boot,Git', institution: 'State Technological University', created_at: '2026-09-19' },
        { student_id: 'student_15', dream_job: 'Cloud Engineer', readiness_score: 40, matched_skills: 'Networking', missing_skills: 'AWS,Terraform,Linux', institution: 'NIT Trichy', created_at: '2026-09-19' },
        { student_id: 'student_16', dream_job: 'Frontend Engineer', readiness_score: 75, matched_skills: 'React,JavaScript,Tailwind', missing_skills: 'TypeScript,Next.js', institution: 'IIT Bombay', created_at: '2026-09-19' },
        { student_id: 'student_17', dream_job: 'Cybersecurity Analyst', readiness_score: 49, matched_skills: 'Networking,Linux', missing_skills: 'Penetration Testing,Wireshark', institution: 'DTU', created_at: '2026-09-19' },
        { student_id: 'student_18', dream_job: 'Full Stack Engineer', readiness_score: 78, matched_skills: 'React,Node.js,MongoDB,Express', missing_skills: 'TypeScript,AWS', institution: 'State Technological University', created_at: '2026-09-19' },
        { student_id: 'student_19', dream_job: 'QA Engineer', readiness_score: 53, matched_skills: 'Manual Testing', missing_skills: 'Selenium,Python', institution: 'Bangalore University', created_at: '2026-09-19' },
        { student_id: 'student_20', dream_job: 'Data Scientist', readiness_score: 64, matched_skills: 'Python,Pandas,SQL', missing_skills: 'Machine Learning,Scikit-Learn', institution: 'IIT Bombay', created_at: '2026-09-19' },
        { student_id: 'student_21', dream_job: 'UI/UX Designer', readiness_score: 70, matched_skills: 'Figma,Wireframing', missing_skills: 'User Research,Prototyping', institution: 'Bangalore University', created_at: '2026-09-19' },
        { student_id: 'student_22', dream_job: 'Frontend Engineer', readiness_score: 50, matched_skills: 'HTML,CSS,JavaScript', missing_skills: 'React,Tailwind', institution: 'Anna University', created_at: '2026-09-19' },
        { student_id: 'student_23', dream_job: 'Backend Developer', readiness_score: 62, matched_skills: 'Node.js,PostgreSQL', missing_skills: 'Redis,Docker', institution: 'State Technological University', created_at: '2026-09-19' },
        { student_id: 'student_24', dream_job: 'Mobile App Developer', readiness_score: 46, matched_skills: 'Java', missing_skills: 'Flutter,Dart', institution: 'Anna University', created_at: '2026-09-19' },
        { student_id: 'student_25', dream_job: 'DevOps Engineer', readiness_score: 57, matched_skills: 'Linux,Git,Docker', missing_skills: 'Ansible,Kubernetes', institution: 'DTU', created_at: '2026-09-19' }
      ];

      for (const student of studentAssessmentsToSeed) {
        await runQuery(
          'INSERT INTO student_readiness (student_id, dream_job, readiness_score, matched_skills, missing_skills, institution, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [student.student_id, student.dream_job, student.readiness_score, student.matched_skills, student.missing_skills, student.institution, student.created_at]
        );
      }
    }

    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
