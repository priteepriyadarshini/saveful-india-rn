const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    assets {
      id: uid
      extension
      filename
      folderId
      kind
      mimeType
      size
      slug
      title
      url
      volumeId
      width
    }
  }
`;

exports.query = query;
