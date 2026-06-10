export type SubscriptionStatus = 
  | 'active' 
  | 'payment_due' 
  | 'grace_period' 
  | 'locked' 
  | 'deleted';

export interface Subscription {
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  gracePeriodEndsAt?: Date;
  lockedAt?: Date;
  deletionScheduledAt?: Date;
  plan: 'starter' | 'professional' | 'premium';
  amount: number;
}

export interface SubscriptionState {
  subscription: Subscription;
  daysUntilDeletion?: number;
  canAccessDashboard: boolean;
  shouldShowWarning: boolean;
  warningType?: 'payment_due' | 'grace_period' | 'locked';
}
