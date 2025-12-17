// import { CompositeScreenProps } from '@react-navigation/native';
// import {
//   createNativeStackNavigator,
//   NativeStackScreenProps,
// } from '@react-navigation/native-stack';
// import tw from '../../../common/tailwind';
// import { FeedStackScreenProps } from '../../../modules/feed/navigation/FeedNavigation';
// // import CreateChallengeScreen from 'modules/groups/screens/CreateChallengeScreen';
// // import CreateGroupScreen from 'modules/groups/screens/CreateGroupScreen';
// // import CreateGroupSuccessScreen from 'modules/groups/screens/CreateGroupSuccessScreen';
// // import EditGroupScreen from 'modules/groups/screens/EditGroupScreen';
// // import GroupChallengeDetailScreen from 'modules/groups/screens/GroupChallengeDetailScreen';
// // import GroupDetailScreen from 'modules/groups/screens/GroupDetailScreen';
// import React from 'react';

// export type GroupsStackParamList = {
//   CreateGroup: undefined;
//   CreateGroupSuccess: { id: string };
//   GroupDetail: { id: string; joined?: string };
//   EditGroup: { id: string };
//   GroupChallengeDetail: { groupId: string; id: string };
//   CreateChallenge: { groupId: string };
// };

// export type GroupsStackScreenProps<Screen extends keyof GroupsStackParamList> =
//   CompositeScreenProps<
//     NativeStackScreenProps<GroupsStackParamList, Screen>,
//     FeedStackScreenProps<'Groups'>
//   >;

// const NavigationStack = createNativeStackNavigator<GroupsStackParamList>();

// export default function GroupsStackNavigator() {
//   return (
//     <NavigationStack.Navigator
//       screenOptions={({ navigation }) => ({
//         detachPreviousScreen: !navigation.isFocused(),
//         headerTintColor: tw.color('gray-900'),
//       })}
//     >
//       <NavigationStack.Screen
//         name="CreateGroup"
//         component={CreateGroupScreen}
//         options={() => ({
//           title: '',
//           headerShown: false,
//         })}
//       />
//       <NavigationStack.Screen
//         name="CreateGroupSuccess"
//         component={CreateGroupSuccessScreen}
//         options={() => ({
//           title: '',
//           headerShown: false,
//         })}
//       />
//       <NavigationStack.Screen
//         name="GroupDetail"
//         component={GroupDetailScreen}
//         options={() => ({
//           title: '',
//           headerShown: false,
//         })}
//       />
//       <NavigationStack.Screen
//         name="EditGroup"
//         component={EditGroupScreen}
//         options={() => ({
//           title: '',
//           headerShown: false,
//         })}
//       />
//       <NavigationStack.Screen
//         name="GroupChallengeDetail"
//         component={GroupChallengeDetailScreen}
//         options={() => ({
//           title: '',
//           headerShown: false,
//         })}
//       />
//       <NavigationStack.Screen
//         name="CreateChallenge"
//         component={CreateChallengeScreen}
//         options={() => ({
//           title: '',
//           headerShown: false,
//         })}
//       />
//     </NavigationStack.Navigator>
//   );
// }
