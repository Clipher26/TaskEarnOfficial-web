import { PlayerState } from "./spaceResolver";

export interface MatchInput {
  match_id: string;
  stake_tier: number;
  players: PlayerState[];
  action_type: "DICE_ROLL" | "FORFEIT" | "MATCH_END";
  dice_value?: number;
}

export interface PayoutSettlement {
  winner_id: string | null;
  loser_id: string | null;
  winner_payout: number;
  loser_fine: number;
  platform_fee: number;
  reason: string;
}

export interface EvaluatedPlayer {
  id: string;
  previous_position: number;
  new_position: number;
  landed_tile: string;
  tile_action: "ADD_FUNDS" | "SUBTRACT_FUNDS" | "JAIL" | "NONE";
  amount_changed: number;
  new_balance_usdt: number;
  is_in_jail: boolean;
}

export interface MatchOutput {
  match_id: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  evaluated_player: EvaluatedPlayer | null;
  payout_settlement: PayoutSettlement;
}

export function evaluateMatch(input: MatchInput): MatchOutput {
  const { match_id, stake_tier, players, action_type } = input;

  const validStakes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  if (!validStakes.includes(stake_tier)) {
    return {
      match_id,
      status: "CANCELLED",
      evaluated_player: null,
      payout_settlement: {
        winner_id: null,
        loser_id: null,
        winner_payout: 0,
        loser_fine: 0,
        platform_fee: 0,
        reason: "Invalid stake tier.",
      },
    };
  }

  if (action_type === "FORFEIT") {
    const forfeiter = players.find((p) => p.disconnected) || players[0];
    const otherPlayer = players.find((p) => p.id !== forfeiter.id) || players[1];
    const fine = stake_tier * 1.5;
    const compensation = stake_tier * 1.35;
    const platformFee = stake_tier * 0.15;

    return {
      match_id,
      status: "COMPLETED",
      evaluated_player: null,
      payout_settlement: {
        winner_id: otherPlayer.id,
        loser_id: forfeiter.id,
        winner_payout: compensation,
        loser_fine: fine,
        platform_fee: platformFee,
        reason: `Forfeit settlement: ${forfeiter.id} forfeited. Fine: $${fine.toFixed(2)}, Compensation: $${compensation.toFixed(2)}.`,
      },
    };
  }

  if (action_type === "MATCH_END") {
    const [p1, p2] = players;
    const winner = p1.balanceUsdt > p2.balanceUsdt ? p1 : p2;
    const loser = winner.id === p1.id ? p2 : p1;
    const prizePool = stake_tier * 2;
    const platformFee = prizePool * 0.1;
    const winnerPayout = prizePool * 0.9;
    const loserFine = stake_tier;

    return {
      match_id,
      status: "COMPLETED",
      evaluated_player: null,
      payout_settlement: {
        winner_id: winner.id,
        loser_id: loser.id,
        winner_payout: winnerPayout,
        loser_fine: loserFine,
        platform_fee: platformFee,
        reason: `Match completed. Winner: ${winner.id}. Prize Pool: $${prizePool.toFixed(2)}, Platform Fee: $${platformFee.toFixed(2)}.`,
      },
    };
  }

  if (action_type === "DICE_ROLL") {
    const player = players[0];
    const previousPosition = player.position;
    const diceValue = input.dice_value || 0;
    const newPosition = (previousPosition + diceValue) % 40;
    const landedTile = `Space ${newPosition}`;

    return {
      match_id,
      status: "IN_PROGRESS",
      evaluated_player: {
        id: player.id,
        previous_position: previousPosition,
        new_position: newPosition,
        landed_tile: landedTile,
        tile_action: "NONE",
        amount_changed: 0,
        new_balance_usdt: player.balanceUsdt,
        is_in_jail: player.isInJail,
      },
      payout_settlement: {
        winner_id: null,
        loser_id: null,
        winner_payout: 0,
        loser_fine: 0,
        platform_fee: 0,
        reason: "Turn completed.",
      },
    };
  }

  return {
    match_id,
    status: "CANCELLED",
    evaluated_player: null,
    payout_settlement: {
      winner_id: null,
      loser_id: null,
      winner_payout: 0,
      loser_fine: 0,
      platform_fee: 0,
      reason: "Unknown action type.",
    },
  };
}
