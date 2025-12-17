const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    articleContentEntries {
      ... on articleContent_default_Entry {
        id: uid
        title
        hackCategory {
          id: uid
        }
        thumbnailImage {
          id: uid
          filename
          url
        }
        shortDescription
        heroImage {
          id: uid
          filename
          url
        }
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
        description
        articleBlocks {
          __typename
          ... on articleBlocks_textBlock_BlockType {
            id: uid
            text
          }
          ... on articleBlocks_imageBlock_BlockType {
            id: uid
            image {
              id: uid
              filename
              url
            }
          }
          ... on articleBlocks_hackOrTipBlock_BlockType {
            id: uid
            hackOrTip {
              id: uid
            }
          }
          ... on articleBlocks_videoBlock_BlockType {
            id: uid
            videoUrl
            videoCaption
            videoCredit
            videoThumbnail {
              id: uid
              filename
              url
            }
          }
          ... on articleBlocks_listBlock_BlockType {
            id: uid
            listTitle
            listItems {
              ... on listItems_BlockType {
                id: uid
                listText
              }
            }
          }
          ... on articleBlocks_accordionBlock_BlockType {
            id: uid
            accordion {
              ... on accordion_BlockType {
                id: uid
                accordionTitle
                accordionText
                accordionFramework {
                  id: uid
                }
              }
            }
          }
          ... on articleBlocks_imageDetailsBlock_BlockType {
            id: uid
            blockImage {
              id: uid
              filename
              url
            }
            blockTitle
            blockDescription
          }
        }
      }
    }
  }
`;

exports.query = query;
