const { gql } = require('@apollo/client/core');

const query = gql`
  query {
    frameworkEntries(orderBy: "dateUpdated", inReverse: true) {
      ... on framework_default_Entry {
        id: uid
        slug
        description
        frameworkCategories {
          id: uid
        }
        freezeKeepTime
        fridgeKeepTime
        hackOrTip {
          id: uid
        }
        heroImage {
          id: uid
          filename
          url
        }
        title
        variantTags {
          id: uid
          title
        }
        youtubeId
        portions
        prepAndCookTime
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
        components {
          ... on components_component_BlockType {
            id: uid
            title
            componentInstructions
            componentTitle
            includedInVariants {
              id: uid
              title
            }
            requiredIngredients {
              ... on requiredIngredients_BlockType {
                id: uid
                recommendedIngredient {
                  id: uid
                  title
                  averageWeight
                }
                alternativeIngredients {
                  ... on alternativeIngredients_alternativeIngredients_BlockType {
                    id: uid
                    ingredient {
                      id: uid
                      title
                      averageWeight
                    }
                    alternativeOptions
                    quantity
                    preparation
                  }
                }
                quantity
                preparation
              }
            }
            optionalIngredients {
              ... on optionalIngredients_BlockType {
                id: uid
                ingredient {
                  id: uid
                  title
                  averageWeight
                }
                quantity
                preparation
              }
            }
            stronglyRecommended
            choiceInstructions
            buttonText
            componentSteps {
              ... on componentSteps_BlockType {
                id: uid
                stepInstructions
                relevantIngredients {
                  id: uid
                  title
                  averageWeight
                }
                hackOrTip {
                  id: uid
                }
                alwaysShow
              }
            }
          }
        }
        prepLongDescription
        prepShortDescription
        shortDescription
        useLeftoversIn {
          id: uid
        }
        frameworkSponsor {
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

// Function to create a paginated query with limit and offset
const createPaginatedQuery = (limit, offset) => gql`
  query {
    frameworkEntries(orderBy: "dateUpdated", inReverse: true, limit: ${limit}, offset: ${offset}) {
      ... on framework_default_Entry {
        id: uid
        slug
        description
        frameworkCategories {
          id: uid
        }
        freezeKeepTime
        fridgeKeepTime
        hackOrTip {
          id: uid
        }
        heroImage {
          id: uid
          filename
          url
        }
        title
        variantTags {
          id: uid
          title
        }
        youtubeId
        portions
        prepAndCookTime
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
        components {
          ... on components_component_BlockType {
            id: uid
            title
            componentInstructions
            componentTitle
            includedInVariants {
              id: uid
              title
            }
            requiredIngredients {
              ... on requiredIngredients_BlockType {
                id: uid
                recommendedIngredient {
                  id: uid
                  title
                  averageWeight
                }
                alternativeIngredients {
                  ... on alternativeIngredients_alternativeIngredients_BlockType {
                    id: uid
                    ingredient {
                      id: uid
                      title
                      averageWeight
                    }
                    alternativeOptions
                    quantity
                    preparation
                  }
                }
                quantity
                preparation
              }
            }
            optionalIngredients {
              ... on optionalIngredients_BlockType {
                id: uid
                ingredient {
                  id: uid
                  title
                  averageWeight
                }
                quantity
                preparation
              }
            }
            stronglyRecommended
            choiceInstructions
            buttonText
            componentSteps {
              ... on componentSteps_BlockType {
                id: uid
                stepInstructions
                relevantIngredients {
                  id: uid
                  title
                  averageWeight
                }
                hackOrTip {
                  id: uid
                }
                alwaysShow
              }
            }
          }
        }
        prepLongDescription
        prepShortDescription
        shortDescription
        useLeftoversIn {
          id: uid
        }
        frameworkSponsor {
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
exports.createPaginatedQuery = createPaginatedQuery;
