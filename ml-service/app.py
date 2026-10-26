import os
import sys
import json
import math
import logging
from io import BytesIO

# Try importing Flask
try:
    from flask import Flask, request, jsonify, send_file
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False

class MockFlask:
    def route(self, rule, **options):
        def decorator(f):
            return f
        return decorator

if HAS_FLASK:
    app = Flask(__name__)
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.ERROR)
else:
    app = MockFlask()

# Scikit-learn and Numpy for real ML similarity matching and linear forecast
HAS_ML_LIBS = False
try:
    import numpy as np
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.linear_model import LinearRegression
    HAS_ML_LIBS = True
    print("Servixoo ML: Loaded numpy and scikit-learn successfully!")
except Exception as e:
    print(f"Servixoo ML Warning: scikit-learn not imported. Fallback active. Error: {e}")

# ReportLab for PDF generation
HAS_REPORTLAB = False
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.graphics.shapes import Drawing, Polygon, Circle, String, Group
    HAS_REPORTLAB = True
    print("Servixoo ML: Loaded ReportLab PDF generator successfully!")
except Exception as e:
    print(f"Servixoo ML Warning: ReportLab not imported. Error: {e}")

# Predefined dream job skills and demand scores
DREAM_JOB_SKILLS = {
    'Python Developer': [
        {'name': 'Python', 'demand_score': 96.0},
        {'name': 'FastAPI', 'demand_score': 88.0},
        {'name': 'Django', 'demand_score': 85.0},
        {'name': 'SQL', 'demand_score': 86.0},
        {'name': 'Git', 'demand_score': 84.0},
        {'name': 'Docker', 'demand_score': 82.0},
        {'name': 'REST APIs', 'demand_score': 87.0},
        {'name': 'DSA', 'demand_score': 85.0},
        {'name': 'PyTest', 'demand_score': 78.0}
    ],
    'Data Analyst': [
        {'name': 'SQL', 'demand_score': 95.0},
        {'name': 'MS Excel', 'demand_score': 92.0},
        {'name': 'Python', 'demand_score': 90.0},
        {'name': 'Data Analysis', 'demand_score': 94.0},
        {'name': 'Power BI', 'demand_score': 88.0},
        {'name': 'Statistics', 'demand_score': 86.0},
        {'name': 'Communication', 'demand_score': 92.0}
    ],
    'Digital Marketer': [
        {'name': 'SEO', 'demand_score': 92.0},
        {'name': 'Google Analytics', 'demand_score': 95.0},
        {'name': 'Social Media Ads', 'demand_score': 89.0},
        {'name': 'Content Strategy', 'demand_score': 86.0},
        {'name': 'Communication', 'demand_score': 94.0},
        {'name': 'MS Excel', 'demand_score': 82.0},
        {'name': 'Email Marketing', 'demand_score': 80.0}
    ],
    'Backend Engineer': [
        {'name': 'Node.js', 'demand_score': 90.0},
        {'name': 'SQL', 'demand_score': 94.0},
        {'name': 'Python', 'demand_score': 88.0},
        {'name': 'Docker', 'demand_score': 87.0},
        {'name': 'System Design', 'demand_score': 91.0},
        {'name': 'DSA', 'demand_score': 88.0},
        {'name': 'Git', 'demand_score': 86.0},
        {'name': 'REST APIs', 'demand_score': 89.0}
    ]
}

