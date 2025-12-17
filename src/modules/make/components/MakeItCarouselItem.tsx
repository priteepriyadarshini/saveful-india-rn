import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import { IFrameworkComponentStep } from '../../../models/craft';
import HackOrTip from '../../../modules/make/components/HackOrTip';
import RelevantIngredients from './RelevantIngredients';
import React, { useState } from 'react';
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

  return (
    <View
      style={tw`relative pb-4 w-[${
        Dimensions.get('screen').width
      }px] h-full justify-between px-5`}
      key={item.id}
    >
      <ScrollView
        style={tw.style(item.hackOrTip.length > 0 ? 'mb-8' : 'mb-20')}
        showsVerticalScrollIndicator={false}
      >
        <RenderHTML
          source={{
            html: item.stepInstructions || '',
          }}
          contentWidth={Dimensions.get('window').width - 40}
          tagsStyles={{
            p: tw.style('text-white'),
            strong: tw.style('text-lemon'),
          }}
          defaultViewProps={{
            style: tw`m-0 p-0`,
          }}
          defaultTextProps={{
            style: tw.style(
              'mb-4 font-sans-semibold text-3.5xl leading-tightest',
            ),
            maxFontSizeMultiplier: 1,
          }}
          customHTMLElementModels={{
            strong: HTMLElementModel.fromCustomModel({
              tagName: 'strong',
              mixedUAStyles: tw.style('text-lemon'),
              contentModel: HTMLContentModel.textual,
              reactNativeProps: {
                native: {
                  onPress: () => {
                    setIsIngredientsActive(!isIngredientsActive);
                  },
                },
              },
            }),
          }}
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

      <View>
        {index === noOfItems - 1 && (
          <View
            style={tw.style('gap-3', index < noOfItems - 1 ? 'pb-20' : 'pb-2')}
          >
            <SecondaryButton
              iconLeft="check"
              onPress={onCompleteCook}
              loading={isLoading}
            >
              Complete the cook
            </SecondaryButton>
          </View>
        )}
      </View>

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
