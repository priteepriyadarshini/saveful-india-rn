import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import * as WebBrowser from 'expo-web-browser';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import {
  Dimensions,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { h5TextStyle, bodyLargeRegular, h6TextStyle, bodyMediumRegular, bodyMediumBold, bodySmallRegular } from '../../../theme/typography';

export default function ResultsScreen() {
  //const linkTo = useLinkTo();
  const navigation = useNavigation();
  
  const insets = useSafeAreaInsets();
  const { sendScrollEventInitiation } = useAnalytics();
  const paddingTop = `pt-[${insets.top}px]`;

  return (
    <View style={tw`relative flex-1 border bg-eggplant ${paddingTop}`}>
      <ImageBackground
        style={tw.style('absolute left-0 top-0')}
        imageStyle={{
          resizeMode: 'contain',
          width: Dimensions.get('screen').width,
          height: (Dimensions.get('screen').width * 760) / 375,
        }}
        source={require('../../../../assets/placeholder/purple-line.png')}
      />
      <View style={tw.style(`flex-row items-start justify-between px-3 py-4 `)}>
        <Pressable
          onPress={() => 
            navigation.goBack()
          }
        >
          <Feather name={'arrow-left'} size={20} color="white" />
        </Pressable>
        <Pressable
          onPress={() => 
            navigation.goBack()
          }
        >
          <Feather name={'x'} size={20} color="white" />
        </Pressable>
      </View>
      <ScrollView
        scrollEventThrottle={1}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          sendScrollEventInitiation(event, 'Results Page Interacted');
        }}
        contentContainerStyle={tw.style('w-full')}
      >
        <View style={tw.style('relative z-10')}>
          <View style={tw.style('w-full items-center px-5 pb-[144px]')}>
            <Text
              style={tw.style(h5TextStyle, 'pb-2 pt-7 text-center text-white')}
              maxFontSizeMultiplier={1}
            >
              How are your results calculated?
            </Text>
          </View>
        </View>
        <Image
          resizeMode="contain"
          style={tw`absolute left-1/2 top-[85px] z-10 -ml-[133px] w-[267px]`}
          source={require('../../../../assets/placeholder/banana-peel.png')}
          accessibilityIgnoresInvertColors
        />
        <View style={tw.style('pb-15 pt-30 bg-creme px-5')}>
          <Text
            style={tw.style(
              h5TextStyle,
              'pb-4 pt-[35px] text-left text-eggplant',
            )}
            maxFontSizeMultiplier={1}
          >
            Reducing food waste is a team sport
          </Text>
          <Text
            style={tw.style(bodyLargeRegular, 'text-left text-black')}
            maxFontSizeMultiplier={1.5}
          >
            {`And we’re so glad you’re in the club to save more food together. Without doing bin audits, food waste can be tricky to measure (even the experts agree). That’s why we’ve made our surveys and tracking tool as fast, simple and easy to use as possible.\n\nEvery time you cook a Saveful meal, we’re assuming you’re using up food you already have – and saving it from the bin. So, we count any ingredient you’ve used and indicated was already in your kitchen, as food potentially saved.\n\nHere’s how we’ve estimated your potential savings, using some assumptions and averages.`}
          </Text>
        </View>
        <View
          style={tw.style(
            'border-t border-strokecream  bg-white px-5 py-10 pt-5',
          )}
        >
          <View>
            <Text
              style={tw.style(
                h6TextStyle,
                'pb-4 pt-[35px] text-left text-eggplant',
              )}
            >
              Pre-make survey AND OVERALL TRACK RESULTS
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-left text-black')}>
              Your
              <Text style={tw.style(bodyMediumBold)}>
                {` potential total food savings in kg from frameworks made`}
              </Text>
              {` is calculated based on the total average weights of any ingredient you use in all the frameworks you make.\n\nYour `}
              <Text style={tw.style(bodyMediumBold)}>
                {`potential total food savings in dollars`}
              </Text>
              {`  is calculated by multiplying your potential total food savings in kg from frameworks made by the average price of food per kg in Australia`}
              <Text
                style={tw.style(bodyMediumRegular, {
                  textAlignVertical: 'top',
                  fontSize: 12,
                })}
              >{`#`}</Text>
              .
            </Text>
          </View>
          <View style={tw`gap-4`}>
            <Text
              style={tw.style(
                h6TextStyle,
                'pb-4 pt-[35px] text-left text-eggplant',
              )}
            >
              Weekly survey and past week’s results
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-left text-black')}>
              Your weekly results are calculated week on week, or from survey to
              survey – whichever is most recent.
            </Text>

            <Text style={tw.style(bodyMediumRegular, 'text-left text-black')}>
              Your
              <Text style={tw.style(bodyMediumBold)}>
                {` overall potential weekly food waste/saving in kg`}
              </Text>
              {` is calculated by units of food item (scraps, leftovers and whole food items reported as wasted) x the average weight of that item.`}
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-left text-black')}>
              Your
              <Text style={tw.style(bodyMediumBold)}>
                {` potential food waste/savings to dollars`}
              </Text>
              {` is figured out by multiplying your total food waste/saving x the average price of food per kg in Australia`}
              <Text
                style={tw.style(bodyMediumRegular, {
                  textAlignVertical: 'top',
                  fontSize: 12,
                })}
              >{`#`}</Text>
              .
            </Text>

            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  'https://watchmywaste.com.au/food-waste-greenhouse-gas-calculator/',
                )
              }
            >
              <Text style={tw.style(bodyMediumRegular, 'text-left text-black')}>
                Your
                <Text style={tw.style(bodyMediumBold)}>
                  {` potential food waste/savings to CO2 emissions `}
                </Text>
                {`is calculated based on a conversion ratio sourced from `}
                <Text style={tw.style(bodyMediumBold, 'underline')}>
                  {`greenhouse gas calculator.`}
                </Text>
              </Text>
            </Pressable>
          </View>
          <View
            style={tw.style(
              'p-4= mt-[37px] rounded-[10px] border border-strokecream bg-creme',
            )}
          >
            {/* <Text style={tw.style(bodySmallRegular)}>
              {`^ Total waste equates to about 312kg of food waste per person every year – or 15kg of waste per week per household based on a 2.5 person household, `}
            </Text>
            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  'https://aifs.gov.au/research/facts-and-figures/population-households-and-families#:~:text=While%20the%20number%20of%20households,%2C%20at%202.5%2C%20in%202021',
                )
              }
            >
              <Text style={tw.style(bodySmallRegular, 'underline')}>
                {`Australian Insititute of Family Studies.`}
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  'https://www.dcceew.gov.au/environment/protection/waste/food-waste',
                )
              }
            >
              <Text style={tw.style(bodySmallRegular, 'underline')}>
                {`\n* Department of Climate Change, Energy, the Environment and Water`}
              </Text>
            </Pressable> */}
            <Text style={tw.style(bodySmallRegular)}>
              {`# Total average cost of food per kg sourced from Fight Food Waste’s Household Survey data.`}
            </Text>
          </View>
        </View>
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