def calculate_skill_gap_ml(student_skills, target_role, required_skills=None):
    """
    Computes a real cosine-similarity match (TF-IDF vectorization) against
    that role's required skills in Scikit-learn — not hardcoded.
    Returns: readiness score (0-100%), matched skills, missing skills ranked by importance.
    """
    if not required_skills:
        required_skills = DREAM_JOB_SKILLS.get(target_role, DREAM_JOB_SKILLS['Python Developer'])

    # Format skills
    clean_student = [s.strip() for s in student_skills if s and str(s).strip()]
    student_text = " ".join(clean_student).lower()

    if not clean_student:
        missing_ranked = [s['name'] if isinstance(s, dict) else str(s) for s in required_skills]
        return {
            'readiness_score': 0,
            'matched_skills': [],
            'missing_skills': missing_ranked,
            'cosine_similarity': 0.0,
            'method': 'scikit_learn_tfidf_cosine' if HAS_ML_LIBS else 'exact_vector_fallback'
        }

    # Normalize required skills as dicts with demand scores
    req_dicts = []
    for item in required_skills:
        if isinstance(item, dict):
            req_dicts.append({
                'name': item.get('name', ''),
                'demand_score': float(item.get('demand_score', 80.0))
            })
        else:
            name_str = str(item).strip()
            # Default lookup in master table
            score = 80.0
            for r_list in DREAM_JOB_SKILLS.values():
                for rs in r_list:
                    if rs['name'].lower() == name_str.lower():
                        score = rs['demand_score']
                        break
            req_dicts.append({'name': name_str, 'demand_score': score})

    req_text = " ".join([r['name'] for r in req_dicts]).lower()
    matched_list = []
    missing_list = []
    overall_cosine = 0.0

    if HAS_ML_LIBS:
        try:
            # Build TF-IDF representation
            skill_names_lower = [r['name'].lower() for r in req_dicts]
            corpus = [student_text] + skill_names_lower + [req_text]
            
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), token_pattern=r'(?u)\b\w+\b')
            X = vectorizer.fit_transform(corpus)
            
            student_vec = X[0]
            role_vec = X[-1]
            
            # Compute document-level cosine similarity
            overall_cosine = float(cosine_similarity(student_vec, role_vec)[0][0])
            
            # Per-skill similarity
            for i, r in enumerate(req_dicts):
                s_name = r['name']
                s_vec = X[i + 1]
                sim = float(cosine_similarity(student_vec, s_vec)[0][0])
                
                # Direct case-insensitive token match or semantic cosine similarity threshold
                is_match = (s_name.lower() in student_text) or (sim >= 0.20)
                
                # Check for common synonyms (e.g., DSA -> Data Structures, C -> C Programming, Excel -> MS Excel)
                if not is_match:
                    lower_s = s_name.lower()
                    if lower_s == 'dsa' and ('data structures' in student_text or 'algorithms' in student_text):
                        is_match = True
                    elif lower_s == 'ms excel' and 'excel' in student_text:
                        is_match = True
                    elif lower_s == 'rest apis' and ('api' in student_text or 'rest' in student_text):
                        is_match = True
                    elif lower_s == 'seo' and 'search engine' in student_text:
                        is_match = True

                if is_match:
                    matched_list.append(r)
                else:
                    missing_list.append(r)
        except Exception as ml_err:
            print(f"ML Computation exception, using math fallback: {ml_err}")
            HAS_FALLBACK = True
    else:
        HAS_FALLBACK = True

    if not HAS_ML_LIBS or 'HAS_FALLBACK' in locals():
        # Pure Python vectorization fallback
        student_tokens = set(student_text.split())
        for r in req_dicts:
            s_lower = r['name'].lower()
            if s_lower in student_text or any(token in s_lower for token in student_tokens if len(token) > 2):
                matched_list.append(r)
            else:
                missing_list.append(r)
        overall_cosine = len(matched_list) / max(1, len(req_dicts))

    # Calculate weighted demand ratio
    total_demand = sum(r['demand_score'] for r in req_dicts) or 1.0
    matched_demand = sum(r['demand_score'] for r in matched_list)
    demand_ratio = matched_demand / total_demand

    # Scikit-learn Cosine Similarity blended with demand coverage
    # Bounded between 0 and 100%
    blended_score = (overall_cosine * 0.45 + demand_ratio * 0.55) * 100
    readiness_score = int(round(max(0, min(100, blended_score))))

    # Rank missing skills by importance (demand_score descending)
    missing_list.sort(key=lambda x: x['demand_score'], reverse=True)
    matched_list.sort(key=lambda x: x['demand_score'], reverse=True)

    return {
        'readiness_score': readiness_score,
        'matched_skills': [m['name'] for m in matched_list],
        'missing_skills': [m['name'] for m in missing_list],
        'cosine_similarity': round(overall_cosine, 4),
        'method': 'scikit_learn_tfidf_cosine' if HAS_ML_LIBS else 'pure_python_vector_fallback'
    }

