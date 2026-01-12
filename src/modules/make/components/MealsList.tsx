import SkeletonLoader from '../../../common/components/SkeletonLoader';
import { filterAllergiesByUserPreferences } from '../../../common/helpers/filterIngredients';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import MealCard from './MealCard';
import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import { recipeApiService } from '../../recipe/api/recipeApiService';
import { recipesToFrameworks } from '../../recipe/adapters/recipeAdapter';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

export default function MealsList({ filters }: { filters: string[] }) {
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const [frameworks, setFrameworks] = React.useState<IFramework[]>([]);
  const [allFrameworks, setAllFrameworks] = React.useState<IFramework[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getFrameworksData = async () => {
    try {
      // Fetch recipes from the new API
      const recipes = await recipeApiService.getAllRecipes();
      
      // Convert recipes to framework format for UI compatibility
      const convertedFrameworks = recipesToFrameworks(recipes);
      
      // Apply allergy filters if needed
      if (convertedFrameworks) {
        const filtered = filterAllergiesByUserPreferences(
          convertedFrameworks,
          userOnboarding?.allergies,
        );
        setAllFrameworks(filtered);
        setFrameworks(filtered);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      // Do not fallback to Craft CMS; keep only API usage
      setAllFrameworks([]);
      setFrameworks([]);
      setIsLoading(false);
    }
  };

 useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOnboarding]);

  // When filters change, fetch server-side filtered recipes to avoid ID mismatches
  useEffect(() => {
    const applyFilters = async () => {
      if (!filters || filters.length === 0) {
        setFrameworks(allFrameworks);
        return;
      }

      try {
        const recipes = await recipeApiService.getRecipesByCategories(filters);
        const converted = recipesToFrameworks(recipes);
        const filtered = filterAllergiesByUserPreferences(
          converted,
          userOnboarding?.allergies,
        );
        // If server-side filtered result is empty, attempt client-side fallback
        if (!filtered || filtered.length === 0) {
          // Try per-category endpoint and merge results
          try {
            const perCategoryResults = await Promise.all(
              filters.map(id => recipeApiService.getRecipesByCategory(id))
            );
            const mergedRecipes = perCategoryResults.flat();
            // Deduplicate by recipe _id
            const seen: Record<string, boolean> = {};
            const deduped = mergedRecipes.filter(r => {
              const rid = typeof (r as any)._id === 'string'
                ? ((r as any)._id as string)
                : ((r as any)._id?.$oid as string) || String((r as any)._id);
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
              // Final client-side fallback against already loaded frameworks
              const clientFiltered = allFrameworks.filter(framework =>
                framework.frameworkCategories.some(category => {
                  const categoryId = extractCategoryId(category);
                  return filters.includes(categoryId);
                })
              );
              setFrameworks(clientFiltered);
            }
          } catch (e) {
            const clientFiltered = allFrameworks.filter(framework =>
              framework.frameworkCategories.some(category => {
                const categoryId = extractCategoryId(category);
                return filters.includes(categoryId);
              })
            );
            setFrameworks(clientFiltered);
          }
        } else {
          setFrameworks(filtered);
        }
      } catch (err) {
        // Fallback to client-side filtering if API fails
        const clientFiltered = allFrameworks.filter(framework =>
          framework.frameworkCategories.some(category => {
            const categoryId = extractCategoryId(category);
            return filters.includes(categoryId);
          })
        );
        setFrameworks(clientFiltered);
      }
    };

    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const skeletonStyles = [
    `mb-3 h-[311px] w-[${itemLength}px] overflow-hidden rounded`,
  ];

  if (isLoading || !frameworks.length) {
    return (
      <View style={tw`flex-row flex-wrap justify-center pt-5`}>
        {Array.from(Array(2).keys()).map((_, index: number) => (
          <View key={index}>
            <SkeletonLoader styles={skeletonStyles} />
          </View>
        ))}
      </View>
    );
  }

  // Helper to extract category ID from various formats
  const extractCategoryId = (category: any): string => {
    // Direct string
    if (typeof category === 'string') return category;

    // Common shapes: { id: string } | { id: { $oid: string } } | { id: { _id: string } }
    if (category?.id) {
      if (typeof category.id === 'string') return category.id;
      // MongoDB ObjectId wrappers
      if (category.id?.$oid) return category.id.$oid as string;
      if (category.id?._id) {
        return typeof category.id._id === 'string'
          ? (category.id._id as string)
          : (category.id._id?.$oid as string) || String(category.id._id);
      }
      // Fallback to best-effort stringification
      const str = String(category.id);
      return str === '[object Object]' ? '' : str;
    }

    // Alternate shapes: { _id: string } | { _id: { $oid: string } }
    if (category?._id) {
      if (typeof category._id === 'string') return category._id;
      if (category._id?.$oid) return category._id.$oid as string;
      const str = String(category._id);
      return str === '[object Object]' ? '' : str;
    }

    return '';
  };


  return (
    <View style={tw`m-5 gap-2`}>
      {frameworks.map(item => (
          <MealCard key={item.id} {...item} />
        ))}
    </View>
  );
}



