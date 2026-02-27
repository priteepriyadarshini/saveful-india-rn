import { Recipe, PopulatedRecipe } from '../models/recipe';
import { IFramework, IAsset, ISticker, ITag, ISponsor, IFrameworkComponent } from '../../../models/craft';

const extractId = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value?.$oid) return value.$oid;
  if (value?._id) return typeof value._id === 'string' ? value._id : value._id.$oid || value._id.toString();
  return value?.toString() || '';
};

/** Extract ingredient name from a populated ingredient (object with `name`) or fallback to '' */
const extractIngredientTitle = (value: any): string => {
  if (typeof value === 'object' && value !== null && value.name) return value.name;
  return '';
};

/** Extract averageWeight from a populated ingredient or fallback to 0 */
const extractIngredientWeight = (value: any): number => {
  if (typeof value === 'object' && value !== null && typeof value.averageWeight === 'number') return value.averageWeight;
  return 0;
};


export function recipeToFramework(recipe: Recipe | PopulatedRecipe): IFramework {
  const heroImage: IAsset[] = recipe.heroImageUrl
    ? [
        {
          id: `${extractId(recipe._id)}-hero`,
          title: recipe.title,
          url: recipe.heroImageUrl,
          uid: `${extractId(recipe._id)}-hero-uid`,
        },
      ]
    : [];

  // Convert variant tags to ITag format
  // IMPORTANT: Use the same id prefix for variants everywhere so
  // PrepScreen filters components correctly.
  // We standardize on `variant-<name>`.
  const variantTags: ITag[] = [];
  recipe.components.forEach(wrapper => {
    wrapper.variantTags.forEach(tag => {
      if (!variantTags.find(t => t.title === tag)) {
        variantTags.push({
          id: `variant-${tag}`,
          title: tag,
          uid: `variant-${tag}-uid`,
        });
      }
    });
  });

  // If no variant tags exist, create a default one
  if (variantTags.length === 0) {
    variantTags.push({
      id: 'variant-default',
      title: 'Default',
      uid: 'variant-default-uid',
    });
  }

  // Convert sticker if present
  const sticker: ISticker[] = [];
  if (recipe.stickerId) {
    if (typeof recipe.stickerId === 'object' && recipe.stickerId !== null) {
      const stickerData = recipe.stickerId as any;
      if (stickerData.imageUrl) {
        sticker.push({
          id: extractId(stickerData._id || stickerData),
          uid: extractId(stickerData._id || stickerData),
          image: [
            {
              id: `${extractId(stickerData._id || stickerData)}-image`,
              title: 'Sticker',
              url: stickerData.imageUrl,
              uid: `${extractId(stickerData._id || stickerData)}-image-uid`,
            },
          ],
        });
      }
    }
  }

  // Convert framework categories
  const frameworkCategories = recipe.frameworkCategories.map(cat => ({
    id: extractId(cat),
  }));

  // Convert sponsor if present
  const frameworkSponsor: ISponsor[] = [];
  if (recipe.sponsorId) {
    if (typeof recipe.sponsorId === 'object' && recipe.sponsorId !== null) {
      const sponsor = recipe.sponsorId as any;
      frameworkSponsor.push({
        id: extractId(sponsor._id || sponsor),
        title: sponsor.title || '',
        sponsorLogo: sponsor.logo
          ? [
              {
                id: `${extractId(sponsor._id || sponsor)}-logo`,
                title: sponsor.title || '',
                url: sponsor.logo,
                uid: `${extractId(sponsor._id || sponsor)}-logo-uid`,
              },
            ]
          : [],
        sponsorLogoBlackAndWhite: sponsor.logoBlackAndWhite
          ? [
              {
                id: `${extractId(sponsor._id || sponsor)}-logo-bw`,
                title: sponsor.title || '',
                url: sponsor.logoBlackAndWhite,
                uid: `${extractId(sponsor._id || sponsor)}-logo-bw-uid`,
              },
            ]
          : [],
        broughtToYouBy: sponsor.broughtToYouBy || '',
        sponsorTagline: sponsor.tagline || '',
      });
    }
  }

  // Convert components
  const components: IFrameworkComponent[] = [];
  
  recipe.components.forEach((wrapper, wrapperIndex) => {
    wrapper.component.forEach((comp, compIndex) => {
      const componentId = `${extractId(recipe._id)}-component-${wrapperIndex}-${compIndex}`;
      
      // Convert required ingredients
      const requiredIngredients = comp.requiredIngredients.map(reqIng => ({
        id: `${componentId}-req-ing-${extractId(reqIng.recommendedIngredient)}`,
        recommendedIngredient: [
          {
            id: extractId(reqIng.recommendedIngredient),
            title: extractIngredientTitle(reqIng.recommendedIngredient),
            averageWeight: extractIngredientWeight(reqIng.recommendedIngredient),
          },
        ],
        alternativeIngredients: reqIng.alternativeIngredients.map(alt => ({
          id: `alt-${extractId(alt.ingredient)}`,
          ingredient: [
            {
              id: extractId(alt.ingredient),
              title: extractIngredientTitle(alt.ingredient),
              averageWeight: extractIngredientWeight(alt.ingredient),
            },
          ],
          quantity: alt.inheritQuantity ? reqIng.quantity : alt.quantity || '',
          preparation: alt.inheritPreparation ? reqIng.preparation : alt.preparation || '',
          alternativeOptions: (alt.inheritQuantity && alt.inheritPreparation 
            ? ['inheritQuantity', 'inheritPreparation'] 
            : alt.inheritQuantity 
            ? ['inheritQuantity']
            : alt.inheritPreparation
            ? ['inheritPreparation']
            : []) as ['inheritQuantity' | 'inheritPreparation'],
        })),
        quantity: reqIng.quantity,
        preparation: reqIng.preparation,
      }));

      // Convert optional ingredients
      const optionalIngredients = comp.optionalIngredients.map(optIng => ({
        id: `${componentId}-opt-ing-${extractId(optIng.ingredient)}`,
        ingredient: [
          {
            id: extractId(optIng.ingredient),
            title: extractIngredientTitle(optIng.ingredient),
            averageWeight: extractIngredientWeight(optIng.ingredient),
          },
        ],
        quantity: optIng.quantity,
        preparation: optIng.preparation,
      }));

      // Convert steps
      const steps = comp.componentSteps.map((step, stepIndex) => ({
        id: `${componentId}-step-${stepIndex}`,
        stepInstructions: step.stepInstructions,
        hackOrTip: step.hackOrTipIds.map(id => ({ id: extractId(id) }) as any),
        alwaysShow: step.alwaysShow,
        relevantIngredients: step.relevantIngredients.map(id => ({ id: extractId(id), title: extractIngredientTitle(id) })),
      }));

      // Create included in variants - if empty, use all variant tags
      let includedInVariants = comp.includedInVariants.map(variant => ({
        id: `variant-${variant}`,
        title: variant,
        uid: `variant-${variant}-uid`,
      }));

      // If no variants specified, include in all variants
      if (includedInVariants.length === 0) {
        // When no specific variants specified, include the component in all variants
        // using the same standardized ids as variantTags
        includedInVariants = variantTags;
      }

      components.push({
        id: componentId,
        uid: componentId,
        title: comp.componentTitle,
        componentTitle: comp.componentTitle,
        componentInstructions: comp.componentInstructions || null,
        requiredIngredients,
        optionalIngredients,
        includedInVariants,
        componentSteps: steps,
        stronglyRecommended: (wrapper.stronglyRecommended ? ['stronglyRecommended'] : []) as ['stronglyRecommended'],
        choiceInstructions: wrapper.choiceInstructions || null,
        buttonText: wrapper.buttonText || null,
      });
    });
  });

  // Convert hack or tips
  const hackOrTip = recipe.hackOrTipIds.map(id => ({
    id: extractId(id),
  }));

  // Convert use leftovers in
  const useLeftoversIn = recipe.useLeftoversIn.map(id => ({
    id: extractId(id),
  }));

  // Create the IFramework object
  const framework: IFramework = {
    id: extractId(recipe._id),
    slug: recipe.title.toLowerCase().replace(/\s+/g, '-'),
    title: recipe.title,
    components,
    shortDescription: recipe.shortDescription,
    description: recipe.longDescription,
    heroImage,
    frameworkCategories,
    frameworkSponsor,
    fridgeKeepTime: recipe.fridgeKeepTime || '',
    freezeKeepTime: recipe.freezeKeepTime || '',
    hackOrTip,
    portions: recipe.portions,
    prepAndCookTime: recipe.prepCookTime,
    // Prefer wrapper-level prep descriptions if provided; fallback to recipe-level
    prepShortDescription:
      recipe.components.find(w => !!w.prepShortDescription)?.prepShortDescription ||
      recipe.shortDescription,
    prepLongDescription:
      recipe.components.find(w => !!w.prepLongDescription)?.prepLongDescription ||
      recipe.longDescription,
    sticker,
    useLeftoversIn,
    variantTags,
    youtubeId: recipe.youtubeId,
  };

  return framework;
}

/**
 * Converts an array of recipes to frameworks
 */
export function recipesToFrameworks(recipes: Recipe[] | PopulatedRecipe[]): IFramework[] {
  return recipes.map(recipe => recipeToFramework(recipe));
}
