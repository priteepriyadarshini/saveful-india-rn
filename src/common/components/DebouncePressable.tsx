import { useCallback, useEffect, useState } from 'react';
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native';
import Loader from './Loader/Loader';


interface DebouncedPressableProps extends PressableProps {
  rePressDelay?: number;
  loading?: boolean;
}

const DebouncedPressable = ({
  onPress,
  children,
  rePressDelay = 400,
  disabled,
  loading,
  ...props
}: DebouncedPressableProps) => {
  const [inProgress, setInProgress] = useState(false);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (onPress && !inProgress) {
        setInProgress(true);
        onPress(event);
      }
    },
    [inProgress, onPress],
  );

  useEffect(() => {
    inProgress && setTimeout(() => setInProgress(false), rePressDelay);
  }, [inProgress, rePressDelay]);

  return (
    <Pressable onPress={handlePress} disabled={disabled || loading} {...props}>
      {loading ? <Loader /> : children}
    </Pressable>
  );
};

export default DebouncedPressable;
