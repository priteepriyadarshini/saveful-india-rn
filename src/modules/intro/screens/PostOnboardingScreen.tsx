import { Feather } from '@expo/vector-icons';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import PostOnboardLoading from '../../../modules/intro/components/PostOnboardLoading';
import PostOnboardingCarousel from '../../../modules/intro/components/PostOnboardingCarousel';
import { POSTONBOARDING } from '../../../modules/intro/data/postonboarding';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostOnboardingScreen() {
  const insets = useSafeAreaInsets();
  const paddingTop = `pt-[${insets.top}px]`;
  const paddingBottom = `pb-[${insets.bottom}px]`;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPostOnboardSet, setIsPostOnboardSet] = useState<boolean>(false);
  const flatListRef = useRef<FlatList<any>>(null);

  const scrollToItem = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: index + 1,
      });
    }
  };

  return (
    <>
      {!isPostOnboardSet ? (
        <ImageBackground
          style={tw`flex-1 bg-creme ${paddingBottom}`}
          source={
            currentIndex === 0
              ? require('../../../../assets/ribbons/postonboarding.png')
              : require('../../../../assets/ribbons/onboarding.png')
          }
          imageStyle={{
            resizeMode: 'cover',
            top: undefined,
            height:
              currentIndex === 0
                ? (Dimensions.get('screen').width * 650) / 502
                : (Dimensions.get('screen').width * 297) / 375,
          }}
        >
          <View style={tw`flex-1 justify-between ${paddingTop}`}>
            {currentIndex === 0 ? (
              <View style={tw.style('h-11 items-center justify-center')}>
                <View style={tw.style('h-1 w-[138px] rounded-full bg-mint')}>
                  <Animated.View
                    style={tw`h-full w-[95%] rounded-full bg-kale`}
                  />
                </View>
              </View>
            ) : (
              <View style={tw.style('w-full items-start')}>
                <Pressable
                  style={tw`ml-5 flex`}
                  onPress={() => {
                    scrollToItem(currentIndex - 1);
                  }}
                  accessibilityRole="button"
                >
                  <Feather name="arrow-left" color="black" size={20} />
                </Pressable>
              </View>
            )}
            <PostOnboardingCarousel
              flatListRef={flatListRef}
              activeDotIndex={currentIndex}
              setActiveDotIndex={setCurrentIndex}
              data={POSTONBOARDING}
              scrollToItem={scrollToItem}
              setIsPostOnboardSet={setIsPostOnboardSet}
            />
          </View>
        </ImageBackground>
      ) : (
        <PostOnboardLoading setIsPostOnboardSet={setIsPostOnboardSet} />
      )}
      <FocusAwareStatusBar statusBarStyle="dark" />
    </>
  );
}
