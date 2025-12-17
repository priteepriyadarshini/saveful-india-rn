import tw from '../../../common/tailwind';
import React, { Fragment } from 'react';
import { Dimensions, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function MakeItNavigation({
  items,
  currentIndex,
  slideIndex,
  maxAmountOfDots,
}: {
  items: { id: string }[];
  currentIndex: number;
  slideIndex: number;
  maxAmountOfDots?: number;
}) {
  return (
    <View style={tw`mb-7 mt-4 w-full flex-row gap-1 self-center px-5`}>
      {items.map((item, index) => {
        const isCurrentOrPast =
          currentIndex >= index ||
          (maxAmountOfDots &&
            currentIndex >= maxAmountOfDots &&
            index === items.length - 1);

        return (
          <Fragment key={item.id.toString()}>
            <Progress.Bar
              progress={
                index === 0 ? 1 : isCurrentOrPast ? slideIndex / index : 0
              }
              color={'#96F0B6'}
              indeterminateAnimationDuration={100}
              unfilledColor={'rgba(255, 252, 249, 0.2)'}
              animated
              borderWidth={0}
              height={4}
              useNativeDriver={true}
              borderRadius={9999}
              animationConfig={{ bounciness: 0 }}
              animationType={'spring'}
              width={
                (Dimensions.get('screen').width - 40 - (items.length - 1) * 4) /
                items.length
              }
            />
          </Fragment>
        );
      })}
    </View>
  );
}
