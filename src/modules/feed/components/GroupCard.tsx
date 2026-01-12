import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import tw from '../../../common/tailwind';
import { Group } from '../../../modules/groups/api/types';
import { Image, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import { bodyLargeBold, subheadSmallUppercase } from '../../../theme/typography';
import { FeedStackParamList } from '../navigation/FeedNavigation';
import { getGroupImage } from '../../../modules/groups/assets/groupImages';

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();

  const localRandomImage = getGroupImage(group._id || group.name);
  const memberCount = typeof (group as any).memberCount === 'number' ? (group as any).memberCount : 0;

  return (
    <DebouncedPressable
      onPress={() => navigation.navigate('Groups', { screen: 'GroupDetail', params: { id: group._id } })}
      style={tw.style(
        'w-full rounded-2xl border border-strokecream bg-white overflow-hidden',
      )}
    >
      <View style={tw.style('w-85')}>
        <Image
          source={group.profilePhotoUrl ? { uri: group.profilePhotoUrl } : localRandomImage}
          style={tw.style('h-36 w-full')}
          resizeMode="cover"
        />
        <View style={tw.style('px-4 py-3')}>
          <Text style={tw.style(bodyLargeBold, 'text-darkgray')} numberOfLines={2}>
            {group.name}
          </Text>
          <Text style={tw.style(subheadSmallUppercase, 'text-midgray mt-1')}>
            {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
          </Text>
        </View>
      </View>
    </DebouncedPressable>
  );
}
