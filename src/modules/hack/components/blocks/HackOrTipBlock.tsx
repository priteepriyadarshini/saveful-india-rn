import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import tw from '../../../../common/tailwind';
import { IArticleBlockHackOrTip } from '../../../../models/craft';
import HackOrTip from '../../../make/components/HackOrTip';
import { hackOrTipApiService, HackOrTip as ApiHackOrTip } from '../../api/hackOrTipApiService';

export default function HackOrTipBlock({
  block,
}: {
  block: IArticleBlockHackOrTip | any;
}) {
  const [hackOrTips, setHackOrTips] = useState<ApiHackOrTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHackOrTips = async () => {
      try {
        // Handle Craft CMS structure (block.hackOrTip array)
        if (block.hackOrTip && Array.isArray(block.hackOrTip)) {
          const ids = block.hackOrTip.map((item: any) => item.id);
          if (ids.length > 0) {
            // For Craft CMS, we might not have API, so just use the first one
            setIsLoading(false);
            return;
          }
        }

        // Handle API structure (block.hackOrTipIds array)
        if (block.hackOrTipIds && Array.isArray(block.hackOrTipIds)) {
          if (block.hackOrTipIds.length > 0) {
            const data = await hackOrTipApiService.getByIds(block.hackOrTipIds);
            setHackOrTips(data);
          }
        }
      } catch (error) {
        console.error('Error loading hack or tips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackOrTips();
  }, [block]);

  // Handle Craft CMS structure
  if (block.hackOrTip && Array.isArray(block.hackOrTip) && block.hackOrTip.length > 0) {
    return (
      <View style={tw`mx-5`}>
        <HackOrTip id={block.hackOrTip[0].id} block={true} />
      </View>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <View style={tw`mx-5 items-center justify-center py-4`}>
        <ActivityIndicator size="small" color={tw.color('kale')} />
      </View>
    );
  }

  // Handle empty state
  if (hackOrTips.length === 0) {
    return null;
  }

  // Render API hack or tips
  return (
    <View style={tw`mx-5 gap-4`}>
      {hackOrTips.map((hackOrTip, index) => (
        <ApiHackOrTipItem key={hackOrTip._id || index} hackOrTip={hackOrTip} />
      ))}
    </View>
  );
}

// Component to render API-based hack or tip
function ApiHackOrTipItem({ hackOrTip }: { hackOrTip: ApiHackOrTip }) {
  const { Feather } = require('@expo/vector-icons');
  const { useState, useMemo, useRef, useCallback } = React;
  const { Pressable, ScrollView, Image } = require('react-native');
  const { BottomSheetModal } = require('@gorhom/bottom-sheet');
  const { useReducedMotion } = require('react-native-reanimated');
  const RenderHTML = require('react-native-render-html').default;
  const { 
    subheadLargeUppercase, 
    bodyMediumRegular, 
    subheadMediumUppercase, 
    h7TextStyle, 
    tagStyles 
  } = require('../../../../theme/typography');
  const { cardMintDrop } = require('../../../../theme/shadow');

  const bottomSheetModalRef = useRef<any>(null);
  const snapPoints = useMemo(() => ['1%', '90%'], []);
  const reducedMotion = useReducedMotion();

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handlePresentModalDismiss = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  let icon: 'zap' | 'star' = 'star';
  let title = '';
  
  switch (hackOrTip.type) {
    case 'Mini Hack':
      icon = 'zap';
      title = 'Mini hack';
      break;
    case 'Pro Tip':
      icon = 'star';
      title = 'Pro tip';
      break;
    case 'Serving Suggestion':
      icon = 'star';
      title = 'Serving suggestion';
      break;
    default:
      icon = 'star';
      title = hackOrTip.type;
      break;
  }

  // Get sponsor info if populated
  const sponsor = typeof hackOrTip.sponsorId === 'object' ? hackOrTip.sponsorId : null;

  return (
    <>
      <View style={[tw.style('gap-3 rounded bg-mint p-4 pb-5'), cardMintDrop]}>
        <View style={tw`flex-row items-center justify-between gap-3`}>
          <View style={tw.style('flex-row items-center gap-3')}>
            <Feather name={icon} size={24} color={tw.color('black')} />
            <Text style={tw.style(subheadLargeUppercase)}>{title}</Text>
          </View>
          {sponsor && sponsor.logo && (
            <View style={tw.style('items-center')}>
              {hackOrTip.sponsorHeading && (
                <Text style={tw.style('font-sans-semibold text-[8px] leading-tight tracking-widest uppercase text-black mb-1')}>
                  {hackOrTip.sponsorHeading}
                </Text>
              )}
              <Image
                resizeMode="contain"
                style={tw`h-[32px] w-[61px] rounded-lg`}
                source={{ uri: sponsor.logo }}
              />
            </View>
          )}
        </View>

        <View>
          <Text style={tw.style(bodyMediumRegular)}>
            {hackOrTip.shortDescription}
          </Text>

          {hackOrTip.description && (
            <Pressable
              onPress={handlePresentModalPress}
              style={tw.style('mt-3 self-center rounded-full bg-kale px-4 py-1')}
            >
              <Text style={tw.style(subheadMediumUppercase, 'text-white')}>
                Read more
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {hackOrTip.description && (
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          animateOnMount={!reducedMotion}
          snapPoints={snapPoints}
          containerStyle={{ backgroundColor: 'rgba(26, 26, 27, 0.7)' }}
          style={tw.style('overflow-hidden rounded-2.5xl border border-strokecream')}
          handleStyle={tw.style('hidden')}
          enableContentPanningGesture={false}
        >
          <ScrollView style={tw.style('px-5')}>
            <View style={tw.style('items-end py-4')}>
              <Pressable onPress={handlePresentModalDismiss}>
                <Feather name={'x'} size={16} color="black" />
              </Pressable>
            </View>
            <View style={tw.style('items-center justify-center')}>
              <Text style={tw.style(h7TextStyle)}>{title}</Text>
            </View>
            <View style={tw.style('pb-[50px] pt-[22px]')}>
              <RenderHTML
                source={{ html: hackOrTip.description }}
                contentWidth={225}
                tagsStyles={tagStyles}
                baseStyle={{
                  fontFamily: 'Saveful-Regular',
                  color: '#575757',
                }}
              />
            </View>
          </ScrollView>
        </BottomSheetModal>
      )}
    </>
  );
}
