import React from 'react';
import { LayoutChangeEvent } from 'react-native';

interface ComponentSize {
  width?: number;
  height?: number;
}

// Hook for getting the size of a component
// Returns the size, and an onLayout function to apply to the view you want to know the size of
const useComponentSize = (
  initialSize?: ComponentSize,
): [ComponentSize, (event: LayoutChangeEvent) => void] => {
  const [size, setSize] = React.useState<ComponentSize>(
    initialSize ?? { width: undefined, height: undefined },
  );

  const onLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (size.width !== width || size.height !== height) {
        setSize({ width, height });
      }
    },
    [size.height, size.width],
  );

  return [size, onLayout];
};

export default useComponentSize;
