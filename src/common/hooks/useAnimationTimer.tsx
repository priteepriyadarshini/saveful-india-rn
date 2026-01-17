import React from 'react';

export default function useAnimationTimer(
  duration = 1000,
  delay = 0,
  targetValue = 0,
) {
  const [elapsed, setTime] = React.useState(0);
  React.useEffect(() => {
    setTime(0);
    let animationFrame: number,
      timerStop: ReturnType<typeof setTimeout>,
      start: number;
    function onFrame() {
      setTime(Date.now() - start);
      animationFrame = requestAnimationFrame(onFrame);
    }

    function onStart() {
      timerStop = setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        setTime(Date.now() - start);
      }, duration);
      start = Date.now();
      animationFrame = requestAnimationFrame(onFrame);
    }
    const timerDelay = setTimeout(onStart, delay);

    return () => {
      clearTimeout(timerStop);
      clearTimeout(timerDelay);
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, delay, targetValue]);
  return elapsed;
}
