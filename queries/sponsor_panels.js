const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    sponsorPanelEntries {
      ... on sponsorPanel_default_Entry {
        id: uid
        title
        factOrInsight
        videoSubTitle
        videoThumbnail {
          id: uid
          title
          url
        }
        videoTitle
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
      }
    }
  }
`;

exports.query = query;
