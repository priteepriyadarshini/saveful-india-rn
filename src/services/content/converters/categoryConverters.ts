import { IArticleContents, 
  IArticleContent, 
  ICategories, 
  ICategory, 
  IChallenges, 
  IChallenge, 
  IIngredients, 
  IIngredient, 
  IFrameworks, 
  IFramework, 
  IHackOrTips, 
  IHackOrTip, 
  ISponsorPanels, 
  ISponsorPanel, 
  IVideoContents, 
  IVideoContent 
} from "../../../models/craft";


export const articleContentsApiResponseToArticleContentModels = (
  apiResponse: IArticleContents,
): IArticleContent[] => {
  if (
    !apiResponse?.articleContentEntries ||
    apiResponse?.articleContentEntries.length === 0
  ) {
    return [];
  }

  const articleContents = apiResponse?.articleContentEntries;

  if (!articleContents) {
    return [];
  }

  return articleContents;
};

export const categoriesApiResponseToCategoryModels = (
  apiResponse: ICategories,
): ICategory[] => {
  if (!apiResponse?.categories || apiResponse?.categories.length === 0) {
    return [];
  }

  const categories = apiResponse?.categories;

  if (!categories) {
    return [];
  }

  return categories;
};

export const challengesApiResponseToChallengeModels = (
  apiResponse: IChallenges,
): IChallenge[] => {
  if (
    !apiResponse?.challengeEntries ||
    apiResponse?.challengeEntries.length === 0
  ) {
    return [];
  }

  const challenges = apiResponse?.challengeEntries;

  if (!challenges) {
    return [];
  }

  return challenges;
};

export const ingredientsApiResponseToIngredientModels = (
  apiResponse: IIngredients,
): IIngredient[] => {
  if (
    !apiResponse?.ingredientEntries ||
    apiResponse?.ingredientEntries.length === 0
  ) {
    return [];
  }

  const ingredients = apiResponse?.ingredientEntries;

  if (!ingredients) {
    return [];
  }

  return ingredients;
};

export const frameworksApiResponseToFrameworkModels = (
  apiResponse: IFrameworks,
): IFramework[] => {
  if (
    !apiResponse?.frameworkEntries ||
    apiResponse?.frameworkEntries.length === 0
  ) {
    return [];
  }

  const frameworks = apiResponse?.frameworkEntries;

  if (!frameworks) {
    return [];
  }

  return frameworks;
};

export const hackOrTipsApiResponseToHackOrTipModels = (
  apiResponse: IHackOrTips,
): IHackOrTip[] => {
  if (
    !apiResponse?.hackOrTipEntries ||
    apiResponse?.hackOrTipEntries.length === 0
  ) {
    return [];
  }

  const hackOrTips = apiResponse?.hackOrTipEntries;

  if (!hackOrTips) {
    return [];
  }

  return hackOrTips;
};

export const sponsorPanelsApiResponseToSponsorPanelModels = (
  apiResponse: ISponsorPanels,
): ISponsorPanel[] => {
  if (
    !apiResponse?.sponsorPanelEntries ||
    apiResponse?.sponsorPanelEntries.length === 0
  ) {
    return [];
  }

  const sponsorPanels = apiResponse?.sponsorPanelEntries;

  if (!sponsorPanels) {
    return [];
  }

  return sponsorPanels;
};

export const videoContentsApiResponseToVideoContentModels = (
  apiResponse: IVideoContents,
): IVideoContent[] => {
  if (
    !apiResponse?.videoContentEntries ||
    apiResponse?.videoContentEntries.length === 0
  ) {
    return [];
  }

  const videoContents = apiResponse?.videoContentEntries;

  if (!videoContents) {
    return [];
  }

  return videoContents;
};
