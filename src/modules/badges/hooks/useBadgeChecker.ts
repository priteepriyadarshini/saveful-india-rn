import { useCallback, useEffect } from 'react';
import { useCheckMyMilestonesMutation, useLazyGetBadgeByIdQuery } from '../api/api';
import { useBadgeNotification } from '../context/BadgeNotificationContext';
import { Badge, MilestoneType, UserBadge } from '../api/types';
import { useGetCurrentUserQuery } from '../../auth/api';
import { getCurrencySymbol } from '../../../common/utils/currency';

/**
 * Hook to check milestones and automatically show badge notifications
 */
export const useBadgeChecker = () => {
  const [checkMilestones, { data, isLoading, isSuccess }] = useCheckMyMilestonesMutation();
  const [fetchBadgeById] = useLazyGetBadgeByIdQuery();
  const { queueBadgeNotifications } = useBadgeNotification();
  const { data: currentUser } = useGetCurrentUserQuery();
  const currencySymbol = getCurrencySymbol(currentUser?.country);

  // When new badges are awarded, show notifications
  useEffect(() => {
    const enrichAndQueue = async (awards: UserBadge[]) => {
      try {
        const notifications = await Promise.all(
          awards.map(async (userBadge) => {
            const id = typeof userBadge.badgeId === 'string'
              ? (userBadge.badgeId as string)
              : (userBadge.badgeId as Badge)._id;
            const fetched = await fetchBadgeById({ id }).unwrap();
            const badge: Badge = fetched as Badge;

            // Generate earned reason based on badge details
            const earnedReason = buildEarnedReason(badge, userBadge, currencySymbol);

            return {
              badge,
              earnedReason,
              userBadge,
            };
          })
        );
        queueBadgeNotifications(notifications);
      } catch (error) {
        console.error('Failed to enrich badges:', error);
      }
    };

    if (isSuccess && Array.isArray(data?.badges) && data.badges.length > 0) {
      enrichAndQueue(data.badges as UserBadge[]);
    }
  }, [isSuccess, data, queueBadgeNotifications, fetchBadgeById]);

  const checkMilestonesNow = useCallback(async () => {
    try {
      await checkMilestones().unwrap();
    } catch (error) {
      console.error('Failed to check milestones:', error);
    }
  }, [checkMilestones]);

  return {
    checkMilestonesNow,
    isCheckingMilestones: isLoading,
  };
};

/**
 * Generate a human-readable reason for milestone badges
 */
function buildEarnedReason(badge: Badge, userBadge: UserBadge, currencySymbol = '₹'): string {
  const threshold = badge.milestoneThreshold || userBadge.achievedValue || 0;

  // Challenge winner badges
  if (badge.category === 'CHALLENGE_WINNER') {
    return userBadge.metadata?.challengeName
      ? `Congratulations on winning ${userBadge.metadata.challengeName}!`
      : 'You won a challenge!';
  }

  // Sponsor or special badges
  if (badge.category === 'SPONSOR') {
    return badge.sponsorName
      ? `A special reward from ${badge.sponsorName}!`
      : 'A special sponsor reward!';
  }
  if (badge.category === 'SPECIAL') {
    return 'You earned a special achievement!';
  }

  // Milestone-style badges
  switch (badge.milestoneType) {
    case MilestoneType.FIRST_RECIPE_COOKED:
      return `You've cooked your first recipe!`;
    case MilestoneType.RECIPES_COOKED_5:
    case MilestoneType.RECIPES_COOKED_10:
    case MilestoneType.RECIPES_COOKED_25:
    case MilestoneType.RECIPES_COOKED_50:
      return `You've cooked ${threshold} recipes!`;
    case MilestoneType.MONEY_SAVED_25:
    case MilestoneType.MONEY_SAVED_50:
    case MilestoneType.MONEY_SAVED_100:
    case MilestoneType.MONEY_SAVED_250:
    case MilestoneType.MONEY_SAVED_500:
      return `You've saved ${currencySymbol}${threshold}!`;
    case MilestoneType.FIRST_FOOD_SAVED:
      return `First food saved — great start!`;
    case MilestoneType.FOOD_SAVED_5KG:
    case MilestoneType.FOOD_SAVED_10KG:
    case MilestoneType.FOOD_SAVED_15KG:
    case MilestoneType.FOOD_SAVED_20KG:
      return `You've saved ${threshold}kg of food!`;
    case MilestoneType.SHOPPING_LIST_1:
    case MilestoneType.SHOPPING_LIST_5:
    case MilestoneType.SHOPPING_LIST_10:
    case MilestoneType.SHOPPING_LIST_25:
      return `You've created ${threshold} shopping lists!`;
    case MilestoneType.WEEKDAY_MEALS_5:
      return `You've cooked ${threshold} weekday meals!`;
    case MilestoneType.COOKING_STREAK:
      return `${threshold} day cooking streak!`;
    case MilestoneType.CHALLENGE_PARTICIPATION:
      return `Participated in ${threshold} challenges!`;
    default:
      // Category-based fallback
      if (badge.category === 'USAGE') return 'Great app engagement!';
      if (badge.category === 'COOKING') return 'Cooking milestone achieved!';
      if (badge.category === 'MONEY_SAVED') return 'Savings milestone achieved!';
      if (badge.category === 'FOOD_SAVED') return 'Food waste reduced — nice!';
      if (badge.category === 'PLANNING') return 'Planning achievement unlocked!';
      if (badge.category === 'BONUS') return 'Bonus achievement unlocked!';
      if (badge.category === 'ONBOARDING') return 'Welcome aboard!';
      return 'Achievement unlocked!';
  }
}
