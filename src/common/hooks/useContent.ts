import { recipeApiService } from '../../modules/recipe/api/recipeApiService';
import { recipeToFramework } from '../../modules/recipe/adapters/recipeAdapter';
import { hackApiService } from '../../modules/hack/api/hackApiService';
import { ingredientApiService } from '../../modules/ingredients/api/ingredientApiService';
import { hackOrTipApiService } from '../../modules/hackOrTip/api/hackOrTipApiService';
import { transformIngredientToLegacyFormat } from '../../modules/ingredients/helpers/ingredientTransformers';
import { transformHackOrTip } from '../../modules/hackOrTip/helpers/transformers';
import { ICategory, IFramework, IIngredient, IHackOrTip, IChallenge, ISponsorPanel, IArticleContent, IVideoContent } from '../../models/craft';

export default function useContent() {

  const getFrameworks = async (): Promise<IFramework[] | null> => {
    try {
      const recipes = await recipeApiService.getAllRecipes();
      if (recipes && recipes.length > 0) {
        return recipes.map(r => recipeToFramework(r as any));
      }
    } catch (error) {
      console.error('useContent.getFrameworks error:', error);
    }
    return null;
  };

  const getFramework = async (id: string): Promise<IFramework | null> => {
    try {
      const recipe = await recipeApiService.getRecipeById(id);
      if (recipe) return recipeToFramework(recipe);
    } catch (error) {
      console.error('useContent.getFramework error:', error);
    }
    return null;
  };

  const getFrameworkBySlug = async (slug: string): Promise<IFramework | null> => {
    try {
      const recipe = await recipeApiService.getRecipeBySlug(slug);
      if (recipe) return recipeToFramework(recipe);
    } catch (error) {
      console.error('useContent.getFrameworkBySlug error:', error);
    }
    return null;
  };

  const getCategories = async (): Promise<ICategory[] | null> => {
    try {
      const cats = await hackApiService.getAllCategories();
      if (cats && cats.length > 0) {
        return cats.map(c => ({
          id: c._id || c.id || '',
          title: c.name,
          groupHandle: 'hack',
          groupId: '',
          uid: c._id || c.id || '',
        }));
      }
    } catch (error) {
      console.error('useContent.getCategories error:', error);
    }
    return null;
  };

  const getCategory = async (id: string): Promise<ICategory | null> => {
    try {
      const data = await hackApiService.getCategoryWithHacks(id);
      if (data) {
        const cat = data.category;
        const catId = cat._id || cat.id || '';
        return {
          id: catId,
          title: cat.name,
          groupHandle: 'hack',
          groupId: '',
          uid: catId,
          heroImage: cat.heroImageUrl
            ? [{ id: catId, title: cat.name, url: cat.heroImageUrl, uid: catId }]
            : [],
        };
      }
    } catch (error) {
      console.error('useContent.getCategory error:', error);
    }
    return null;
  };

  const getIngredients = async (): Promise<IIngredient[] | null> => {
    try {
      const ings = await ingredientApiService.getAllIngredients();
      if (ings && ings.length > 0) {
        return ings.map(transformIngredientToLegacyFormat);
      }
    } catch (error) {
      console.error('useContent.getIngredients error:', error);
    }
    return null;
  };

  const getIngredient = async (id: string): Promise<IIngredient | null> => {
    try {
      const ing = await ingredientApiService.getIngredientById(id);
      if (ing) return transformIngredientToLegacyFormat(ing);
    } catch (error) {
      console.error('useContent.getIngredient error:', error);
    }
    return null;
  };

  const getHackOrTips = async (): Promise<IHackOrTip[] | null> => {
    try {
      const hots = await hackOrTipApiService.getAll();
      if (hots && hots.length > 0) {
        return hots.map(transformHackOrTip);
      }
    } catch (error) {
      console.error('useContent.getHackOrTips error:', error);
    }
    return null;
  };

  const getHackOrTip = async (id: string): Promise<IHackOrTip | null> => {
    try {
      const hot = await hackOrTipApiService.getHackOrTipById(id);
      if (hot) return transformHackOrTip(hot);
    } catch (error) {
      console.error('useContent.getHackOrTip error:', error);
    }
    return null;
  };

  const getChallenges = async (): Promise<IChallenge[] | null> => null;
  const getChallenge = async (_id: string): Promise<IChallenge | null> => null;
  const getSponsorPanels = async (): Promise<ISponsorPanel[] | null> => null;
  const getSponsorPanel = async (_id: string): Promise<ISponsorPanel | null> => null;
  const getArticleContents = async (): Promise<IArticleContent[] | null> => null;
  const getArticleContent = async (_id: string): Promise<IArticleContent | null> => null;
  const getVideoContents = async (): Promise<IVideoContent[] | null> => null;
  const getVideoContent = async (_id: string): Promise<IVideoContent | null> => null;

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
