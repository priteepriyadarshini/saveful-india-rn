const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    videoContentEntries {
      ... on videoContent_default_Entry {
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
        videoUrl
      }
    }
  }
`;

exports.query = query;
