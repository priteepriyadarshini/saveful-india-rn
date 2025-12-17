import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { IProduceList } from '../../../modules/track/types';
import { Image, Pressable, Text, View } from 'react-native';
import { bodyLargeMedium } from '../../../theme/typography';

export default function TrackSurveyProduce({
  list,
  selectedProduce,
  setSelectedProduce,
}: {
  list: IProduceList[];
  selectedProduce: string[];
  setSelectedProduce: (produce: string | undefined) => void;
}) {
  const isSelected = (value: string | undefined) => {
    return selectedProduce.findIndex(x => x === value) !== -1;
  };

  return (
    <View style={tw.style('flex-row flex-wrap pt-8')}>
      {list.map(produce => {
        return (
          <Pressable
            key={produce.id}
            style={tw`w-1/2 p-[5px]`}
            onPress={() => {
              setSelectedProduce(produce.name);
            }}
          >
            <View
              style={tw.style(
                'w-full items-center rounded-[10px] border border-radish bg-white p-2',
                {
                  'border-eggplant-vibrant bg-radish': isSelected(produce.name),
                },
              )}
            >
              <Image
                resizeMode="contain"
                style={tw`h-[70px]`}
                source={produce.image?.uri as any}
                accessibilityIgnoresInvertColors
              />
              <View
                style={tw.style('items-center justify-center pt-1', {
                  'flex-row': isSelected(produce.name),
                })}
              >
                <Text style={tw.style(bodyLargeMedium)}>{produce.name}</Text>
                {isSelected(produce.name) && (
                  <Feather
                    style={tw.style('pl-1.5')}
                    name="check"
                    size={18}
                    color={tw.color('black')}
                  />
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
