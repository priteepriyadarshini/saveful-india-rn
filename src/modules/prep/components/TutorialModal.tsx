import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GenericCarouselFlatlist from '../../../common/components/GenericCarousel/GenericCarouselFlatlist';
import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import React, { useCallback, useRef } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { FlatList } from 'react-native-gesture-handler';
import { bodySmallBold, bodySmallRegular } from '../../../theme/typography';

const screenWidth = Dimensions.get('window').width;
const itemLength = screenWidth - 40;

export default function TutorialModal({
  data,
  isFirst,
  setIsFirst,
  storageKey,
}: {
  isFirst: boolean;
  setIsFirst: (value: boolean) => void;
  storageKey: string;
  data: {
    id: number;
    title: string;
    image: any;
    description: string;
  }[];
}) {
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const flatListRef = useRef<FlatList<any>>(null);

  const scrollCarousel = (offset: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset, animated: true });
    }
  };

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentSlideSize =
        screenWidth || event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / currentSlideSize;
      const roundIndex = Math.round(index);

      setCurrentIndex(roundIndex);
    },
    [],
  );

  return (
    <Modal animationType="fade" transparent={true} visible={isFirst}>
      <View
        style={[
          tw.style('z-10 flex-1 items-center justify-center px-5'),
          { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        ]}
      >
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          useNativeDriver
          style={tw.style(
            'w-full rounded-2xl border border-strokecream bg-creme pb-9 pt-2.5',
          )}
        >
          <View style={tw`px-4`}>
            <Pressable
              onPress={async () => {
                setIsFirst(false);
                await AsyncStorage.setItem(storageKey, 'true');
              }}
              style={tw.style('items-end')}
            >
              <Feather name="x" size={24} color={tw.color('black')} />
            </Pressable>
          </View>
          <View style={tw.style('w-full items-center')}>
            <GenericCarouselFlatlist
              flatListRef={flatListRef}
              data={data}
              scrollEnabled={true}
              itemLength={itemLength}
              onScroll={onScroll}
              renderItem={({ item }) => (
                <View style={tw.style(`w-[${itemLength}px]`)}>
                  <Image
                    resizeMode="contain"
                    style={tw`h-[${
                      ((Dimensions.get('screen').width - 72) * 208) / 297
                    }px] w-[${Dimensions.get('screen').width - 72}px] mx-auto`}
                    source={item.image}
                  />
                  <View style={tw.style('p-4')}>
                    <Text
                      style={[
                        tw.style(bodySmallBold, 'pb-2 text-center uppercase'),
                        { letterSpacing: 1 },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={tw.style(
                        bodySmallRegular,
                        'text-center text-midgray',
                      )}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
              )}
              getCurrentIndex={setCurrentIndex}
            />
          </View>
          <GenericCarouselPagination
            items={data}
            dotSpacing={4}
            dotSize={4}
            activeDotColor="eggplant"
            inactiveDotColor="eggplant/60"
            currentIndex={currentIndex}
          />
          <View style={tw.style('px-4 pt-8')}>
            <SecondaryButton
              onPress={async () => {
                if (currentIndex < data.length - 1) {
                  scrollCarousel((currentIndex + 1) * itemLength);
                } else {
                  setIsFirst(false);
                  await AsyncStorage.setItem(storageKey, 'true');
                }
              }}
            >
              {currentIndex < data.length - 1 ? 'Next' : 'Got it'}
            </SecondaryButton>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
}
