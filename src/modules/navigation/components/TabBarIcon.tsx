import React from 'react';
import { Image, ImageRequireSource, Pressable, Text } from 'react-native';
import { NavigationHelpers, ParamListBase } from '@react-navigation/native';
import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import tw from '../../../common/tailwind'; // Adjust path if needed
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { mixpanelEventName } from '../../analytics/analytics';


// interface TabBarIconProps {
//   navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
//   route: { name: string; key: string };
//   focused: boolean;
// }

// function TabBarIcon(props: TabBarIconProps) {
//   const { navigation, route, focused } = props;

//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const { newCurrentRoute } = useCurentRoute();

//   const safeArea = useSafeAreaInsets();
//   //const { sendAnalyticsEvent } = useAnalytics();

//   const makeItRoute = newCurrentRoute === 'MakeIt';

//   const paddingStyle = { paddingBottom: safeArea.bottom > 0 ? 0 : 13 };

//   let iconSource: ImageRequireSource;

//   switch (route.name) {
//     case 'Feed':
//       iconSource = focused
//         ? require('../../../../assets/icons/tabbar/feed/ic_feed_active.png')
//         : makeItRoute
//         ? require('../../../../assets/icons/tabbar/feed/ic_feed_creme.png')
//         : require('../../../../assets/icons/tabbar/feed/ic_feed_inactive.png');
//       break;
//     case 'Make':
//       iconSource = focused
//         ? makeItRoute
//           ? require('../../../../assets/icons/tabbar/make/ic_make_lime.png')
//           : require('../../../../assets/icons/tabbar/make/ic_make_active.png')
//         : require('../../../../assets/icons/tabbar/make/ic_make_inactive.png');
//       break;
//     case 'Hack':
//       iconSource = focused
//         ? require('../../../../assets/icons/tabbar/hack/ic_hack_active.png')
//         : makeItRoute
//         ? require('../../../../assets/icons/tabbar/hack/ic_hack_creme.png')
//         : require('../../../../assets/icons/tabbar/hack/ic_hack_inactive.png');
//       break;
//     case 'Track':
//       iconSource = focused
//         ? require('../../../../assets/icons/tabbar/track/ic_track_active.png')
//         : makeItRoute
//         ? require('../../../../assets/icons/tabbar/track/ic_track_creme.png')
//         : require('../../../../assets/icons/tabbar/track/ic_track_inactive.png');
//       break;
//     default:
//       iconSource = require('../../../../assets/icons/tabbar/feed/ic_feed_inactive.png');
//       break;
//   }


//   const onPress = () => {
//     const event = navigation.emit({
//       type: 'tabPress',
//       target: route.key,
//       canPreventDefault: true,
//     });

//     if (!focused && !event.defaultPrevented) {
//       navigation.navigate(route.name);
//     }
//   };

//   return (
//     <Pressable
//       accessibilityRole="button"
//       onPress={onPress}
//       style={tw.style('flex-1 items-center justify-center py-2')}
//     >
//       <Image
//         source={iconSource}
//         accessibilityIgnoresInvertColors
//       />
//       <Text style={tw.style(`text-xs mt-1 font-semibold ${focused ? 'text-black' : 'text-gray-500'}`)}>
//         {route.name}
//       </Text>
//     </Pressable>
//   );
// }

// export default TabBarIcon;



interface TabBarIconProps {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  route: { name: string; key: string };
  focused: boolean;
}

function TabBarIcon(props: TabBarIconProps) {
  const { navigation, route, focused } = props;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { newCurrentRoute } = useCurentRoute();

  const safeArea = useSafeAreaInsets();
  const { sendAnalyticsEvent } = useAnalytics();

  const makeItRoute = newCurrentRoute === 'MakeIt';

  const paddingStyle = { paddingBottom: safeArea.bottom > 0 ? 0 : 13 };

  let iconSource: ImageRequireSource;

  switch (route.name) {
    case 'Feed':
      iconSource = focused
        ? require('../../../../assets/icons/tabbar/feed/ic_feed_active.png')
        : makeItRoute
        ? require('../../../../assets/icons/tabbar/feed/ic_feed_creme.png')
        : require('../../../../assets/icons/tabbar/feed/ic_feed_inactive.png');
      break;
    case 'Make':
      iconSource = focused
        ? makeItRoute
          ? require('../../../../assets/icons/tabbar/make/ic_make_lime.png')
          : require('../../../../assets/icons/tabbar/make/ic_make_active.png')
        : require('../../../../assets/icons/tabbar/make/ic_make_inactive.png');
      break;
    case 'Hack':
      iconSource = focused
        ? require('../../../../assets/icons/tabbar/hack/ic_hack_active.png')
        : makeItRoute
        ? require('../../../../assets/icons/tabbar/hack/ic_hack_creme.png')
        : require('../../../../assets/icons/tabbar/hack/ic_hack_inactive.png');
      break;
    case 'Track':
      iconSource = focused
        ? require('../../../../assets/icons/tabbar/track/ic_track_active.png')
        : makeItRoute
        ? require('../../../../assets/icons/tabbar/track/ic_track_creme.png')
        : require('../../../../assets/icons/tabbar/track/ic_track_inactive.png');
      break;
    default:
      iconSource = require('../../../../assets/icons/tabbar/feed/ic_feed_inactive.png');
      break;
  }

  const pascalCaseTransform = (text: string) => {
    if (text === 'Shop') {
      // Im just parsing it here because if we change it in the stack/tab itself, we should rename EVERYWHERE.
      // So we should be sure that we want this change :P
      return 'Brands';
    }

    return text.replace(/([A-Z][a-z])/g, ' $1').replace(/(\d)/g, ' $1');
  };

  const onPress = () => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: route.name,
        action: mixpanelEventName.tabNavigated,
      },
    });
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!focused && !event.defaultPrevented) {
      // The `merge: true` option makes sure that the params inside the tab screen are preserved
      navigation.navigate(route.name);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      style={tw.style(
        'pt-7px flex-1 flex-col items-center justify-center',
        paddingStyle,
      )}
      onPress={onPress}
    >
      <Image
        style={[
          tw`h-6 w-6`,
          // { tintColor: focused ? undefined : tw.color('gray-200') },
        ]}
        source={iconSource}
        accessibilityIgnoresInvertColors
      />
      <Text
        minimumFontScale={1}
        maxFontSizeMultiplier={1.5}
        style={tw.style(
          `text-10px mt-1 font-sans-bold tracking-tight ${
            focused
              ? `font-sans-semibold ${
                  makeItRoute ? 'text-creme' : 'text-black'
                }`
              : `font-sans-semibold ${
                  makeItRoute ? 'text-creme' : 'text-stone'
                } `
          }`,
        )}
      >
        {pascalCaseTransform(route.name)}
      </Text>
    </Pressable>
  );
}

export default TabBarIcon;
