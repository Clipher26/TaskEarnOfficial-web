import axios from "axios";

const ADMIN_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const ADMIN_API = axios.create({
  baseURL: `${ADMIN_API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

ADMIN_API.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

ADMIN_API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("admin_token");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export type {
  FreelancerApplication,
  FreelancerProfile,
  Job,
  Proposal,
  Contract,
  Milestone,
  Review,
  DashboardStats,
  ApplicationStatus,
  JobStatus,
  ProposalStatus,
  ContractStatus,
  MilestoneStatus,
} from "@/types/freelance";

export const freelanceAdminApi = {
  listApplications: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await ADMIN_API.get(`/admin/freelance/applications?${params.toString()}`);
    return res.data;
  },

  getApplication: async (applicationId: string): Promise<any> => {
    const res = await ADMIN_API.get(`/admin/freelance/applications/${applicationId}`);
    return res.data;
  },

  approveApplication: async (applicationId: string, note?: string): Promise<any> => {
    const res = await ADMIN_API.post(`/admin/freelance/applications/${applicationId}/approve`, { note });
    return res.data;
  },

  rejectApplication: async (applicationId: string, note: string): Promise<any> => {
    const res = await ADMIN_API.post(`/admin/freelance/applications/${applicationId}/reject`, { note });
    return res.data;
  },

  listAllJobs: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await ADMIN_API.get(`/admin/freelance/jobs?${params.toString()}`);
    return res.data;
  },

  getAllProposals: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.job_id) params.append("job_id", filters.job_id);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await ADMIN_API.get(`/admin/freelance/proposals?${params.toString()}`);
    return res.data;
  },

  getAllContracts: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await ADMIN_API.get(`/admin/freelance/contracts?${params.toString()}`);
    return res.data;
  },

  getAllMilestones: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.contract_id) params.append("contract_id", filters.contract_id);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await ADMIN_API.get(`/admin/freelance/milestones?${params.toString()}`);
    return res.data;
  },

  getAllReviews: async (filters: Partial<any> = {}): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    params.append("page", String(filters.page || 1));
    params.append("limit", String(filters.limit || 20));
    const res = await ADMIN_API.get(`/admin/freelance/reviews?${params.toString()}`);
    return res.data;
  },

  getDashboardStats: async (): Promise<any> => {
    const res = await ADMIN_API.get("/admin/freelance/dashboard/stats");
    return res.data;
  },

  getPlatformStats: async (): Promise<any> => {
    const res = await ADMIN_API.get("/admin/freelance/dashboard");
    return res.data;
  },

  resolveDispute: async (contractId: string, payload: any): Promise<any> => {
    const res = await ADMIN_API.post(`/admin/freelance/contracts/${contractId}/dispute/resolve`, payload);
    return res.data;
  },
};
