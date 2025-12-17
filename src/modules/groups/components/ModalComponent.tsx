import { Feather } from '@expo/vector-icons';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Svg, { Line } from 'react-native-svg';
import { bodySmallRegular, h6TextStyle } from '../../../theme/typography';

export default function ModalComponent({
  preHeading,
  heading,
  description,
  divider,
  isModalVisible,
  setIsModalVisible,
  primaryButton,
  secondaryButton,
  children,
  footerComponent,
  horizontalPadding = true,
}: {
  preHeading?: ReactNode;
  heading: string;
  description?: string;
  divider?: boolean;
  isModalVisible: boolean;
  setIsModalVisible: any;
  primaryButton?: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
  };
  children?: ReactNode;
  footerComponent?: ReactNode;
  horizontalPadding?: boolean;
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isModalVisible}
      statusBarTranslucent
    >
      <View
        style={[
          tw.style('z-10 flex-1 items-center justify-center px-5'),
          { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
        ]}
      >
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          useNativeDriver
          style={tw.style(
            'w-full rounded-2xl border border-strokecream bg-creme py-6',
            horizontalPadding ? 'px-5' : '',
          )}
        >
          {preHeading}

          {/* Header */}
          <View style={tw`absolute right-0 top-6 z-10`}>
            <Pressable
              onPress={() => {
                setIsModalVisible(false);
              }}
              style={tw.style('h-11 w-11 items-center justify-center')}
            >
              <Feather name="x" size={24} color={tw.color('black')} />
            </Pressable>
          </View>

          <View
            style={tw.style(
              `mx-6 justify-center`,
              heading === '' ? '' : 'min-h-11',
            )}
          >
            <Text style={tw.style(h6TextStyle, 'text-center text-eggplant')}>
              {heading}
            </Text>
          </View>

          {description && (
            <View style={tw.style(`mt-4`, divider ? '' : 'mb-6')}>
              <Text
                style={tw.style(
                  bodySmallRegular,
                  'flex-wrap text-center text-midgray',
                )}
                maxFontSizeMultiplier={1}
              >
                {description}
              </Text>
            </View>
          )}

          {divider && (
            <View style={tw.style('py-6')}>
              <Svg height="2px" width="100%">
                <Line
                  x1="0"
                  y1={1}
                  x2="100%"
                  y2={1}
                  stroke={tw.color('strokecream')}
                  strokeDasharray={undefined}
                />
              </Svg>
            </View>
          )}

          {/* Children */}
          {children}

          {/* Buttons */}
          <View style={tw.style(`gap-2`, horizontalPadding ? '' : 'mx-5')}>
            {/* Primary button */}
            {primaryButton && (
              <SecondaryButton
                onPress={primaryButton.onPress}
                disabled={primaryButton.disabled}
                loading={primaryButton.loading}
              >
                {primaryButton.text}
              </SecondaryButton>
            )}

            {/* Secondary button */}
            {secondaryButton && (
              <SecondaryButton
                onPress={secondaryButton.onPress}
                disabled={secondaryButton.disabled}
              >
                {secondaryButton.text}
              </SecondaryButton>
            )}
          </View>

          {/* Footer */}
          {footerComponent}
        </Animatable.View>
      </View>
    </Modal>
  );
}
