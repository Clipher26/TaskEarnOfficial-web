import { create } from "zustand";
import { VirtualWallet, Trade, Signal, Quest, Tournament, P2POffer, ActivityItem, P2PEscrowOrder, AutoWithdrawalRule, SavingsVault, GiftCardRedemption, PayoutSplit, TransactionReceipt, DebitCardWaitlist, MobileTopupOrder, UserBadge, BossBattle, UserMysteryBox, UserAchievement, MiniTournament, LiveStream, UserProfileCustomization, DiceRollResult, UserSurveyProfile, TaskDispute, TaskReminder, TaskSpeedrun, GroupTaskPool, TaskSubmission, TaskPreview, OfferwallOffer, OfferwallConversion } from "@/lib/types";

interface AppState {
  user: any | null;
  isLoggedIn: boolean;
  wallet: VirtualWallet | null;
  trades: Trade[];
  signals: Signal[];
  quests: Quest[];
  tournaments: Tournament[];
  p2pOffers: P2POffer[];
  p2pOrders: P2PEscrowOrder[];
  activities: ActivityItem[];
  activeModule: "dashboard" | "earnpoly" | "trade" | "signals" | "tasks" | "p2p" | "tournaments" | "streak" | "vip" | "leaderboard" | "guilds" | "staking" | "profile" | "referral" | "wallet-vaults" | "auto-withdraw" | "gift-cards" | "debit-card" | "badges" | "boss-battle" | "mystery-boxes" | "achievements" | "streams" | "profile-customization" | "social-feed" | "chat" | "bounty-board" | "offerwall" | "earnflip" | "earnclash" | "ai-arcade" | "ghost-tasks" | "prediction" | "earnflex";
  isLoading: boolean;
  autoWithdrawRules: AutoWithdrawalRule[];
  vaults: SavingsVault[];
  giftCards: GiftCardRedemption[];
  payoutSplit: PayoutSplit | null;
  receipts: TransactionReceipt[];
  debitCardWaitlist: DebitCardWaitlist | null;
  mobileTopupOrders: MobileTopupOrder[];
  userBadges: UserBadge[];
  activeBossBattle: BossBattle | null;
  mysteryBoxes: UserMysteryBox[];
  userAchievements: UserAchievement[];
  skillTree: any | null;
  activeTournaments: MiniTournament[];
  liveStreams: LiveStream[];
  userCustomizations: UserProfileCustomization[];
  diceResult: DiceRollResult | null;
  surveyProfile: UserSurveyProfile | null;
  disputes: TaskDispute[];
  reminders: TaskReminder[];
  speedruns: TaskSpeedrun[];
  groupPools: GroupTaskPool[];
  submissions: TaskSubmission[];
  previews: TaskPreview[];
  offerwallOffers: OfferwallOffer[];
  offerwallConversions: OfferwallConversion[];

  setOfferwallOffers: (offers: OfferwallOffer[]) => void;
  setOfferwallConversions: (conversions: OfferwallConversion[]) => void;

