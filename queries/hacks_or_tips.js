const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    hackOrTipEntries {
      ... on hackOrTip_default_Entry {
        id: uid
        description
        hackOrTipType
        title
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
        shortDescription
        sponsorHeading
      }
    }
  }
`;

exports.query = query;
