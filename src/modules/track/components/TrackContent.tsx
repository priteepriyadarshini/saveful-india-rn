import tw from '../../../common/tailwind';
import TrackLinearGradient from '../../../modules/track/components/TrackLinearGradient';
import React from 'react';
import { Dimensions, ScrollView } from 'react-native';

const paddingBottom = 'pb-[44px]';

export default function TrackContent({
  children,
  paddingWidth = 80,
  hideGradient = false,
}: {
  paddingWidth?: number;
  children: React.ReactNode;
  hideGradient?: boolean;
}) {
  const paddingInnerContent = Dimensions.get('window').width - paddingWidth;

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw.style(
          `w-[${paddingInnerContent}px] ${paddingBottom}`,
        )}
      >
        {children}
      </ScrollView>
      {!hideGradient && (
        <TrackLinearGradient style={`max-w-[${paddingInnerContent}px]`} />
      )}
    </>
  );
}
