import { useState } from 'react';
import { Dimensions, View, ViewStyle } from 'react-native';
import { 
  GenericCarouselWrapper, 
  GenericCarouselFlatlist 
} from '../../../common/components/GenericCarousel';
import tw from '../../../common/tailwind';
import { IAsset, ITag, IFramework } from '../../../models/craft';
import MealCard from '../../feed/components/MealCard';

interface RenderItemProps {
  id: string;
  title: string;
  heroImage: IAsset[];
  variantTags: ITag[];
  description: string;
}

const windowWidth = Dimensions.get('window').width;
const singleLength = windowWidth - 40;

export default function MealCarousel({
  type = 'survey',
  items,
  contentContainerStyle,
  itemLength = windowWidth - 40,
}: {
  type?: 'profile' | 'survey';
  items: IFramework[];
  contentContainerStyle?: ViewStyle;
  itemLength?: number;
}) {
  const [maxHeight, setMaxHeight] = useState<number>(0);

  if (!items || items.length === 0) return null;

  return (
    <View style={tw`flex-1`}>
      {items && items.length > 0 && (
        <GenericCarouselWrapper style={tw`relative mb-5 overflow-hidden`}>
          <GenericCarouselFlatlist
            contentContainerStyle={tw.style(
              `${items.length === 1 ? 'w-full' : 'pl-5 pr-3'}`,
              contentContainerStyle,
            )}
            data={items}
            section={'Meal'}
            itemLength={itemLength}
            renderItem={(renderItem: {
              item: RenderItemProps;
              index: number;
            }) => (
              <View
                style={{
                  width:
                    items.length === 1
                      ? type === 'profile'
                        ? singleLength
                        : '100%'
                      : itemLength,
                }}
              >
                <View style={tw.style(`${items.length === 1 ? '' : 'mr-2'}`)}>
                  <MealCard
                    {...renderItem.item}
                    maxHeight={maxHeight}
                    setMaxHeight={setMaxHeight}
                  />
                </View>
              </View>
            )}
          />
        </GenericCarouselWrapper>
      )}
    </View>
  );
}
