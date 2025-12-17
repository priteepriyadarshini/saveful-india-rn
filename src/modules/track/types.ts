export interface PostMake {
  id?: number;
  title?: string;
  image?: {
    uri?: string;
  };
  postMakeList?: IPostMakeList[];
}

export interface Survey {
  id?: number;
  title?: string;
  image?: {
    uri?: string;
  };
  surveyList?: ISurveyList[];
}

export interface Savings {
  id: number;
  type: string;
  saved: string;
  description: string;
  isBest: boolean;
  image: {
    uri: string;
  };
}

export interface WeekResults {
  spent: string;
  waste: string;
  currentWeekResults: Savings[];
}

export interface IPostMakeList {
  id?: number;
  title?: string;
  leftOverList?: ILeftoverList[];
  list?: string[];
}

export interface ISurveyList {
  id?: number;
  title?: string;
  subTitle?: string;
  image?: {
    uri?: string;
  };
  name: string;
  phrase?: string;
  produces?: IProduceList[];
  ingredients?: string[];
  buttonText?: string;
}

export interface IProduceList {
  id?: number;
  name?: string;
  image?: {
    uri: string;
  };
  controllerName: string;
  phrase?: string;
}

export interface ILeftoverList {
  id?: number;
  title?: string;
  recipe?: string;
  image?: {
    uri?: string;
  };
}