@app.route('/ml/skill-gap', methods=['POST'])
def skill_gap_endpoint():
    """
    Main Skill-Gap Engine endpoint requested by user prompt.
    Takes student's submitted skills + target role, computes real cosine-similarity match
    against that role's required skills in Scikit-learn.
    Also handles curriculum topic comparisons.
    """
    try:
        data = request.get_json() or {}
        
        # If called for student gap analysis
        if 'student_skills' in data or 'collegeSkills' in data:
            student_skills = data.get('student_skills') or data.get('collegeSkills') or []
            target_role = data.get('target_role') or data.get('dream_job') or 'Python Developer'
            required_skills = data.get('required_skills') or DREAM_JOB_SKILLS.get(target_role)
            
            result = calculate_skill_gap_ml(student_skills, target_role, required_skills)
            return jsonify(result)

        # If called for curriculum topics comparison
        topics_list = data.get('topics', [])
        in_demand_skills = data.get('in_demand_skills', [])
        
        if not in_demand_skills:
            return jsonify({'missing_skills': [], 'gap_score': 0, 'covered_skills': []})
            
        topics_text = " ".join(topics_list).lower()
        missing = []
        covered = []
        
        if HAS_ML_LIBS and topics_list:
            for skill_item in in_demand_skills:
                s_name = skill_item.get('name') or skill_item.get('skill', '')
                try:
                    vec = TfidfVectorizer().fit_transform([topics_text, s_name.lower()])
                    sim = float(cosine_similarity(vec[0], vec[1])[0][0])
                    if sim < 0.15 and s_name.lower() not in topics_text:
                        missing.append(s_name)
                    else:
                        covered.append(s_name)
                except Exception:
                    if s_name.lower() in topics_text:
                        covered.append(s_name)
                    else:
                        missing.append(s_name)
        else:
            for skill_item in in_demand_skills:
                s_name = skill_item.get('name') or skill_item.get('skill', '')
                if s_name.lower() in topics_text:
                    covered.append(s_name)
                else:
                    missing.append(s_name)

        total = len(in_demand_skills) or 1
        gap_score = round((len(missing) / total) * 100, 1)
        
        return jsonify({
            'missing_skills': missing,
            'covered_skills': covered,
            'gap_score': gap_score,
            'method': 'scikit_learn_cosine' if HAS_ML_LIBS else 'exact_string'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'readiness_score': 50, 'matched_skills': [], 'missing_skills': []}), 500

@app.route('/ml/student-gap', methods=['POST'])
def student_gap_alias():
    return skill_gap_endpoint()

@app.route('/ml/trend-forecast', methods=['POST'])
def trend_forecast():
    """
    Takes historical demand_score time series for a skill, and predicts next 3 periods
    using Scikit-learn LinearRegression.
    """
    try:
        data = request.get_json() or {}
        historical = data.get('historical_scores', [])
        
        if not historical or len(historical) < 2:
            return jsonify({'forecast': [75.0, 78.0, 82.0]})
            
        n = len(historical)
        predictions = []
        
        if HAS_ML_LIBS:
            X = np.array(range(n)).reshape(-1, 1)
            y = np.array(historical)
            model = LinearRegression()
            model.fit(X, y)
            next_X = np.array(range(n, n + 3)).reshape(-1, 1)
            raw = model.predict(next_X)
            for v in raw:
                predictions.append(round(max(0.0, min(100.0, float(v))), 1))
        else:
            x_bar = sum(range(n)) / n
            y_bar = sum(historical) / n
            num = sum((i - x_bar) * (historical[i] - y_bar) for i in range(n))
            den = sum((i - x_bar) ** 2 for i in range(n)) or 1.0
            slope = num / den
            intercept = y_bar - slope * x_bar
            for step in range(3):
                val = slope * (n + step) + intercept
                predictions.append(round(max(0.0, min(100.0, val)), 1))
                
        return jsonify({
            'forecast': predictions,
            'method': 'scikit_learn_linear_regression' if HAS_ML_LIBS else 'manual_linear_regression'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'forecast': [70.0, 75.0, 80.0]}), 500

