import { useCallback, useEffect, useState } from "react";
import { freelanceApi } from "@/services/api/freelance";
import { freelanceAdminApi } from "@/services/api/freelance-admin";

export function useFreelanceJobs(filters: Partial<any> = {}) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelanceApi.listJobs({ page: 1, limit: 20, ...filters });
      setJobs(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}

export function useFreelanceJob(id: string | null) {
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await freelanceApi.getJob(id);
        setJob(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch job");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  return { job, loading, error };
}

export function useFreelanceProposals(filters: Partial<any> = {}) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelanceApi.listProposals({ page: 1, limit: 20, ...filters });
      setProposals(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return { proposals, loading, error, refetch: fetchProposals };
}

export function useFreelanceContracts(filters: Partial<any> = {}) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelanceApi.listContracts({ page: 1, limit: 20, ...filters });
      setContracts(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return { contracts, loading, error, refetch: fetchContracts };
}

export function useFreelanceContract(id: string | null) {
  const [contract, setContract] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchContract = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await freelanceApi.getContract(id);
        setContract(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch contract");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id]);

  return { contract, loading, error };
}

export function useFreelanceMilestones(contractId: string | null) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId) return;
    const fetchMilestones = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await freelanceApi.listMilestones(contractId);
        setMilestones(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch milestones");
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, [contractId]);

  return { milestones, loading, error, refetch: () => contractId && freelanceApi.listMilestones(contractId).then(setMilestones) };
}

export function useFreelanceProfile() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelanceApi.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}

export function useFreelanceReviews(userId?: string) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await freelanceApi.listReviews(userId);
        setReviews(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [userId]);

  return { reviews, loading, error };
}

export function useFreelanceDashboardStats() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelanceApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAdminFreelanceApplications(filters: Partial<any> = {}) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelanceAdminApi.listApplications({ page: 1, limit: 20, ...filters });
      setApplications(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, loading, error, refetch: fetchApplications };
}

export function useAdminFreelanceStats() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freelanceAdminApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch admin stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAdminFreelancePlatformStats() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await freelanceAdminApi.getPlatformStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch platform stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, loading, error };
}
