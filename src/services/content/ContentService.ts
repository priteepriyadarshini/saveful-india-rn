import {
  IArticleContent,
  IArticleContents,
  ICategories,
  ICategory,
  IChallenge,
  IChallenges,
  IFramework,
  IFrameworks,
  IHackOrTip,
  IHackOrTips,
  IIngredient,
  IIngredients,
  ISponsorPanel,
  ISponsorPanels,
  IVideoContent,
  IVideoContents,
} from '../../models/craft';

export interface ContentServiceInterface {
  articleContents: IArticleContents;
  categories: ICategories;
  ingredients: IIngredients;
  frameworks: IFrameworks;
  hackOrTips: IHackOrTips;
  sponsorPanels: ISponsorPanels;
  getArticleContents(): IArticleContents;
  getCategories(): ICategories;
  getCategory(id: string): ICategories;
  getIngredients(): IIngredients;
  getIngredient(id: string): IIngredients;
  getFrameworks(): IFrameworks;
  getFrameworkBySlug(slug: string): IFrameworks;
  getFramework(id: string): IFrameworks;
  getHackOrTips(): IHackOrTips;
  getHackOrTip(id: string): IHackOrTips;
  getSponsorPanels(): ISponsorPanels;
  getSponsorPanel(id: string): ISponsorPanels;
  loadContent(): Promise<unknown>;
}

export class ContentService implements ContentServiceInterface {
  articleContents: IArticleContents;

  categories: ICategories;

  challenges: IChallenges;

  ingredients: IIngredients;

  frameworks: IFrameworks;

  hackOrTips: IHackOrTips;

  sponsorPanels: ISponsorPanels;

  videoContents: IVideoContents;

  constructor() {
    // descendant classes will load these in as necessary
    this.articleContents = {} as IArticleContents;
    this.categories = {} as ICategories;
    this.challenges = {} as IChallenges;
    this.ingredients = {} as IIngredients;
    this.frameworks = {} as IFrameworks;
    this.hackOrTips = {} as IHackOrTips;
    this.sponsorPanels = {} as ISponsorPanels;
    this.videoContents = {} as IVideoContents;
  }

  getArticleContents = () => {
    return this.articleContents;
  };

  getArticleContent = (id: string) => {
    const content: IArticleContent | undefined =
      this.articleContents.articleContentEntries.find(item => item.id === id);

    return {
      articleContentEntries: content ? [content] : [],
    };
  };

  getCategories = () => {
    return this.categories;
  };

  getCategory = (id: string) => {
    const content: ICategory | undefined = this.categories.categories.find(
      item => item.id === id,
    );

    return {
      categories: content ? [content] : [],
    };
  };

  getChallenges = () => {
    return this.challenges;
  };

  getChallenge = (id: string) => {
    const content: IChallenge | undefined =
      this.challenges.challengeEntries.find(item => item.id === id);

    return {
      challengeEntries: content ? [content] : [],
    };
  };

  getIngredients = () => {
    return this.ingredients;
  };

  getIngredient = (id: string) => {
    const content: IIngredient | undefined =
      this.ingredients.ingredientEntries.find(item => item.id === id);

    return {
      ingredientEntries: content ? [content] : [],
    };
  };

  getFrameworks = () => {
    return this.frameworks;
  };

  getFrameworkBySlug = (slug: string) => {
    const content: IFramework | undefined =
      this.frameworks.frameworkEntries.find(item => item.slug === slug);

    return {
      frameworkEntries: content ? [content] : [],
    };
  };

  getFramework = (id: string) => {
    const content: IFramework | undefined =
      this.frameworks.frameworkEntries.find(item => item.id === id);

    return {
      frameworkEntries: content ? [content] : [],
    };
  };

  getHackOrTips = () => {
    return this.hackOrTips;
  };

  getHackOrTip = (id: string) => {
    const content: IHackOrTip | undefined =
      this.hackOrTips.hackOrTipEntries.find(item => item.id === id);

    return {
      hackOrTipEntries: content ? [content] : [],
    };
  };

  getSponsorPanels = () => {
    return this.sponsorPanels;
  };

  getSponsorPanel = (id: string) => {
    const content: ISponsorPanel | undefined =
      this.sponsorPanels.sponsorPanelEntries.find(item => item.id === id);

    return {
      sponsorPanelEntries: content ? [content] : [],
    };
  };

  getVideoContents = () => {
    return this.videoContents;
  };

  getVideoContent = (id: string) => {
    const content: IVideoContent | undefined =
      this.videoContents.videoContentEntries.find(item => item.id === id);

    return {
      videoContentEntries: content ? [content] : [],
    };
  };

  loadContent = async () => {
    // implement in descendant class
    return new Promise(function (resolve, reject) {
      reject(
        new Error(
          'loadContent should be implemented in descendant class of ContentService',
        ),
      );
    });
  };
}
