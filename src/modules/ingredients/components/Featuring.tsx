import {
  GenericCarouselFlatlist,
  GenericCarouselWrapper,
} from '../../../common/components/GenericCarousel';
import { filterIngredientById } from '../../../common/helpers/filterIngredients';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import RecipeCard from '../../../modules/make/components/RecipeCard';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { h7TextStyle } from '../../../theme/typography';

// const flexRow = 'flex-row justify-between items-center px-5 py-4.5';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

export default function Featuring({
  ingredientId,
  title,
}: {
  ingredientId: string;
  title: string;
}) {
  const { getFrameworks } = useContent();
  const [frameworks, setFrameworks] = React.useState<IFramework[]>([]);
  const [, setCurrentIndex] = React.useState<number>(0);

  const flatListRef = React.useRef<any>(null); // Reference to the FlatList component
  // Function to scroll the FlatList
  // const scrollCarousel = (offset: number) => {
  //   if (flatListRef.current) {
  //     flatListRef.current.scrollToOffset({ offset, animated: true });
  //   }
  // };

  const [maxHeight, setMaxHeight] = useState<number>(0);

  const getFrameworksData = async () => {
    const data = await getFrameworks();

    if (data) {
      setFrameworks(data);
    }
  };

  useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (frameworks.length === 0) {
    return null;
  }

  const recommendedDishes = filterIngredientById(frameworks, ingredientId);

  if (recommendedDishes.length === 0) {
    return null;
  }

  return (
    <View style={tw`w-full items-center`}>
      <Text style={tw.style(h7TextStyle, 'px-5 text-center')}>
        Cook a meal with {title}
      </Text>
      <GenericCarouselWrapper style={tw`relative my-5 overflow-hidden`}>
        <GenericCarouselFlatlist
          flatListRef={flatListRef}
          contentContainerStyle={tw`pl-5 pr-3`}
          data={recommendedDishes}
          itemLength={itemLength}
          renderItem={(renderItem: { item: IFramework; index: number }) => (
            <View style={{ width: itemLength }}>
              <View style={tw.style(`mr-2`)}>
                <RecipeCard
                  {...renderItem.item}
                  kind={[title]}
                  maxHeight={maxHeight}
                  setMaxHeight={setMaxHeight}
                />
              </View>
            </View>
          )}
          getCurrentIndex={setCurrentIndex}
          section={'Feature'}
        />
        {/* {recommendedDishes.length > 1 ? (
          <View style={tw.style(flexRow)}>
            <GenericCarouselPagination
              items={recommendedDishes}
              dotSpacing={4}
              dotSize={4}
              activeDotColor="eggplant"
              inactiveDotColor="eggplant/60"
              currentIndex={currentIndex}
            />
            <Pressable
              onPress={() => {
                scrollCarousel((currentIndex + 1) * itemLength);
              }}
            >
              <Feather name="arrow-right" size={20} color={tw.color('kale')} />
            </Pressable>
          </View>
        ) : null} */}
      </GenericCarouselWrapper>
    </View>
  );
}
