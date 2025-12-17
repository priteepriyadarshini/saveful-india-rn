import tw from '../../../common/tailwind';
import { LocationMetadata } from '../../../modules/intro/api/types';
import PostcodeAutocomplete from '../../../modules/intro/components/PostcodeAutocomplete';
import React, { useState } from 'react';
import { Control, UseFormSetValue } from 'react-hook-form';
import { Image, ImageRequireSource, Text, View } from 'react-native';
import {
  bodyLargeRegular,
  h2TextStyle,
  h4TextStyle,
  subheadLarge,
  subheadMediumUppercase,
  subheadSmall,
} from '../../../theme/typography';

// const isIPhoneXAndAbove = Dimensions.get('screen').height >= 812;

export default function OnboardingItemHeader({
  image,
  heading,
  welcomeMessage,
  subHeading,
  description,
  bigHeading,
  subDescription,
  showPostcodeInput,
  // control,
  itemId,
  setValue,
}: {
  itemId?: number;
  image?: ImageRequireSource;
  heading?: string;
  welcomeMessage?: string;
  subHeading?: string;
  description: string;
  bigHeading?: string;
  subDescription?: string;
  showPostcodeInput?: boolean;
  control: Control<any, any>;
  setValue: UseFormSetValue<any>;
}) {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationMetadata | null>(null);

  return (
    <>
      <View style={tw.style('gap-6', showPostcodeInput ? '' : 'pt-6')}>
        <View style={tw`items-center gap-2`}>
          {!showPostcodeInput && heading && (
            <Text
              style={tw.style(
                h4TextStyle,
                `text-center ${itemId === 7 ? 'max-w-[300px]' : 'w-full'}`,
              )}
              maxFontSizeMultiplier={1}
            >
              {heading}
            </Text>
          )}
          {bigHeading && (
            <Text
              style={tw.style(h2TextStyle, `w-full text-center`)}
              maxFontSizeMultiplier={1}
            >
              {bigHeading}
            </Text>
          )}
          {subDescription && (
            <Text
              style={tw.style(
                bodyLargeRegular,
                `pt-2 text-center text-midgray`,
              )}
              maxFontSizeMultiplier={1.5}
            >
              {subDescription}
            </Text>
          )}
          {image && (
            <Image
              style={tw.style(
                `mx-auto ${
                  itemId === 7 ? 'my-7' : 'mb-7'
                } h-[290px] max-w-full`,
              )}
              resizeMode="contain"
              source={image}
            />
          )}
          {showPostcodeInput && heading && (
            <Text
              style={tw.style(h4TextStyle, 'mb-5 text-center')}
              maxFontSizeMultiplier={1}
            >
              {heading}
            </Text>
          )}
          {welcomeMessage && (
            <Text
              style={tw.style(subheadLarge, 'text-center')}
              maxFontSizeMultiplier={1}
            >
              {welcomeMessage}
            </Text>
          )}
          {subHeading && (
            <Text
              style={tw.style(subheadSmall, `text-center text-midgray`)}
              maxFontSizeMultiplier={1}
            >
              {subHeading}
            </Text>
          )}
          {showPostcodeInput && (
            <View style={tw`mb-4.5 w-full flex-1`}>
              {description && (
                <View style={tw.style('items-center')}>
                  <Text
                    style={tw.style(
                      bodyLargeRegular,
                      `w-80 pb-5 text-center text-midgray`,
                    )}
                    maxFontSizeMultiplier={1.5}
                  >
                    {description}
                  </Text>
                </View>
              )}
              <Text
                style={[
                  tw.style(
                    subheadMediumUppercase,
                    'pb-2 text-center text-stone',
                  ),
                ]}
                maxFontSizeMultiplier={1}
              >
                Your postcode
              </Text>

              <PostcodeAutocomplete
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                setValue={setValue}
                containerStyle={tw`mx-5`}
                textStyles={tw`text-center`}
              />

              {/* <ControlledTextInput
                  name="postcode"
                  control={control}
                  placeholder="Enter your postcode"
                  textStyles={tw`text-center`}
                  containerStyle={tw`mx-5`}
                  inputMode="numeric"
                  returnKeyType="done"
                /> */}
            </View>
          )}
        </View>
        {!showPostcodeInput && description && (
          <View style={tw.style('items-center')}>
            <Text
              style={tw.style(
                bodyLargeRegular,
                `text-center text-midgray ${itemId === 7 ? 'pt-7' : 'pt-4'} ${
                  itemId === 9 ? 'w-[300px]' : ''
                }`,
              )}
              maxFontSizeMultiplier={1.5}
            >
              {description}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
