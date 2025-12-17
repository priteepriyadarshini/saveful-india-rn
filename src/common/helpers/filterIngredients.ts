import { IFramework, IFrameworkComponent } from "../../models/craft";

const filterIngredientById = (frameworks: IFramework[], id: string) => {
  const result = frameworks.filter(item => {
    const matchOptional = item.components.some(dishes =>
      dishes.optionalIngredients.some(ingredients =>
        ingredients.ingredient.some(ingredient => ingredient.id.includes(id)),
      ),
    );
    const matchRecommended = item.components.some(dishes =>
      dishes.requiredIngredients.some(ingredients =>
        ingredients.recommendedIngredient.some(ingredient =>
          ingredient.id.includes(id),
        ),
      ),
    );

    const matchAlternative = item.components.some(dishes =>
      dishes.requiredIngredients.some(alternatives =>
        alternatives.alternativeIngredients.some(ingredients =>
          ingredients.ingredient.some(ingredient => ingredient.id.includes(id)),
        ),
      ),
    );

    return matchOptional || matchRecommended || matchAlternative;
  });

  return result;
};

const filterAllergiesByUserPreferences = (
  frameworks: IFramework[],
  allergies?: string[],
) => {
  const result = frameworks.filter(item => {
    // const excludeOptional = !item.components.some(dishes =>
    //   dishes.optionalIngredients.some(ingredients =>
    //     ingredients.ingredient.some(
    //       ingredient => allergies?.some(f => f === ingredient.id),
    //     ),
    //   ),
    // );

    const excludeRecommended = !item.components.some(dishes =>
      dishes.requiredIngredients.some(
        ingredients =>
          ingredients.alternativeIngredients.length === 0 &&
          ingredients.recommendedIngredient.some(
            ingredient => allergies?.some(f => f === ingredient.id),
          ),
      ),
    );

    // const excludeAlternative = !item.components.some(dishes =>
    //   dishes.requiredIngredients.some(alternatives =>
    //     alternatives.alternativeIngredients.some(ingredients =>
    //       ingredients.ingredient.some(
    //         ingredient => allergies?.some(f => f === ingredient.id),
    //       ),
    //     ),
    //   ),
    // );

    return (
      // excludeOptional &&
      excludeRecommended
      // && excludeAlternative
    );
  });

  return result;
};

const filterIngredientByArray = (
  frameworks: IFramework[],
  selectedIngredient: {
    id: string;
    title: string;
  }[],
) => {
  const result = frameworks.filter(item => {
    const matchOptional = item.components.some(dishes =>
      dishes.optionalIngredients.some(ingredients =>
        ingredients.ingredient.some(ingredient =>
          selectedIngredient.some(f => f.id === ingredient.id),
        ),
      ),
    );
    const matchRecommended = item.components.some(dishes =>
      dishes.requiredIngredients.some(ingredients =>
        ingredients.recommendedIngredient.some(ingredient =>
          selectedIngredient.some(f => f.id === ingredient.id),
        ),
      ),
    );

    const matchAlternative = item.components.some(dishes =>
      dishes.requiredIngredients.some(alternatives =>
        alternatives.alternativeIngredients.some(ingredients =>
          ingredients.ingredient.some(ingredient =>
            selectedIngredient.some(f => f.id === ingredient.id),
          ),
        ),
      ),
    );

    return matchOptional || matchRecommended || matchAlternative;
  });
  return result;
};

const getAllIngredientsFromComponentsByArray = (
  components: IFrameworkComponent[],
  selectedIngredients: { id: string; title: string }[],
): string[] => {
  const allTitles = new Set<string>();

  components.forEach(component => {
    component.requiredIngredients.forEach(ri => {
      ri.recommendedIngredient.forEach(ingredient => {
        if (
          selectedIngredients.some(
            selected => selected.title === ingredient.title,
          )
        ) {
          allTitles.add(ingredient.title);
        }
      });
    });

    component.requiredIngredients.forEach(ri => {
      ri.alternativeIngredients.forEach(ai => {
        ai.ingredient.forEach(ingredient => {
          if (
            selectedIngredients.some(
              selected => selected.title === ingredient.title,
            )
          ) {
            allTitles.add(ingredient.title);
          }
        });
      });
    });

    component.optionalIngredients.forEach(oi => {
      oi.ingredient.forEach(ingredient => {
        if (
          selectedIngredients.some(
            selected => selected.title === ingredient.title,
          )
        ) {
          allTitles.add(ingredient.title);
        }
      });
    });
  });

  return Array.from(allTitles);
};

function getAllIngredientsFromComponents(components: IFrameworkComponent[]): {
  id: string;
  title: string;
  averageWeight: number;
}[] {
  const allTitles = [] as {
    id: string;
    title: string;
    averageWeight: number;
  }[];

  components.forEach(component => {
    // Recommended Ingredients
    const recommendedTitles = component.requiredIngredients.flatMap(ri =>
      ri.recommendedIngredient.map(ingredient => ({
        id: ingredient.id,
        title: ingredient.title,
        averageWeight: ingredient.averageWeight,
      })),
    );

    // Alternative Ingredients
    const alternativeTitles = component.requiredIngredients.flatMap(ri =>
      ri.alternativeIngredients.flatMap(ai =>
        ai.ingredient.map(ingredient => ({
          id: ingredient.id,
          title: ingredient.title,
          averageWeight: ingredient.averageWeight,
        })),
      ),
    );

    // Optional Ingredients
    const optionalTitles = component.optionalIngredients.flatMap(oi =>
      oi.ingredient.map(ingredient => ({
        id: ingredient.id,
        title: ingredient.title,
        averageWeight: ingredient.averageWeight,
      })),
    );

    // Concatenate all titles from the current component
    const allIngredientTitles = [
      ...recommendedTitles,
      ...alternativeTitles,
      ...optionalTitles,
    ];

    allTitles.push(...allIngredientTitles);
  });

  return Array.from(new Set(allTitles));
}

export {
  filterAllergiesByUserPreferences,
  filterIngredientByArray,
  filterIngredientById,
  getAllIngredientsFromComponents,
  getAllIngredientsFromComponentsByArray,
};
