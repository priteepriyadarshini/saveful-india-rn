import { useCallback, useEffect, useRef, useState } from 'react';
import { filterAllergiesByUserPreferences } from '../../../common/helpers/filterIngredients';
import { IFramework } from '../../../models/craft';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import { useGetCurrentUserQuery } from '../../auth/api';
import { recipeApiService } from '../../recipe/api/recipeApiService';
import { recipesToFrameworks } from '../../recipe/adapters/recipeAdapter';

// Helper to extract category ID from various formats
const extractCategoryId = (category: any): string => {
  if (typeof category === 'string') return category;

  if (category?.id) {
    if (typeof category.id === 'string') return category.id;
    if (category.id?.$oid) return category.id.$oid as string;
    if (category.id?._id) {
      return typeof category.id._id === 'string'
        ? (category.id._id as string)
        : (category.id._id?.$oid as string) || String(category.id._id);
    }
    const str = String(category.id);
    return str === '[object Object]' ? '' : str;
  }

  if (category?._id) {
    if (typeof category._id === 'string') return category._id;
    if (category._id?.$oid) return category._id.$oid as string;
    const str = String(category._id);
    return str === '[object Object]' ? '' : str;
  }

  return '';
};

export default function useMeals(filters: string[]) {
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetCurrentUserQuery();

  // Prefer user profile country; fall back to onboarding suburb (which stores country name).
  const userCountry = currentUser?.country || userOnboarding?.suburb;

  const [frameworks, setFrameworks] = useState<IFramework[]>([]);
  const allFrameworksRef = useRef<IFramework[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getFrameworksData = useCallback(async () => {
    // Wait until the user profile has resolved so we have the correct country before fetching.
    if (isCurrentUserLoading) return;
    try {
      const recipes = await recipeApiService.getAllRecipes(userCountry);
      const convertedFrameworks = recipesToFrameworks(recipes);

      if (convertedFrameworks) {
        const filtered = filterAllergiesByUserPreferences(
          convertedFrameworks,
          userOnboarding?.allergies,
        );
        allFrameworksRef.current = filtered;
        setFrameworks(filtered);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      allFrameworksRef.current = [];
      setFrameworks([]);
      setIsLoading(false);
    }
  }, [userOnboarding?.allergies, userCountry, isCurrentUserLoading]);

  useEffect(() => {
    getFrameworksData();
  }, [getFrameworksData]);

  // When filters change, fetch server-side filtered recipes
  useEffect(() => {
    const allFrameworks = allFrameworksRef.current;

    const applyFilters = async () => {
      if (!filters || filters.length === 0) {
        setFrameworks(allFrameworks);
        return;
      }

      try {
        const recipes = await recipeApiService.getRecipesByCategories(filters, userCountry);
        const converted = recipesToFrameworks(recipes);
        const filtered = filterAllergiesByUserPreferences(
          converted,
          userOnboarding?.allergies,
        );

        if (!filtered || filtered.length === 0) {
          try {
            const perCategoryResults = await Promise.all(
              filters.map(id => recipeApiService.getRecipesByCategory(id, userCountry)),
            );
            const mergedRecipes = perCategoryResults.flat();
            const seen: Record<string, boolean> = {};
            const deduped = mergedRecipes.filter(r => {
              const rid =
                typeof (r as any)._id === 'string'
                  ? ((r as any)._id as string)
                  : ((r as any)._id?.$oid as string) ||
                    String((r as any)._id);
              if (!rid || seen[rid]) return false;
              seen[rid] = true;
              return true;
            });
            const mergedFrameworks = recipesToFrameworks(deduped);
            const allergyFiltered = filterAllergiesByUserPreferences(
              mergedFrameworks,
              userOnboarding?.allergies,
            );
            if (allergyFiltered && allergyFiltered.length > 0) {
              setFrameworks(allergyFiltered);
            } else {
              const clientFiltered = allFrameworks.filter(framework =>
                framework.frameworkCategories?.some(category => {
                  const categoryId = extractCategoryId(category);
                  return filters.includes(categoryId);
                }),
              );
              setFrameworks(clientFiltered);
            }
          } catch {
            const clientFiltered = allFrameworks.filter(framework =>
              framework.frameworkCategories?.some(category => {
                const categoryId = extractCategoryId(category);
                return filters.includes(categoryId);
              }),
            );
            setFrameworks(clientFiltered);
          }
        } else {
          setFrameworks(filtered);
        }
      } catch {
        const clientFiltered = allFrameworks.filter(framework =>
          framework.frameworkCategories?.some(category => {
            const categoryId = extractCategoryId(category);
            return filters.includes(categoryId);
          }),
        );
        setFrameworks(clientFiltered);
      }
    };

    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, userCountry, userOnboarding?.allergies]);

  return { frameworks, isLoading };
}
