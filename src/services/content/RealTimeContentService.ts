//import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { 
  IArticleContents, 
  ICategories, 
  IChallenges, 
  IFrameworks, 
  IHackOrTips, 
  IIngredients, 
  ISponsorPanels, 
  IVideoContents 
} from '../../models/craft';
import {
  ContentService,
  ContentServiceInterface,
} from '../../services/content/ContentService'

import ArticleContentsQuery from 'C:/Saveful/saveful-india-rn/queries/article_contents.js';
import CategoriesQuery from 'C:/Saveful/saveful-india-rn/queries/categories.js';
import ChallengesQuery from 'C:/Saveful/saveful-india-rn/queries/challenges.js';
import FrameworksQuery from 'C:/Saveful/saveful-india-rn/queries/frameworks.js';
import HackOrTipsQuery from 'C:/Saveful/saveful-india-rn/queries/hacks_or_tips.js';
import IngredientsQuery from 'C:/Saveful/saveful-india-rn/queries/ingredients.js';
import SponsorPanelsQuery from 'C:/Saveful/saveful-india-rn/queries/sponsor_panels.js';
import VideoContentsQuery from 'C:/Saveful/saveful-india-rn/queries/video_contents.js';

const{
  ApolloClient,
  InMemoryCache,
  HttpLink,
  // NormalizedCacheObject,
  // gql,
} = require('@apollo/client/core');
const fetch = require('node-fetch');

// hack below is to ensure contentful uses the *browser* version and not the *node* version for react native
// and shutting up type script complaining cos it can't find the types for createClient
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

// Remote GraphQL server endpoint URL
const graphqlEndpoint = 'https://cms.dev.saveful.com/api';

export default class RealTimeContentService
  extends ContentService
  implements ContentServiceInterface
{
  client: any;

  constructor() {
    super();

    // Initialize Apollo Client
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.client = new ApolloClient({
      link: new HttpLink({ uri: graphqlEndpoint, fetch }),
      cache: new InMemoryCache(),
    });
  }

  loadContent = async () => {
    this.articleContents = (
      await this.client.query({
        query: ArticleContentsQuery.query,
      })
    ).data as IArticleContents;
    this.categories = (
      await this.client.query({
        query: CategoriesQuery.query,
      })
    ).data as ICategories;
    this.challenges = (
      await this.client.query({
        query: ChallengesQuery.query,
      })
    ).data as IChallenges;
    this.frameworks = (
      await this.client.query({
        query: FrameworksQuery.query,
      })
    ).data as IFrameworks;
    this.hackOrTips = (
      await this.client.query({
        query: HackOrTipsQuery.query,
      })
    ).data as IHackOrTips;
    this.ingredients = (
      await this.client.query({
        query: IngredientsQuery.query,
      })
    ).data as IIngredients;
    this.sponsorPanels = (
      await this.client.query({
        query: SponsorPanelsQuery.query,
      })
    ).data as ISponsorPanels;
    this.videoContents = (
      await this.client.query({
        query: VideoContentsQuery.query,
      })
    ).data as IVideoContents;
  };
}
