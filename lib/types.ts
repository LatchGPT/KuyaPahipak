export type PodCategory = "transparent" | "non-transparent";
export type ProductStatus = "available" | "coming-soon" | "sold-out";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  available: "Available",
  "coming-soon": "Coming Soon",
  "sold-out": "Sold Out",
};

export const productStatusRank = (status?: ProductStatus) =>
  ({ available: 0, "coming-soon": 1, "sold-out": 2 })[status ?? "available"];

export interface Brand {
  id: string;
  name: string;
  imageUrl: string;
  category: PodCategory;
  status?: ProductStatus;
  price?: number;
  createdAt?: number;
}

export interface Flavor {
  id: string;
  brandId: string;
  name: string;
  imageUrl: string;
  stock: number;
  lowStockAlert: number;
  createdAt?: number;
}

export interface PurchaseItem {
  flavorId: string;
  flavorName: string;
  quantity: number;
  brandId?: string;
  brandName?: string;
}

export interface Customer {
  id: string;
  name: string;
  totalPurchased: number;
  totalRedeemed: number;
  items: PurchaseItem[];
  createdAt?: number;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  brandId: string;
  brandName: string;
  flavorId: string;
  flavorName: string;
  quantity: number;
  amount: number;
  createdAt: number;
}

export interface Claim {
  id: string;
  customerId: string;
  customerName: string;
  flavorId: string;
  flavorName: string;
  quantity: number;
  createdAt: number;
}

export interface Settings {
  id: string;
  lowStockDefault: number;
  podPrice: number;
  transparentWeight?: number;
  nonTransparentWeight?: number;
  brandWeights?: Record<string, number>;
}

export interface SpinTicket {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  status: "pending" | "claimed" | "expired";
  categoryWon?: PodCategory;
  brandWonId?: string;
  brandWonName?: string;
  flavorWonId?: string;
  flavorWonName?: string;
  createdAt: number;
  claimedAt?: number;
}

export interface RewardState {
  progress: number;
  claimable: number;
  nextMilestone: number;
}

