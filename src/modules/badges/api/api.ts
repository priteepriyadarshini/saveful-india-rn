import api from '../../api';
import {
  Badge,
  UserBadge,
  LeaderboardEntry,
  BadgeStats,
  BadgesResponse,
  UserBadgesResponse,
  LeaderboardResponse,
  BadgeStatsResponse,
  BadgeCategory,
  TimeFilter,
} from './types';

const badgesApi = api
  .enhanceEndpoints({
    addTagTypes: ['Badges', 'UserBadges', 'Leaderboard', 'BadgeStats'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      // Get all badges
      getAllBadges: builder.query<Badge[], { includeInactive?: boolean }>({
        query: params => ({
          url: `/api/badges${params.includeInactive ? '?includeInactive=true' : ''}`,
          method: 'GET',
        }),
        providesTags: ['Badges'],
        transformResponse: (r: any) => {
          // Backend returns { badges: [...] }
          return r.badges || [];
        },
      }),

      // Get leaderboard with user stats
      getLeaderboard: builder.query<LeaderboardEntry[], { limit?: number; period?: TimeFilter }>({
        query: params => {
          const mapPeriod = (p?: TimeFilter) => {
            if (!p) return 'ALL_TIME';
            switch (p) {
              case 'all':
                return 'ALL_TIME';
              case 'monthly':
                return 'MONTHLY';
              case 'weekly':
                return 'WEEKLY';
              case 'today':
                // Backend has no daily granularity; fallback to weekly
                return 'WEEKLY';
              default:
                return 'ALL_TIME';
            }
          };
          const limitParam = params.limit ?? 50;
          const periodParam = mapPeriod(params.period);
          const query = `?limit=${limitParam}&period=${periodParam}&metric=BOTH`;
          return {
            url: `/api/analytics/leaderboard${query}`,
            method: 'GET',
          };
        },
        providesTags: ['Leaderboard'],
        transformResponse: (r: any) => {
          // Backend returns array directly or wrapped in object
          const leaderboard = Array.isArray(r) ? r : (r.leaderboard || []);
          return leaderboard.map((entry: any, index: number) => ({ 
            ...entry, 
            rank: index + 1,
            mealsCooked: entry.mealsCooked || entry.numberOfMealsCooked || 0,
            foodSavedGrams: entry.foodSavedGrams || entry.foodSavedInGrams || 0,
          }));
        },
      }),

      // Get my badges
      getMyBadges: builder.query<UserBadge[], void>({
        query: () => ({
          url: '/api/badges/user/my-badges',
          method: 'GET',
        }),
        providesTags: ['UserBadges'],
        transformResponse: (r: any) => {
          // Backend returns array directly
          return Array.isArray(r) ? r : [];
        },
      }),

      // Get my badge stats
      getMyBadgeStats: builder.query<BadgeStats, void>({
        query: () => ({
          url: '/api/badges/user/my-stats',
          method: 'GET',
        }),
        providesTags: ['BadgeStats'],
        transformResponse: (r: any) => {
          // Backend returns stats object directly
          return r || {
            totalBadges: 0,
            badgesByCategory: {},
            recentBadges: [],
            unviewedCount: 0,
          };
        },
      }),

      // Mark badge as viewed
      markBadgeAsViewed: builder.mutation<void, { badgeId: string }>({
        query: params => ({
          url: `/api/badges/user/mark-viewed/${params.badgeId}`,
          method: 'POST',
        }),
        invalidatesTags: ['UserBadges', 'BadgeStats'],
      }),

      // Explicitly check and award any milestone badges for current user
      checkMyMilestones: builder.mutation<{ newBadgesAwarded: number; badges?: any[] }, void>({
        query: () => ({
          url: '/api/badges/user/check-milestones',
          method: 'POST',
        }),
        invalidatesTags: ['UserBadges', 'BadgeStats'],
      }),
    }),
  });

export default badgesApi;

export const {
  useGetAllBadgesQuery,
  useGetLeaderboardQuery,
  useGetMyBadgesQuery,
  useGetMyBadgeStatsQuery,
  useMarkBadgeAsViewedMutation,
  useCheckMyMilestonesMutation,
} = badgesApi;
