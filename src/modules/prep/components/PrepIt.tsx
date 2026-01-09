import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import CircularHeader from '../../../modules/prep/components/CircularHeader';
import React, { useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import RenderHTML from 'react-native-render-html';
import {
  bodyLargeBold,
  bodyMediumRegular,
  h7TextStyle,
  tagStyles,
} from '../../../theme/typography';

export default function PrepIt({
  shortDescription,
  description,
}: {
  shortDescription: string;
  description: string | null;
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  /* https://github.com/gorhom/react-native-bottom-sheet/issues/1560#issuecomment-1750466864
  Added fixes for ios / android users who uses reduce motion */
  const reducedMotion = useReducedMotion();

  // Stabilize RenderHTML props
  const contentWidth = useMemo(() => Dimensions.get('window').width - 40, []);
  const defaultViewProps = useMemo(() => ({ style: tw`m-0 p-0` }), []);
  const defaultTextProps = useMemo(
    () => ({ style: tw.style(bodyMediumRegular, 'pt-2.5 text-stone') }),
    [],
  );

  // callbacks
  const handlePresentModalPress = () => {
    setIsModalVisible(true);
  };
  const handlePresentModalDismiss = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={tw.style('pt-4.5 px-5')}>
      <CircularHeader title="prep it" />
      <Text style={tw.style('pt-4 text-left', bodyMediumRegular)}>
        {shortDescription}
      </Text>

      {description && (
        <Pressable onPress={handlePresentModalPress} style={tw.style('pt-2.5')}>
          <Text
            style={tw.style(
              bodyMediumRegular,
              'text-eggplant-vibrant underline',
            )}
          >
            Read more...
          </Text>
        </Pressable>
      )}

      {description && (
        <Modal
          animationType={reducedMotion ? 'none' : 'slide'}
          transparent
          visible={isModalVisible}
          onRequestClose={handlePresentModalDismiss}
        >
          <View style={tw`flex-1 bg-black bg-opacity-70`}>
            <View
              style={tw.style(
                'absolute bottom-0 left-0 right-0 max-h-[90%] overflow-hidden rounded-t-2.5xl border border-strokecream bg-white',
              )}
            >
              <ScrollView style={tw.style('px-5')}>
                <View style={tw.style('items-end py-4')}>
                  <Pressable onPress={handlePresentModalDismiss}>
                    <Feather name={'x'} size={16} color="black" />
                  </Pressable>
                </View>
                <View style={tw.style('items-center justify-center')}>
                  <Text style={tw.style(h7TextStyle, 'text-center')}>Prep it</Text>
                </View>
                <View style={tw.style('pb-[50px] pt-[22px]')}>
                  <Text style={tw.style(bodyLargeBold, 'text-stone')}>
                    {shortDescription}
                  </Text>
                  <RenderHTML
                    source={{ html: description || '' }}
                    contentWidth={contentWidth}
                    tagsStyles={tagStyles}
                    defaultViewProps={defaultViewProps}
                    defaultTextProps={defaultTextProps}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
