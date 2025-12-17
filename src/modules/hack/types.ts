export interface Hacks {
  id?: number;
  type?: string;
  list?: IGuides[] | IArticles[] | IVideos[];
}

export interface IGuides {
  id: number;
  link?: string;
  subColor?: string;
  color?: string;
  textColor?: string;
  subHeading?: string;
  title?: string;
}

export interface IArticles {
  id: number;
  link?: string;
  title?: string;
  subtitle?: string;
  brand?: {
    uri?: string;
  };
  image?: {
    uri?: string;
  };
}

export interface IVideos {
  id: number;
  link?: string;
  title?: string;
  subtitle?: string;
  video?: {
    uri?: string;
  };
  image?: {
    uri?: string;
  };
}
