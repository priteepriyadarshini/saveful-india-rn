import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { ResizeMode, Video } from 'expo-av';
import { ISponsorPanel } from '../../../models/craft';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import {
  bodyMediumRegular,
  bodySmallBold,
  bodySmallRegular,
  labelLarge,
  subheadMediumUppercase,
} from '../../../theme/typography';

export default function SponsorPanel({ id }: { id: string }) {
  const env = useEnvironment();
  const video = useRef<any>(null);

  const toggleFullscreen = () => {
    video?.current?.presentFullscreenPlayer();
    video.current.setPositionAsync(0);
    video.current.playAsync();
  };

  const { getSponsorPanel } = useContent();
  const [sponsorPanel, setSponsorPanel] = useState<ISponsorPanel>();

  const getSponsorPanelsData = async () => {
    const data = await getSponsorPanel(id);

    if (data) {
      setSponsorPanel(data);
    }
  };

  useEffect(() => {
    getSponsorPanelsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sponsorPanel) return null;

  return (
    <View
      style={[
        tw`gap-4 rounded border border-strokecream bg-white p-4`,
        cardDrop,
      ]}
    >
      {!!sponsorPanel.videoTitle && (
        <>
          {/* Change to actual video */}
          <Video
            ref={video}
            style={tw.style('hidden')}
            source={{
              uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
            }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            // onPlaybackStatusUpdate={status => setStatus(() => status)}
          />
          <Pressable onPress={toggleFullscreen} style={tw`flex-row`}>
            <View style={tw`shrink justify-center`}>
              <Text style={tw.style(subheadMediumUppercase, 'text-midgray')}>
                {sponsorPanel.videoSubTitle}
              </Text>
              <Text style={tw.style(labelLarge, 'mt-1 pr-4')}>
                {sponsorPanel.videoTitle}
              </Text>
              <View style={tw`relative mt-2.5 w-full`}>
                <PrimaryButton buttonSize="small">
                  Watch the video
                </PrimaryButton>
                <Image
                  style={[
                    tw`absolute -right-[36px] -top-5 z-10 h-[74px] w-[73px]`,
                  ]}
                  resizeMode="contain"
                  source={require('../../../../assets/buttons/play.png')}
                  accessibilityIgnoresInvertColors
                />
              </View>
            </View>
            <View style={[tw`shrink-0`, { zIndex: -1 }]}>
              <Image
                style={[tw`h-[152px] w-[115px]`]}
                resizeMode="contain"
                source={bundledSource(
                  sponsorPanel.videoThumbnail[0]?.url,
                  env.useBundledContent,
                )}
                accessibilityIgnoresInvertColors
              />
            </View>
          </Pressable>
        </>
      )}

      {/* <View style={tw`mt-4 border-t border-strokecream pt-4`}> */}
      <View>
        <Text style={tw.style(subheadMediumUppercase, 'text-midgray')}>
          {sponsorPanel.title}
        </Text>
        <Text style={tw.style(bodyMediumRegular, 'mt-1')}>
          {sponsorPanel.factOrInsight}
        </Text>
      </View>

      {sponsorPanel.sponsor && sponsorPanel.sponsor.length > 0 && (
        <View style={tw`flex-row gap-4 border-t border-strokecream pt-4`}>
          <View style={tw`shrink`}>
            <Text style={tw.style(bodySmallBold, 'text-stone')}>
              {sponsorPanel.sponsor[0].broughtToYouBy}
            </Text>
            <Text style={tw.style(bodySmallRegular, 'text-stone')}>
              {sponsorPanel.sponsor[0].sponsorTagline}
            </Text>
          </View>
          <View style={tw`shrink-0`}>
            {(sponsorPanel.sponsor[0]?.sponsorLogo[0]?.url ||
              sponsorPanel.sponsor[0]?.sponsorLogoBlackAndWhite[0]?.url) && (
              <Image
                style={[tw`h-[35px] w-[96px]`]}
                resizeMode="contain"
                source={bundledSource(
                  sponsorPanel.sponsor[0]?.sponsorLogo[0]?.url
                    ? sponsorPanel.sponsor[0]?.sponsorLogo[0]?.url
                    : sponsorPanel.sponsor[0]?.sponsorLogoBlackAndWhite[0]?.url,
                  env.useBundledContent,
                )}
                accessibilityIgnoresInvertColors
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}
