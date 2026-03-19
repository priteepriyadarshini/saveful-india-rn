import { parse, stringify } from "flatted";
import {
  IArticleContents,
  ICategories,
  IChallenges,
  IFrameworks,
  IHackOrTips,
  IIngredients,
  ISponsorPanels,
  IVideoContents,
} from "../../models/craft";
import {
  ContentService,
  ContentServiceInterface,
} from "../../services/content/ContentService";

import bundledArticleContents from "C:/Saveful/saveful-india-rn/assets/content/article_contents.json";
import bundledCategories from "C:/Saveful/saveful-india-rn/assets/content/categories.json";
import bundledChallenges from "C:/Saveful/saveful-india-rn/assets/content/challenges.json";
import bundledFrameworks from "C:/Saveful/saveful-india-rn/assets/content/frameworks.json";
import bundledHackOrTips from "C:/Saveful/saveful-india-rn/assets/content/hacks_or_tips.json";
import bundledIngredients from "C:/Saveful/saveful-india-rn/assets/content/ingredients.json";
import bundledSponsorPanels from "C:/Saveful/saveful-india-rn/assets/content/sponsor_panels.json";
import bundledVideoContents from "C:/Saveful/saveful-india-rn/assets/content/video_contents.json";

interface BundledFlattedJson {
  flattedString: string;
}

export default class BundledContentService
  extends ContentService
  implements ContentServiceInterface
{
  dataLoaded = false;

  //   loadContent = async () => {
  //     // only parse the once
  //     if (!this.dataLoaded) {
  //       this.articleContents = Flatted.parse(
  //         (bundledArticleContents as BundledFlattedJson).flattedString,
  //       ) as IArticleContents;
  //       this.categories = Flatted.parse(
  //         (bundledCategories as BundledFlattedJson).flattedString,
  //       ) as ICategories;
  //       this.challenges = Flatted.parse(
  //         (bundledChallenges as BundledFlattedJson).flattedString,
  //       ) as IChallenges;
  //       this.frameworks = Flatted.parse(
  //         (bundledFrameworks as BundledFlattedJson).flattedString,
  //       ) as IFrameworks;
  //       this.hackOrTips = Flatted.parse(
  //         (bundledHackOrTips as BundledFlattedJson).flattedString,
  //       ) as IHackOrTips;
  //       this.ingredients = Flatted.parse(
  //         (bundledIngredients as BundledFlattedJson).flattedString,
  //       ) as IIngredients;
  //       this.sponsorPanels = Flatted.parse(
  //         (bundledSponsorPanels as BundledFlattedJson).flattedString,
  //       ) as ISponsorPanels;
  //       this.videoContents = Flatted.parse(
  //         (bundledVideoContents as BundledFlattedJson).flattedString,
  //       ) as IVideoContents;
  //       this.dataLoaded = true;
  //     }
  //     return new Promise(function (resolve, _reject) {
  //       resolve(null);
  //     });
  //   };
  // }

  loadContent = async () => {
    if (!this.dataLoaded) {
      this.articleContents = parse(
        (bundledArticleContents as BundledFlattedJson).flattedString
      ) as IArticleContents;
      this.categories = parse(
        (bundledCategories as BundledFlattedJson).flattedString
      ) as ICategories;
      this.challenges = parse(
        (bundledChallenges as BundledFlattedJson).flattedString
      ) as IChallenges;
      this.frameworks = parse(
        (bundledFrameworks as BundledFlattedJson).flattedString
      ) as IFrameworks;
      this.hackOrTips = parse(
        (bundledHackOrTips as BundledFlattedJson).flattedString
      ) as IHackOrTips;
      this.ingredients = parse(
        (bundledIngredients as BundledFlattedJson).flattedString
      ) as IIngredients;
      this.sponsorPanels = parse(
        (bundledSponsorPanels as BundledFlattedJson).flattedString
      ) as ISponsorPanels;
      this.videoContents = parse(
        (bundledVideoContents as BundledFlattedJson).flattedString
      ) as IVideoContents;

      this.dataLoaded = true;
    }

    return new Promise((resolve) => {
      resolve(null);
    });
  };
}
