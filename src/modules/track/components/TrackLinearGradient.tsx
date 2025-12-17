import tw from '../../../common/tailwind';
import { LinearGradient } from 'expo-linear-gradient';

export default function TrackLinearGradient({
  paddingInnerContent = 'w-full',
  style = '',
}: {
  style?: string;
  paddingInnerContent?: string;
}) {
  return (
    <LinearGradient
      colors={['#4b217600', '#4b2176']}
      start={[0, 0]}
      end={[0, 1]}
      style={tw`${style} m-h-9 absolute ${paddingInnerContent}`}
    />
  );
}
