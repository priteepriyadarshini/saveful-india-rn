import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import {
  GenericCarouselFlatlist,
  GenericCarouselWrapper,
} from '../../../common/components/GenericCarousel';
import GenericCarouselPagination from '../../../common/components/GenericCarousel/GenericCarouselPagination';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import {
  useGetUserTrackSurveyEligibilityQuery,
  useGetUserTrackSurveysQuery,
} from '../../../modules/track/api/api';
import { WEEKLYSURVEY } from '../../../modules/track/data/data';
import moment from 'moment';
import React from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Text,
  View,
} from 'react-native';
import {
  bodyLargeMedium,
  bodySmallRegular,
  h2TextStyle,
  subheadSmallUppercase,
} from '../../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SurveyStackParamList } from '../navigation/SurveyNavigator';

interface RenderItemProps {
  id: number;
  isBest: boolean;
  title: string;
  value: string;
  image: string;
  output: string;
  status: string;
}

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

function WeeklySurveyCard({
  isBest,
  image,
  output,
  value,
  status,
}: RenderItemProps) {
  return (
    <View style={{ width: itemLength }}>
      <View
        style={tw`mr-2 items-center overflow-hidden rounded-[10px] border border-eggplant-light bg-white px-[25px] pb-5 pt-4`}
      >
        {isBest && (
          <View
            style={[
              tw.style(
                'right-45 -left-22 absolute top-9 w-[267px] bg-mint px-2.5 py-1',
              ),
              {
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          >
            <View style={tw.style('overflow-hidden')}>
              <Text
                style={[
                  tw.style(subheadSmallUppercase, 'text-center'),
                  { letterSpacing: 1 },
                ]}
              >
                Personal Best!
              </Text>
            </View>
          </View>
        )}
        <Image
          resizeMode="contain"
          style={tw.style('h-[88px]')}
          source={image as ImageSourcePropType}
          accessibilityIgnoresInvertColors
        />
        <View style={tw.style('flex-row items-center justify-center')}>
          {status && (
            <View
              style={tw.style(
                `mr-2 h-[28.5px] w-[28.5px] items-center justify-center rounded-full ${
                  status === 'less' ? 'bg-mint' : 'bg-strokecream'
                }`,
              )}
            >
              <Feather
                name={status === 'less' ? 'arrow-down' : 'arrow-up'}
                size={24}
                color={tw.color('black')}
              />
            </View>
          )}
          <Text
            style={tw.style(h2TextStyle, 'mt-1.5')}
            maxFontSizeMultiplier={1}
          >
            {value}
          </Text>
        </View>
        <Text style={tw.style(subheadSmallUppercase, 'mt-1 text-stone')}>
          {output}
        </Text>
      </View>
    </View>
  );
}

interface SurveyDateProps {
  nextSurveyDate: string;
}

function CurrentSurveyCompleted({ nextSurveyDate }: SurveyDateProps) {
  return (
    <View style={tw`relative border border-strokecream bg-white px-5 py-8`}>
      {/* <LinearGradient
        colors={['#F3E9DA', '#F3E9DA00']}
        start={[0, 0]}
        end={[0, 1]}
        style={tw`absolute left-0 right-0 top-0 h-8`}
      /> */}
      <Text style={tw.style(bodyLargeMedium, 'text-center')}>
        You’re all up to date!
      </Text>
      <Text style={tw.style(bodySmallRegular, 'mx-10 mt-2 text-center')}>
        You’ve already completed your weekly survey – nice work!
      </Text>
      <Text style={tw.style(bodySmallRegular, 'mt-2 text-center')}>
        {`The next one will be available on ${moment(nextSurveyDate).format(
          'Do MMM',
        )}.`}
      </Text>
      {/* <LinearGradient
        colors={['#F3E9DA00', '#F3E9DA']}
        start={[0, 0]}
        end={[0, 1]}
        style={tw`absolute bottom-0 left-0 right-0 h-8`}
      /> */}
    </View>
  );
}

function FirstSurveyDate({ nextSurveyDate }: SurveyDateProps) {
  return (
    <View style={tw`relative border border-strokecream bg-white px-5 py-8`}>
      <Text style={tw.style(bodyLargeMedium, 'text-center')}>
        You’re all up to date!
      </Text>
      <Text style={tw.style(bodySmallRegular, 'mt-2 text-center')}>
        {`Your survey will be available on ${moment(nextSurveyDate).format(
          'Do MMM',
        )}.`}
      </Text>
    </View>
  );
}

export default function WeeklySurveyCarousel() {
  //const linkTo = useLinkTo();
  const navigation = useNavigation<NativeStackNavigationProp<SurveyStackParamList>>();

  const { data: userSurveys } = useGetUserTrackSurveysQuery();
  const { data: eligibilityData } = useGetUserTrackSurveyEligibilityQuery();

  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  if (!userSurveys || !eligibilityData) {
    return null;
  }

  if (userSurveys.length === 0) {
    return (
      <View style={tw`px-5`}>
        <View
          style={tw`rounded-2lg border border-eggplant-light bg-white p-5 pt-3`}
        >
          <Image
            resizeMode="contain"
            style={tw.style('mx-auto mb-3 h-[88px] w-[89px]')}
            source={require('../../../../assets/placeholder/big-savings.png')}
            accessibilityIgnoresInvertColors
          />
          <Text style={tw.style(bodyLargeMedium, 'text-center')}>
            Your savings are stored here!
          </Text>
          <Text style={tw.style(bodySmallRegular, 'mt-2 text-center')}>
            When you complete your weekly survey, you’ll be able to see your
            most recent results here.
          </Text>
        </View>
        <View style={tw`mt-3 gap-2`}>
          {eligibilityData.eligible ? (
            <SecondaryButton
              onPress={() => {
                navigation.navigate('SurveyWeekly');
              }}
            >
              Take your weekly survey now
            </SecondaryButton>
          ) : (
            <FirstSurveyDate
              nextSurveyDate={eligibilityData.next_survey_date}
            />
          )}
        </View>
      </View>
    );
  }

  const data = WEEKLYSURVEY({
    co2Savings: userSurveys[0].co2_savings,
    costSavings: userSurveys[0].cost_savings,
    foodSaved: userSurveys[0].food_saved,
  });

  const isEligible = eligibilityData.eligible;

  if (!data || data.length === 0) {
    return null;
  }

  if (userSurveys.length === 1) {
    return (
      <View>
        <View
          style={tw`mx-5 rounded-2lg border border-eggplant-light bg-white p-5 pt-3`}
        >
          <Image
            resizeMode="contain"
            style={tw.style('mx-auto mb-3 h-[88px] w-[89px]')}
            source={require('../../../../assets/placeholder/big-savings.png')}
            accessibilityIgnoresInvertColors
          />
          <Text style={tw.style(bodyLargeMedium, 'text-center')}>
            Your savings are stored here!
          </Text>
          <Text style={tw.style(bodySmallRegular, 'mt-2 text-center')}>
            Complete next week’s survey to see how you are tracking!
          </Text>
        </View>
        <View style={tw`mt-3 gap-2 px-5`}>
          {isEligible ? (
            <SecondaryButton
              onPress={() => {
                navigation.navigate('SurveyWeekly');
              }}
            >
              Take your weekly survey now
            </SecondaryButton>
          ) : (
            <CurrentSurveyCompleted
              nextSurveyDate={eligibilityData.next_survey_date}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={tw.style('pb-8')}>
      <View style={tw.style('mx-5 pb-2.5')}>
        <Text
          style={[
            tw.style(bodySmallRegular, 'uppercase text-midgray'),
            { letterSpacing: 1 },
          ]}
        >
          your latest weekly survey results
        </Text>
      </View>

      <GenericCarouselWrapper style={tw.style(`relative overflow-hidden`)}>
        <GenericCarouselFlatlist
          section={'Weekly Survey'}
          contentContainerStyle={tw.style('pl-5 pr-3')}
          data={data}
          itemLength={itemLength}
          renderItem={(renderItem: {
            item: RenderItemProps;
            index: number;
          }) => <WeeklySurveyCard {...renderItem.item} />}
          getCurrentIndex={setCurrentIndex}
        />
        <View style={tw`mx-5 flex-row items-center justify-between py-5`}>
          <GenericCarouselPagination
            items={data}
            dotSpacing={4}
            dotSize={4}
            activeDotColor="eggplant"
            inactiveDotColor="eggplant/60"
            currentIndex={currentIndex}
          />
          {/* <Feather name="arrow-right" size={20} color={tw.color('kale')} /> */}
        </View>
      </GenericCarouselWrapper>

      {isEligible ? (
        <View style={tw`px-5`}>
          <View style={tw`gap-2`}>
            <SecondaryButton
              onPress={() => {
                navigation.navigate('SurveyWeekly');
              }}
            >
              Take your weekly survey now
            </SecondaryButton>
          </View>
        </View>
      ) : (
        <CurrentSurveyCompleted
          nextSurveyDate={eligibilityData.next_survey_date}
        />
      )}
    </View>
  );
}
