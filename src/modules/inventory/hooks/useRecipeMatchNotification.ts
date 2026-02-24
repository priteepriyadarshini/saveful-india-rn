import { useCallback, useRef } from 'react';
import { useCheckNewRecipeMatchesMutation } from '../api/inventoryApi';
import useNotifications from '../../notifications/hooks/useNotifications';

export default function useRecipeMatchNotification() {
  const [checkNewMatches] = useCheckNewRecipeMatchesMutation();
  const { scheduleNotification } = useNotifications();
  const lastNotifiedRef = useRef<number>(0);

  const notifyIfNewMatches = useCallback(
    async (country?: string) => {
      const now = Date.now();
      if (now - lastNotifiedRef.current < 30_000) {
        return;
      }

      try {
        const result = await checkNewMatches(
          country ? { country } : undefined,
        ).unwrap();

        if (result.hasNewMatches && result.topNewMatch) {
          lastNotifiedRef.current = now;

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
        }
      } catch (error) {
        console.warn('Recipe match notification check failed:', error);
      }
    },
    [checkNewMatches, scheduleNotification],
  );

  return { notifyIfNewMatches };
}
