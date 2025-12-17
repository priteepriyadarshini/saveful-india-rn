export interface IDescription {
  title: string;
  description: string;
}

export interface Dish {
  id?: number;
  name?: string;
  preparation?: PreparationItem;
  uri?: string;
  sticker?: {
    uri?: string;
  };
  info?: CarouselItem[];
  flavors?: FlavorItem[];
}

export interface PreparationItem {
  id?: number;
  portion: string;
  prepTime: {
    time: number;
    format: string;
  };
}

export interface CarouselItem {
  id: number;
  uri?: string;
  description?: string | IDescription[];
  readMore?: {
    readMoreTitle: string;
    readMoreSubTitle: string;
    readMoreDescription: string;
  };
  icon?: string;
  backgroundColor?: string;
  borderColor?: string;
  title: string;
}

export interface FlavorItem {
  id?: number;
  flavor: string;
  ingredients: IngredientItem[];
}

export interface IngredientItem {
  id?: number;
  name?: string;
  info?: string;
  recommendation?: {
    requirement: string;
    requiredCondition: string;
  };
  list?: IngredientType[];
  extras?: {
    id?: number;
    selection: 'single' | 'multiple';
    phrase?: string;
    subtitle?: string;
    subinfo?: string;
    list?: ExtrasItem[];
  };
}

export interface ExtrasItem {
  id: number;
  item?: string;
  instructions?: string;
}

export interface IngredientType {
  id?: number;
  instructions?: string;
  item?: string[];
}
