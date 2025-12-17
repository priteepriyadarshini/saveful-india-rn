const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    challengeEntries {
      ... on challenge_default_Entry {
        id: uid
        slug
        title
        challengeBadge {
          id: uid
          filename
          url
        }
        challengeShortDescription
        challengeDescription
        sponsor {
          ... on sponsor_Category {
            id: uid
            title
            sponsorLogo {
              id: uid
              title
              url
            }
            sponsorLogoBlackAndWhite {
              id: uid
              title
              url
            }
            broughtToYouBy
            sponsorTagline
          }
        }

        termsAndConditionsLink
        termsAndConditionsText
        challengeCompleteDescription
        challengeSocialShareImage {
          id: uid
          filename
          url
        }
        incompleteChallengeMessage
        optInBannerMessage

        optInStartDate
        gracePeriodStartDate
        drawStartDate
        challengeEndDate
        challengeDuration
        numberOfCooks

        bonusAchievements {
          ... on bonusAchievements_saverAchievement_BlockType {
            id: uid
            achievementTitle
            achievementSubTitle
            achievementShortDescription
            achievementDescription
            achievementEarnedBadge {
              id: uid
              title
              url
            }
            achievementUndearnedBadge {
              id: uid
              title
              url
            }
            foodSavedTarget
            achievementSocialShareImage {
              id: uid
              title
              url
            }
            achievementEarnedDescription
          }
        }
      }
    }
  }
`;

exports.query = query;
