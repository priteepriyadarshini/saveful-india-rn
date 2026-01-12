import { Feather } from '@expo/vector-icons';
// Replacing BottomSheet with a reliable RN Modal for consistent display
import tw from '../../../common/tailwind';
import { IHackOrTip } from '../../../models/craft';
import { hackOrTipApiService } from '../../hackOrTip/api/hackOrTipApiService';
import { transformHackOrTip } from '../../hackOrTip/helpers/transformers';
import HackOrTipSponsor from '../../../modules/make/components/HackOrTipSponsor';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import RenderHTML from 'react-native-render-html';
import {
  bodyLargeBold,
  bodyMediumRegular,
  h7TextStyle,
  subheadLargeUppercase,
  subheadMediumUppercase,
  tagStyles,
} from '../../../theme/typography';

export default function HackOrTip({
  id,
  maxHeight = 0,
  setMaxHeight,
}: {
  id: string;
  maxHeight?: number;
  setMaxHeight?: (value: number) => void;
}) {
  // Modal visibility state (replaces BottomSheet)
  const [isModalVisible, setIsModalVisible] = useState(false);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const handlePresentModalDismiss = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const [hackOrTip, setHackOrTip] = React.useState<IHackOrTip>();

  const getHackOrTipData = async () => {
    try {
      const apiData = await hackOrTipApiService.getHackOrTipById(id);
      const transformed = transformHackOrTip(apiData);
      setHackOrTip(transformed);
    } catch (error) {
      console.error('Failed to load HackOrTip from API', error);
    }
  };

  /* https://github.com/gorhom/react-native-bottom-sheet/issues/1560#issuecomment-1750466864
  Added fixes for ios / android users who uses reduce motion */
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    getHackOrTipData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!hackOrTip) return null;

  let icon: 'zap' | 'star' = 'star';
  let title = '';
  switch (hackOrTip.hackOrTipType) {
    case 'miniHack':
      icon = 'zap';
      title = 'Mini hack';
      break;
    case 'proTip':
      icon = 'star';
      title = 'Pro tip';
      break;
    case 'servingSuggestion':
      icon = 'star';
      title = 'Serving suggestion';
      break;
    default:
      icon = 'star';
      title = 'Mini hack';
      break;
  }

  return (
    <>
      <View
        style={[
          tw.style(`gap-3 rounded bg-mint p-4 pb-5 min-h-[${maxHeight}px]`),
          // cardMintDrop,
        ]}
        onLayout={event => {
          const height = event.nativeEvent.layout.height;
          if (setMaxHeight && height > maxHeight) {
            setMaxHeight(height);
          }
        }}
      >
        <View style={tw`flex-row items-center justify-between gap-3`}>
          <View style={tw.style('flex-row items-center gap-3')}>
            <Feather name={icon} size={24} color={tw.color('black')} />
            <Text style={tw.style(subheadLargeUppercase)}>{title}</Text>
          </View>
          {hackOrTip.sponsor && hackOrTip.sponsor[0] && (
            <HackOrTipSponsor
              sponsorTitle={hackOrTip.sponsorHeading}
              {...hackOrTip.sponsor[0]}
            />
          )}
        </View>

        <View>
          <Text style={tw.style(bodyMediumRegular)}>
            {hackOrTip.shortDescription}
          </Text>

          {hackOrTip.description && (
            <Pressable
              onPress={handlePresentModalPress}
              style={tw.style(
                'mt-3 self-center rounded-full bg-kale px-4 py-1',
              )}
            >
              <Text style={tw.style(subheadMediumUppercase, 'text-white')}>
                Read more
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {hackOrTip.description && (
        <Modal
          animationType={reducedMotion ? 'none' : 'slide'}
          transparent
          visible={isModalVisible}
          onRequestClose={handlePresentModalDismiss}
        >
          <View style={tw`flex-1 bg-black bg-opacity-70`}>
            <View
              style={tw.style(
                'absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-2.5xl border border-strokecream bg-white',
              )}
            >
              <ScrollView style={tw.style('px-5')}>
                <View style={tw.style('items-end py-4')}>
                  <Pressable onPress={handlePresentModalDismiss}>
                    <Feather name={'x'} size={16} color="black" />
                  </Pressable>
                </View>
                <View style={tw.style('items-center justify-center')}>
                  <Text style={tw.style(h7TextStyle)}>{title}</Text>
                </View>
                <View style={tw.style('pb-[50px] pt-[22px]')}>
                  <Text style={tw.style(bodyLargeBold, 'text-stone')}>
                    {hackOrTip.shortDescription}
                  </Text>
                  <RenderHTML
                    source={{
                      html: hackOrTip.description || '',
                    }}
                    contentWidth={Dimensions.get('window').width - 40}
                    tagsStyles={tagStyles}
                    defaultViewProps={{
                      style: tw`m-0 p-0`,
                    }}
                    defaultTextProps={{
                      style: tw.style(bodyMediumRegular, 'pt-2.5 text-stone'),
                    }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
