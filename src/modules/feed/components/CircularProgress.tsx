import tw from '../../../common/tailwind';
import React from 'react';
import { Animated, View } from 'react-native';
// import  from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

export interface CircularProgressProps
  extends React.ComponentProps<typeof View> {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress = ({
  progress,
  size = 72,
  strokeWidth = 5,
  children,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // const currentProgress = useSharedValue(0);
  // const strokeDashOffsetAnimation = useDerivedValue(
  //   () => circumference * (1 - currentProgress.value),
  // );

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  // useEffect(() => {
  //   currentProgress.value = withTiming(progress, { duration: 500 });
  // }, [progress]);

  return (
    <View style={tw`w-[${size}px] h-[${size}px] items-center justify-center`}>
      <Svg>
        <Circle
          stroke={tw.color('stone')}
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={'none'}
          strokeDasharray={circumference}
        />
        {/* <Circle
          stroke="blue"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={'none'}
          strokeDasharray={(progress * circumference) / 100}
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        /> */}
        <AnimatedCircle
          stroke={tw.color('eggplant-light')}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={'none'}
          strokeDasharray={circumference}
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          strokeDashoffset={circumference * ((100 - progress) / 100)}
        />
      </Svg>
      <View
        style={tw`absolute z-10 left-[${strokeWidth}px] top-[${strokeWidth}px] w-[${
          size - strokeWidth * 2
        }px] h-[${
          size - strokeWidth * 2
        }px] items-center justify-center overflow-hidden`}
      >
        {children}
      </View>
    </View>
  );
};
