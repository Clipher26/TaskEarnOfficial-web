import { BoardSpace } from "./earnpoly";

export interface PlayerState {
  id: string;
  balanceUsdt: number;
  isInJail: boolean;
  jailTurnsRemaining: number;
  position: number;
  disconnected?: boolean;
}

export interface SpaceLandingResult {
  updatedPlayer: PlayerState;
  message: string;
}

export function handleSpaceLanding(player: PlayerState, space: BoardSpace, stakeTier: number): SpaceLandingResult {
  let updatedPlayer = { ...player };
  let message = "";

  const multiplier = stakeTier / 10;

  switch (space.type) {
    case "BONUS":
      const bonusAmount = (space.amount || 0) * multiplier;
      updatedPlayer.balanceUsdt = Math.max(0, updatedPlayer.balanceUsdt + bonusAmount);
      message = `🎉 Landed on ${space.name}! Received +${bonusAmount.toFixed(2)} USDT.`;
      break;

    case "PENALTY":
    case "TAX":
    case "FINE":
      const penaltyAmount = (space.amount || 0) * multiplier;
      updatedPlayer.balanceUsdt = Math.max(0, updatedPlayer.balanceUsdt - penaltyAmount);
      message = `⚠️ Landed on ${space.name}! Paid penalty of -${penaltyAmount.toFixed(2)} USDT.`;
      break;

    case "CORNER":
      if (space.action === "GO_TO_JAIL") {
        updatedPlayer.position = 10;
        updatedPlayer.isInJail = true;
        updatedPlayer.jailTurnsRemaining = 3;
        const jailFine = 10 * multiplier;
        updatedPlayer.balanceUsdt = Math.max(0, updatedPlayer.balanceUsdt - jailFine);
        message = `🚨 Rugged! Sent to Crypto Jail and fined -${jailFine.toFixed(2)} USDT.`;
      } else if (space.action === "COLLECT_REWARD") {
        const rewardAmount = (space.amount || 10) * multiplier;
        updatedPlayer.balanceUsdt = Math.max(0, updatedPlayer.balanceUsdt + rewardAmount);
        message = `🚀 Completed circuit around Genesis Block! Collected +${rewardAmount.toFixed(2)} USDT.`;
      } else if (space.action === "COLLECT_VAULT_POOL") {
        const vaultAmount = 5 * multiplier;
        updatedPlayer.balanceUsdt = Math.max(0, updatedPlayer.balanceUsdt + vaultAmount);
        message = `🅿️ Free Parking! Collected vault pool bonus of +${vaultAmount.toFixed(2)} USDT.`;
      }
      break;

    case "TASK":
      message = `📋 Landed on ${space.name}! Complete the micro-task to earn $CRED and bonus USDT.`;
      break;

    case "LIQUIDITY_POOL":
      message = `🏦 Landed on ${space.name}! Stake $EARN to earn yield or trade LP tokens.`;
      break;

    case "ORACLE":
      message = `🔮 Landed on ${space.name}! Pay oracle fee or use price feed data.`;
      break;

    default:
      message = `Landed on ${space.name}.`;
      break;
  }

  return { updatedPlayer, message };
}