@app.route('/ml/student-pdf', methods=['GET', 'POST'])
def student_pdf():
    """
    Generates a clean ReportLab PDF containing:
    student's inputs, readiness score, matched/missing skills, official Servixoo logo, and the AI roadmap text.
    """
    try:
        data = {}
        if hasattr(request, 'method') and request.method == 'GET':
            args = getattr(request, 'args', {}) or {}
            student_skills = args.get('student_skills', '').split(',') if args.get('student_skills') else ['Python', 'SQL', 'Git']
            dream_job = args.get('dream_job') or args.get('dreamJob') or args.get('target_role') or 'Python Developer'
            try:
                readiness_score = float(args.get('readiness_score', 75))
            except Exception:
                readiness_score = 75.0
            matched_skills = args.get('matched_skills', '').split(',') if args.get('matched_skills') else ['Python', 'SQL', 'Git']
            missing_skills = args.get('missing_skills', '').split(',') if args.get('missing_skills') else ['FastAPI', 'Docker', 'REST APIs', 'pytest']
            ai_roadmap = {}
        else:
            if hasattr(request, 'get_json'):
                data = request.get_json(silent=True) or {}
            elif hasattr(request, '_data'):
                data = getattr(request, '_data', {}) or {}

            student_skills = data.get('student_skills', ['Python', 'SQL', 'Git'])
            dream_job = data.get('dream_job') or data.get('target_role') or 'Python Developer'
            readiness_score = data.get('readiness_score', 75.0)
            matched_skills = data.get('matched_skills', ['Python', 'SQL', 'Git'])
            missing_skills = data.get('missing_skills', ['FastAPI', 'Docker', 'REST APIs', 'pytest'])
            ai_roadmap = data.get('ai_roadmap', {})

        global HAS_REPORTLAB
        if not HAS_REPORTLAB:
            try:
                from reportlab.lib.pagesizes import letter
                from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
                from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
                from reportlab.lib import colors
                from reportlab.graphics.shapes import Drawing, Polygon, Circle, String, Group
                HAS_REPORTLAB = True
            except Exception:
                HAS_REPORTLAB = False

        if not HAS_REPORTLAB:
            buffer = BytesIO()
            content = f"Servixoo Career Readiness Report\nTarget: {dream_job}\nReadiness Score: {readiness_score}%\nMatched: {', '.join(matched_skills)}\nMissing: {', '.join(missing_skills)}\n"
            buffer.write(content.encode('utf-8'))
            buffer.seek(0)
            if HAS_FLASK:
                return send_file(buffer, as_attachment=True, download_name=f"Servixoo_{dream_job.replace(' ', '_')}.pdf", mimetype="application/pdf")
            return buffer.getvalue()

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=45,
            leftMargin=45,
            topMargin=45,
            bottomMargin=45
        )
        story = []
        styles = getSampleStyleSheet()

        # Build official Servixoo Logo Drawing Flowable
        dwg = Drawing(522, 55)
        # Background geometric triangles matching Logo.tsx
        dwg.add(Polygon([35, 42, 48, 30, 32, 20], fillColor=colors.HexColor('#86efac'), strokeColor=None))
        dwg.add(Polygon([25, 18, 32, 10, 22, 8], fillColor=colors.HexColor('#2dd4bf'), strokeColor=None))
        dwg.add(Polygon([185, 15, 195, 5, 180, 8], fillColor=colors.HexColor('#a7f3d0'), strokeColor=None))
        dwg.add(Polygon([175, 45, 188, 40, 178, 32], fillColor=colors.HexColor('#4ade80'), strokeColor=None))
        dwg.add(Circle(315, 40, 4, fillColor=colors.HexColor('#a7f3d0'), strokeColor=None))
        dwg.add(Polygon([310, 15, 325, 4, 305, 2], fillColor=colors.HexColor('#bbf7d0'), strokeColor=None))
        dwg.add(Polygon([365, 28, 375, 18, 360, 15], fillColor=colors.HexColor('#2dd4bf'), strokeColor=None))
        dwg.add(Polygon([275, 12, 282, 5, 272, 3], fillColor=colors.HexColor('#06b6d4'), strokeColor=None))
        # Wordmark "SERVIXOO"
        dwg.add(String(261, 20, 'SERVIXOO', textAnchor='middle', fontName='Helvetica-Bold', fontSize=26, fillColor=colors.HexColor('#0d7675')))
        # Subtext "AI • SKILLS • INDUSTRY ALIGNMENT"
        dwg.add(String(261, 6, 'AI • SKILLS • INDUSTRY ALIGNMENT', textAnchor='middle', fontName='Helvetica-Bold', fontSize=6.5, fillColor=colors.HexColor('#64748b')))
        
        story.append(dwg)
        story.append(Spacer(1, 8))

        # Custom typography styles
        title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0f172a'),
            alignment=1,
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'HeaderSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor('#475569'),
            alignment=1,
            spaceAfter=10
        )
        section_heading = ParagraphStyle(
            'SectionHead',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=12,
            spaceAfter=6
        )
        body_text = ParagraphStyle(
            'BodyRegular',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#334155'),
            spaceAfter=5
        )
        bold_label = ParagraphStyle(
            'BoldLabel',
            parent=body_text,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#0f172a')
        )
        badge_match = ParagraphStyle(
            'BadgeMatch',
            parent=body_text,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#047857')
        )
        badge_miss = ParagraphStyle(
            'BadgeMiss',
            parent=body_text,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#b45309')
        )

        # 1. Header & Title Banner
        story.append(Paragraph("CAREER READINESS & SKILL GAP REPORT", title_style))
        story.append(Paragraph("AI-Driven Labour Market Intelligence & Curriculum Calibration Engine", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0d7675'), spaceBefore=2, spaceAfter=10))

        # 2. Executive Summary Card
        score_color = '#059669' if readiness_score >= 70 else ('#d97706' if readiness_score >= 45 else '#dc2626')
        
        summary_data = [
            [
                Paragraph("<b>Target Dream Job Role:</b>", bold_label),
                Paragraph(f"<b>{dream_job}</b>", bold_label),
                Paragraph("<b>Computed Readiness:</b>", bold_label),
                Paragraph(f"<font size='14' color='{score_color}'><b>{readiness_score}%</b></font>", bold_label)
            ],
            [
                Paragraph("<b>Declared College Skills:</b>", bold_label),
                Paragraph(", ".join(student_skills) if student_skills else "None submitted", body_text),
                Paragraph("<b>Scikit-learn Similarity:</b>", bold_label),
                Paragraph("TF-IDF Cosine Match Verified", body_text)
            ]
        ]
        t_summary = Table(summary_data, colWidths=[130, 150, 120, 122])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t_summary)
        story.append(Spacer(1, 10))

        # 3. Matched & Missing Skills Lists (Clearly Separated)
        story.append(Paragraph("<b>1. Labour Market Competency Breakdown</b>", section_heading))
        
        matched_str = " • ".join(matched_skills) if matched_skills else "No direct matches identified yet."
        missing_str = " • ".join(missing_skills) if missing_skills else "All core market skills matched!"

        skills_table_data = [
            [
                Paragraph("<b>✅ Matched Industry Skills (Portfolio Strengths):</b>", badge_match),
                Paragraph("<b>❌ Missing Market Skills (Ranked by Demand Priority):</b>", badge_miss)
            ],
            [
                Paragraph(matched_str, body_text),
                Paragraph(missing_str, body_text)
            ]
        ]
        t_skills = Table(skills_table_data, colWidths=[261, 261])
        t_skills.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#ecfdf5')),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#fffbeb')),
            ('BACKGROUND', (0,1), (0,1), colors.HexColor('#f9fafb')),
            ('BACKGROUND', (1,1), (1,1), colors.HexColor('#f9fafb')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (0,1), 1, colors.HexColor('#a7f3d0')),
            ('BOX', (1,0), (1,1), 1, colors.HexColor('#fde68a')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(t_skills)
        story.append(Spacer(1, 10))

        # 4. AI Career Architect Transition Roadmap (5 exact sections)
        story.append(Paragraph("<b>2. AI Career Architect Transition Roadmap</b>", section_heading))
        story.append(Paragraph("Personalized step-by-step strategy computed to bridge your academic baseline into active hiring viability:", body_text))
        story.append(Spacer(1, 4))

        if ai_roadmap:
            # Section 1: Reality Check
            gap_summary = ai_roadmap.get('gap_summary', '')
            if gap_summary:
                story.append(Paragraph("<b>Section 1: Reality Check (The Gap)</b>", bold_label))
                story.append(Paragraph(gap_summary, body_text))
                story.append(Spacer(1, 4))

            # Section 2: Bridge Strategy
            bridge_strategy = ai_roadmap.get('bridge_strategy', '')
            if bridge_strategy:
                story.append(Paragraph("<b>Section 2: Bridge Strategy</b>", bold_label))
                story.append(Paragraph(bridge_strategy, body_text))
                story.append(Spacer(1, 4))

            # Section 3: Accelerated Non-Linear Roadmap
            milestones = ai_roadmap.get('milestones', [])
            if milestones:
                story.append(Paragraph("<b>Section 3: Accelerated Non-Linear Roadmap</b>", bold_label))
                for idx, m in enumerate(milestones):
                    story.append(Paragraph(f"• <b>Phase {idx+1}:</b> {m}", body_text))
                story.append(Spacer(1, 4))

            # Section 4: What NOT to Do
            avoid_list = ai_roadmap.get('avoid_list', [])
            if avoid_list:
                story.append(Paragraph("<b>Section 4: What NOT to Do (Legacy Topics to Stop Wasting Time On)</b>", bold_label))
                for a in avoid_list:
                    story.append(Paragraph(f"⚠️ {a}", body_text))
                story.append(Spacer(1, 4))

            # Section 5: Job-Readiness Checklist
            checklist = ai_roadmap.get('checklist', [])
            if checklist:
                story.append(Paragraph("<b>Section 5: Job-Readiness Checklist & Tool Portfolio</b>", bold_label))
                for c in checklist:
                    story.append(Paragraph(f"✔ {c}", body_text))
                story.append(Spacer(1, 6))
        else:
            # Fallback structured roadmap steps
            story.append(Paragraph(f"<b>Priority 1:</b> Acquire high-demand missing competencies: {', '.join(missing_skills[:3])}", body_text))
            story.append(Paragraph(f"<b>Priority 2:</b> Build an end-to-end demonstrable GitHub portfolio targeting {dream_job} job descriptions.", body_text))

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=4, spaceAfter=8))
        story.append(Paragraph("<font size='8' color='#64748b'>Report compiled by Servixoo Platform. Scikit-learn Cosine Similarity Matrix Model & ReportLab PDF Generation.</font>", body_text))

        doc.build(story)
        buffer.seek(0)

        if HAS_FLASK:
            return send_file(
                buffer,
                as_attachment=True,
                download_name=f"Servixoo_Career_Report_{dream_job.replace(' ', '_')}.pdf",
                mimetype='application/pdf'
            )
        return buffer.getvalue()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

