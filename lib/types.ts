export type PodCategory = "transparent" | "non-transparent";

export interface Brand {
  id: string;
  name: string;
  imageUrl: string;
  category: PodCategory;
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
}

export interface RewardState {
  progress: number;
  claimable: number;
  nextMilestone: number;
}
