export interface Skill {
  id: number;
  name: string;
  category: string;
  demand_score: number;
  trend_direction: 'UP' | 'DOWN' | 'STABLE';
  historical?: number[];
  forecast?: number[];
  forecast_method?: string;
}

export interface District {
  id: number;
  name: string;
  top_demand_skills: string; // Comma-separated
  gap_score: number;
  latitude?: number; // For 3D sphere positioning
  longitude?: number;
}

export interface Curriculum {
  id: number;
  institution_name: string;
  course_name: string;
  topics: string; // Comma-separated
  last_updated: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  required_skills: string; // Comma-separated
  district: string;
  source: string;
  scraped_at: string;
}

export interface SkillGapReport {
  id: number;
  curriculum_id: number;
  course_name?: string;
  institution_name?: string;
  topics?: string;
  missing_skills: string; // Comma-separated
  recommendation_text: string;
  created_at: string;
  gap_score?: number;
  method?: string;
}
