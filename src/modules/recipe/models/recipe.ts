export interface AlternativeIngredient {
  ingredient: string; // ObjectId as string
  inheritQuantity: boolean;
  inheritPreparation: boolean;
  quantity?: string;
  preparation?: string;
}

export interface RequiredIngredient {
  recommendedIngredient: string; // ObjectId as string
  quantity: string;
  preparation: string;
  alternativeIngredients: AlternativeIngredient[];
}

export interface OptionalIngredient {
  ingredient: string; // ObjectId as string
  quantity: string;
  preparation: string;
}

export interface ComponentStep {
  stepInstructions: string;
  hackOrTipIds: string[]; // ObjectId[] as string[]
  alwaysShow: boolean;
  relevantIngredients: string[]; // ObjectId[] as string[]
}

export interface Component {
  componentTitle: string;
  componentInstructions?: string;
  includedInVariants: string[];
  requiredIngredients: RequiredIngredient[];
  optionalIngredients: OptionalIngredient[];
  componentSteps: ComponentStep[];
}

export interface RecipeComponentWrapper {
  prepShortDescription?: string;
  prepLongDescription?: string;
  variantTags: string[];
  stronglyRecommended: boolean;
  choiceInstructions?: string;
  buttonText?: string;
  component: Component[];
}

export interface Recipe {
  _id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  hackOrTipIds: string[]; // ObjectId[] as string[]
  heroImageUrl?: string;
  youtubeId?: string;
  portions: string;
  prepCookTime: number;
  stickerId?: string; 
  frameworkCategories: string[]; 
  sponsorId?: string; 
  fridgeKeepTime?: string;
  freezeKeepTime?: string;
  useLeftoversIn: string[]; 
  components: RecipeComponentWrapper[];
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedIngredient {
  _id: string;
  name: string;
  heroImageUrl?: string;
  averageWeight?: number;
}

export interface PopulatedHackOrTip {
  _id: string;
  title: string;
  shortDescription?: string;
}

export interface PopulatedSticker {
  _id: string;
  name?: string;
  imageUrl?: string;
}

export interface PopulatedSponsor {
  _id: string;
  title: string;
  logo?: string;
  broughtToYouBy?: string;
  tagline?: string;
}

export interface PopulatedFrameworkCategory {
  _id: string;
  title: string;
  heroImageUrl?: string;
  iconImageUrl?: string;
}

export interface PopulatedRecipe extends Omit<Recipe, 'frameworkCategories' | 'sponsorId' | 'stickerId' | 'hackOrTipIds'> {
  frameworkCategories: (string | PopulatedFrameworkCategory)[];
  sponsorId?: string | PopulatedSponsor;
  stickerId?: string | PopulatedSticker;
  hackOrTipIds: (string | PopulatedHackOrTip)[];
}
