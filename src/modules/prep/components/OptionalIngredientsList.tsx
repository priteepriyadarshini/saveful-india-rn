import tw from '../../../common/tailwind';
import { Pressable, Text, View } from 'react-native';
import { bodyMediumRegular } from '../../../theme/typography';

export default function OptionalIngredientsList({
  ingredients,
  selectedOptionalIngredients,
  setSelectedOptionalIngredients,
}: {
  ingredients: {
    id: string;
    title: string;
  }[];
  selectedOptionalIngredients: string[];
  setSelectedOptionalIngredients: (ingredient: string) => void;
}) {
  const isSelected = (value: string) => {
    return selectedOptionalIngredients.findIndex(x => x === value) !== -1;
  };

  return (
    <View>
      {ingredients.map(ingredient => {
        return (
          <Pressable
            key={ingredient.id}
            style={tw`flex-row items-center gap-2 border-b border-strokecream py-3.5`}
            onPress={() => {
              setSelectedOptionalIngredients(ingredient.id);
            }}
          >
            <View style={tw.style('rounded-full border border-stone p-1')}>
              <View
                style={tw.style('h-2 w-2 rounded-full bg-eggplant opacity-0', {
                  'opacity-100': isSelected(ingredient.id),
                })}
              />
            </View>
            <Text style={tw.style(bodyMediumRegular)}>{ingredient.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
