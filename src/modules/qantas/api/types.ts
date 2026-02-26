/** Qantas Frequent Flyer – RTK Query API types */

export interface QantasPointsAward {
  points: number;
  reason: string;
  awardedAt: string;
}

export interface QantasFFNResponse {
  _id: string;
  userId: string;
  memberId: string;
  surname: string;
  isLinked: boolean;
  linkStatus: string;
  linkedAt: string;
  isRewarded: boolean;
  surveysCompletedSinceLink: number;
  totalPointsAwarded: number;
  greenTierUnlocked: boolean;
  expirationDate: string | null;
  link_response: {
    qffReference: {
      memberId: string;
    };
  };
}

export interface QantasDashboardResponse {
  ffn: QantasFFNResponse;
  surveysInCycle: number;
  surveysRequired: number;
  pointsPerCycle: number;
  greenTierUnlocked: boolean;
  totalPointsAwarded: number;
  isRewarded: boolean;
  /** 0–1 progress toward next reward */
  progress: number;
  pendingAllocation: boolean;
  pointsHistory: QantasPointsAward[];
}

export interface LinkFFNDto {
  memberId: string;
  surname: string;
}

export interface UnlinkFFNResponse {
  success: boolean;
  message: string;
}
