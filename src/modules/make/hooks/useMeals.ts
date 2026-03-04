import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { filterAllergiesByUserPreferences } from '../../../common/helpers/filterIngredients';
import { IFramework } from '../../../models/craft';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import { useGetCurrentUserQuery } from '../../auth/api';
import { recipeApiService } from '../../recipe/api/recipeApiService';
import { recipesToFrameworks } from '../../recipe/adapters/recipeAdapter';
import { useGetDietaryRecommendationsQuery } from '../../recipe/api/recipeApi';

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

/** Map dietary UI keys to API query params (same as DietaryRecipesScreen). */
function buildDietaryQueryParams(dietaryFilters: string[], country?: string) {
  let vegType: string | undefined;
  if (dietaryFilters.includes('vegan'))           vegType = 'VEGAN';
  else if (dietaryFilters.includes('vegetarian')) vegType = 'VEGETARIAN';

  return {
    vegType,
    dairyFree:   dietaryFilters.includes('dairyFree'),
    nutFree:     dietaryFilters.includes('nutFree'),
    glutenFree:  dietaryFilters.includes('glutenFree'),
    hasDiabetes: dietaryFilters.includes('diabetes'),
    country,
  };
}

export default function useMeals(filters: string[], dietaryFilters: string[] = []) {
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetCurrentUserQuery();

  // Prefer user profile country; fall back to onboarding suburb (which stores country name).
  const userCountry = currentUser?.country || userOnboarding?.suburb;

  // ─── Dietary recommendations query (skipped when no dietary filters active) ───
  const dietaryQueryParams = useMemo(
    () => buildDietaryQueryParams(dietaryFilters, userCountry),
    [dietaryFilters, userCountry],
  );
  const skipDietaryQuery = dietaryFilters.length === 0;
  const { data: dietaryRecipes } = useGetDietaryRecommendationsQuery(
    skipDietaryQuery ? skipToken : dietaryQueryParams,
  );

  // Build a Set of matching recipe IDs for fast in-memory filtering
  const dietaryRecipeIds = useMemo(() => {
    if (!dietaryRecipes || dietaryFilters.length === 0) return null;
    return new Set(dietaryRecipes.map(r => r._id));
  }, [dietaryRecipes, dietaryFilters]);

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
        // Apply current filters immediately if any active
        if (filters.length > 0) {
          const clientFiltered = filtered.filter(framework =>
            framework.frameworkCategories?.some(category => {
              const categoryId = extractCategoryId(category);
              return filters.includes(categoryId);
            }),
          );
          setFrameworks(clientFiltered.length > 0 ? clientFiltered : filtered);
        } else {
          setFrameworks(filtered);
        }
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

  // When filters or dietary results change, do instant client-side filtering from cached data
  useEffect(() => {
    const allFrameworks = allFrameworksRef.current;
    // If no data loaded yet, skip
    if (allFrameworks.length === 0) return;

    const hasCategoryFilters = filters && filters.length > 0;
    const hasDietaryFilters = dietaryFilters.length > 0 && dietaryRecipeIds !== null;

    if (!hasCategoryFilters && !hasDietaryFilters) {
      setFrameworks(allFrameworks);
      return;
    }

    let result = allFrameworks;

    // Apply category filters
    if (hasCategoryFilters) {
      const categoryFiltered = result.filter(framework =>
        framework.frameworkCategories?.some(category => {
          const categoryId = extractCategoryId(category);
          return filters.includes(categoryId);
        }),
      );
      if (categoryFiltered.length > 0) {
        result = categoryFiltered;
      }
    }

    // Apply dietary filters (in-memory intersection with dietary API results)
    if (hasDietaryFilters && dietaryRecipeIds) {
      const dietaryFiltered = result.filter(framework =>
        dietaryRecipeIds.has(framework.id),
      );
      if (dietaryFiltered.length > 0) {
        result = dietaryFiltered;
      }
    }

    setFrameworks(result);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dietaryFilters, dietaryRecipeIds]);

  return { frameworks, isLoading };
}
