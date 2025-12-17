import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import { HackStackScreenProps } from '../navigation/HackNavigation';
import { ResizeMode, Video } from 'expo-av';

export default function HackVideoScreen({
  route: {
    params: { videoString },
  },
}: HackStackScreenProps<'HackVideo'>) {
  const video = useRef<any>(null);
  const navigation = useNavigation();

  return (
    <View style={tw.style('h-full w-full bg-black')}>
      <Video
        ref={video}
        style={tw.style('h-full w-full justify-center')}
        source={{
          uri: videoString,
        }}
        useNativeControls={true}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        // onPlaybackStatusUpdate={status => setStatus(() => status)}
      />
      <View style={tw`absolute left-0 top-0 z-10 w-full`}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0)']} // Light black to transparent
          start={[0, 0]}
          end={[0, 1]}
          style={tw`absolute left-0 right-0 top-0 h-full`}
        />
        <SafeAreaView style={tw`relative`}>
          <View style={tw.style('z-10 items-end pb-20 pt-3')}>
            <Pressable
              style={tw.style('pr-4')}
              onPress={() => navigation.goBack()}
            >
              <Feather name={'x'} size={24} color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
