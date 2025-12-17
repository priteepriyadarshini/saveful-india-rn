import React from 'react';
import { ButtonProps, Pressable, Text, TextStyle } from 'react-native';
import { h6TextStyle } from '../../theme/typography';
import tw from '../tailwind';


function GreenTextNavigationBarButton({
  onPress,
  title,
  titleStyle,
}: ButtonProps & { titleStyle?: TextStyle }) {
  const [pressed, setIsPressed] = React.useState<boolean>(false);

  return (
    <Pressable
      accessibilityRole="button"
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={tw`flex h-11 items-center justify-center px-2`}
    >
      <Text
        minimumFontScale={1}
        maxFontSizeMultiplier={2}
        style={tw.style(
          h6TextStyle,
          'text-green-500',
          {
            'opacity-50': pressed,
          },
          titleStyle,
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export default GreenTextNavigationBarButton;
