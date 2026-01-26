import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import { IFrameworkComponentStep } from '../../../models/craft';
import HackOrTip from '../../../modules/prep/components/HackOrTip';
import RelevantIngredients from './RelevantIngredients';
import React, { useMemo, useCallback, useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
// import Modal from 'react-native-modal';
import RenderHTML, {
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html';

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
  const [isIngredientsActive, setIsIngredientsActive] =
    useState<boolean>(false);

  // Stabilize RenderHTML props to avoid frequent provider rerenders
  const contentWidth = useMemo(() => Dimensions.get('window').width - 40, []);
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
  const onStrongPress = useCallback(() => {
    setIsIngredientsActive(prev => !prev);
  }, []);
  const customHTMLElementModels = useMemo(
    () => ({
      strong: HTMLElementModel.fromCustomModel({
        tagName: 'strong',
        mixedUAStyles: tw.style('text-lemon font-sans-bold'),
        contentModel: HTMLContentModel.textual,
        reactNativeProps: {
          native: {
            onPress: onStrongPress,
          },
        },
      }),
    }),
    [onStrongPress],
  );

  const screenHeight = Dimensions.get('window').height;
  const reservedBottomSpace = 200;

  return (
    <View
      style={tw`relative w-[${
        Dimensions.get('screen').width
      }px] h-full px-5`}
      key={item.id}
    >
      <ScrollView
        style={{
          maxHeight: screenHeight - reservedBottomSpace,
        }}
        contentContainerStyle={tw`pb-12`}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
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
          customHTMLElementModels={customHTMLElementModels}
        />

        {item.hackOrTip.length > 0 && (
          <View
            style={tw.style(
              'mt-4 gap-3',
              index < noOfItems - 1 ? 'pb-12' : 'pb-2',
            )}
          >
            <HackOrTip id={item.hackOrTip[0].id} />
          </View>
        )}
      </ScrollView>

      {index === noOfItems - 1 && (
        <View style={tw`mb-6`}>
          <SecondaryButton
            iconLeft="check"
            onPress={onCompleteCook}
            loading={isLoading}
          >
            Complete the cook
          </SecondaryButton>
        </View>
      )}

      {/* Navigation for left/right */}
      {index > 0 && (
        <Pressable
          style={tw.style(
            'absolute left-0 top-0 w-10',
            index < noOfItems - 1 ? 'bottom-20' : 'bottom-0',
          )}
          onPress={() => {
            scrollToItem(index - 1);
          }}
        />
      )}
      {index < noOfItems - 1 && (
        <Pressable
          style={tw.style(
            'absolute right-0 top-0 w-10',
            index < noOfItems - 1 ? 'bottom-20' : 'bottom-0',
          )}
          onPress={() => {
            scrollToItem(index + 1);
          }}
        />
      )}

      {index < noOfItems - 1 && item.ingredients.length > 0 && (
        <RelevantIngredients
          ingredients={item.ingredients}
          setIsIngredientsActive={setIsIngredientsActive}
          isIngredientsActive={isIngredientsActive}
        />
      )}
    </View>
  );
}