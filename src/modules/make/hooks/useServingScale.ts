import { useCallback, useEffect, useRef, useState } from 'react';
import { recipeApiService } from '../../recipe/api/recipeApiService';
import { parseServingsFromPortions } from '../components/ServingSizeSelector';

interface ScaledIngredient {
  ingredientName: string;
  originalQuantity: string;
  scaledQuantity: string;
  ingredientId?: string;
  preparation?: string;
}

interface UseServingScaleParams {
  originalPortions: string | null;
  recipeTitle?: string;
  ingredients: {
    id: string;
    title: string;
    quantity?: string;
    preparation?: string;
  }[];
}

interface UseServingScaleResult {
  servings: number;
  isScaling: boolean;
  scaledQuantities: Map<string, string>;
  setServings: (count: number) => void;
  cookingNotes?: string;
  originalServings: number;
  error?: string;
}


export function useServingScale({
  originalPortions,
  recipeTitle,
  ingredients,
}: UseServingScaleParams): UseServingScaleResult {
  const originalServings = parseServingsFromPortions(originalPortions);
  const [servings, setServingsState] = useState(originalServings);
  const [isScaling, setIsScaling] = useState(false);
  const [scaledQuantities, setScaledQuantities] = useState<Map<string, string>>(
    new Map(),
  );
  const [cookingNotes, setCookingNotes] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const cacheRef = useRef<
    Map<number, { quantities: Map<string, string>; notes?: string }>
  >(new Map());

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const performScale = useCallback(
    async (targetServings: number) => {
      const cached = cacheRef.current.get(targetServings);
      if (cached) {
        setScaledQuantities(cached.quantities);
        setCookingNotes(cached.notes);
        setIsScaling(false);
        return;
      }

      if (targetServings === originalServings) {
        setScaledQuantities(new Map());
        setCookingNotes(undefined);
        setIsScaling(false);
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      setIsScaling(true);
      setError(undefined);

      try {
        const ingredientPayload = ingredients
          .filter((ing) => ing.quantity && ing.quantity.trim() !== '')
          .map((ing) => ({
            ingredientName: ing.title,
            originalQuantity: ing.quantity!,
            preparation: ing.preparation,
            ingredientId: ing.id,
          }));

        if (ingredientPayload.length === 0) {
          setIsScaling(false);
          return;
        }

        const result = await recipeApiService.scaleServings({
          originalServings,
          desiredServings: targetServings,
          recipeTitle,
          ingredients: ingredientPayload,
        });

        const qtyMap = new Map<string, string>();
        result.scaledIngredients.forEach((scaled: ScaledIngredient) => {
          if (scaled.ingredientId) {
            qtyMap.set(scaled.ingredientId, scaled.scaledQuantity);
          }
          qtyMap.set(
            `name:${scaled.ingredientName.toLowerCase()}`,
            scaled.scaledQuantity,
          );
        });

        cacheRef.current.set(targetServings, {
          quantities: qtyMap,
          notes: result.cookingNotes,
        });

        setScaledQuantities(qtyMap);
        setCookingNotes(result.cookingNotes);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Serving scale error:', err);
          setError('Failed to adjust quantities. Using original amounts.');
          setScaledQuantities(new Map());
          setCookingNotes(undefined);
        }
      } finally {
        setIsScaling(false);
      }
    },
    [ingredients, originalServings, recipeTitle],
  );

  const setServings = useCallback(
    (count: number) => {
      const clamped = Math.max(1, Math.min(20, count));
      setServingsState(clamped);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        performScale(clamped);
      }, 300);
    },
    [performScale],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);


  const getScaledQuantity = useCallback(
    (ingredientId: string, ingredientName: string, originalQuantity: string): string => {
      if (scaledQuantities.size === 0) return originalQuantity;
      return (
        scaledQuantities.get(ingredientId) ||
        scaledQuantities.get(`name:${ingredientName.toLowerCase()}`) ||
        originalQuantity
      );
    },
    [scaledQuantities],
  );

  return {
    servings,
    isScaling,
    scaledQuantities,
    setServings,
    cookingNotes,
    originalServings,
    error,
  };
}

export function getScaledQuantityForIngredient(
  scaledQuantities: Map<string, string>,
  ingredientId: string,
  ingredientName: string,
  originalQuantity: string,
): string {
  if (scaledQuantities.size === 0) return originalQuantity;
  return (
    scaledQuantities.get(ingredientId) ||
    scaledQuantities.get(`name:${ingredientName.toLowerCase()}`) ||
    originalQuantity
  );
}
