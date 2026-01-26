import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import { IFrameworkComponentStep } from '../../../models/craft';
import HackOrTip from '../../../modules/prep/components/HackOrTip';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import RenderHTML from 'react-native-render-html';

interface ICarouselItem extends IFrameworkComponentStep {
  ingredients: {
    id: string;
    title: string;
    quantity: string;
    preparation?: string;
  }[];
}

export default function MakeItCarouselItem({
  item,
  index,
  noOfItems,
  isLoading,
  onCompleteCook,
  scrollToItem,
}: {
  item: ICarouselItem;
  index: number;
  noOfItems: number;
  isLoading: boolean;
  onCompleteCook: () => void;
  scrollToItem: (index: number) => void;
}) {
  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;
  
  // Stabilize RenderHTML props to avoid frequent provider rerenders
  const contentWidth = useMemo(() => screenWidth - 40, [screenWidth]);
  const tagsStyles = useMemo(
    () => ({
      body: tw.style('text-white font-sans-semibold text-3.5xl leading-tightest'),
      p: tw.style('text-white font-sans-semibold text-3.5xl leading-tightest mb-4'),
      div: tw.style('text-white font-sans-semibold text-3.5xl leading-tightest'),
      span: tw.style('text-white font-sans-semibold'),
      strong: tw.style('text-lemon font-sans-bold text-3.5xl leading-tightest'),
      b: tw.style('text-lemon font-sans-bold text-3.5xl leading-tightest'),
    }),
    [],
  );
  const defaultViewProps = useMemo(() => ({ style: tw`m-0 p-0` }), []);
  const defaultTextProps = useMemo(
    () => ({
      style: tw.style('text-white font-sans-semibold text-3.5xl leading-tightest mb-4'),
      maxFontSizeMultiplier: 1 as const,
    }),
    [],
  );

  const isLastStep = index === noOfItems - 1;

  return (
    <View
      style={tw`w-[${screenWidth}px] h-full`}
      key={item.id}
    >
      {/* Scrollable Content Area - takes full height */}
      <ScrollView
        style={tw`flex-1 px-5`}
        contentContainerStyle={tw.style('pb-40 pt-4')}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
      >
        <RenderHTML
          source={{ 
            html: item.stepInstructions?.trim().startsWith('<') 
              ? item.stepInstructions 
              : `<p>${item.stepInstructions || ''}</p>` 
          }}
          contentWidth={contentWidth}
          tagsStyles={tagsStyles}
          defaultViewProps={defaultViewProps}
          defaultTextProps={defaultTextProps}
        />

        {item.hackOrTip.length > 0 && (
          <View style={tw.style('mt-4 gap-3 mb-4')}>
            <HackOrTip id={item.hackOrTip[0].id} />
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Button Area - only on last step */}
      {isLastStep && (
        <View style={tw`absolute bottom-28 left-0 right-0 px-5 z-10`}>
          <SecondaryButton
            iconLeft="check"
            onPress={onCompleteCook}
            loading={isLoading}
          >
            Complete the cook
          </SecondaryButton>
        </View>
      )}

      {/* Navigation for left/right - touch areas on edges */}
      {index > 0 && (
        <Pressable
          style={tw.style('absolute left-0 top-0 w-12 bottom-0 z-5')}
          onPress={() => {
            scrollToItem(index - 1);
          }}
        />
      )}
      {index < noOfItems - 1 && (
        <Pressable
          style={tw.style('absolute right-0 top-0 w-12 bottom-0 z-5')}
          onPress={() => {
            scrollToItem(index + 1);
          }}
        />
      )}
    </View>
  );
}