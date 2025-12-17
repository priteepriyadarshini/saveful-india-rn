import { useLinkTo } from '@react-navigation/native';
import GenericCarouselFlatlist from '../../../common/components/GenericCarousel/GenericCarouselFlatlist';
import EggplantButton from '../../../common/components/ThemeButtons/EggplantButton';
import tw from '../../../common/tailwind';
import { LinearGradient } from 'expo-linear-gradient';
//import GroupCard from 'modules/feed/components/GroupCard';
//import JoinGroupModal from 'modules/feed/components/JoinGroupModal';
import { useGetUserGroupsQuery } from '../../../modules/groups/api/api';
import HowItWorksModal from '../../../modules/groups/components/HowItWorksModal';
import { Dimensions, Image, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import { bodyLargeBold, bodySmallRegular, h6TextStyle } from '../../../theme/typography';

const screenWidth = Dimensions.get('screen').width;
const itemLength = screenWidth - 40;

export default function CommunityGroups() {
  const linkTo = useLinkTo();

  const { data: groups } = useGetUserGroupsQuery();

  if (!groups) return null;

  return (
    <View style={tw.style('items-center gap-4 pt-10')}>
      <Text
        style={tw.style(h6TextStyle, 'px-5 text-center')}
        maxFontSizeMultiplier={1}
      >
        community groups
      </Text>
      <View style={tw.style('w-full')}>
        {groups && groups.length > 0 ? (
          <View style={tw.style('w-full')}>
            <GenericCarouselFlatlist
              data={groups}
              contentContainerStyle={tw`pl-5 pr-3`}
              scrollEnabled={true}
              itemLength={itemLength + 8}
              renderItem={({ item }) => (
                <View style={tw`mr-2`} key={item.id}>
                  {/* <GroupCard
                    id={item.id}
                    name={item.name}
                    // banner={item.banner.url}
                  /> */}
                </View>
              )}
            />
          </View>
        ) : (
          <View
            style={tw.style(
              ' mx-5 items-center rounded-[10px] border border-strokecream bg-white px-5 py-7',
              cardDrop,
            )}
          >
            <Image
              resizeMode="contain"
              source={require('../../../../assets/placeholder/community-icon.png')}
              accessibilityIgnoresInvertColors
            />
            <Text
              style={tw.style(bodyLargeBold, 'mt-3 text-center text-midgray')}
            >
              Start saving together
            </Text>
            <Text
              style={tw.style(
                bodySmallRegular,
                'py-3 text-center text-midgray',
              )}
              maxFontSizeMultiplier={1}
            >
              Start a Saveful Community Group with your school, workplace or any
              community you like.
            </Text>

            <HowItWorksModal />
          </View>
        )}
      </View>

      <View style={tw.style('w-full flex-row justify-between gap-2 px-5 pb-8')}>
        <EggplantButton onPress={() => linkTo('/groups/create')}>
          Create a group
        </EggplantButton>
        {/* <JoinGroupModal
          onJoin={(id: string) => linkTo(`/groups/${id}?joined=true`)}
        /> */}
      </View>

      <LinearGradient
        colors={[
          'rgba(238, 228, 215, 0.00)',
          '#EEE4D7',
          '#EEE4D7',
          'rgba(238, 228, 215, 0.00)',
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={tw.style('h-[1px] w-full')}
      />
    </View>
  );
}
