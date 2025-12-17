import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import React, { SetStateAction, useEffect, useState } from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import useEnvironment from '../../environment/hooks/useEnvironment';
import { 
  bodyMediumBold, 
  subheadMediumUppercase, 
  subheadSmall 
} from '../../../theme/typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SurveyStackParamList } from '../navigation/SurveyNavigator';

export default function TrackTabNav() {
  //const linkTo = useLinkTo();
  const navigation = useNavigation<NativeStackNavigationProp<SurveyStackParamList>>();
  
  const env = useEnvironment();

  const [activeTab, setActiveTab] = useState('history');
  const handleTabPress = (tabName: SetStateAction<string>) => {
    setActiveTab(tabName);
  };

  const [frameworks, setFrameworks] = React.useState<IFramework[]>([]);
  const { getFrameworks } = useContent();

  const getFrameworksData = async () => {
    const data = await getFrameworks();

    if (data) {
      setFrameworks(data);
    }
  };

  useEffect(() => {
    getFrameworksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (frameworks.length === 0) {
    return null;
  }

  return (
    <View style={tw.style(`px-5`)}>
      <View style={tw.style(`flex-row`)}>
        <TouchableOpacity
          style={tw.style(
            `flex-1 items-center rounded-l-md border border-strokecream py-2.5 ${
              activeTab === 'history'
                ? 'border-eggplant-light bg-radish'
                : 'border-strokecream bg-white'
            }`,
          )}
          onPress={() => handleTabPress('history')}
        >
          <Text
            style={[
              tw.style(
                bodyMediumBold,
                activeTab === 'history' ? 'text-black' : 'text-midgray',
              ),
              { letterSpacing: 1 },
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw.style(
            `flex-1 items-center rounded-r-md border py-2.5 ${
              activeTab === 'saved'
                ? 'border-eggplant-light bg-radish'
                : 'border-strokecream bg-white'
            }`,
          )}
          onPress={() => handleTabPress('saved')}
        >
          <Text
            style={[
              tw.style(
                bodyMediumBold,
                activeTab === 'saved' ? 'text-black' : 'text-midgray',
              ),
              { letterSpacing: 1 },
            ]}
          >
            Saved
          </Text>
        </TouchableOpacity>
      </View>
      {/* Render content based on the active tab */}
      {activeTab === 'history' ? (
        <View style={tw.style('py-5.5')}>
          {frameworks &&
            frameworks.map(framework => {
              return (
                <View key={framework.id}>
                  <Pressable
                    onPress={() => {
                      navigation.navigate('PostMake', { id: framework.id });
                    }}
                    style={[
                      tw.style(
                        `rounded-[10px] border border-strokecream bg-white p-4 shadow-sm`,
                      ),
                    ]}
                  >
                    <Image
                      style={tw`m-h-[226px] w-full rounded`}
                      resizeMode="cover"
                      source={bundledSource(
                        framework.heroImage[0].url,
                        env.useBundledContent,
                      )}
                      accessibilityIgnoresInvertColors
                    />
                    <View style={tw`pb-1 pt-4`}>
                      <Text
                        style={tw.style(subheadMediumUppercase, 'text-midgray')}
                      >
                        made on 21/5/23
                      </Text>
                    </View>
                    <View style={tw.style('flex-row justify-between')}>
                      <Text style={tw.style(subheadSmall)}>
                        {framework.title}
                      </Text>
                      <Feather
                        style={tw.style('px-1')}
                        name="bookmark"
                        size={24}
                        color={tw.color('black')}
                      />
                    </View>
                  </Pressable>
                </View>
              );
            })}
        </View>
      ) : (
        <View style={tw.style('py-5.5')}>
          <Text>Saved Content Goes Here</Text>
        </View>
      )}
    </View>
  );
}
