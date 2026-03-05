import { useCallback } from 'react';
import { useCheckNewRecipeMatchesMutation } from '../api/inventoryApi';
import useNotifications from '../../notifications/hooks/useNotifications';


let lastNotifiedTimestamp = 0;

export default function useRecipeMatchNotification() {
  const [checkNewMatches] = useCheckNewRecipeMatchesMutation();
  const { scheduleNotification } = useNotifications();

  const notifyIfNewMatches = useCallback(
    async (country?: string) => {
      const now = Date.now();
      if (now - lastNotifiedTimestamp < 30_000) {
        return;
      }
      lastNotifiedTimestamp = now;

      try {
        const result = await checkNewMatches(
          country ? { country } : undefined,
        ).unwrap();

        if (result.hasNewMatches && result.topNewMatch) {
          const matchCount = result.newMatchCount;
          const topRecipe = result.topNewMatch.recipe.title;
          const matchPct = result.topNewMatch.matchPercentage;

          const message =
            matchCount === 1
              ? `You can now cook "${topRecipe}" (${matchPct}% match) with your ingredients!`
              : `${matchCount} new recipes unlocked! Try "${topRecipe}" (${matchPct}% match) first.`;

          await scheduleNotification({
            message,
            delayInSeconds: 3,
            url: '/inventory/meal-suggestions',
          });
        } else {
          lastNotifiedTimestamp = 0;
        }
      } catch (error) {
        lastNotifiedTimestamp = 0;
        console.warn('Recipe match notification check failed:', error);
      }
    },
    [checkNewMatches, scheduleNotification],
  );

  return { notifyIfNewMatches };
}
