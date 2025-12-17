import tw from '../../../common/tailwind';
// import { TRACK } from 'modules/track/data/data';
import React, { Fragment, SetStateAction, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import { subheadMediumUppercase } from '../../../theme/typography';
import ChartContent from './ChartContent';
import { useGetStatsQuery } from '../api/api';

export default function TrackTabChart() {
  const { data: stats } = useGetStatsQuery();

  // MOCK DATA
  // const stats = {
  //   food_savings_user: 12.5,
  //   total_cost_savings: 87.3,
  //   completed_meals_count: 18,
  // };


  const TRACK = [
    {
      name: 'food',
      heading: 'you’ve potentially saved',
      value: `${Number(stats?.food_savings_user ?? 0).toFixed(2)}kg`,
      description: `by cooking ${stats?.completed_meals_count} saveful meals`,
      image: {
        uri: require('../../../../assets/track/food.png'),
      },
    },
    {
      name: 'money',
      heading: 'you’ve potentially saved',
      value: `$${stats?.total_cost_savings}`,
      description: `by cooking ${stats?.completed_meals_count} saveful meals`,
      image: {
        uri: require('../../../../assets/track/money.png'),
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
          `relative items-center rounded-2lg border border-eggplant-vibrant bg-white pb-3 pt-5`,
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
                    ? 'rounded-r-[11px]'
                    : 'rounded-l-[11px]'
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
            {activeTab === content.name && <ChartContent item={content} />}
          </Fragment>
        );
      })}
    </View>
  );
}
