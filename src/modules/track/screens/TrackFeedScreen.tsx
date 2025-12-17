import React, { useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import TrackTabNav from '../components/TrackTabNav';
import TrackSearchBarHeader from '../components/TrackSearchBarHeader';

export default function TrackFeedScreen() {
  const insets = useSafeAreaInsets();
  const offset = useRef(new Animated.Value(0)).current;
  const paddingTop = `pt-${insets.top + 44}px`;

  return (
    <View style={tw`flex-1 bg-creme`}>
      <ScrollView>
        <View style={tw.style(`${paddingTop}`)}>
          <TrackSearchBarHeader animatedValue={offset} onPress={() => {}} />
        </View>
        <TrackTabNav />
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
