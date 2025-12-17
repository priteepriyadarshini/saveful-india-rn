import tw from '../../tailwind';
import React from 'react';
import { View } from 'react-native';

export default function GenericCarouselPagination({
  items,
  paginationContainerStyle,
  dotSpacing,
  dotSize,
  activeDotColor,
  inactiveDotColor,
  currentIndex,
  maxAmountOfDots,
}: {
  items: { id: number | string }[];
  paginationContainerStyle?: string;
  dotSpacing: number;
  dotSize: number;
  activeDotColor: string;
  inactiveDotColor: string;
  currentIndex: number;
  maxAmountOfDots?: number;
}) {
  return (
    <View style={tw.style('flex-row self-center', paginationContainerStyle)}>
      {items.map((item, index) => {
        const isCurrent =
          currentIndex === index ||
          (maxAmountOfDots &&
            currentIndex >= maxAmountOfDots &&
            index === items.length - 1);
        return (
          <View
            key={item.id.toString()}
            style={tw.style(
              isCurrent ? `w-[${dotSize * 3}px]` : `w-[${dotSize}px]`,
              `mx-[${
                dotSpacing / 2
              }px] h-[${dotSize}px] rounded-[${dotSize}px] bg-${
                isCurrent ? activeDotColor : inactiveDotColor
              }`,
            )}
          />
        );
      })}
    </View>
  );
}
