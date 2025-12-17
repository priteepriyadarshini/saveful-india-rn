// import tw from '../../../common/tailwind';
// import DeveloperFormLabel from '../../../modules/developer/components/DeveloperFormLabel';
// import {
//   useDeleteUserOnboardingMutation,
//   useGetUserOnboardingQuery,
// } from 'modules/intro/api/api';
// import React from 'react';
// import { Alert, Button, View } from 'react-native';

// export default function UserOnboardingReset() {
//   const { data, isLoading } = useGetUserOnboardingQuery();
//   const [deleteUserOnboarding] = useDeleteUserOnboardingMutation();

//   const onDelete = async () => {
//     try {
//       await deleteUserOnboarding();
//     } catch (error) {
//       Alert.alert('Error deleting onboarding');
//     }
//   };

//   return (
//     <View style={tw`flex flex-row items-center justify-between py-2`}>
//       <DeveloperFormLabel>Onboarding</DeveloperFormLabel>
//       <Button
//         disabled={isLoading}
//         title={data ? 'Completed' : 'Not completed'}
//         onPress={() => {
//           if (data) {
//             onDelete();
//           }
//         }}
//       />
//     </View>
//   );
// }
