import tw from '../tailwind';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  seperator: {
    height: StyleSheet.hairlineWidth,
    borderBottomColor: tw.color('gray-300'),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
export default function Separator({ style }: { style?: ViewStyle | string }) {
  return <View style={tw.style(styles.seperator, style)} />;
}
