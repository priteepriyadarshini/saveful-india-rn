export type { IAsset, ITag } from '../../../models/craft';

export interface IFramework {
  id: string;
  title: string;
  shortDescription?: string;
  heroImageUrl?: string;
  thumbnailImageUrl?: string;
  slug?: string;
  ingredients?: IIngredient[];
  variantTags?: import('../../../models/craft').ITag[];
  description?: string;
  iconImage?: string;
}

export interface IIngredient {
  id: string;
  title: string;
  imageUrl?: string;
  averageWeight: number;
}
