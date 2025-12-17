import { useRef } from 'react';
import { Dimensions, Image, Pressable } from 'react-native';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { IAsset } from '../../../models/craft';
import useEnvironment from '../../environment/hooks/useEnvironment';
import Video from 'react-native-video';

export default function VideoBox({
  isPlaying,
  videoUrl,
  videoThumbnail,
  onPressPlay,
}: {
  isPlaying: boolean;
  videoThumbnail: IAsset[];
  videoUrl?: string;
  onPressPlay: () => void;
}) {
  const videoRef = useRef<any>(null);
  const env = useEnvironment();

  return (
    <Pressable style={tw`relative`} onPress={onPressPlay}>
      {/* {!isPlaying && ( */}
      <Image
        style={tw`h-[${
          ((Dimensions.get('screen').width - 40) * 190) / 335
        }px] w-[${
          Dimensions.get('screen').width - 40
        }px] overflow-hidden rounded-[28px]`}
        resizeMode="cover"
        source={bundledSource(videoThumbnail[0].url, env.useBundledContent)}
        accessibilityIgnoresInvertColors
      />
      {/* )} */}
      <Image
        style={[
          tw`${
            isPlaying ? 'z-10' : 'z-999'
          } absolute left-1/2 top-1/2 -ml-[37px] -mt-[37px] h-[74px] w-[73px]`,
        ]}
        resizeMode="contain"
        source={require('../../../../assets/buttons/play.png')}
        accessibilityIgnoresInvertColors
      />
      <Video
        style={tw.style(
          'absolute bottom-0 left-0 right-0 top-0 z-10 hidden rounded-[28px]',
        )}
        source={{
          uri: videoUrl,
        }}
        ref={videoRef}
        resizeMode="cover"
        onLoad={() => {
          videoRef.current.seek(0);
        }}
        repeat
        muted
        disableFocus
        playWhenInactive
        ignoreSilentSwitch="obey"
        preventsDisplaySleepDuringVideoPlayback={false}
        // onReadyForDisplay={() => setVideoIsReady(true)}
        paused={!isPlaying}
      />
    </Pressable>
  );
}