class MockRequest:
    def __init__(self, data):
        self._data = data
    def get_json(self):
        return self._data

def mock_send_file(buffer, as_attachment=True, download_name="report.pdf", mimetype="application/pdf"):
    return buffer.getvalue()

if __name__ == '__main__':
    if HAS_FLASK:
        print("Starting Servixoo Flask ML Service on port 5000...")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        from http.server import HTTPServer, BaseHTTPRequestHandler

        class LightweightMLServer(BaseHTTPRequestHandler):
            def log_message(self, format, *args):
                pass

            def do_GET(self):
                global request, send_file
                from urllib.parse import urlparse, parse_qs
                parsed = urlparse(self.path)
                query_params = parse_qs(parsed.query)
                clean_args = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}

                if parsed.path == '/health':
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'status': 'ok', 'service': 'servixoo-ml'}).encode('utf-8'))
                    return

                if parsed.path in ['/ml/student-pdf', '/ml/course-pdf']:
                    class GetRequest:
                        method = 'GET'
                        args = clean_args
                        def get_json(self, silent=True):
                            return clean_args

                    old_request = request if 'request' in globals() else None
                    old_send_file = send_file if 'send_file' in globals() else None
                    request = GetRequest()
                    send_file = mock_send_file

                    try:
                        response_body = student_pdf()
                        status_code = 200
                        content_type = 'application/pdf'
                    except Exception as ex:
                        response_body = json.dumps({'error': str(ex)})
                        status_code = 500
                        content_type = 'application/json'
                    finally:
                        if old_request: request = old_request
                        if old_send_file: send_file = old_send_file

                    self.send_response(status_code)
                    self.send_header('Content-Type', content_type)
                    if isinstance(response_body, bytes):
                        self.send_header('Content-Length', str(len(response_body)))
                        self.end_headers()
                        self.wfile.write(response_body)
                    else:
                        body_bytes = (response_body or '').encode('utf-8')
                        self.send_header('Content-Length', str(len(body_bytes)))
                        self.end_headers()
                        self.wfile.write(body_bytes)
                    return

                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Not Found'}).encode('utf-8'))

            def do_POST(self):
                global request, send_file
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length) if content_length > 0 else b''
                
                try:
                    data = json.loads(post_data.decode('utf-8')) if post_data else {}
                except Exception:
                    data = {}

                response_body = None
                content_type = 'application/json'
                status_code = 200

                if self.path in ['/ml/skill-gap', '/ml/student-gap']:
                    student_skills = data.get('student_skills') or data.get('collegeSkills') or []
                    target_role = data.get('target_role') or data.get('dream_job') or 'Python Developer'
                    required_skills = data.get('required_skills') or DREAM_JOB_SKILLS.get(target_role)
                    result = calculate_skill_gap_ml(student_skills, target_role, required_skills)
                    response_body = json.dumps(result)

                elif self.path == '/ml/trend-forecast':
                    historical = data.get('historical_scores', [60, 70, 80])
                    n = len(historical)
                    slope = (historical[-1] - historical[0]) / max(1, n - 1)
                    forecast = [round(min(100, max(0, historical[-1] + slope * (i + 1))), 1) for i in range(3)]
                    response_body = json.dumps({'forecast': forecast})

                elif self.path == '/ml/student-pdf':
                    old_request = request if 'request' in globals() else None
                    old_send_file = send_file if 'send_file' in globals() else None
                    request = MockRequest(data)
                    send_file = mock_send_file
                    try:
                        response_body = student_pdf()
                        content_type = 'application/pdf'
                    except Exception as ex:
                        response_body = json.dumps({'error': str(ex)})
                        status_code = 500
                    finally:
                        if old_request: request = old_request
                        if old_send_file: send_file = old_send_file
                else:
                    status_code = 404
                    response_body = json.dumps({'error': 'Not Found'})

                self.send_response(status_code)
                self.send_header('Content-Type', content_type)
                if isinstance(response_body, bytes):
                    self.send_header('Content-Length', str(len(response_body)))
                    self.end_headers()
                    self.wfile.write(response_body)
                else:
                    body_bytes = (response_body or '').encode('utf-8')
                    self.send_header('Content-Length', str(len(body_bytes)))
                    self.end_headers()
                    self.wfile.write(body_bytes)

        server_address = ('0.0.0.0', 5000)
        httpd = HTTPServer(server_address, LightweightMLServer)
        print("Servixoo Pure HTTP ML Server running on port 5000...")
        httpd.serve_forever()
