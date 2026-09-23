# Servixoo — AI-Driven Labour Market Intelligence & Curriculum Alignment Platform

Servixoo is a full-stack, AI-powered platform designed to close the gap between educational curriculum development and real-time industry skill demands (SIH Problem Statement ID: SIH263134). By continuously analyzing labor market trends, tracking regional hiring metrics, and comparing curriculum topics against in-demand profiles, Servixoo assists academic institutions and district planner boards in keeping courses modern, relevant, and aligned with market forces.

---

## 🚀 Key Features

1. **Intelligence Dashboard**
   - Consolidated KPIs detailing jobs tracked, Monitored Skills, and the Average Regional Skill Gap.
   - Recharts visualizers highlighting regional misalignment indexes and domain hiring intensities.
   - Interactive lists tracking emerging market skills and high-risk structural misalignment zones.

2. **3D Spatial District Explorer**
   - High-fidelity **Three.js** rotating globe displaying regional tech corridors.
   - Interactive, pulsating coordinate nodes representing districts, color-coded and sized according to real-time skill gaps.
   - Dynamic side panel reporting district-specific hiring profiles, in-demand competencies, and specific active job posts.

3. **AI Curriculum Alignment Analyzer**
   - Select and analyze curriculum syllabi with a single click.
   - Interactive multi-stage pipeline showing mathematical vector calculations.
   - **Scikit-learn** model comparing course topics against active regional skill profiles.
   - **Gemini AI** integration to generate highly detailed, technical, structured syllabus modernizing proposals.

4. **Emerging Market Trend Forecasts**
   - Predictive timelines showcasing skill demand score projections over the next three months.
   - **Linear Regression and MLP models** trained inside the Python ML service on historical time series data.

---

## 🛠️ Technology Stack

- **Frontend (React SPA):** React 19, Tailwind CSS, Three.js, Recharts, Lucide Icons, React Markdown.
- **Backend API Gateway (Node.js + Express):** TypeScript server acting as the main REST API orchestrator, serving static assets, managing SQLite operations, and proxying requests to the machine learning daemon.
- **Relational Database (SQLite):** Single-file relational database storing jobs, skills, curricula, and historical gap reports.
- **Machine Learning Microservice (Python):** Flask-based stateless daemon executing scientific models:
  - **Scikit-learn (TF-IDF & Cosine Similarity):** Matching course topics against in-demand skills to calculate misalignment.
  - **NumPy & Linear Regression:** Training models on historical hiring demand arrays to forecast future skill trends.

---

## 📐 Project Structure

```
servixoo/
  ├── server.ts              # Full-stack Express.js API gateway & Vite orchestrator
  ├── ml-service/
  │   └── app.py             # Python Flask ML microservice (Flask + Scikit-Learn)
  ├── src/
  │   ├── db/
  │   │   └── database.ts    # SQLite initialization, table schemas, and mock seed engine
  │   ├── components/
  │   │   ├── Sidebar.tsx    # Dark, high-tech sidebar layout
  │   │   └── ThreeGlobe.tsx # Three.js 3D district spatial visualization canvas
  │   ├── pages/
  │   │   ├── Dashboard.tsx  # KPI indicators and Recharts layouts
  │   │   ├── DistrictExplorer.tsx # 3D globe integrated profile viewer
  │   │   ├── CurriculumAnalyzer.tsx # Syllabus dropdown selector & AI advisor
  │   │   └── SkillTrends.tsx # Skill trend projection chart
  │   ├── App.tsx            # Navigation and page routing module
  │   ├── main.tsx           # React bootstrap script
  │   └── types.ts           # Shared TypeScript interfaces
  ├── package.json           # Dependencies, devDependencies, and build scripts
  ├── tsconfig.json          # TypeScript compilation parameters
  ├── vite.config.ts         # Vite server parameters
  └── README.md              # Documentation
```

---

## ⚙️ How to Run Locally

### Prerequisites
1. **Node.js** (v18 or higher)
2. **Python 3** (v3.10 or higher) with pip

### 1. Install Dependencies & Set Up Environment

Initialize variables inside the environment profile (copy `.env.example` to `.env`):
```bash
cp .env.example .env
```
Ensure you add your `GEMINI_API_KEY` to the `.env` file to enable the fully functional AI advisor reports.

Install Node dependencies:
```bash
npm install
```

Install Python libraries:
```bash
pip3 install -r requirements.txt
```
*(Or let Node automatically spawn python packages from standard binary repositories).*

### 2. Launch the Platform
Start the unified full-stack server using a single command:
```bash
npm run dev
```

This single command:
1. Compiles and mounts the TypeScript Express server on port `3000`.
2. Initializes the SQLite database file at `./db/servixoo.db` and auto-seeds 25+ rich, realistic records.
3. Automatically spawns the Python ML Flask microservice in the background on local port `5000`.
4. Hot-reloads your React code inside the browser.

---

## 🧠 Behind the Models

### Skill Extractors (NLP)
Raw text uploaded or scraped from employer job listings undergoes clean tokenization. The Flask NLP module matches descriptions against our known skill dictionaries, computing cosine metrics of vocabulary overlaps.

### Alignment Similarity (Scikit-Learn)
Curricula undergo TF-IDF Vectorization via Scikit-Learn. The course syllabus is processed as a document body, and local district hiring indexes are queries. The cosine similarity matrix identifies alignment gaps. If an in-demand skill has low similarity with the syllabus, it's categorized as missing, contributing to a weighted gap calculation.

### Predictive Forecasters (ML Regression)
Hiring frequency matrices are parsed sequentially. For each skill, the Flask ML microservice trains a regression vector mapping time indexes `[0, 1, 2, 3, 4, 5]` to historical demand. This trained model projects indices `[6, 7, 8]` to deliver a 3-month forecast of future regional industry demands.
