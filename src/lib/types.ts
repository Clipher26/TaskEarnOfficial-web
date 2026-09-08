export interface User {
  id: string;
  email?: string;
  telegram_id?: number;
  telegram_username?: string;
  profile_image_url?: string;
  role: "USER" | "ADMIN" | "VIP";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  is_2fa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface VirtualWallet {
  user_id: string;
  available_balance_usdt: number;
  locked_margin_usdt: number;
  platform_credits: number;
  tcoin_balance: number;
  cred_balance: number;
  ngn_balance: number;
  streak_count: number;
  total_trades: number;
  last_checkin_at?: string;
  vip_tier: number;
  updated_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  bybit_order_id: string;
  symbol: string;
  side: "BUY" | "SELL";
  allocated_margin: number;
  leverage: number;
  entry_price: number;
  exit_price?: number;
  pnl: number;
  status: "OPEN" | "CLOSED" | "LIQUIDATED";
  created_at: string;
  closed_at?: string;
}

export interface CasinoBet {
  id: string;
  user_id: string;
  game_type: "CRASH" | "DICE" | "PLINKO";
  bet_amount: number;
  currency: "USDT" | "CREDITS";
  multiplier?: number;
  payout?: number;
  server_seed: string;
  client_seed: string;
  nonce: number;
  created_at: string;
}

export interface AffiliateRelation {
  referrer_id: string;
  referee_id: string;
  tier_level: 1 | 2;
  created_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  reward_amount: number;
  reward_currency: string;
  is_repeatable: boolean;
  target_count?: number;
  start_at?: string;
  end_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface QuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  progress_count: number;
  claimed: boolean;
  claimed_at?: string;
  completed_at: string;
}

export interface Tournament {
  id: string;
  title: string;
  type: "TRADING_VOLUME" | "CASINO_WAGER" | "PNL_PERCENT";
  prize_pool_usdt: number;
  start_time: string;
  end_time: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
  created_at: string;
}

export interface TournamentParticipant {
  tournament_id: string;
  user_id: string;
  score: number;
  rank?: number;
  potential_payout: number;
  updated_at: string;
}

export interface P2POffer {
  id: string;
  merchant_id: string;
  offer_type: "BUY" | "SELL";
  currency: "NGN" | "INR" | "KES" | "USD";
  rate: number;
  min_limit: number;
  max_limit: number;
  payment_methods: string[];
  is_active: boolean;
  created_at: string;
}

export interface P2POrder {
  id: string;
  offer_id: string;
  buyer_id: string;
  seller_id: string;
  usdt_amount: number;
  fiat_amount: number;
  payment_method_used?: string;
  status: "CREATED" | "PAID" | "RELEASED" | "DISPUTED" | "CANCELLED";
  escrow_locked_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface P2PDispute {
  id: string;
  order_id: string;
  raised_by_user_id: string;
  reason: string;
  proof_urls: string[];
  status: "OPEN" | "RESOLVED_BUYER" | "RESOLVED_SELLER";
  created_at: string;
  resolved_at?: string;
}

export interface P2PEscrowOrder {
  id: string;
  seller_id: string;
  buyer_id?: string;
  amount_crypto: number;
  amount_fiat: number;
  fiat_currency: string;
  status: "OPEN" | "IN_ESCROW" | "PAYMENT_SENT" | "RELEASED" | "CANCELLED" | "DISPUTED" | "UNDER_REVIEW" | "RESOLVED_BUYER" | "RESOLVED_SELLER";
  payment_method_used?: string;
  created_at: string;
  updated_at: string;
}

export type Signal = TradingSignal;

export interface TradingSignal {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entry_price: number;
  tp1?: number;
  tp2?: number;
  stop_loss?: number;
  indicator_reason?: string;
  status: "ACTIVE" | "HIT_TP1" | "HIT_TP2" | "HIT_SL" | "CANCELLED";
  created_at: string;
}

export interface BotConfig {
  id: string;
  user_id: string;
  bot_type: "COPY_SIGNAL" | "DCA" | "GRID";
  symbol: string;
  allocated_margin: number;
  leverage: number;
  max_drawdown_pct?: number;
  stop_loss_pct?: number;
  take_profit_pct?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotExecutionLog {
  id: string;
  config_id: string;
  user_id: string;
  signal_id?: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  fill_price?: number;
  pnl: number;
  status: "PENDING" | "FILLED" | "PARTIALLY_FILLED" | "CANCELLED" | "FAILED";
  created_at: string;
}

export interface LedgerTransaction {
  id: string;
  user_id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRADE_ALLOCATION" | "TRADE_PNL" | "CASINO_BET" | "CASINO_PAYOUT" | "AFFILIATE_REWARD_T1" | "AFFILIATE_REWARD_T2" | "QUEST_REWARD" | "DAILY_STREAK_BONUS" | "P2P_ESCROW_LOCK" | "P2P_ESCROW_RELEASE" | "TOURNAMENT_PRIZE";
  amount: number;
  balance_after: number;
  reference_id?: string;
  created_at: string;
}

export interface AIChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used?: number;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  type: "trade" | "casino" | "quest" | "earnpoly" | "deposit" | "withdrawal" | "signal" | "streak" | "guild";
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  icon: string;
  color: "emerald" | "rose" | "cyan" | "amber" | "indigo" | "slate";
}

export interface UserGamification {
  user_id: string;
  xp_points: number;
  vip_level: number;
  vip_tier: "FREE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND" | "ELITE_TRADER";
  task_multiplier: number;
  trading_fee_rate: number;
  tcoin_balance: number;
  cred_balance: number;
  current_streak: number;
  longest_streak: number;
  last_checkin_at?: string;
  weekly_checkins: number;
  active_multiplier: number;
  multiplier_expires_at?: string;
}

export interface Guild {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  total_monthly_xp: number;
  total_monthly_tasks: number;
  total_monthly_earnpoly_wins: number;
  is_active: boolean;
  member_count?: number;
  user_role?: "LEADER" | "OFFICER" | "MEMBER";
  vault_tcoin?: number;
  total_xp?: number;
  total_tasks?: number;
  max_members?: number;
  created_at?: string;
}

export interface GuildMember {
  guild_id: string;
  user_id: string;
  role: "LEADER" | "OFFICER" | "MEMBER";
  xp_contributed: number;
  tasks_completed: number;
  earnpoly_wins: number;
  username?: string;
  joined_at?: string;
}

export interface StakingVault {
  id: string;
  user_id: string;
  asset: "TCOIN" | "CRED";
  tier: "SHORT_30D" | "MEDIUM_60D" | "LONG_90D";
  amount: number;
  apy_rate: number;
  start_date: string;
  end_date: string;
  claimed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  period: "WEEKLY" | "MONTHLY";
  category: "TOP_EARNER" | "TOP_TRADER" | "TOP_EARNPOLY";
  score: number;
  rank?: number;
  prize_pool_usdt: number;
  earned_usdt: number;
}

export interface MultiplierWheelSpin {
  id: string;
  user_id: string;
  streak_day: number;
  multiplier_type: "TASK_CRED" | "USDT_BONUS" | "EARNPOLY_TICKET" | "JAIL_FREE";
  multiplier_value: number;
  duration_hours: number;
  usdt_bonus_amount: number;
  claimed: boolean;
  expires_at: string;
}

export interface SybilCheck {
  id: string;
  user_id: string;
  ip_address?: string;
  device_fingerprint?: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
  risk_score: number;
  check_type: string;
}

export interface UserSurveyProfile {
  id: string;
  user_id: string;
  age?: number;
  employment_status?: string;
  country: string;
  city?: string;
  education_level?: string;
  interests?: string;
  household_income?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskDispute {
  id: string;
  user_id: string;
  offer_id?: string;
  conversion_id?: string;
  reason: string;
  evidence_urls: string[];
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED_USER" | "RESOLVED_ADVERTISER" | "CLOSED";
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface TaskReminder {
  id: string;
  user_id: string;
  category: string;
  min_payout_usd?: number;
  is_active: boolean;
  created_at: string;
}

export interface TaskSpeedrun {
  id: string;
  conversion_id: string;
  user_id: string;
  offer_id: string;
  time_spent_seconds: number;
  average_time_seconds: number;
  bonus_pct: number;
  bonus_awarded: boolean;
  created_at: string;
}

export interface GroupTaskPool {
  id: string;
  offer_id: string;
  required_participants: number;
  current_participants: number;
  group_payout_multiplier: number;
  window_start: string;
  window_end: string;
  status: "OPEN" | "FILLED" | "EXPIRED" | "CANCELLED";
  created_at: string;
}

export interface TaskPreview {
  id: string;
  offer_id: string;
  preview_type: string;
  preview_url: string;
  caption?: string;
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  user_id: string;
  offer_id: string;
  conversion_id?: string;
  task_type: "STANDARD" | "AUDIO_VOICE" | "AI_ANNOTATION" | "GEO_FENCED" | "GROUP_POOL" | "SURVEY";
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED" | "DISPUTED";
  started_at?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ProofValidation {
  id: string;
  conversion_id: string;
  user_id: string;
  image_hash?: string;
  ai_risk_score?: number;
  ai_status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW";
  ai_feedback?: string;
  human_status?: string;
  human_feedback?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceFingerprint {
  id: string;
  user_id: string;
  fingerprint_hash: string;
  device_model?: string;
  os_version?: string;
  browser_name?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  is_vpn: boolean;
  is_proxy: boolean;
  is_emulator: boolean;
  risk_score?: number;
  last_seen_at: string;
  created_at: string;
}

export interface DeviceFingerprintStatus {
  fingerprint?: string;
  is_vpn: boolean;
  is_proxy: boolean;
  is_emulator: boolean;
  risk_score: number;
  vpn_risk_level: string;
  connection_type?: string;
  country?: string;
  city?: string;
  is_blocked: boolean;
}

export interface VPNDetectionLog {
  id: string;
  user_id?: string;
  ip_address: string;
  risk_level: string;
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_datacenter: boolean;
  provider_name?: string;
  country?: string;
  city?: string;
  connection_type?: string;
  detected_at: string;
}

export interface AdvertiserAutoTopUp {
  id: string;
  advertiser_id: string;
  payment_gateway: string;
  gateway_customer_id?: string;
  gateway_payment_method_id?: string;
  threshold_usd: number;
  top_up_amount_usd: number;
  max_balance_usd?: number;
  status: string;
  last_triggered_at?: string;
  total_top_ups: number;
  total_topped_up_usd: number;
  created_at: string;
  updated_at: string;
}

export interface GeoTarget {
  id: string;
  campaign_id: string;
  target_type: string;
  target_value: string;
  is_exclusion: boolean;
  created_at: string;
}

export interface WebhookTest {
  id: string;
  advertiser_id: string;
  webhook_id?: string;
  test_event: string;
  payload_sent: any;
  response_status?: number;
  response_body?: string;
  status: string;
  error_message?: string;
  tested_at: string;
}

export interface AdvertiserBadge {
  id: string;
  advertiser_id: string;
  badge_type: string;
  description?: string;
  is_visible: boolean;
  awarded_at: string;
}

export interface ABTest {
  id: string;
  campaign_id: string;
  variant_a_title: string;
  variant_b_title: string;
  status: string;
  winner_variant?: string;
  confidence_level?: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface BlacklistEntry {
  id: string;
  user_id: string;
  advertiser_id: string;
  reason?: string;
  created_at: string;
}

export interface HoneypotAttempt {
  id: string;
  user_id: string;
  task_id: string;
  question_id: string;
  correct_answer: string;
  user_answer: string;
  is_bot_detected: boolean;
  ip_address?: string;
  device_fingerprint?: string;
  user_agent?: string;
  created_at: string;
}

export interface SecurityStats {
  total_proof_validations: number;
  pending_proof_validations: number;
  rejected_by_ai: number;
  blocked_vpn_users: number;
  blocked_emulators: number;
  active_auto_topups: number;
  total_badges_awarded: number;
  active_ab_tests: number;
  total_blacklist_entries: number;
  detected_bots: number;
}

export interface AutoWithdrawalRule {
  id: string;
  trigger_type: "THRESHOLD" | "SCHEDULED" | "MANUAL";
  threshold_amount: number | null;
  currency: string;
  destination_type: string;
  destination_details: string | null;
  is_active: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsVault {
  id: string;
  amount: number;
  apy_rate: number;
  start_date: string;
  end_date: string;
  status: string;
  claimed_at: string | null;
  created_at: string;
}

export interface GiftCardRedemption {
  id: string;
  provider: string;
  amount_usdt: number;
  denomination: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  status: string;
  delivery_url: string | null;
  created_at: string;
}

export interface Arbitrator {
  id: string;
  trust_score: number;
  cases_resolved: number;
  cases_pending: number;
  total_fees_earned: number;
  is_active: boolean;
  joined_at: string;
  last_active_at: string;
}

export interface PayoutSplit {
  id: string;
  splits: Record<string, number>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionReceipt {
  id: string;
  receipt_type: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  currency: string;
  pdf_url: string | null;
  status: string;
  created_at: string;
}

export interface DebitCardWaitlist {
  id: string;
  full_name: string;
  address_line1: string | null;
  city: string | null;
  country: string | null;
  status: string;
  perks_tier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MobileTopupOrder {
  id: string;
  provider: string;
  phone_number: string;
  amount_usdt: number;
  local_amount: number;
  local_currency: string;
  status: string;
  transaction_ref: string | null;
  created_at: string;
}

export interface GaslessCashout {
  id: string;
  amount: number;
  network: string;
  destination_address: string;
  tx_hash: string | null;
  status: string;
  created_at: string;
}

export interface BadgeType {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  earning_boost_pct: number;
  criteria_type: string;
  criteria_value?: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  badge_type_id: string;
  badge_code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earning_boost_pct: number;
  earned_at?: string;
  is_equipped: boolean;
}

export interface BossBattle {
  id: string;
  name: string;
  description: string;
  target_tasks: number;
  total_tasks_completed: number;
  reward_multiplier: number;
  status: "UPCOMING" | "ACTIVE" | "VICTORY" | "DEFEAT";
  starts_at?: string;
  ends_at?: string;
  progress_pct: number;
}

export interface BossBattleProgress {
  id: string;
  boss_battle_id: string;
  user_id: string;
  tasks_contributed: number;
  updated_at?: string;
}

export interface MysteryBox {
  id: string;
  name: string;
  description: string;
  required_daily_tasks: number;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface UserMysteryBox {
  id: string;
  box_id: string;
  box_name: string;
  opened: boolean;
  reward_type?: string;
  reward_amount?: number;
  reward_currency?: string;
  rarity?: string;
  claimed: boolean;
  awarded_at?: string;
  opened_at?: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  achievement_type: "TASK_MASTER" | "FAST_CASH" | "EARNPOLY_CHAMP" | "SOCIAL_BUTTERFLY";
  skill_tree?: string;
  required_tasks?: number;
  reward_skill_points: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  achievement_id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  achievement_type: string;
  skill_tree?: string;
  progress_count: number;
  completed: boolean;
  claimed: boolean;
  awarded_at?: string;
  created_at: string;
}

export interface SkillTree {
  user_id: string;
  survey_master_points: number;
  fast_cash_points: number;
  earnpoly_ace_points: number;
  trading_whale_points: number;
  total_points_spent: number;
  available_points: number;
  lifetime_earned: number;
}

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

export interface LiveStream {
  id: string;
  title: string;
  platform: "TWITCH" | "YOUTUBE";
  stream_url: string;
  thumbnail_url?: string;
  streamer_name: string;
  is_active: boolean;
  drop_interval_minutes: number;
  drop_amount_tcoin: number;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
}

export interface StreamViewer {
  id: string;
  stream_id: string;
  user_id: string;
  total_watch_seconds: number;
  last_reward_at?: string;
  created_at: string;
}

export interface StreamReward {
  id: string;
  stream_id: string;
  user_id: string;
  amount_tcoin: number;
  watch_seconds: number;
  claimed: boolean;
  created_at: string;
}

export interface ProfileSkin {
  id: string;
  code: string;
  name: string;
  skin_type: "FRAME" | "GLOW" | "AVATAR";
  price_tcoin: number;
  preview_image_url?: string;
  css_class?: string;
  is_limited: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserProfileCustomization {
  id: string;
  skin_id: string;
  code: string;
  name: string;
  skin_type: string;
  price_tcoin: number;
  css_class?: string;
  is_equipped: boolean;
  purchased_at?: string;
}

export interface DiceRollResult {
  success: boolean;
  dice_value: number;
  payout_multiplier: number;
  tcoin_won: number;
  message: string;
}

export interface EarningFeedEntry {
  id: string;
  user_id: string;
  event_type: "TASK_COMPLETED" | "MILESTONE_REACHED" | "BIG_PAYOUT" | "GUILD_WAR_WIN" | "REFERRAL_BONUS" | "EARN_POLY_WIN";
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  metadata?: string;
  is_public: boolean;
  created_at: string;
  reaction_count?: number;
  user_reaction?: string;
  username?: string;
}

export interface FeedReaction {
  id: string;
  feed_entry_id: string;
  user_id: string;
  reaction_type: "LIKE" | "FIRE" | "CLAP" | "ROCKET";
  created_at: string;
}

export interface TipTransaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount_tcoin: number;
  message?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  tx_hash?: string;
  created_at: string;
  recipient_username?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  room_type: "GLOBAL" | "GUILD" | "PRIVATE";
  category?: string;
  description?: string;
  is_moderated: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  reply_to_id?: string;
  is_pinned: boolean;
  created_at: string;
  username?: string;
}

export interface BountyBoardEntry {
  id: string;
  poster_id: string;
  title: string;
  description?: string;
  reward_amount: number;
  reward_currency: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "REJECTED" | "EXPIRED";
  completions: number;
  max_completions?: number;
  expiry_date?: string;
  task_url?: string;
  is_approved: boolean;
  created_at: string;
  poster_username?: string;
}

export interface OfferRating {
  id: string;
  offer_id: string;
  user_id: string;
  difficulty_rating: number;
  accuracy_rating: number;
  review_text?: string;
  created_at: string;
  username?: string;
}

export interface SharedTaskLink {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  share_code: string;
  total_clicks: number;
  total_completions: number;
  total_bonus_earned: number;
  is_active: boolean;
  created_at: string;
}

export interface ReferralLandingPage {
  id: string;
  user_id: string;
  custom_title?: string;
  welcome_message?: string;
  brand_color?: string;
  logo_url?: string;
  is_published: boolean;
  views_count: number;
  conversions_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatorPartner {
  id: string;
  user_id: string;
  platform: string;
  handle: string;
  follower_count?: number;
  promo_code: string;
  revenue_share_pct: number;
  total_referred: number;
  total_earned_usdt: number;
  status: string;
  created_at: string;
}

export interface ReferralLadderEntry {
  user_id: string;
  username: string;
  total_usdt: number;
  total_tcoin: number;
  referral_count: number;
  rank: number;
}

export interface GuildWar {
  id: string;
  guild_id: string;
  opponent_guild_id?: string;
  title: string;
  prize_pool: number;
  status: string;
  start_date?: string;
  end_date?: string;
  guild_score: number;
  opponent_score: number;
  created_at: string;
}

export interface OfferwallOffer {
  id: string;
  title: string;
  description?: string;
  category: string;
  payout_usd: number;
  tcoin_reward: number;
  country: string;
  action_url: string;
  advertiser_name: string;
  campaign_id: string;
  is_featured: boolean;
  conversions: number;
  budget_usd: number;
  spent_usd: number;
}

export interface OfferwallConversion {
  id: string;
  offer_title: string;
  payout_usd: number;
  tcoin_awarded: number;
  status: string;
  created_at: string;
}

export interface OfferwallStats {
  total_offers: number;
  total_completed: number;
  total_earned_usdt: number;
  total_earned_tcoin: number;
}

export interface EarnflipTask {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  platform: "YOUTUBE" | "TWITTER" | "INSTAGRAM" | "TIKTOK" | "TELEGRAM" | "WEB" | "MOBILE";
  reward_amount: number;
  reward_currency: string;
  instructions?: string;
  proof_type: string;
  estimated_duration_minutes?: number;
  max_participants?: number;
  total_completions: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED";
  anti_bot_checks?: string;
  metadata?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EarnflipSubmission {
  id: string;
  task_id: string;
  user_id: string;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "UNDER_REVIEW";
  proof_data?: string;
  proof_urls?: string[];
  anti_bot_passed?: boolean;
  anti_bot_details?: string;
  review_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reward_credited: boolean;
  reward_tx_id?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EarnClashRoom {
  id: string;
  name: string;
  host_id: string;
  game_mode: "CLASSIC" | "RANKED" | "QUICK_MATCH" | "TOURNAMENT";
  stake_amount: number;
  stake_currency: string;
  max_players: number;
  current_players: number;
  status: "WAITING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED" | "EXPIRED";
  room_code?: string;
  metadata?: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EarnClashPlayer {
  id: string;
  room_id: string;
  user_id: string;
  score: number;
  is_ready: boolean;
  result: "PENDING" | "WIN" | "LOSS" | "DRAW" | "DISCONNECTED";
  payout_amount: number;
  payout_credited: boolean;
  payout_tx_id?: string;
  joined_at?: string;
}

export interface EarnClashRoomDetail extends EarnClashRoom {
  players: EarnClashPlayer[];
}

export interface EarnClashMatchState {
  room_id: string;
  status: "WAITING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED" | "EXPIRED";
  players: EarnClashPlayer[];
  started_at?: string;
  finished_at?: string;
}

export interface RedTeamVault {
  id: string;
  title: string;
  description: string;
  system_prompt: string;
  entry_fee: number;
  reward_pool: number;
  status: "LOCKED" | "ATTEMPTED" | "BREACHED" | "COMPLETED";
  difficulty: string;
  max_attempts?: number;
  current_attempts: number;
  breach_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface RedTeamAttempt {
  id: string;
  vault_id: string;
  user_id: string;
  prompt: string;
  response?: string;
  leaked_secret: boolean;
  tokens_used?: number;
  latency_ms?: number;
  reward_credited: boolean;
  reward_tx_id?: string;
  created_at?: string;
}

export interface GhostTask {
  id: string;
  title: string;
  description: string;
  target_url: string;
  required_proof_type: "TLS_NOTARY" | "RECLAIM" | "CUSTOM";
  required_claim: string;
  reward_amount: number;
  reward_currency: string;
  max_participants?: number;
  total_completions: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface GhostTaskProof {
  id: string;
  task_id: string;
  user_id: string;
  proof_identifier: string;
  proof_type: "TLS_NOTARY" | "RECLAIN" | "CUSTOM";
  claim_data?: string;
  signature: string;
  public_signals?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  reward_credited: boolean;
  reward_tx_id?: string;
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PredictionMarket {
  id: string;
  title: string;
  description?: string;
  resolution_criteria?: string;
  status: "ACTIVE" | "RESOLVED" | "CANCELLED";
  yes_liquidity: number;
  no_liquidity: number;
  total_volume: number;
  resolution_outcome?: "YES" | "NO";
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PredictionPosition {
  id: string;
  market_id: string;
  user_id: string;
  outcome: "YES" | "NO";
  shares: number;
  avg_price: number;
  realized_pnl: number;
  created_at?: string;
  updated_at?: string;
}
