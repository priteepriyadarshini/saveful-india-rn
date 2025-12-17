import useEnvironment from '../../modules/environment/hooks/useEnvironment';
import BundledContentService from '../../services/content/BundledContentService';
import { ContentService } from '../../services/content/ContentService';
import RealTimeContentService from '../../services/content/RealTimeContentService';
import {
  articleContentsApiResponseToArticleContentModels,
  categoriesApiResponseToCategoryModels,
  challengesApiResponseToChallengeModels,
  frameworksApiResponseToFrameworkModels,
  hackOrTipsApiResponseToHackOrTipModels,
  ingredientsApiResponseToIngredientModels,
  sponsorPanelsApiResponseToSponsorPanelModels,
  videoContentsApiResponseToVideoContentModels,
} from '../../services/content/converters/categoryConverters';

export default function useContent() {
  const env = useEnvironment();

  let contentService: ContentService;
  if (env.useBundledContent) {
    contentService = new BundledContentService();
    // console.log('created BundledHelpContentService');
  } else {
    contentService = new RealTimeContentService();
    // console.log('created RealTimeHelpContentService');
  }

  const getArticleContents = async () => {
    await contentService.loadContent();
    const response = contentService.getArticleContents();

    const models = articleContentsApiResponseToArticleContentModels(response);

    if (models.length > 0) {
      return models;
    }

    return null;
  };

  const getArticleContent = async (id: string) => {
    await contentService.loadContent();
    const response = contentService.getArticleContent(id);

    const models = articleContentsApiResponseToArticleContentModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  const getCategories = async () => {
    await contentService.loadContent();
    const response = contentService.getCategories();

    const models = categoriesApiResponseToCategoryModels(response);

    if (models.length > 0) {
      return models;
    }

    return null;
  };

  const getCategory = async (id: string) => {
    await contentService.loadContent();
    const response = contentService.getCategory(id);

    const models = categoriesApiResponseToCategoryModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  const getChallenges = async () => {
    await contentService.loadContent();
    const response = contentService.getChallenges();

    const models = challengesApiResponseToChallengeModels(response);

    if (models.length > 0) {
      return models;
    }

    return null;
  };

  const getChallenge = async (id: string) => {
    await contentService.loadContent();
    const response = contentService.getChallenge(id);

    const models = challengesApiResponseToChallengeModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  const getIngredients = async () => {
    await contentService.loadContent();
    const response = contentService.getIngredients();

    const models = ingredientsApiResponseToIngredientModels(response);

    if (models.length > 0) {
      return models;
    }

    return null;
  };

  const getIngredient = async (id: string) => {
    await contentService.loadContent();
    const response = contentService.getIngredient(id);

    const models = ingredientsApiResponseToIngredientModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  const getFrameworks = async () => {
    await contentService.loadContent();
    const response = contentService.getFrameworks();

    const models = frameworksApiResponseToFrameworkModels(response);

    if (models.length > 0) {
      return models;
    }

    return null;
  };

  const getFrameworkBySlug = async (slug: string) => {
    await contentService.loadContent();
    const response = contentService.getFrameworkBySlug(slug);

    const models = frameworksApiResponseToFrameworkModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  const getFramework = async (id: string) => {
    await contentService.loadContent();
    const response = contentService.getFramework(id);

    const models = frameworksApiResponseToFrameworkModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  const getHackOrTips = async () => {
    await contentService.loadContent();
    const response = contentService.getHackOrTips();

    const models = hackOrTipsApiResponseToHackOrTipModels(response);

    if (models.length > 0) {
      return models;
    }

    return null;
  };

  const getHackOrTip = async (id: string) => {
    await contentService.loadContent();
    const response = contentService.getHackOrTip(id);

    const models = hackOrTipsApiResponseToHackOrTipModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  const getSponsorPanels = async () => {
    await contentService.loadContent();
    const response = contentService.getSponsorPanels();

    const models = sponsorPanelsApiResponseToSponsorPanelModels(response);

    if (models.length > 0) {
      return models;
    }

    return null;
  };

  const getSponsorPanel = async (id: string) => {
    await contentService.loadContent();
    const response = contentService.getSponsorPanel(id);

    const models = sponsorPanelsApiResponseToSponsorPanelModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  const getVideoContents = async () => {
    await contentService.loadContent();
    const response = contentService.getVideoContents();

    const models = videoContentsApiResponseToVideoContentModels(response);

    if (models.length > 0) {
      return models;
    }

    return null;
  };

  const getVideoContent = async (id: string) => {
    await contentService.loadContent();
    const response = contentService.getVideoContent(id);

    const models = videoContentsApiResponseToVideoContentModels(response);

    if (models.length > 0) {
      return models[0];
    }

    return null;
  };

  return {
    getArticleContents,
    getArticleContent,
    getCategories,
    getCategory,
    getChallenges,
    getChallenge,
    getIngredients,
    getIngredient,
    getFrameworks,
    getFrameworkBySlug,
    getFramework,
    getHackOrTips,
    getHackOrTip,
    getSponsorPanels,
    getSponsorPanel,
    getVideoContents,
    getVideoContent,
  };
}
