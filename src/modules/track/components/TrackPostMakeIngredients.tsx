import tw from '../../../common/tailwind';
import { Pressable, Text, View } from 'react-native';
import { subheadSmall } from '../../../theme/typography';

export interface ITrackPostMakeIngredient {
  id: string;
  title: string;
  averageWeight: number;
}

export default function TrackPostMakeIngredients({
  list,
  selectedIngredients,
  setSelectedIngredients,
}: {
  list: ITrackPostMakeIngredient[];
  selectedIngredients: ITrackPostMakeIngredient[];
  setSelectedIngredients: (
    ingredient: ITrackPostMakeIngredient | undefined,
  ) => void;
}) {
  const isSelected = (value: string | undefined) => {
    return selectedIngredients.findIndex(x => x.id === value) !== -1;
  };

  return (
    <View style={tw.style('pt-8')}>
      {list.map(ingredient => {
        return (
          <Pressable
            key={ingredient.id}
            style={tw`flex-row items-center gap-2 border-b border-eggplant-vibrant py-3.5`}
            onPress={() => {
              setSelectedIngredients(ingredient);
            }}
          >
            <View style={tw.style('rounded-full border border-stone p-1')}>
              <View
                style={tw.style(
                  'h-2 w-2 rounded-full bg-eggplant-light opacity-0',
                  {
                    'opacity-100': isSelected(ingredient.id),
                  },
                )}
              />
            </View>
            <Text style={tw.style(subheadSmall, 'text-white')}>
              {ingredient.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
