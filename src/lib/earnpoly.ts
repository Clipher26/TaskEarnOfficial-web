export interface BoardSpace {
  id: number;
  name: string;
  type: "CORNER" | "BONUS" | "PENALTY" | "TAX" | "FINE" | "PROPERTY" | "TASK" | "LIQUIDITY_POOL" | "ORACLE";
  action?: string;
  amount?: number;
  price?: number;
  rent?: number;
  color?: string;
  icon?: string;
}

export interface Player {
  id: string;
  username: string;
  position: number;
  balance_earn: number;
  balance_cred: number;
  is_in_jail: boolean;
  jail_turns: number;
  owned_properties: string[];
  avatar_color: string;
  character_id?: number | null;
}

export interface BoardState {
  spaces: Record<string, { owner_id?: string; validators_count: number; is_mortgaged: boolean }>;
  market_condition: "BULL_MARKET" | "BEAR_MARKET" | "SIDEWAYS";
  current_player_index: number;
  dice?: [number, number];
  message?: string;
  awaiting_character_selection?: boolean;
}

export interface GameSession {
  session_id: string;
  status: "WAITING" | "IN_PROGRESS" | "FINISHED";
  players: Player[];
  board_state: BoardState;
  turn_count: number;
  stake_tier?: number;
  market_condition?: string;
  created_at?: string;
  awaiting_character_selection?: boolean;
}

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  reward_cred: number;
  reward_earn: number;
  url?: string;
  duration_seconds: number;
  type: "watch" | "click" | "quiz" | "follow";
}

export const BOARD_SPACES: BoardSpace[] = [
  { id: 0, name: "Genesis Block (GO)", type: "CORNER", action: "COLLECT_REWARD", amount: 10, icon: "🌅" },
  { id: 1, name: "Airdrop Claim", type: "BONUS", action: "ADD_FUNDS", amount: 1, icon: "🎁" },
  { id: 2, name: "DEX Micro-Fee", type: "PENALTY", action: "SUBTRACT_FUNDS", amount: 2, icon: "💸" },
  { id: 3, name: "Sui Network", type: "PROPERTY", price: 60, rent: 4, color: "#4da1ff", icon: "🌊" },
  { id: 4, name: "Network Gas Tax", type: "TAX", action: "SUBTRACT_FUNDS", amount: 3, icon: "⛽" },
  { id: 5, name: "Uniswap Liquidity Pool", type: "LIQUIDITY_POOL", price: 200, rent: 25, icon: "🏦" },
  { id: 6, name: "Aptos Node", type: "PROPERTY", price: 100, rent: 6, color: "#2dd4bf", icon: "🅰️" },
  { id: 7, name: "Task Card Space", type: "TASK", action: "TRIGGER_TASK", icon: "📋" },
  { id: 8, name: "Cardano Validator", type: "PROPERTY", price: 100, rent: 6, color: "#0033ad", icon: "₳" },
  { id: 9, name: "Staking Reward", type: "BONUS", action: "ADD_FUNDS", amount: 2, icon: "💰" },

  { id: 10, name: "Crypto Jail / Rugged", type: "CORNER", action: "JAIL_VISIT", icon: "🚔" },
  { id: 11, name: "Polygon PoS", type: "PROPERTY", price: 140, rent: 10, color: "#8247e5", icon: "🔷" },
  { id: 12, name: "Chainlink Oracle", type: "ORACLE", price: 150, rent: 12, icon: "⬡" },
  { id: 13, name: "Arbitrum One", type: "PROPERTY", price: 140, rent: 10, color: "#28a0f0", icon: "🔵" },
  { id: 14, name: "Optimism Hub", type: "PROPERTY", price: 160, rent: 12, color: "#ff0420", icon: "🔴" },
  { id: 15, name: "Curve Liquidity Pool", type: "LIQUIDITY_POOL", price: 200, rent: 25, icon: "🏦" },
  { id: 16, name: "Bridge Gas Fee", type: "PENALTY", action: "SUBTRACT_FUNDS", amount: 2, icon: "🌉" },
  { id: 17, name: "Flash Crash Loss", type: "PENALTY", action: "SUBTRACT_FUNDS", amount: 3, icon: "📉" },
  { id: 18, name: "Avalanche Subnet", type: "PROPERTY", price: 180, rent: 14, color: "#e84142", icon: "🔺" },
  { id: 19, name: "Base L2 Node", type: "PROPERTY", price: 200, rent: 16, color: "#0052ff", icon: "🔹" },

  { id: 20, name: "Free Parking / Airdrop Vault", type: "CORNER", action: "COLLECT_VAULT_POOL", icon: "🅿️" },
  { id: 21, name: "Bug Bounty Reward", type: "BONUS", action: "ADD_FUNDS", amount: 5, icon: "🐛" },
  { id: 22, name: "Task Card Space", type: "TASK", action: "TRIGGER_TASK", icon: "📋" },
  { id: 23, name: "Solana Validator", type: "PROPERTY", price: 220, rent: 18, color: "#14f195", icon: "◎" },
  { id: 24, name: "BNB Chain Node", type: "PROPERTY", price: 240, rent: 20, color: "#f3ba2f", icon: "🟡" },
  { id: 25, name: "PancakeSwap LP", type: "LIQUIDITY_POOL", price: 200, rent: 25, icon: "🏦" },
  { id: 26, name: "Slippage Loss", type: "PENALTY", action: "SUBTRACT_FUNDS", amount: 2, icon: "📉" },
  { id: 27, name: "Pyth Network Oracle", type: "ORACLE", price: 150, rent: 12, icon: "🔮" },
  { id: 28, name: "Polkadot Relay", type: "PROPERTY", price: 260, rent: 22, color: "#e6007a", icon: "🔗" },
  { id: 29, name: "Smart Contract Audit Fine", type: "FINE", action: "SUBTRACT_FUNDS", amount: 5, icon: "🔍" },

  { id: 30, name: "Go To Jail (Rugged)", type: "CORNER", action: "GO_TO_JAIL", icon: "⚡" },
  { id: 31, name: "Ethereum Node", type: "PROPERTY", price: 300, rent: 26, color: "#627eea", icon: "Ξ" },
  { id: 32, name: "Impermanent Loss", type: "PENALTY", action: "SUBTRACT_FUNDS", amount: 3, icon: "💧" },
  { id: 33, name: "Task Card Space", type: "TASK", action: "TRIGGER_TASK", icon: "📋" },
  { id: 34, name: "Bitcoin Mining Rig", type: "PROPERTY", price: 320, rent: 28, color: "#f7931a", icon: "₿" },
  { id: 35, name: "Balancer Liquidity Pool", type: "LIQUIDITY_POOL", price: 200, rent: 25, icon: "🏦" },
  { id: 36, name: "MEV Bot Frontrun Penalty", type: "PENALTY", action: "SUBTRACT_FUNDS", amount: 3, icon: "🤖" },
  { id: 37, name: "Web3 Grant Bonus", type: "BONUS", action: "ADD_FUNDS", amount: 5, icon: "🏆" },
  { id: 38, name: "SEC Fine / Compliance Tax", type: "TAX", action: "SUBTRACT_FUNDS", amount: 10, icon: "🏛️" },
  { id: 39, name: "OpenSea Marketplace", type: "PROPERTY", price: 400, rent: 35, color: "#2081e2", icon: "🌊" },
];

