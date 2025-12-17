const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    ingredientEntries {
      ... on ingredient_default_Entry {
        averageWeight
        id: uid
        description
        heroImage {
          id: uid
          title
          url
        }
        inSeason
        ingredientCategory {
          id: uid
        }
        ingredientTheme
        nutrition
        pantryItem
        parentIngredient {
          id: uid
        }
        sponsorPanel {
          id: uid
        }
        title
        sticker {
          id: uid
          ... on sticker_Category {
            image {
              url
              id: uid
              title
            }
          }
        }
        suitableDiets {
          id: uid
        }
        relatedHacks {
          id: uid
        }
      }
    }
  }
`;

exports.query = query;
