import useAnimationTimer from "./useAnimationTimer";


export type EasingFunctions = 'linear' | 'elastic' | 'inExpo';

const easing = {
  linear: (n: number) => n,
  elastic: (n: number) =>
    n * (33 * n * n * n * n - 106 * n * n * n + 126 * n * n - 67 * n + 15),
  inExpo: (n: number) => 2 ** (10 * (n - 1)),
};

export default function useAnimation(
  targetValue: number,
  easingName: EasingFunctions = 'linear',
  duration = 500,
  delay = 0,
) 
  {
  const elapsed = useAnimationTimer(duration, delay, targetValue);
  const n = Math.min(1, elapsed / duration);
  return easing[easingName](n);
  }
