// import * as Linking from "expo-linking";

// const expoPrefix = Linking.createURL("/");

// const linking = {
//   prefixes: [
//     expoPrefix,
//     Linking.createURL('/'),
//     "https://app.dev.saveful.com",
//     "https://app.staging.saveful.com",
//     "https://app.saveful.com",
//   ],
//   config: {
//     //initialRouteName: 'Root', // by pritee so that i can check what is causing the navigation error
//     screens: {
//       // commented out because we probably dont want this to be so easy to get to lol
//       // Developer: '/developer',

//       // not sure when we would use a deep link to the intro or onboarding given users should only see these once
//       // and any push would occur after they have already seen them and logged in and unable to access again
//       // Intro: {
//       //   screens: {
//       //     IntroHome: { path: '/intro', exact: true },
//       //   },
//       // },
//       // Onboarding: {
//       //   screens: {
//       //     Onboarding: { path: '/onboarding', exact: true },
//       //     PostOnboarding: { path: '/postonboarding', exact: true },
//       //   },
//       // },

//       Root: {
//         screens: {
//           Feed: {
//             initialRouteName: "FeedHome",
//             screens: {
//               FeedHome: { path: "/feed", exact: true },
//               Partners: { path: "/partners", exact: true },
//               Groups: {
//                 initialRouteName: "Groups",
//                 screens: {
//                   CreateGroup: { path: "/groups/create", exact: true },
//                   CreateGroupSuccess: {
//                     path: "/groups/create/:id",
//                     exact: true,
//                   },
//                   GroupDetail: { path: "/groups/:id", exact: true },
//                   EditGroup: { path: "/groups/:id/edit", exact: true },
//                   GroupChallengeDetail: {
//                     path: "/groups/:groupId/challenges/:id",
//                     exact: true,
//                   },
//                   CreateChallenge: {
//                     path: "/groups/:groupId/challenges/create",
//                     exact: true,
//                   },
//                 },
//               },
//             },
//           },
//           Make: {
//             path: "make",
//             initialRouteName: "MakeHome",
//             screens: {
//               MakeHome: { path: '' } , // /make
//               PrepDetail: { path: "prep/:slug" } , // /make/prep/:slug
//             },
//           },
//           Hack: {
//             initialRouteName: "HackHome",
//             screens: {
//               HackHome: { path: "/hacks", exact: true },
//               HackCategory: { path: "/hacks/:id", exact: true },
//               HackDetail: {
//                 path: "/hacks/:categoryId/articles/:id",
//                 exact: true,
//               },
//               HackVideo: {
//                 path: "/video/:videoString",
//                 exact: true,
//               },
//             },
//           },
//           Track: {
//             initialRouteName: "TrackHome",
//             screens: {
//               TrackHome: { path: "/track", exact: true },
//               Profile: { path: "/track/profile", exact: true },
//               ProfileHistory: { path: "/track/history/:id", exact: true },
//               Settings: { path: "/track/settings", exact: true },
//               SettingsDetails: { path: "/track/settings/details", exact: true },
//               SettingsSaveful: { path: "/track/settings/saveful", exact: true },
//               SettingsNotifications: {
//                 path: "/track/settings/notifications",
//                 exact: true,
//               },
//               SettingsDetailsOnboardingDietary: {
//                 path: "/track/settings/details/onboarding-dietary",
//                 exact: true,
//               },
//               SettingsAccounts: {
//                 path: "/track/settings/accounts",
//                 exact: true,
//               },
//               ChangePassword: {
//                 path: "/track/settings/change-password",
//                 exact: true,
//               },
//             },
//           },
//         },
//       },
//       Ingredients: {
//         screens: {
//           IngredientsHome: { path: "ingredients", exact: true },
//           IngredientDetail: { path: "ingredients/:id", exact: true },
//           IngredientsResults: { path: "ingredients/results", exact: true },
//         },
//       },
//       Survey: {
//         screens: {
//           PostMake: { path: "/survey/postmake/:id", exact: true },
//           SurveyWeekly: { path: "/survey/weekly", exact: true },
//           Results: { path: "/survey/results", exact: true },
//         },
//       },
//       // Video: { path: '/video', exact: true }, // /video/:id
//       QantasLink: {
//         screens: { path: "/qantas-link", exact: true },
//       },
//       AppCallbacks: {
//         screens: {
//           Login: { path: "/app/login/redirect", exact: true },
//         },
//       },
//       NotFound: "*",
//     },
//   },
// }; /* as LinkingOptions<RootParamList>; */

// export default linking;

import * as Linking from "expo-linking";

const expoPrefix = Linking.createURL("/");

const linking = {
  prefixes: [
    expoPrefix,
    "https://app.dev.saveful.com",
    "https://app.staging.saveful.com",
    "https://app.saveful.com",
  ],
  config: {
    screens: {
      Root: {
        screens: {
          Feed: {
            initialRouteName: "FeedHome",
            screens: {
              FeedHome: { path: "feed", exact: true },
              Partners: { path: "partners", exact: true },
              Groups: {
                initialRouteName: "Groups",
                screens: {
                  CreateGroup: { path: "groups/create", exact: true },
                  CreateGroupSuccess: { path: "groups/create/:id", exact: true },
                  GroupDetail: { path: "groups/:id", exact: true },
                  EditGroup: { path: "groups/:id/edit", exact: true },
                  GroupChallengeDetail: { path: "groups/:groupId/challenges/:id", exact: true },
                  CreateChallenge: { path: "groups/:groupId/challenges/create", exact: true },
                },
              },
            },
          },

          // Make: {
          //   initialRouteName: "MakeHome",
          //   screens: {
          //     MakeHome: { path: "make" }, // explicit path
          //     PrepDetail: { path: "make/prep/:slug" }, // explicit path
          //   },
          // },

          Hack: {
            initialRouteName: "HackHome",
            screens: {
              HackHome: { path: "hacks", exact: true },
              HackCategory: { path: "hacks/:id", exact: true },
              HackDetail: { path: "hacks/:categoryId/articles/:id", exact: true },
              HackVideo: { path: "video/:videoString", exact: true },
            },
          },

          Track: {
            initialRouteName: "TrackHome",
            screens: {
              TrackHome: { path: "track", exact: true },
              Profile: { path: "track/profile", exact: true },
              ProfileHistory: { path: "track/history/:id", exact: true },
              Settings: { path: "track/settings", exact: true },
              SettingsDetails: { path: "track/settings/details", exact: true },
              SettingsSaveful: { path: "track/settings/saveful", exact: true },
              SettingsNotifications: { path: "track/settings/notifications", exact: true },
              SettingsDetailsOnboardingDietary: { path: "track/settings/details/onboarding-dietary", exact: true },
              SettingsAccounts: { path: "track/settings/accounts", exact: true },
              ChangePassword: { path: "track/settings/change-password", exact: true },
            },
          },
        },
      },

      Ingredients: {
        screens: {
          IngredientsHome: { path: "ingredients", exact: true },
          IngredientDetail: { path: "ingredients/:id", exact: true },
          IngredientsResults: { path: "ingredients/results", exact: true },
        },
      },

      Survey: {
        screens: {
          PostMake: { path: "survey/postmake/:id", exact: true },
          SurveyWeekly: { path: "survey/weekly", exact: true },
          Results: { path: "survey/results", exact: true },
        },
      },

      QantasLink: { screens: { path: "qantas-link", exact: true } },
      AppCallbacks: { screens: { Login: { path: "app/login/redirect", exact: true } } },
      NotFound: "*",
    },
  },
};

export default linking;