export const TIER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  PROPERTY: { bg: "bg-slate-800", border: "border-slate-600", text: "text-slate-200" },
  LIQUIDITY_POOL: { bg: "bg-emerald-900/40", border: "border-emerald-500/40", text: "text-emerald-400" },
  ORACLE: { bg: "bg-purple-900/40", border: "border-purple-500/40", text: "text-purple-400" },
  TASK: { bg: "bg-orange-900/40", border: "border-orange-500/40", text: "text-orange-400" },
  BONUS: { bg: "bg-emerald-900/40", border: "border-emerald-500/40", text: "text-emerald-400" },
  PENALTY: { bg: "bg-red-900/40", border: "border-red-500/40", text: "text-red-400" },
  TAX: { bg: "bg-amber-900/40", border: "border-amber-500/40", text: "text-amber-400" },
  FINE: { bg: "bg-rose-900/40", border: "border-rose-500/40", text: "text-rose-400" },
  CORNER: { bg: "bg-slate-800/90", border: "border-slate-600", text: "text-slate-200" },
};

export const TASK_TYPES: Record<string, { label: string; reward_range: [number, number] }> = {
  follow: { label: "Follow", reward_range: [5, 15] },
  watch: { label: "Watch", reward_range: [3, 8] },
  quiz: { label: "Quiz", reward_range: [10, 25] },
  share: { label: "Share", reward_range: [8, 20] },
  join: { label: "Join", reward_range: [5, 12] },
  refer: { label: "Refer", reward_range: [20, 50] },
  staking: { label: "Stake", reward_range: [15, 30] },
  nft: { label: "NFT", reward_range: [10, 25] },
  bridge: { label: "Bridge", reward_range: [8, 20] },
};

export const INITIAL_BALANCE_EARN = 1500;
export const INITIAL_BALANCE_CRED = 0;

export function getSpaceById(id: number): BoardSpace | undefined {
  return BOARD_SPACES.find((s) => s.id === id);
}

export function getSpaceName(id: number): string {
  return getSpaceById(id)?.name ?? `Space ${id}`;
}

export function calculateRent(space: BoardSpace, validators: number): number {
  if (!space.rent || space.type !== "PROPERTY") return 0;
  return space.rent;
}

export function isPropertyOwned(boardState: BoardState, spaceName: string): boolean {
  return !!boardState.spaces[spaceName]?.owner_id;
}

export const CHARACTERS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  name: `Character ${i + 1}`,
  color: `hsl(${(i * 137.508) % 360}, 70%, 60%)`,
  emoji: ["🤖", "👾", "🦊", "🐉", "🦄", "🐙", "🦁", "🐸", "🦅", "🐺", "🦈", "🐝", "🦋", "🐧", "🦉", "🐙", "🦂", "🐍", "🦜", "🐢"][i],
}));
