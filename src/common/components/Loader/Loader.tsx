import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import useInterval from '../../hooks/useInterval';
import Dot from './components/Dot';

const DOT_COUNT = 3;

function Loader({ type }: { type?: 'dark' | 'light' }) {
  const dots = Array.from(Array(DOT_COUNT).keys());
  const [currentDot, setCurrentDot] = React.useState<number>(0);

  useInterval(() => {
    setCurrentDot((currentDot + 1) % DOT_COUNT);
  }, 520);

  return (
    <View style={tw`mb-1 flex-row items-center`}>
      {dots.map(i => (
        <Dot key={i} type={type} active={i === currentDot} />
      ))}
    </View>
  );
}

export default Loader;
