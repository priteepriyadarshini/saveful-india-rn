import { useCallback, useEffect } from 'react';
import { useCheckMyMilestonesMutation } from '../api/api';
import { useBadgeNotification } from '../context/BadgeNotificationContext';
import { Badge, BadgeCategory, MilestoneType } from '../api/types';

/**
 * Hook to check milestones and automatically show badge notifications
 */
export const useBadgeChecker = () => {
  const [checkMilestones, { data, isLoading, isSuccess }] = useCheckMyMilestonesMutation();
  const { queueBadgeNotifications } = useBadgeNotification();

  // When new badges are awarded, show notifications
  useEffect(() => {
    if (isSuccess && data?.badges && data.badges.length > 0) {
      const notifications = data.badges.map((userBadge: any) => {
        const badge = userBadge.badge || userBadge.badgeId;
        
        // Generate earned reason based on badge type
        let earnedReason = '';
        if (badge.category === BadgeCategory.MILESTONE) {
          earnedReason = getMilestoneReason(badge);
        } else if (badge.category === BadgeCategory.CHALLENGE_WINNER) {
          earnedReason = userBadge.metadata?.challengeName 
            ? `Congratulations on winning ${userBadge.metadata.challengeName}!`
            : 'You won a challenge!';
        } else if (badge.category === BadgeCategory.SPECIAL) {
          earnedReason = 'You earned a special achievement!';
        }

        return {
          badge,
          earnedReason,
          userBadge,
        };
      });

      queueBadgeNotifications(notifications);
    }
  }, [isSuccess, data, queueBadgeNotifications]);

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
function getMilestoneReason(badge: Badge): string {
  const threshold = badge.milestoneThreshold || 0;

  switch (badge.milestoneType) {
    case MilestoneType.TOTAL_MEALS_COOKED:
      return `You've cooked ${threshold} meals!`;
    case MilestoneType.TOTAL_FOOD_SAVED:
      return `You've saved ${threshold}g of food!`;
    case MilestoneType.MONTHLY_MEALS_COOKED:
      return `${threshold} meals this month!`;
    case MilestoneType.YEARLY_MEALS_COOKED:
      return `${threshold} meals this year!`;
    case MilestoneType.MONTHLY_FOOD_SAVED:
      return `${threshold}g saved this month!`;
    case MilestoneType.YEARLY_FOOD_SAVED:
      return `${threshold}g saved this year!`;
    case MilestoneType.COOKING_STREAK:
      return `${threshold} day cooking streak!`;
    case MilestoneType.CHALLENGE_PARTICIPATION:
      return `Participated in ${threshold} challenges!`;
    default:
      return 'Keep up the great work!';
  }
}
