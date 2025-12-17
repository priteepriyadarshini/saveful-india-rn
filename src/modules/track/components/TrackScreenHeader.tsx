import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import tw from '../../../common/tailwind';
import { useGetCurrentUserQuery } from '../../../modules/auth/api';
import ProfileIcons from './ProfileIcons';
import { ProfileInfo } from './ProfileInfo';
import { Pressable, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TrackStackParamList } from '../navigation/TrackNavigation';

export default function TrackScreenHeader() {
  //const linkTo = useLinkTo();
  const navigation =
    useNavigation<NativeStackNavigationProp<TrackStackParamList>>();

  const { data: user } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  }); // TODO: Uncomment when useGetCurrentUserQuery is available


  // TODO: Delete when actual query is available
  // const user = {
  //   first_name: 'Guest',// icon is taking value from here
  //   last_name: 'TrackScreenHeader',
  //   inserted_at: '2024-03-15T10:00:00Z',
  // };


  return (
    <View style={tw.style('flex-1 flex-row justify-between px-5')}>
      <View>
        <ProfileInfo />
      </View>
      <View style={tw.style('flex-1 flex-row justify-end')}>
        <Pressable
          onPress={() => {
            navigation.navigate('Settings', { isChangePasswordUpdated: false });
          }}
        >
          <Feather
            style={tw.style('mt-[3px] pr-2.5')}
            name="settings"
            size={30}
            color={tw.color('white')}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate('Profile');
          }}
        >
          <ProfileIcons iconText={user?.first_name.charAt(0)} />
        </Pressable>
      </View>
    </View>
  );
}
