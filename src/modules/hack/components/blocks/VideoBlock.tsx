import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from '../../../../common/tailwind';
import { IArticleBlockVideo } from '../../../../models/craft';
import VideoBox from '../../../feed/components/VideoBox';
import { HackStackParamList } from '../../navigation/HackNavigation';
import { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import YoutubePlayer, {
  YoutubeMeta,
  getYoutubeMeta,
} from 'react-native-youtube-iframe';
import { bodyMediumRegular } from '../../../../theme/typography';

const windowWidth = Dimensions.get('window').width;
const itemWidth = windowWidth - 40;

export default function VideoBlock({ block }: { block: IArticleBlockVideo }) {
  const id = block.videoUrl.split('v=')[1] || '';

  const navigation =
    useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoMeta, setVideoMeta] = useState<YoutubeMeta>();

  useEffect(() => {
    getYoutubeMeta(id).then(meta => {
      setVideoMeta(meta);
    });
  }, [id]);
  console.log(block.videoUrl);

  return (
    <View style={tw.style('pb-4.5 mx-5 border-b border-creme-2')}>
      {id && videoMeta ? (
        <View style={tw`w-full overflow-hidden rounded-[28px]`}>
          <YoutubePlayer
            width={itemWidth}
            height={(itemWidth * videoMeta.height) / videoMeta.width}
            play={isPlaying}
            videoId={id}
            initialPlayerParams={{
              loop: true,
              controls: false,
            }}
            onChangeState={(event: string) => {
              if (event === 'ended') {
                setIsPlaying(false);
              }
            }}
          />

          {!isPlaying && (
            <Pressable
              style={tw`absolute left-0 top-0 z-10 h-full w-full`}
              onPress={() => setIsPlaying(true)}
            >
              <Image
                style={tw`absolute left-0 top-0 z-10 h-full w-full`}
                resizeMode="cover"
                source={{
                  uri: videoMeta.thumbnail_url,
                }}
                accessibilityIgnoresInvertColors
              />
              <Image
                style={[
                  tw`${
                    isPlaying ? 'z-10' : 'z-999'
                  } absolute left-1/2 top-1/2 -ml-[37px] -mt-[37px] h-[74px] w-[73px]`,
                ]}
                resizeMode="contain"
                source={require('../../../../../assets/buttons/play.png')}
                accessibilityIgnoresInvertColors
              />
            </Pressable>
          )}
        </View>
      ) : (
        <>
          {block.videoUrl.includes('assets.saveful.com') ? (
            <Pressable
              onPress={() => {
                navigation.navigate('HackVideo', {
                  videoString: block.videoUrl,
                });
              }}
            >
              <VideoBox
                isPlaying={isPlaying}
                videoThumbnail={block.videoThumbnail}
                videoUrl={block.videoUrl}
                onPressPlay={() =>
                  navigation.navigate('HackVideo', {
                    videoString: block.videoUrl,
                  })
                }
              />
            </Pressable>
          ) : (
            <></>
          )}
        </>
      )}
      <Text style={tw.style(bodyMediumRegular, 'my-3 text-stone')}>
        {block.videoCaption ?? videoMeta?.title}
      </Text>
      {block.videoCredit && (
        <View style={tw.style('flex-row')}>
          <Feather name={'video'} size={16} color={tw.color('stone')} />
          <Text style={tw.style('pl-3 font-sans-italic text-stone')}>
            Video credit: {block.videoCredit}
          </Text>
        </View>
      )}
    </View>
  );
}
