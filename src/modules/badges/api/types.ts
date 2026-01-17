export enum BadgeCategory {
  ONBOARDING = 'ONBOARDING',
  USAGE = 'USAGE',
  COOKING = 'COOKING',
  MONEY_SAVED = 'MONEY_SAVED',
  FOOD_SAVED = 'FOOD_SAVED',
  PLANNING = 'PLANNING',
  BONUS = 'BONUS',
  SPONSOR = 'SPONSOR',
  CHALLENGE_WINNER = 'CHALLENGE_WINNER',
  SPECIAL = 'SPECIAL',
}

export enum MilestoneType {
  FIRST_RECIPE_COOKED = 'FIRST_RECIPE_COOKED',
  
  TOTAL_APP_SESSIONS_3 = 'TOTAL_APP_SESSIONS_3',
  TOTAL_APP_SESSIONS_7 = 'TOTAL_APP_SESSIONS_7',
  TOTAL_APP_SESSIONS_20 = 'TOTAL_APP_SESSIONS_20',
  TOTAL_APP_SESSIONS_50 = 'TOTAL_APP_SESSIONS_50',
  
  RECIPES_COOKED_5 = 'RECIPES_COOKED_5',
  RECIPES_COOKED_10 = 'RECIPES_COOKED_10',
  RECIPES_COOKED_25 = 'RECIPES_COOKED_25',
  RECIPES_COOKED_50 = 'RECIPES_COOKED_50',
  
  MONEY_SAVED_25 = 'MONEY_SAVED_25',
  MONEY_SAVED_50 = 'MONEY_SAVED_50',
  MONEY_SAVED_100 = 'MONEY_SAVED_100',
  MONEY_SAVED_250 = 'MONEY_SAVED_250',
  MONEY_SAVED_500 = 'MONEY_SAVED_500',
  
  FIRST_FOOD_SAVED = 'FIRST_FOOD_SAVED',
  FOOD_SAVED_5KG = 'FOOD_SAVED_5KG',
  FOOD_SAVED_10KG = 'FOOD_SAVED_10KG',
  FOOD_SAVED_15KG = 'FOOD_SAVED_15KG',
  FOOD_SAVED_20KG = 'FOOD_SAVED_20KG',
  
  SHOPPING_LIST_1 = 'SHOPPING_LIST_1',
  SHOPPING_LIST_5 = 'SHOPPING_LIST_5',
  SHOPPING_LIST_10 = 'SHOPPING_LIST_10',
  SHOPPING_LIST_25 = 'SHOPPING_LIST_25',
  
  WEEKDAY_MEALS_5 = 'WEEKDAY_MEALS_5',
  
  COOKING_STREAK = 'COOKING_STREAK',
  CHALLENGE_PARTICIPATION = 'CHALLENGE_PARTICIPATION',
}

export enum MetricType {
  RECIPES_COOKED = 'RECIPES_COOKED',
  APP_SESSIONS = 'APP_SESSIONS',
  MONEY_SAVED_CUMULATIVE = 'MONEY_SAVED_CUMULATIVE',
  FOOD_WEIGHT_SAVED = 'FOOD_WEIGHT_SAVED',
  SHOPPING_LISTS_CREATED = 'SHOPPING_LISTS_CREATED',
  WEEKDAY_MEALS_COOKED = 'WEEKDAY_MEALS_COOKED',
  FIRST_EVENT = 'FIRST_EVENT',
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: BadgeCategory;
  milestoneType?: MilestoneType;
  milestoneThreshold?: number;
  metricType?: MetricType;
  isActive: boolean;
  rarityScore: number;
  iconColor?: string;
  isDeleted: boolean;
  challengeId?: string;
  isSponsorBadge?: boolean;
  sponsorName?: string;
  sponsorLogoUrl?: string;
  sponsorCountries?: string[];
  sponsorValidFrom?: string;
  sponsorValidUntil?: string;
  sponsorMetadata?: {
    campaignId?: string;
    redemptionCode?: string;
    sponsorLink?: string;
    termsAndConditions?: string;
  };
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
  badgeCount: number;
  mealsCooked: number;
  foodSavedGrams: number;
  totalMoneySaved?: number;
  totalCo2SavedGrams?: number;
  totalCo2SavedKg?: number;
  rank?: number;
}

export type TimeFilter = 'today' | 'weekly' | 'monthly' | 'all';

export type MetricFilter = 'meals' | 'saved' | 'money' | 'badges' | 'co2' | 'all';

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
