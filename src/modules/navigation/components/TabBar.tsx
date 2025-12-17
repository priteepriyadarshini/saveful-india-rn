// import React from 'react';
// import { View } from 'react-native';
// import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import TabBarIcon from './TabBarIcon'; // Adjust path if needed
// import tw from '../../../common/tailwind'; // Adjust path if needed


// export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
//   const insets = useSafeAreaInsets();
//   const paddingBottom = insets.bottom > 0 ? `pb-[${insets.bottom}px]` : 'pb-3';

//   const focusedOptions = descriptors[state.routes[state.index].key].options;
//   if ((focusedOptions?.tabBarStyle as any)?.display === 'none') {
//     return null;
//   }

//   return (
//     <View style={tw.style(`flex-row bg-white border-t border-gray-200 ${paddingBottom}`)}>
//       {state.routes.map((route, index) => (
//         <TabBarIcon
//           key={route.key}
//           route={route}
//           navigation={navigation}
//           focused={state.index === index}
//         />
//       ))}
//     </View>
//   );
// }



import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import tw from '../../../common/tailwind';
import TabBarIcon from '../../../modules/navigation/components/TabBarIcon';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = insets.bottom === 0 ? 'p-0' : `pb-${insets.bottom}px`;

  const focusedOptions = descriptors[state.routes[state.index].key].options;

  const { newCurrentRoute } = useCurentRoute();

  if ((focusedOptions?.tabBarStyle as any)?.display === 'none') {
    return null;
  }

  return (
    <View
      style={tw`flex-row ${paddingBottom} ${
        newCurrentRoute === 'MakeIt'
          ? 'bg-kale border-t border-middlegreen'
          : 'bg-white'
      } shadow-lg`}
    >
      {state.routes.map((route, index) => {
        return (
          <TabBarIcon
            key={route.name}
            navigation={navigation}
            route={route}
            focused={state.index === index}
          />
        );
      })}
    </View>
  );
}

export default TabBar;
