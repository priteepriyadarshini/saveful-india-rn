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

// Extended type to handle both Craft CMS and API formats
type VideoBlockProps = IArticleBlockVideo | {
  type?: string;
  videoUrl: string;
  videoCaption?: string;
  videoCredit?: string;
  videoThumbnail?: string;
};

export default function VideoBlock({ block }: { block: VideoBlockProps }) {
  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string => {
    if (!url) return '';
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
      /youtube\.com\/watch\?.*v=([^&]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return '';
  };

  const id = extractYouTubeId(block.videoUrl);

  const navigation =
    useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoMeta, setVideoMeta] = useState<YoutubeMeta>();

  useEffect(() => {
    if (id) {
      getYoutubeMeta(id).then(meta => {
        setVideoMeta(meta);
      });
    }
  }, [id]);
  
  // Normalize thumbnail to a string URL for Image source
  const thumbnailUri =
    Array.isArray(block.videoThumbnail)
      ? block.videoThumbnail[0]?.url ?? videoMeta?.thumbnail_url ?? ''
      : typeof block.videoThumbnail === 'string'
        ? block.videoThumbnail ?? videoMeta?.thumbnail_url ?? ''
        : videoMeta?.thumbnail_url ?? '';

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
                source={{ uri: thumbnailUri }}
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
          {/* Fallback for non-YouTube videos (if still needed) */}
          {block.videoUrl.includes('assets.saveful.com') ? (
            <Pressable
              onPress={() => {
                navigation.navigate('HackVideo', {
                  videoString: block.videoUrl,
                });
              }}
            >
              {/* Only render VideoBox if we have Craft-style thumbnail */}
              {Array.isArray(block.videoThumbnail) && (
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
              )}
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
