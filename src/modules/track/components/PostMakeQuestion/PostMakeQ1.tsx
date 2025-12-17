import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import { bundledSource } from '../../../../common/helpers/uriHelpers';
import tw from '../../../../common/tailwind';
import { IFramework } from '../../../../models/craft';
import useEnvironment from '../../../environment/hooks/useEnvironment';
import React from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ScrollView } from 'react-native-gesture-handler';
import { h6TextStyle, bodyMediumRegular } from '../../../../theme/typography';


export default function PostMakeQ1({
  framework,
  item,
  setNextIndex,
  setDislikeStatus,
  setDidYouLikeIt,
}: {
  framework: IFramework;
  item?: any;
  setNextIndex: (index: number) => void;
  handlePresentModalDismiss: () => void;
  setDislikeStatus: (value: string) => void;
  setDidYouLikeIt: (value: boolean) => void;
}) {
  const env = useEnvironment();

  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [feedbackStatus, setFeedbackStatus] = React.useState(false);
  const [flavourStatus, setFlavourStatus] = React.useState('');

  // const handleButtonPress = (option: SetStateAction<string>) => {
  //   if (option === 'no') {
  //     onFeedbackComplete(false);
  //   }
  // };

  const setStatus = (value: string) => {
    setFlavourStatus(value);
    setDislikeStatus(value);
  };

  const onPressFlavorStatus = (index: number) => {
    switch (index) {
      case 0: {
        setStatus('bland');
        break;
      }
      case 1: {
        setStatus('spice');
        break;
      }
      case 2: {
        setStatus('soggy');
        break;
      }
      case 3: {
        setStatus('effort');
        break;
      }
      case 4: {
        setStatus('vibe');
        break;
      }
      default: {
        setStatus('bland');
        break;
      }
    }
    setCurrentIndex(2);
  };

  const tasteImage = (value: string) => {
    switch (value) {
      case 'bland':
        return require('../../../../../assets/placeholder/shakers.png');

      case 'spicy':
        return require('../../../../../assets/placeholder/post-spice.png');

      case 'soggy':
        return require('../../../../../assets/placeholder/post-soggy.png');

      case 'effort':
        return require('../../../../../assets/placeholder/post-effort.png');

      case 'vibe':
        return require('../../../../../assets/placeholder/post-vibe.png');

      default:
        return require('../../../../../assets/placeholder/shakers.png');
    }
  };

  return (
    <View style={tw`h-full w-full items-center justify-between px-5`}>
      <ScrollView contentContainerStyle={tw`relative`}>
        {currentIndex === 0 && (
          <>
            <View>
              <View style={tw.style('pt-8')}>
                <Text
                  style={tw.style(h6TextStyle, 'text-center text-white')}
                  maxFontSizeMultiplier={1}
                >
                  {item[0].title}
                </Text>
              </View>
            </View>
            <View style={tw.style('relative mt-10 rounded-2lg')}>
              <Image
                style={[
                  tw.style(
                    `h-[300px] w-[${
                      Dimensions.get('window').width - 40
                    }px] rounded-2lg border border-radish`,
                  ),
                  // radishCardDrop,
                ]}
                resizeMode="cover"
                source={bundledSource(
                  framework.heroImage[0].url,
                  env.useBundledContent,
                )}
              />
            </View>
            <View style={tw.style('pt-16')}>
              {item[0].buttonText.map(
                (button: { id: string; name: string }, index: number) => {
                  return (
                    <SecondaryButton
                      key={button.id}
                      style={tw.style(
                        'mb-2',
                        index === 0 && feedbackStatus ? 'bg-black' : '',
                      )}
                      buttonTextStyle={tw.style(
                        index === 0 && feedbackStatus ? 'text-white' : '',
                      )}
                      onPress={() => {
                        if (index === 0) {
                          setDidYouLikeIt(true);
                          setFeedbackStatus(true);
                          setTimeout(() => {
                            // handleButtonPress('yes');
                            setNextIndex(1);
                            setFeedbackStatus(false);
                          }, 2000);
                        }
                        if (index === 1) {
                          setCurrentIndex(index);
                          // handleButtonPress('no');
                        }
                      }}
                    >
                      {button.name}
                    </SecondaryButton>
                  );
                },
              )}
            </View>
            {feedbackStatus && (
              <Animatable.Image
                style={tw`absolute left-0 top-20 z-10 w-[${
                  Dimensions.get('window').width - 40
                }px]`}
                resizeMode="contain"
                source={require('../../../../../assets/placeholder/hearts.png')}
                animation="zoomIn"
                duration={500}
              />
            )}
          </>
        )}
        {currentIndex === 1 && (
          <>
            <View>
              <Image
                style={tw`mx-auto h-[189px] w-[276px]`}
                resizeMode="contain"
                source={item[currentIndex].image}
                accessibilityIgnoresInvertColors
              />
              <Text
                style={tw.style(
                  h6TextStyle,
                  'pb-2 pt-9 text-center text-white',
                )}
                maxFontSizeMultiplier={1}
              >
                {item[currentIndex].title}
              </Text>
              <Text
                style={tw.style(
                  bodyMediumRegular,
                  'pb-2 text-center text-white',
                )}
              >
                {item[currentIndex].description}
              </Text>
            </View>
            <View style={tw.style('pt-16')}>
              {item[1].buttonText.map(
                (button: { id: string; name: string }, index: number) => {
                  return (
                    <SecondaryButton
                      key={button.id}
                      style={tw.style('mb-2')}
                      onPress={() => onPressFlavorStatus(index)}
                    >
                      {button.name}
                    </SecondaryButton>
                  );
                },
              )}
            </View>
          </>
        )}
        {currentIndex === 2 && (
          <>
            <View>
              <Image
                style={tw`mx-auto h-[216px] w-[297px] max-w-full`}
                resizeMode="contain"
                source={tasteImage(flavourStatus)}
                accessibilityIgnoresInvertColors
              />
              <View style={tw.style('items-center pt-9')}>
                <Text
                  style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
                  maxFontSizeMultiplier={1}
                >
                  {item[currentIndex].title(flavourStatus)}
                </Text>
                <Text
                  style={tw.style(
                    bodyMediumRegular,
                    'max-w-[278px] pb-2 text-center text-white',
                  )}
                >
                  {item[currentIndex].description}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      {item[currentIndex].id === 2 && (
        <SecondaryButton
          style={tw.style('mb-2 w-full')}
          onPress={() => setNextIndex(1)}
        >
          Got it, thanks!
        </SecondaryButton>
      )}
    </View>
  );
}
