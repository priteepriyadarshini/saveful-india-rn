export enum BadgeCategory {
  MILESTONE = 'MILESTONE',
  CHALLENGE_WINNER = 'CHALLENGE_WINNER',
  SPECIAL = 'SPECIAL',
}

export enum MilestoneType {
  TOTAL_MEALS_COOKED = 'TOTAL_MEALS_COOKED',
  TOTAL_FOOD_SAVED = 'TOTAL_FOOD_SAVED',
  MONTHLY_MEALS_COOKED = 'MONTHLY_MEALS_COOKED',
  YEARLY_MEALS_COOKED = 'YEARLY_MEALS_COOKED',
  MONTHLY_FOOD_SAVED = 'MONTHLY_FOOD_SAVED',
  YEARLY_FOOD_SAVED = 'YEARLY_FOOD_SAVED',
  COOKING_STREAK = 'COOKING_STREAK',
  CHALLENGE_PARTICIPATION = 'CHALLENGE_PARTICIPATION',
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: BadgeCategory;
  milestoneType?: MilestoneType;
  milestoneThreshold?: number;
  isActive: boolean;
  rarityScore: number;
  iconColor?: string;
  isDeleted: boolean;
  challengeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBadge {
  _id: string;
  userId: string;
  badgeId: Badge | string;
  earnedAt: string;
  achievedValue?: number;
  metadata?: {
    challengeId?: string;
    challengeName?: string;
    period?: string;
    rank?: number;
    totalParticipants?: number;
  };
  isNotified: boolean;
  isViewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userEmail: string;
  badgeCount: number;
  mealsCooked: number;
  foodSavedGrams: number;
  totalMoneySaved?: number;
  rank?: number;
}

export type TimeFilter = 'today' | 'weekly' | 'monthly' | 'all';

export interface BadgeStats {
  totalBadges: number;
  badgesByCategory: Record<string, number>;
  recentBadges: UserBadge[];
  unviewedCount: number;
}

// Response types
export interface BadgesResponse {
  badges: Badge[];
}

export interface UserBadgesResponse {
  badges?: UserBadge[];
  userBadges?: UserBadge[];
}

export interface LeaderboardResponse {
  leaderboard?: LeaderboardEntry[];
}

export interface BadgeStatsResponse {
  stats?: BadgeStats;
}
