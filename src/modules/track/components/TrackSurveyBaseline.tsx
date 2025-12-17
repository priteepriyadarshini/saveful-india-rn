import tw from '../../../common/tailwind';
// import { TRACK } from 'modules/track/data/data';
import React, { Fragment, SetStateAction, useState } from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import {
  h2TextStyle,
  subheadMediumUppercase,
  subheadSmallUppercase,
} from '../../../theme/typography';

export default function TrackSurveyBaseline({
  waste = '0',
  spent = '0',
}: {
  waste: string;
  spent: string;
}) {
  const TRACK = [
    {
      name: 'food',
      value: `${Number(waste).toFixed(2)}kg`,
      description: `food waste footprint`,
      image: {
        uri: require('../../../../assets/placeholder/apple.png'),
      },
    },
    {
      name: 'money',
      value: `$${spent}`,
      description: `food waste cost`,
      image: {
        uri: require('../../../../assets/placeholder/money.png'),
      },
    },
  ];

  const [activeTab, setActiveTab] = useState(TRACK?.[0].name);

  const handleTabPress = (tabName: SetStateAction<string>) => {
    setActiveTab(tabName);
  };

  // if (!stats || isGetStatsLoading) return null;

  return (
    <View
      style={[
        tw.style(
          `relative items-center rounded-2lg border border-eggplant-vibrant bg-white pb-3 pt-5 w-[${
            Dimensions.get('window').width - 80
          }px]`,
        ),
        cardDrop,
      ]}
    >
      <View style={tw.style(`flex-row`)}>
        {TRACK.map((content, index) => {
          return (
            <Pressable
              key={index}
              style={tw.style(
                `items-center border border-strokecream px-2.5 py-1 ${
                  index === TRACK.length - 1
                    ? 'rounded-r-full'
                    : 'rounded-l-full'
                } ${
                  activeTab === content.name
                    ? 'border-creme-2 bg-white'
                    : 'border-creme-2 bg-creme-2'
                }`,
              )}
              onPress={() => handleTabPress(content.name)}
            >
              <Text
                style={tw.style(
                  subheadMediumUppercase,
                  activeTab === content.name ? 'text-black' : 'text-stone',
                )}
              >
                {content.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {TRACK.map((content, index) => {
        return (
          <Fragment key={index}>
            {activeTab === content.name && (
              <View style={tw.style('w-full items-center px-5 pb-6 pt-3')}>
                <Image
                  style={tw.style('mx-auto h-[101px] w-[89px]')}
                  resizeMode="contain"
                  source={content.image.uri as any}
                  accessibilityIgnoresInvertColors
                />
                <Text style={tw.style(h2TextStyle, 'mt-1')}>
                  {content.value}
                </Text>
                <Text
                  style={tw.style(
                    subheadSmallUppercase,
                    'text-center text-stone',
                  )}
                >
                  {content.description}
                </Text>
              </View>
            )}
          </Fragment>
        );
      })}
    </View>
  );
}
