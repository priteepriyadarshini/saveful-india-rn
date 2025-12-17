/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import tw from 'twrnc';

const ACTIVE = 'white';
const INACTIVE = 'white/80';

const ACTIVE_DARK = 'black';
const INACTIVE_DARK = 'black/80';

const ANIMATION_DURATION = 520;
const ANIMATION_SCALE = 1.4;

function Dot({
  active,
  type = 'light',
}: {
  active: boolean;
  type?: 'dark' | 'light';
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const scaleDown = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  };

  const scaleUp = () => {
    Animated.timing(scaleAnim, {
      toValue: ANIMATION_SCALE,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  };

  const getDotBgColor = (): string => {
    if (active) {
      return type === 'dark' ? ACTIVE_DARK : ACTIVE;
    }

    return type === 'dark' ? INACTIVE_DARK : INACTIVE;
  };

  useEffect(() => {
    if (active) {
      scaleUp();
    }
  }, []);

  useEffect(() => {
    if (!active) {
      scaleDown();
    } else {
      scaleUp();
    }
  }, [active]);

  return (
    <Animated.View
      style={[
        tw`mx-1 h-2 w-2 rounded-full bg-${getDotBgColor()}`,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
}

export default Dot;
