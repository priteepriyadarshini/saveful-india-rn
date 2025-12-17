import { useIsFocused } from '@react-navigation/native';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import React from 'react';

function FocusAwareStatusBar({
  statusBarStyle,
}: {
  statusBarStyle: StatusBarStyle;
}): React.ReactElement | null {
  const isFocused = useIsFocused();

  return isFocused ? <StatusBar style={statusBarStyle} /> : null;
}

export default FocusAwareStatusBar;
