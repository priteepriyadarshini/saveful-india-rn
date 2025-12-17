import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import { Image, Modal, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
  h1TextStyle,
  h7TextStyle,
  subheadMediumUppercase,
} from '../../../theme/typography';

export default function CompletedCookWithSurvey({
  isModalVisible,
  totalWeightOfSelectedIngredients,
  setIsModalVisible,
}: {
  isModalVisible: boolean;
  totalWeightOfSelectedIngredients: number;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Modal animationType="fade" transparent={true} visible={isModalVisible}>
      <View
        style={tw`z-10 flex-1 items-center justify-center bg-black bg-opacity-0`}
      >
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          useNativeDriver
          style={tw`mx-5 rounded-2lg border bg-white pb-10`}
        >
          <View style={tw.style('items-center py-5')}>
            <Image
              source={require('../../../../assets/placeholder/bowl.png')}
              style={tw`flex-initial`}
              resizeMode="contain"
            />
          </View>
          <View style={tw`px-6`}>
            <Text
              style={tw.style(h7TextStyle, 'pt-4 text-center text-eggplant')}
              maxFontSizeMultiplier={1}
            >
              This meal will save
            </Text>
            <View
              style={tw`mt-2 w-full items-center rounded-[45px] bg-radish py-2`}
            >
              <Text style={tw.style(subheadMediumUppercase, 'text-eggplant')}>
                approximately
              </Text>
              <Text
                style={tw.style(h1TextStyle, 'text-eggplant')}
                maxFontSizeMultiplier={1}
              >
                {`${(totalWeightOfSelectedIngredients / 1000).toFixed(2)}kg`}
              </Text>
              <Text style={tw.style(subheadMediumUppercase, 'text-eggplant')}>
                of food waste
              </Text>
            </View>
            <View style={tw.style('py-7.5')}>
              <Text
                style={tw.style(h7TextStyle, 'text-center text-black')}
                maxFontSizeMultiplier={1}
              >
                Small bites. big savings
              </Text>
              <Text style={tw`pt-3.5 text-center text-midgray`}>
                It might not seem like much, but making a meal like this a few
                times a week can add up to significant savings every month.
              </Text>
            </View>
            <SecondaryButton
              style={tw`rounded-md`}
              onPress={() => setIsModalVisible(false)}
            >
              Close
            </SecondaryButton>
          </View>
        </Animatable.View>
      </View>
      <Image
        style={tw`absolute h-full w-full bg-eggplant opacity-80`}
        resizeMode="cover"
        source={require('../../../../assets/placeholder/background-modal.png')}
      />
    </Modal>
  );
}
