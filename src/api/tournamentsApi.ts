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

export interface MiniTournament {
  id: string;
  title: string;
  description: string;
  game_type: string;
  entry_fee_tcoin: number;
  prize_pool_tcoin: number;
  max_players: number;
  current_players: number;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
  starts_at?: string;
  ends_at?: string;
  can_join: boolean;
  created_at: string;
}

export interface TournamentEntry {
  id: string;
  tournament_id: string;
  user_id: string;
  score: number;
  rank?: number;
  payout_tcoin: number;
  created_at: string;
}

export interface TournamentPrize {
  id: string;
  tournament_id: string;
  rank: number;
  prize_type: string;
  amount?: number;
  currency?: string;
  created_at: string;
}

export const tournamentsApi = {
  listTournaments: async (): Promise<{ tournaments: MiniTournament[] }> => {
    const res = await API.get("/tournaments/");
    return res.data;
  },
  getTournament: async (tournamentId: string): Promise<MiniTournament> => {
    const res = await API.get(`/tournaments/${tournamentId}`);
    return res.data;
  },
  joinTournament: async (tournamentId: string) => {
    const res = await API.post(`/tournaments/${tournamentId}/join`);
    return res.data;
  },
  submitScore: async (tournamentId: string, score: number) => {
    const res = await API.post(`/tournaments/${tournamentId}/submit-score`, null, { params: { score } });
    return res.data;
  },
  getTournamentPrizes: async (tournamentId: string): Promise<TournamentPrize[]> => {
    const res = await API.get(`/tournaments/${tournamentId}/prizes`);
    return res.data;
  },
};
