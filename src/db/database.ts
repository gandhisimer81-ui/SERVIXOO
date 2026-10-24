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
    const existingCourses = await getQuery<{ count: number }>('SELECT COUNT(*) as count FROM courses WHERE name IN ("B.Tech Computer Science", "BBA (Marketing)")');
    const existingJobs = await getQuery<{ count: number }>('SELECT COUNT(*) as count FROM jobs WHERE title IN ("Python Developer", "Data Analyst", "Digital Marketer", "Backend Engineer")');

    const totalCourses = await getQuery<{ count: number }>('SELECT COUNT(*) as count FROM courses');
    // Enforce exactly 2 courses and 4 dream jobs
    if (totalCourses[0]?.count !== 2 || existingJobs[0]?.count < 4) {
      console.log('Aligning SQLite database to Hackathon Scope: 2 Courses & 4 Dream-Job Roles...');
      await runQuery('DELETE FROM syllabus_units');
      await runQuery('DELETE FROM market_skills_by_field');
      await runQuery('DELETE FROM courses');
      await runQuery('DELETE FROM jobs');

      // 1. Exactly 2 Courses
      const coursesToSeed = [
        { name: 'B.Tech Computer Science', stream: 'Engineering', typical_university: 'State Technological University', duration: '4 Years' },
        { name: 'BBA (Marketing)', stream: 'Marketing', typical_university: 'Bangalore Central University', duration: '3 Years' }
      ];

      for (const course of coursesToSeed) {
        await runQuery(
          'INSERT INTO courses (name, stream, typical_university, duration) VALUES (?, ?, ?, ?)',
          [course.name, course.stream, course.typical_university, course.duration]
        );
      }

      // Map course IDs
      const coursesInDb = await getQuery<{ id: number, name: string }>('SELECT id, name FROM courses');
      const courseIdMap: Record<string, number> = {};
      for (const c of coursesInDb) {
        courseIdMap[c.name] = c.id;
      }

      // 2. Detailed, real syllabus subjects & topics per semester for both courses
      const syllabusToSeed = [
        // B.Tech Computer Science (Semesters 1-8)
        { course: 'B.Tech Computer Science', subject: 'Problem Solving & C Programming', topics: 'Variables, Conditionals, Loops, Arrays, Pointers, Dynamic Memory Allocation (malloc/free), Structs, File I/O', semester: 1, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Object Oriented Programming with C++', topics: 'Classes, Objects, Constructors, Inheritance, Polymorphism, Virtual Functions, Templates, File Streams, Turbo C graphics.h', semester: 2, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Data Structures & Algorithms', topics: 'Arrays, Linked Lists, Stacks, Queues, Binary Search Trees, AVL Trees, Graph BFS/DFS, Sorting Algorithms, Big-O Complexity', semester: 3, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Database Management Systems', topics: 'Relational Model, Relational Algebra, SQL Queries, Schema Normalization (1NF to BCNF), B-Trees, Transaction ACID Properties, Concurrency Control', semester: 4, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Operating Systems & Architecture', topics: 'Process Scheduling, Semaphores, Deadlock Avoidance, Paging, Virtual Memory, Unix Shell Commands, 8085 Assembly Routines', semester: 5, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Computer Networks', topics: 'OSI 7 Layers, TCP/IP Suite, Subnetting, Socket Programming, Routing Protocols (OSPF/BGP), DNS, HTTP Protocol', semester: 6, credits: 4 },
        { course: 'B.Tech Computer Science', subject: 'Software Engineering & Waterfall Practices', topics: 'Waterfall Model, Spiral Model, Agile Scrum, Software Requirement Specs (SRS), UML Class Diagrams, Manual Black-box Testing', semester: 7, credits: 3 },
        { course: 'B.Tech Computer Science', subject: 'Compiler Design & System Programming', topics: 'Lexical Analysis (Lex), Syntax Analysis (Yacc), Abstract Syntax Trees, Intermediate Code Generation, Corba Architecture, XML Parsers', semester: 8, credits: 3 },

        // BBA (Marketing) (Semesters 1-6)
        { course: 'BBA (Marketing)', subject: 'Principles of Management & Business Communication', topics: 'Managerial Functions, Organizational Structures, Leadership Theories, Motivation Models, Formal Letter Writing, Meeting Minutes', semester: 1, credits: 4 },
        { course: 'BBA (Marketing)', subject: 'Marketing Management Foundations', topics: '4Ps of Marketing (Product, Price, Place, Promotion), Market Segmentation, Targeting, Positioning, SWOT Analysis, Marketing Environment', semester: 2, credits: 4 },
        { course: 'BBA (Marketing)', subject: 'Consumer Behaviour', topics: 'Buyer Decision-Making Process, Consumer Perception, Attitude Formation, Motivation Theories, Cultural Influences on Buying, Brand Loyalty', semester: 3, credits: 4 },
        { course: 'BBA (Marketing)', subject: 'Traditional Advertising & Public Relations', topics: 'Print Media Advertising, Newspaper Advertorials, Billboard Campaigns, Press Conferences, Yellow Pages Directories, Direct Mail Flyers', semester: 4, credits: 3 },
        { course: 'BBA (Marketing)', subject: 'Sales & Distribution Management', topics: 'Wholesale & Retail Channels, Sales Territory Design, Sales Force Quotas, Cold Calling Scripts, In-store Merchandising, Telemarketing Lists', semester: 5, credits: 3 },
        { course: 'BBA (Marketing)', subject: 'Strategic Brand Management & Global Trade', topics: 'Brand Equity, Brand Architecture, Product Life Cycle Strategies, Domestic Market Expansion, Traditional Export Procedures', semester: 6, credits: 4 }
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
        // Engineering (Computer Science)
        { field: 'Engineering', skill: 'Python', score: 96.0, trend: 1, roles: 'Python Developer, AI Engineer' },
        { field: 'Engineering', skill: 'FastAPI / Django', score: 88.0, trend: 1, roles: 'Python Developer, Backend Engineer' },
        { field: 'Engineering', skill: 'SQL & Database Optimization', score: 92.0, trend: 0, roles: 'Backend Engineer, Data Analyst' },
        { field: 'Engineering', skill: 'Cloud Computing (AWS / Azure)', score: 94.0, trend: 1, roles: 'Cloud Solutions Architect, Backend Engineer' },
        { field: 'Engineering', skill: 'Docker & Kubernetes', score: 89.0, trend: 1, roles: 'DevOps Engineer, Platform Engineer' },
        { field: 'Engineering', skill: 'Modern React & TypeScript', score: 90.0, trend: 1, roles: 'Fullstack Engineer, Frontend Developer' },
        { field: 'Engineering', skill: 'Node.js & Express', score: 88.0, trend: 0, roles: 'Backend Engineer' },
        { field: 'Engineering', skill: 'AI & Large Language Models', score: 97.0, trend: 1, roles: 'AI Engineer, Machine Learning Developer' },
        { field: 'Engineering', skill: 'Git & CI/CD Pipelines', score: 91.0, trend: 1, roles: 'Software Engineer, DevOps' },
        { field: 'Engineering', skill: 'REST & GraphQL APIs', score: 87.0, trend: 1, roles: 'Backend Engineer' },

        // Marketing (BBA)
        { field: 'Marketing', skill: 'Google Analytics 4 & Attribution', score: 95.0, trend: 1, roles: 'Digital Marketer, Marketing Analyst' },
        { field: 'Marketing', skill: 'Performance Marketing (Meta & Google Ads)', score: 94.0, trend: 1, roles: 'Growth Marketer, Campaign Specialist' },
        { field: 'Marketing', skill: 'SEO & Search Console Optimization', score: 92.0, trend: 1, roles: 'SEO Specialist, Digital Marketer' },
        { field: 'Marketing', skill: 'Marketing Automation & CRM (HubSpot)', score: 88.0, trend: 1, roles: 'Marketing Operations Manager' },
        { field: 'Marketing', skill: 'Data-Driven Content Strategy & A/B Testing', score: 86.0, trend: 1, roles: 'Content Strategist' },
        { field: 'Marketing', skill: 'Social Media Growth & Viral Mechanics', score: 89.0, trend: 1, roles: 'Social Media Strategist' },
        { field: 'Marketing', skill: 'Consumer Journey & Funnel Optimization', score: 84.0, trend: 0, roles: 'Growth Product Manager' },
        { field: 'Marketing', skill: 'Email Marketing (Klaviyo / Mailchimp)', score: 81.0, trend: 0, roles: 'Email Campaign Manager' }
      ];

      for (const item of marketSkillsToSeed) {
        await runQuery(
          'INSERT OR IGNORE INTO market_skills_by_field (field, skill_name, demand_score, is_trending, typical_job_roles) VALUES (?, ?, ?, ?, ?)',
          [item.field, item.skill, item.score, item.trend, item.roles]
        );
      }

      // 4. Seed Exactly 4 Dream-Job Roles
      const jobsToSeed = [
        {
          title: 'Python Developer',
          description: 'Build robust REST APIs, asynchronous task queues, and data processing workflows using Python, FastAPI, Django, SQL, and Docker. Experience with automated testing and Git collaboration required.',
          required_skills: 'Python,FastAPI,Django,SQL,Git,Docker,REST APIs,DSA,PyTest',
          district: 'Bangalore Tech Zone',
          source: 'LinkedIn Jobs',
          scraped_at: '2026-10-18'
        },
        {
          title: 'Data Analyst',
          description: 'Transform complex business datasets into clear insights and predictive dashboards. Highly proficient in SQL, MS Excel, Python data modeling (Pandas), Power BI, and executive business communication.',
          required_skills: 'SQL,MS Excel,Python,Data Analysis,Power BI,Statistics,Communication',
          district: 'Central Commercial Corridor',
          source: 'Indeed',
          scraped_at: '2026-10-18'
        },
        {
          title: 'Digital Marketer',
          description: 'Drive multi-channel growth through paid advertising (Google & Meta Ads), search engine optimization (SEO), Google Analytics 4, email marketing automation, and persuasive communication.',
          required_skills: 'SEO,Google Analytics,Social Media Ads,Content Strategy,Communication,MS Excel,Email Marketing',
          district: 'Outer Ring Road Hub',
          source: 'Naukri',
          scraped_at: '2026-10-18'
        },
        {
          title: 'Backend Engineer',
          description: 'Architect scalable web services, microservices, and secure relational database schemas. Strong foundation in Node.js, Express, Python, SQL, Docker, System Design, and REST APIs.',
          required_skills: 'Node.js,Express,SQL,Python,Docker,System Design,DSA,Git,REST APIs',
          district: 'Electronic City Core',
          source: 'Glassdoor',
          scraped_at: '2026-10-18'
        }
      ];

      for (const job of jobsToSeed) {
        await runQuery(
          'INSERT INTO jobs (title, description, required_skills, district, source, scraped_at) VALUES (?, ?, ?, ?, ?, ?)',
          [job.title, job.description, job.required_skills, job.district, job.source, job.scraped_at]
        );
      }
    }

    // Seed Skills table if empty
    const existingSkills = await getQuery<{ count: number }>('SELECT COUNT(*) as count FROM skills');
    if (!existingSkills[0] || existingSkills[0].count === 0) {
      const skillsToSeed = [
        { name: 'Python', category: 'Programming', demand_score: 96.0, trend_direction: 'UP' },
        { name: 'SQL', category: 'Database', demand_score: 93.0, trend_direction: 'STABLE' },
        { name: 'Data Analysis', category: 'Analytics', demand_score: 92.0, trend_direction: 'UP' },
        { name: 'MS Excel', category: 'Analytics', demand_score: 90.0, trend_direction: 'STABLE' },
        { name: 'FastAPI', category: 'Frameworks', demand_score: 88.0, trend_direction: 'UP' },
        { name: 'Django', category: 'Frameworks', demand_score: 84.0, trend_direction: 'STABLE' },
        { name: 'Node.js', category: 'Backend', demand_score: 90.0, trend_direction: 'UP' },
        { name: 'Docker', category: 'Cloud/DevOps', demand_score: 87.0, trend_direction: 'UP' },
        { name: 'Git', category: 'Tools', demand_score: 89.0, trend_direction: 'UP' },
        { name: 'REST APIs', category: 'Architecture', demand_score: 88.0, trend_direction: 'UP' },
        { name: 'DSA', category: 'Fundamentals', demand_score: 86.0, trend_direction: 'STABLE' },
        { name: 'Communication', category: 'Soft Skills', demand_score: 94.0, trend_direction: 'UP' },
        { name: 'SEO', category: 'Marketing', demand_score: 91.0, trend_direction: 'UP' },
        { name: 'Google Analytics', category: 'Marketing', demand_score: 94.0, trend_direction: 'UP' },
        { name: 'Social Media Ads', category: 'Marketing', demand_score: 89.0, trend_direction: 'UP' },
        { name: 'Power BI', category: 'Analytics', demand_score: 88.0, trend_direction: 'UP' },
        { name: 'System Design', category: 'Architecture', demand_score: 89.0, trend_direction: 'UP' },
        { name: 'PyTest', category: 'Tools', demand_score: 78.0, trend_direction: 'UP' }
      ];

      for (const sk of skillsToSeed) {
        await runQuery(
          'INSERT OR IGNORE INTO skills (name, category, demand_score, trend_direction) VALUES (?, ?, ?, ?)',
          [sk.name, sk.category, sk.demand_score, sk.trend_direction]
        );
      }
    }

    console.log('Database aligned and verified for Servixoo Hackathon MVP.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