  setUser: (user: any) => void;
  setWallet: (wallet: VirtualWallet | null) => void;
  setTrades: (trades: Trade[]) => void;
  setSignals: (signals: Signal[]) => void;
  setQuests: (quests: Quest[]) => void;
  setTournaments: (tournaments: Tournament[]) => void;
  setP2POffers: (offers: P2POffer[]) => void;
  setP2POrders: (orders: P2PEscrowOrder[]) => void;
  addActivity: (activity: ActivityItem) => void;
  setActiveModule: (module: AppState["activeModule"]) => void;
  setLoading: (loading: boolean) => void;
  setAutoWithdrawRules: (rules: AutoWithdrawalRule[]) => void;
  setVaults: (vaults: SavingsVault[]) => void;
  setGiftCards: (giftCards: GiftCardRedemption[]) => void;
  setPayoutSplit: (split: PayoutSplit | null) => void;
  setReceipts: (receipts: TransactionReceipt[]) => void;
  setDebitCardWaitlist: (entry: DebitCardWaitlist | null) => void;
  setMobileTopupOrders: (orders: MobileTopupOrder[]) => void;
  setUserBadges: (badges: UserBadge[]) => void;
  setActiveBossBattle: (battle: BossBattle | null) => void;
  setMysteryBoxes: (boxes: UserMysteryBox[]) => void;
  setUserAchievements: (achievements: UserAchievement[]) => void;
  setSkillTree: (tree: any | null) => void;
  setActiveTournaments: (tournaments: MiniTournament[]) => void;
  setLiveStreams: (streams: LiveStream[]) => void;
  setUserCustomizations: (customizations: UserProfileCustomization[]) => void;
  setDiceResult: (result: DiceRollResult | null) => void;
  setSurveyProfile: (profile: UserSurveyProfile | null) => void;
  setDisputes: (disputes: TaskDispute[]) => void;
  setReminders: (reminders: TaskReminder[]) => void;
  setSpeedruns: (speedruns: TaskSpeedrun[]) => void;
  setGroupPools: (pools: GroupTaskPool[]) => void;
  setSubmissions: (submissions: TaskSubmission[]) => void;
  setPreviews: (previews: TaskPreview[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoggedIn: false,
  wallet: null,
  trades: [],
  signals: [],
  quests: [],
  tournaments: [],
  p2pOffers: [],
  p2pOrders: [],
  activities: [],
  activeModule: "dashboard",
  isLoading: true,
  autoWithdrawRules: [],
  vaults: [],
  giftCards: [],
  payoutSplit: null,
  receipts: [],
  debitCardWaitlist: null,
  mobileTopupOrders: [],
  userBadges: [],
  activeBossBattle: null,
  mysteryBoxes: [],
  userAchievements: [],
  skillTree: null,
  activeTournaments: [],
  liveStreams: [],
  userCustomizations: [],
  diceResult: null,
  surveyProfile: null,
  disputes: [],
  reminders: [],
  speedruns: [],
  groupPools: [],
  submissions: [],
  previews: [],
  offerwallOffers: [],
  offerwallConversions: [],

  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setWallet: (wallet) => set({ wallet }),
  setTrades: (trades) => set({ trades }),
  setSignals: (signals) => set({ signals }),
  setQuests: (quests) => set({ quests }),
  setTournaments: (tournaments) => set({ tournaments }),
  setP2POffers: (p2pOffers) => set({ p2pOffers }),
  setP2POrders: (p2pOrders) => set({ p2pOrders }),
  addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities.filter((a) => a.id !== activity.id)].slice(0, 50) })),
  setActiveModule: (activeModule) => set({ activeModule }),
  setLoading: (isLoading) => set({ isLoading }),
  setAutoWithdrawRules: (autoWithdrawRules) => set({ autoWithdrawRules }),
  setVaults: (vaults) => set({ vaults }),
  setGiftCards: (giftCards) => set({ giftCards }),
  setPayoutSplit: (payoutSplit) => set({ payoutSplit }),
  setReceipts: (receipts) => set({ receipts }),
  setDebitCardWaitlist: (debitCardWaitlist) => set({ debitCardWaitlist }),
  setMobileTopupOrders: (mobileTopupOrders) => set({ mobileTopupOrders }),
  setUserBadges: (userBadges) => set({ userBadges }),
  setActiveBossBattle: (activeBossBattle) => set({ activeBossBattle }),
  setMysteryBoxes: (mysteryBoxes) => set({ mysteryBoxes }),
  setUserAchievements: (userAchievements) => set({ userAchievements }),
  setSkillTree: (skillTree) => set({ skillTree }),
  setActiveTournaments: (activeTournaments) => set({ activeTournaments }),
  setLiveStreams: (liveStreams) => set({ liveStreams }),
  setUserCustomizations: (userCustomizations) => set({ userCustomizations }),
  setDiceResult: (diceResult) => set({ diceResult }),
  setSurveyProfile: (surveyProfile) => set({ surveyProfile }),
  setDisputes: (disputes) => set({ disputes }),
  setReminders: (reminders) => set({ reminders }),
  setSpeedruns: (speedruns) => set({ speedruns }),
  setGroupPools: (groupPools) => set({ groupPools }),
  setSubmissions: (submissions) => set({ submissions }),
  setPreviews: (previews) => set({ previews }),
  setOfferwallOffers: (offerwallOffers) => set({ offerwallOffers }),
  setOfferwallConversions: (offerwallConversions) => set({ offerwallConversions }),
}));