import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
    }
    return Promise.reject(error);
  }
);

export type {
  Job,
  Proposal,
  Contract,
  Milestone,
  Review,
  FreelancerProfile,
  FreelancerApplication,
  Skill,
  DashboardStats,
  JobStatus,
  ProposalStatus,
  ContractStatus,
  MilestoneStatus,
  ReviewType,
  ApplicationStatus,
  SkillLevel,
  JobFilters,
  ProposalFilters,
  ContractFilters,
} from "@/types/freelance";

export const freelanceApi = {
  listJobs: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.skills && filters.skills.length > 0) params.append("skills", filters.skills.join(","));
    if (filters.budget_type) params.append("budget_type", filters.budget_type);
    if (filters.budget_min) params.append("budget_min", String(filters.budget_min));
    if (filters.budget_max) params.append("budget_max", String(filters.budget_max));
    if (filters.experience_level) params.append("experience_level", filters.experience_level);
    if (filters.location_type) params.append("location_type", filters.location_type);
    if (filters.status) params.append("status", filters.status);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await API.get(`/freelance/jobs?${params.toString()}`);
    return res.data;
  },

  getJob: async (jobId: string): Promise<any> => {
    const res = await API.get(`/freelance/jobs/${jobId}`);
    return res.data;
  },

  createJob: async (payload: any): Promise<any> => {
    const res = await API.post("/freelance/jobs", payload);
    return res.data;
  },

  updateJob: async (jobId: string, payload: any): Promise<any> => {
    const res = await API.patch(`/freelance/jobs/${jobId}`, payload);
    return res.data;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await API.delete(`/freelance/jobs/${jobId}`);
  },

  submitProposal: async (jobId: string, payload: any): Promise<any> => {
    const res = await API.post(`/freelance/jobs/${jobId}/proposals`, payload);
    return res.data;
  },

  listProposals: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await API.get(`/freelance/proposals?${params.toString()}`);
    return res.data;
  },

  getMyProposals: async (): Promise<any[]> => {
    return freelanceApi.listProposals({});
  },

  getProposal: async (proposalId: string): Promise<any> => {
    const res = await API.get(`/freelance/proposals/${proposalId}`);
    return res.data;
  },

  updateProposal: async (proposalId: string, payload: any): Promise<any> => {
    const res = await API.patch(`/freelance/proposals/${proposalId}`, payload);
    return res.data;
  },

  withdrawProposal: async (proposalId: string): Promise<void> => {
    await API.post(`/freelance/proposals/${proposalId}/withdraw`);
  },

  acceptProposal: async (proposalId: string): Promise<any> => {
    const res = await API.post(`/freelance/proposals/${proposalId}/accept`);
    return res.data;
  },

  rejectProposal: async (proposalId: string, note?: string): Promise<void> => {
    await API.post(`/freelance/proposals/${proposalId}/reject`, { client_note: note });
  },

  listContracts: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await API.get(`/freelance/contracts?${params.toString()}`);
    return res.data;
  },

  getContract: async (contractId: string): Promise<any> => {
    const res = await API.get(`/freelance/contracts/${contractId}`);
    return res.data;
  },

  getContracts: async (): Promise<any[]> => {
    const res = await API.get("/freelance/contracts");
    return res.data;
  },

  createContract: async (payload: any): Promise<any> => {
    const res = await API.post("/freelance/contracts", payload);
    return res.data;
  },

  updateContract: async (contractId: string, payload: any): Promise<any> => {
    const res = await API.patch(`/freelance/contracts/${contractId}`, payload);
    return res.data;
  },

  cancelContract: async (contractId: string): Promise<void> => {
    await API.post(`/freelance/contracts/${contractId}/cancel`);
  },

  listMilestones: async (contractId: string): Promise<any[]> => {
    const res = await API.get(`/freelance/contracts/${contractId}/milestones`);
    return res.data;
  },

  getMilestones: async (contractId: string): Promise<any[]> => {
    return freelanceApi.listMilestones(contractId);
  },

  getMyApplication: async (): Promise<any> => {
    const res = await API.get("/freelance/applications/me");
    return res.data;
  },

  submitApplication: async (payload: any): Promise<any> => {
    return freelanceApi.applyAsFreelancer(payload);
  },

  getMilestone: async (contractId: string, milestoneId: string): Promise<any> => {
    const res = await API.get(`/freelance/contracts/${contractId}/milestones/${milestoneId}`);
    return res.data;
  },

  createMilestone: async (contractId: string, payload: any): Promise<any> => {
    const res = await API.post(`/freelance/contracts/${contractId}/milestones`, payload);
    return res.data;
  },

  updateMilestone: async (contractId: string, milestoneId: string, payload: any): Promise<any> => {
    const res = await API.patch(`/freelance/contracts/${contractId}/milestones/${milestoneId}`, payload);
    return res.data;
  },

  submitMilestone: async (contractId: string, milestoneId: string, payload: any): Promise<any> => {
    const res = await API.post(`/freelance/contracts/${contractId}/milestones/${milestoneId}/submit`, payload);
    return res.data;
  },

  approveMilestone: async (contractId: string, milestoneId: string): Promise<any> => {
    const res = await API.post(`/freelance/contracts/${contractId}/milestones/${milestoneId}/approve`);
    return res.data;
  },

  rejectMilestone: async (contractId: string, milestoneId: string, note?: string): Promise<void> => {
    await API.post(`/freelance/contracts/${contractId}/milestones/${milestoneId}/reject`, { note });
  },

  listReviews: async (userId?: string): Promise<any[]> => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    const res = await API.get(`/freelance/reviews?${params.toString()}`);
    return res.data;
  },

  createReview: async (payload: any): Promise<any> => {
    const res = await API.post("/freelance/reviews", payload);
    return res.data;
  },

  getProfile: async (): Promise<any> => {
    const res = await API.get("/freelance/profile");
    return res.data;
  },

  updateProfile: async (payload: any): Promise<any> => {
    const res = await API.patch("/freelance/profile", payload);
    return res.data;
  },

  getFreelancerProfile: async (userId: string): Promise<any> => {
    const res = await API.get(`/freelance/profile/${userId}`);
    return res.data;
  },

  applyAsFreelancer: async (payload: any): Promise<any> => {
    const res = await API.post("/freelance/apply", payload);
    return res.data;
  },

  getDashboardStats: async (): Promise<any> => {
    const res = await API.get("/freelance/dashboard/stats");
    return res.data;
  },

  getPublicStats: async (): Promise<any> => {
    const res = await API.get("/freelance/public/stats");
    return res.data;
  },

  isFreelancer: async (): Promise<{ is_freelancer: boolean }> => {
    const res = await API.get("/freelance/me/is-freelancer");
    return res.data;
  },
};
