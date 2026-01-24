
export interface IAsset {
  uri: string;
  url?: string;
}

export interface ITag {
  id: string;
  title: string;
}

export interface IFramework {
  id: string;
  title: string;
  shortDescription?: string;
  heroImageUrl?: string;
  thumbnailImageUrl?: string;
  slug?: string;
  ingredients?: IIngredient[];
}

export interface IIngredient {
  id: string;
  title: string;
  imageUrl?: string;
}
