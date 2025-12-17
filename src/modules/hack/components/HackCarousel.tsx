import { useLinkTo, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Dimensions, View, Pressable, Image, Text } from 'react-native';
import { 
  GenericCarouselWrapper, 
  GenericCarouselFlatlist 
} from '../../../common/components/GenericCarousel';
import tw from '../../../common/tailwind';
import { cardDrop } from '../../../theme/shadow';
import { 
  h7TextStyle, 
  bodySmallRegular, 
  subheadMediumUppercase 
} from '../../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HackStackParamList } from '../navigation/HackNavigation';


const itemLength = Dimensions.get('window').width - 40;

export default function HackCarousel({ data }: { data: any }) {
  const [, setActiveDotIndex] = useState<number>(0);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  //const linkTo = useLinkTo();

  const navigation = useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  return (
    <GenericCarouselWrapper style={tw.style(`relative overflow-hidden pb-4`)}>
      <GenericCarouselFlatlist
        contentContainerStyle={tw`pb-4 pl-5 pr-3`}
        data={data}
        renderItem={({ item }: any) => {
          return (
            <View style={{ width: itemLength }}>
              <View style={[tw.style(`mr-3`), cardDrop]}>
                <View
                  style={tw.style(`rounded-lg pb-6`)}
                  onLayout={event => {
                    const height = event.nativeEvent.layout.height;
                    if (setMaxHeight && height > maxHeight) {
                      setMaxHeight(height);
                    }
                  }}
                >
                  <Image
                    source={item.image}
                    resizeMode="cover"
                    style={tw.style(`w-full rounded-t-[10px] border-radish`)}
                  />
                  <View
                    style={tw.style(
                      'rounded-b-[10px] border-b border-l border-r border-radish bg-white p-5',
                    )}
                  >
                    <Text style={tw.style(h7TextStyle, 'pb-2')}>
                      {item.title}
                    </Text>
                    <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
                      {item.subtitle}
                    </Text>
                    <Pressable
                      onPress={() => {
                        //linkTo(`/hacks/1`);
                        navigation.navigate('HackCategory', { id: item.id });
                      }}
                      style={tw.style(
                        'mt-3.5 max-w-[115px] rounded-full bg-strokecream px-4 py-1',
                      )}
                    >
                      <Text style={tw.style(subheadMediumUppercase)}>
                        Read more
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        getCurrentIndex={setActiveDotIndex}
        itemLength={itemLength}
      />
    </GenericCarouselWrapper>
  );
}
