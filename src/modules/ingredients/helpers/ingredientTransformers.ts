import { Ingredient, Month } from '../api/types';
import { IIngredient, IAsset } from '../../../models/craft';

export function isCurrentlyInSeason(inSeason: Month[] | null): boolean {
  if (!inSeason || inSeason.length === 0) return true;
  
  const currentDate = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentDate.getMonth()];
  
  return inSeason.includes(currentMonthName as Month);
}

export function transformIngredientToLegacyFormat(ingredient: Ingredient): IIngredient {
  const categoryId = typeof ingredient.categoryId === 'object' ? ingredient.categoryId._id : ingredient.categoryId;
  const sponsorId = typeof ingredient.sponsorId === 'object' ? ingredient.sponsorId._id : ingredient.sponsorId;
  const stickerId = typeof ingredient.stickerId === 'object' ? ingredient.stickerId._id : ingredient.stickerId;
  
  const heroImage: IAsset[] = ingredient.heroImageUrl ? [{
    id: ingredient._id,
    title: ingredient.name,
    url: ingredient.heroImageUrl,
    uid: ingredient._id,
  }] : [];

  // Transform parentIngredients
  const parentIngredient = ingredient.parentIngredients.map(parent => {
    if (typeof parent === 'object') {
      return {
        id: parent._id,
        title: parent.name,
      };
    }
    return { id: parent, title: '' };
  });

  // Transform suitableDiets
  const suitableDiets = ingredient.suitableDiets.map(diet => {
    if (typeof diet === 'object') {
      return { id: diet._id };
    }
    return { id: diet };
  });

  // Transform relatedHacks
  const relatedHacks = ingredient.relatedHacks.map(hack => {
    if (typeof hack === 'object') {
      return { id: hack._id };
    }
    return { id: hack };
  });

  return {
    id: ingredient._id,
    averageWeight: ingredient.averageWeight,
    description: ingredient.description || null,
    heroImage,
    ingredientTheme: ingredient.theme ? String(ingredient.theme).toLowerCase() : null,
    inSeason: ingredient.inSeason || null,
    nutrition: ingredient.nutrition || null,
    title: ingredient.name,
    sticker: stickerId ? [{ id: stickerId, uid: stickerId, image: [] }] : [],
    parentIngredient,
    sponsorPanel: [],
    sponsorId: sponsorId || undefined,
    suitableDiets,
    relatedHacks,
    uid: ingredient._id,
  };
}

/**
 * Transform array of backend ingredients to legacy format
 */
export function transformIngredientsToLegacyFormat(ingredients: Ingredient[]): IIngredient[] {
  return ingredients.map(transformIngredientToLegacyFormat);
}
