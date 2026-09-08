export enum JobStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED",
}

export enum ProposalStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export enum ContractStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED",
  ARCHIVED = "ARCHIVED",
}

export enum MilestoneStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID = "PAID",
}

export enum ReviewType {
  CLIENT_TO_FREELANCER = "CLIENT_TO_FREELANCER",
  FREELANCER_TO_CLIENT = "FREELANCER_TO_CLIENT",
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum SkillLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  EXPERT = "EXPERT",
}

export enum JobType {
  FIXED = "FIXED",
  HOURLY = "HOURLY",
}

export enum ExperienceLevel {
  ENTRY = "ENTRY",
  INTERMEDIATE = "INTERMEDIATE",
  EXPERT = "EXPERT",
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  years_experience?: number;
}

export interface FreelancerProfile {
  id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  hourly_rate?: number;
  currency: string;
  availability_status: string;
  skills: Skill[];
  portfolio_urls: string[];
  languages: string[];
  rating: number;
  total_reviews: number;
  jobs_completed: number;
  total_earned: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface FreelancerApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  portfolio_url?: string;
  skills: string[];
  experience_years: number;
  bio?: string;
  status: ApplicationStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_note?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  client_id: string;
  client_name?: string;
  title: string;
  description: string;
  category: string;
  skills_required: string[];
  budget_type: "FIXED" | "HOURLY";
  budget_min?: number;
  budget_max?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  estimated_duration_days?: number;
  experience_level: SkillLevel;
  location_type: "REMOTE" | "ONSITE" | "HYBRID";
  location?: string;
  status: JobStatus;
  is_featured: boolean;
  is_urgent: boolean;
  proposals_count: number;
  views_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  job_id: string;
  freelancer_id: string;
  freelancer_name?: string;
  cover_letter: string;
  proposed_amount: number;
  currency: string;
  estimated_duration_days: number;
  status: ProposalStatus;
  client_note?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  job_id: string;
  job_title?: string;
  client_id: string;
  client_name?: string;
  freelancer_id: string;
  freelancer_name?: string;
  proposal_id: string;
  amount: number;
  currency: string;
  status: ContractStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  contract_id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  due_date?: string;
  status: MilestoneStatus;
  submitted_at?: string;
  approved_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  contract_id: string;
  from_user_id: string;
  from_user_name?: string;
  to_user_id: string;
  to_user_name?: string;
  review_type: ReviewType;
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobFilters {
  search?: string;
  category?: string;
  skills?: string[];
  budget_type?: string;
  budget_min?: number;
  budget_max?: number;
  experience_level?: SkillLevel;
  location_type?: string;
  status?: JobStatus;
  page: number;
  limit: number;
}

export interface ProposalFilters {
  status?: ProposalStatus;
  page: number;
  limit: number;
}

export interface ContractFilters {
  status?: ContractStatus;
  page: number;
  limit: number;
}

export interface DashboardStats {
  total_jobs: number;
  active_jobs: number;
  total_proposals: number;
  accepted_proposals: number;
  active_contracts: number;
  completed_contracts: number;
  total_earned: number;
  pending_payments: number;
  avg_rating: number;
  total_reviews: number;
}
