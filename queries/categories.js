const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    categories {
      id: uid
      title
      groupHandle
      groupId
      ... on hack_Category {
        heroImage {
          id: uid
          filename
          url
        }
        image {
          id: uid
          filename
          url
        }
      }
    }
  }
`;

exports.query = query;
