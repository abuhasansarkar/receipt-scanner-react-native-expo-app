export type PlanTier = "free" | "pro" | "business";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  plan: PlanTier;
}
