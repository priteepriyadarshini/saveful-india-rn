import { View } from 'react-native';
import tw from '../tailwind';

export default function InsetsTopBackgroundColor({
  backgroundColor,
}: {
  backgroundColor: string;
}) {
  return (
    <View
      style={tw.style(
        `absolute left-0 right-0 top-0 h-1/2 bg-${backgroundColor}`,
      )}
    />
  );
}
