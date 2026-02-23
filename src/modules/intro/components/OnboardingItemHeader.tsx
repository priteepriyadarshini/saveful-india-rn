import tw from '../../../common/tailwind';
import { LocationMetadata } from '../../../modules/intro/api/types';
import PostcodeAutocomplete from '../../../modules/intro/components/PostcodeAutocomplete';
import React, { useState } from 'react';
import { Control, UseFormSetValue } from 'react-hook-form';
import { Image, ImageRequireSource, Text, TextInput, View, Pressable, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  bodyLargeRegular,
  bodyMediumRegular,
  h2TextStyle,
  h4TextStyle,
  h6TextStyle,
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
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [pincode, setPincode] = useState('');

  const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'NZ', name: 'New Zealand' },
  ];

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
                Your country
              </Text>

              <View style={tw`mx-5`}>
                <Pressable
                  style={tw`flex-row items-center justify-between overflow-hidden rounded-md border border-strokecream bg-white px-4 py-3`}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={tw.style(bodyMediumRegular, selectedCountry ? 'text-stone' : 'text-midgray')}>
                    {selectedCountry || 'Select your country'}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#666" />
                </Pressable>
              </View>

              {/* Pin/Post/Zip code input */}
              <View style={tw`mt-4`}>
                <Text
                  style={[
                    tw.style(
                      subheadMediumUppercase,
                      'pb-2 text-center text-stone',
                    ),
                  ]}
                  maxFontSizeMultiplier={1}
                >
                  Your pin / post / zip code
                </Text>
                <View style={tw`mx-5`}>
                  <TextInput
                    style={tw.style(
                      bodyMediumRegular,
                      'overflow-hidden rounded-md border border-strokecream bg-white px-4 py-3 text-stone',
                    )}
                    placeholder="e.g. 752055"
                    placeholderTextColor={tw.color('midgray')}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    maxLength={10}
                    value={pincode}
                    onChangeText={(text) => {
                      setPincode(text);
                      setValue('pincode', text);
                    }}
                  />
                </View>
              </View>
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
      
      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity 
          style={tw`flex-1 bg-black/50 justify-end`}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={tw`bg-white rounded-t-3xl px-5 py-6`}>
            <Text style={tw.style(h6TextStyle, 'text-center mb-4')}>Select Your Country</Text>
            <ScrollView style={tw`max-h-96`}>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={tw`py-4 border-b border-stone/10`}
                  onPress={() => {
                    setSelectedCountry(country.name);
                    setValue('postcode', country.code);
                    setValue('suburb', country.name);
                    // Store the ISO code so getCurrencySymbol works correctly
                    setValue('country', country.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={tw`text-base ${selectedCountry === country.name ? 'font-bold text-radish' : 'text-stone'}`}>
                    {country.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
