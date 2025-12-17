import { useLinkTo, useNavigation } from '@react-navigation/native';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import {
  bodySmallRegular,
  counterLarge,
  h7TextStyle,
  subheadMediumUppercase,
} from '../../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SurveyStackParamList } from '../navigation/SurveyNavigator';

const paddingInnerContent = Dimensions.get('window').width - 70;
export default function TrackResult({
  foodSaved,
  handlePresentModalDismiss,
  setIsCompleted,
}: {
  foodSaved: number;
  handlePresentModalDismiss: () => void;
  setIsCompleted: (value: boolean) => void;
}) {
  
  //const linkTo = useLinkTo();
  const navigation = useNavigation<NativeStackNavigationProp<SurveyStackParamList>>();

  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  return (
    <View style={tw.style('h-full items-center px-5')}>
      <Image
        style={tw`mx-auto h-[235px] w-[190px]`}
        resizeMode="contain"
        source={require('../../../../assets/placeholder/bowl.png')}
        accessibilityIgnoresInvertColors
      />
      <Text
        style={tw.style(h7TextStyle, 'pb-1.5 pt-7 text-center text-white')}
        maxFontSizeMultiplier={1}
      >
        this dish saved around
      </Text>
      <View
        style={tw.style('w-full items-center rounded-full bg-radish py-1.5')}
      >
        <Text
          style={tw.style(counterLarge, 'text-[50px] text-eggplant')}
          maxFontSizeMultiplier={1}
        >
          {`${(foodSaved / 1000).toFixed(2)}kg`}
        </Text>
        <Text style={[tw.style(subheadMediumUppercase, 'mt-1 text-eggplant')]}>
          of food waste
        </Text>
      </View>
      <Text
        style={tw.style(h7TextStyle, 'pb-3.5 pt-7 text-center text-white')}
        maxFontSizeMultiplier={1}
      >
        Small bites. big savings
      </Text>
      <Text style={tw.style(bodySmallRegular, 'pb-2 text-center text-white')}>
        Making a meal like this five times a week adds up to significant savings
        every month.
      </Text>
      {/* <TrackFeed /> */}

      <View style={tw.style(`w-[${paddingInnerContent}px] py-6 `)}>
        <PrimaryButton
          buttonSize="large"
          style={tw.style('mb-2')}
          onPress={() => {
            handlePresentModalDismiss();
            setIsCompleted(false);
          }}
        >
          Done
        </PrimaryButton>
        <Pressable
          onPress={() => {
            sendAnalyticsEvent({
              event: mixpanelEventName.actionClicked,
              properties: {
                location: newCurrentRoute,
                action: mixpanelEventName.foorprintInfoOpened,
              },
            });
            navigation.navigate('Results');
          }}
        >
          <Text
            style={tw.style(
              bodySmallRegular,
              'mt-3 text-center text-white underline',
            )}
          >
            how was this calculated?
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
