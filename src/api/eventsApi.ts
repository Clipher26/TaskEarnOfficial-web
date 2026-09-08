import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface EventActivity {
  id: string;
  title: string;
  description?: string;
  activity_type: string;
  reward_amount: number;
  xp_reward: number;
  sort_order: number;
  is_required: boolean;
  task_url?: string;
  app_download_url?: string;
  app_store_url?: string;
  play_store_url?: string;
  prize_details?: string;
  submission_instructions?: string;
  submit_telegram?: string;
  submit_whatsapp?: string;
  submit_email?: string;
  verified_admin_telegram?: string;
  verified_admin_whatsapp?: string;
  contact_details?: string;
}

export interface EventProgram {
  id: string;
  slug: string;
  title: string;
  description?: string;
  event_date?: string;
  status: string;
  reward_pool_total: number;
  xp_bonus_multiplier: number;
  min_referrals_required: number;
  start_date?: string;
  end_date?: string;
  unlocked_at?: string;
  started_at?: string;
  timer_duration: number;
  timer_status: string;
  closed_at?: string;
  closed_reason?: string;
  created_at: string;
  updated_at: string;
  activities: EventActivity[];
  participation_count: number;
  total_rewards_distributed: number;
  prize_details?: string;
  submission_instructions?: string;
  submit_telegram?: string;
  submit_whatsapp?: string;
  submit_email?: string;
  task_url?: string;
  app_download_url?: string;
  app_store_url?: string;
  play_store_url?: string;
  verified_admin_telegram?: string;
  verified_admin_whatsapp?: string;
  contact_details?: string;
}

export interface TimerStatusResponse {
  event_id: string;
  status: string;
  timer_status: string;
  started_at?: string;
  duration_hours: number;
  remaining_seconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  expired: boolean;
  closed_at?: string;
  closed_reason?: string;
}

export interface ReferralStatusResponse {
  user_id: string;
  referrals_count: number;
  has_enough_referrals: boolean;
  required_referrals: number;
  referral_link?: string;
  progress_percentage: number;
}

export interface SubmissionResponse {
  id: string;
  event_id: string;
  activity_id: string;
  user_id: string;
  submission_data?: string;
  status: string;
  reward_awarded: number;
  xp_awarded: number;
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface ParticipationResponse {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  total_reward_earned: number;
  total_xp_earned: number;
  completed_activities: number;
  registered_at: string;
  completed_at?: string;
  submissions: SubmissionResponse[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username?: string;
  total_reward: number;
  total_xp: number;
  completed_activities: number;
}

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getEvents(status?: string): Promise<EventProgram[]> {
  const params = status ? { status } : {};
  const response = await axios.get(`${API_BASE}/events`, { params, headers: getAuthHeaders() });
  return response.data;
}

export async function getActiveEvents(): Promise<EventProgram[]> {
  const response = await axios.get(`${API_BASE}/events/active`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getUpcomingEvents(): Promise<EventProgram[]> {
  const response = await axios.get(`${API_BASE}/events/upcoming`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getClosedEvents(): Promise<EventProgram[]> {
  const response = await axios.get(`${API_BASE}/events/closed`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getEventBySlug(slug: string): Promise<EventProgram> {
  const response = await axios.get(`${API_BASE}/events/${slug}`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getEventDetail(slug: string): Promise<{ program: EventProgram; referral_status?: ReferralStatusResponse }> {
  const response = await axios.get(`${API_BASE}/events/${slug}/detail`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getEventTimer(slug: string): Promise<TimerStatusResponse> {
  const response = await axios.get(`${API_BASE}/events/${slug}/timer`, { headers: getAuthHeaders() });
  return response.data;
}

export async function participateInEvent(slug: string): Promise<any> {
  const response = await axios.post(`${API_BASE}/events/${slug}/participate`, {}, { headers: getAuthHeaders() });
  return response.data;
}

export async function submitActivity(payload: { event_id: string; activity_id: string; submission_data: string }): Promise<SubmissionResponse> {
  const response = await axios.post(`${API_BASE}/events/submit`, payload, { headers: getAuthHeaders() });
  return response.data;
}

export async function getEventLeaderboard(slug: string, limit = 50): Promise<LeaderboardEntry[]> {
  const response = await axios.get(`${API_BASE}/events/${slug}/leaderboard`, { params: { limit }, headers: getAuthHeaders() });
  return response.data;
}

export async function getEventRewards(slug: string): Promise<any> {
  const response = await axios.get(`${API_BASE}/events/${slug}/rewards`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getReferralStatus(): Promise<ReferralStatusResponse> {
  const response = await axios.get(`${API_BASE}/events/referrals/status`, { headers: getAuthHeaders() });
  return response.data;
}

export async function getReferralProgress(): Promise<any> {
  const response = await axios.get(`${API_BASE}/events/referrals/progress`, { headers: getAuthHeaders() });
  return response.data;
}