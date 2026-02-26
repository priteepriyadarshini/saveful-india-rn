import tw from '../../../common/tailwind';
import CircularHeader from '../../../modules/prep/components/CircularHeader';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';
import YoutubePlayer, {
  YoutubeMeta,
  getYoutubeMeta,
} from 'react-native-youtube-iframe';
import { bodyMediumRegular } from '../../../theme/typography';

const windowWidth = Dimensions.get('window').width;
const itemWidth = windowWidth - 40;

const normalizeYoutubeId = (input: string): string => {
  if (!input) return '';
  // If it's already a bare ID (11 chars, alphanumeric, _ or -), return as is
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  // Try common URL patterns
  const shortMatch = input.match(/youtu\.be\/(^[a-zA-Z0-9_-]{11}$|[a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1].slice(0, 11);
  const vParamMatch = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vParamMatch && vParamMatch[1]) return vParamMatch[1];
  // Fallback: try to strip query and take last path segment
  try {
    const url = new URL(input);
    const segments = url.pathname.split('/').filter(Boolean);
    const candidate = segments.pop() || '';
    if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) return candidate;
  } catch {}
  return input;
};

export default function PrepVideo({ id }: { id: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoMeta, setVideoMeta] = useState<YoutubeMeta>();

  useEffect(() => {
    const normalized = normalizeYoutubeId(id);
    getYoutubeMeta(normalized).then(meta => {
      setVideoMeta(meta);
    });
  }, [id]);

  if (!id || !videoMeta) {
    return null;
  }

  return (
    <View style={tw.style('px-5 pb-6 pt-10')}>
      <CircularHeader title="watch it" />

      <View style={tw`mt-4 w-full overflow-hidden rounded-lg`}>
        <YoutubePlayer
          width={itemWidth}
          height={(itemWidth * videoMeta.height) / videoMeta.width}
          play={isPlaying}
          videoId={normalizeYoutubeId(id)}
          // videoId="Xqq5skmzf8g"
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
                } absolute left-1/2 top-1/2 -ml-[27px] -mt-[27px] h-[54px] w-[53px]`,
              ]}
              resizeMode="contain"
              source={require('../../../../assets/buttons/play-purple.png')}
              accessibilityIgnoresInvertColors
            />
          </Pressable>
        )}
      </View>

      <Text style={tw.style('pt-4', bodyMediumRegular)}>{videoMeta.title}</Text>
    </View>
  );
}
