import type { RewardState } from "@/lib/types";

export function computeRewardState(totalPurchased: number, totalRedeemed: number): RewardState {
  const earned = Math.floor(Math.max(totalPurchased, 0) / 10);
  const claimable = Math.max(earned - Math.max(totalRedeemed, 0), 0);
  return {
    progress: Math.max(totalPurchased, 0) % 10,
    claimable,
    nextMilestone: 10,
  };
}

export function assertStockAvailable(stock: number, quantity: number): void {
  if (quantity <= 0) throw new Error("Quantity must be greater than zero.");
  if (stock - quantity < 0) throw new Error("Insufficient stock for this action.");
}
