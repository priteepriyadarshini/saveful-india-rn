import React, { useState } from 'react';
import {
  Alert,
  Clipboard,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import {
  useGetUserGroupQuery,
  useDeleteUserGroupMutation,
  useGetGroupChallengesQuery,
} from '../../../modules/groups/api/api';
import { bodyLargeBold, bodySmallRegular, h6TextStyle, subheadSmallUppercase } from '../../../theme/typography';
import { cardDrop } from '../../../theme/shadow';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import ModalComponent from '../../../modules/groups/components/ModalComponent';
import { GroupsStackParamList } from '../navigation/GroupsNavigator';
import { Feather } from '@expo/vector-icons';
import { getGroupImage } from '../../../modules/groups/assets/groupImages';

export default function GroupDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<GroupsStackParamList>>();
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data, isLoading, refetch } = useGetUserGroupQuery({ id });
  const { data: challenges } = useGetGroupChallengesQuery({ communityId: id });
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteUserGroupMutation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCopyCode = () => {
    if (data?.group?.joinCode) {
      Clipboard.setString(data.group.joinCode);
      Alert.alert('Copied!', 'Join code copied to clipboard');
    }
  };

  const handleShareCode = async () => {
    if (data?.group?.joinCode) {
      try {
        await Share.share({
          message: `Join my Saveful Community Group! Use code: ${data.group.joinCode}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup({ id }).unwrap();
              Alert.alert('Success', 'Group deleted successfully');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error?.data?.message || 'Failed to delete group');
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={tw.style('flex-1 items-center justify-center bg-creme')}>
        <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!data || !data.group) {
    return (
      <SafeAreaView style={tw.style('flex-1 items-center justify-center bg-creme')}>
        <Text style={tw.style(bodySmallRegular, 'text-midgray')}>Group not found</Text>
      </SafeAreaView>
    );
  }

  const { group, members } = data;
  const isOwner = typeof group.ownerId === 'object' ? true : false; // If populated, user is owner
  const bannerImage = group.profilePhotoUrl ? { uri: group.profilePhotoUrl } : getGroupImage(group._id || group.name);
  const [activeTab, setActiveTab] = useState<'food' | 'challenges' | 'members'>('food');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const savedKg = ((group.totalFoodSaved || 0) / 1000).toFixed(3);

  return (
    <SafeAreaView style={tw.style('flex-1 bg-creme')}>
      <ScrollView
        contentContainerStyle={tw.style('pb-10')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner */}
        <Image source={bannerImage} style={tw.style('h-40 w-full')} resizeMode="cover" />

        {/* Header Card */}
        <View style={tw.style('mx-5 -mt-6 rounded-3xl bg-creme p-4')}>
          <View style={tw.style('flex-row items-center justify-between')}>
            <DebouncedPressable onPress={() => navigation.goBack()} style={tw.style('w-10 h-10 items-center justify-center')}>
              <Feather name="arrow-left" size={24} color="#1F1F1F" />
            </DebouncedPressable>
            <Text style={tw.style(h6TextStyle, 'text-darkgray')}>
              {group.name}
            </Text>
            <DebouncedPressable onPress={() => setIsSettingsOpen(true)} style={tw.style('w-10 h-10 items-center justify-center')}>
              <Feather name="settings" size={22} color="#1F1F1F" />
            </DebouncedPressable>
          </View>
          {group.description ? (
            <Text style={tw.style(bodySmallRegular, 'mt-2 text-center text-midgray')}>{group.description}</Text>
          ) : null}

          {/* Tabs */}
          <View style={tw.style('mt-4 flex-row rounded-full border border-strokecream bg-white')}> 
            {(['food', 'challenges', 'members'] as const).map((tab, idx) => {
              const label = tab === 'food' ? 'FOOD SAVED' : tab === 'challenges' ? 'CHALLENGES' : 'MEMBERS';
              const isActive = activeTab === tab;
              const itemStyle = tw.style('flex-1 items-center justify-center py-3', isActive ? 'bg-eggplant rounded-full' : '');
              const textStyle = tw.style(subheadSmallUppercase, isActive ? 'text-white' : 'text-darkgray');
              return (
                <DebouncedPressable key={tab} onPress={() => setActiveTab(tab)} style={itemStyle}>
                  <Text style={textStyle}>{label}</Text>
                </DebouncedPressable>
              );
            })}
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'food' && (
          <View style={tw.style('mx-5 mt-4 rounded-2xl border border-strokecream bg-white p-6', cardDrop)}>
            <View style={tw.style('items-center gap-2')}>
              <Feather name="users" size={28} color="#6C2BD9" />
              <Text style={tw.style(subheadSmallUppercase, 'text-midgray text-center')}>THIS GROUP HAS SAVED APPROXIMATELY</Text>
              <Text style={tw.style('font-sans-bold text-6xl text-black')}>{savedKg}</Text>
              <Text style={tw.style(subheadSmallUppercase, 'text-midgray')}>KG OF FOOD</Text>
            </View>
          </View>
        )}

        {activeTab === 'challenges' && (
          <View style={tw.style('mx-5 mt-4 gap-6')}>
            {(() => {
              const now = new Date();
              const list = challenges || [];
              const active = list.filter(c => !!c.isActive);
              const upcoming = list.filter(c => new Date(c.startDate) > now);
              const closed = list.filter(c => new Date(c.endDate) < now);
              const cancelled: typeof list = [];

              const Section = ({ title, items }: { title: string; items: typeof list }) => (
                <View style={tw.style('gap-2')}>
                  <Text style={tw.style(subheadSmallUppercase, 'text-center text-midgray')}>{title}</Text>
                  {items.length === 0 ? (
                    <Text style={tw.style(bodySmallRegular, 'text-center text-midgray')}>No {title.toLowerCase()}</Text>
                  ) : (
                    items.map(challenge => (
                      <DebouncedPressable
                        key={challenge._id}
                        onPress={() => navigation.navigate('ChallengeDetail', { groupId: id, challengeId: challenge._id })}
                        style={tw.style('rounded-2xl border border-strokecream bg-white p-4', cardDrop)}
                      >
                        <Text style={tw.style(bodyLargeBold, 'text-darkgray')}>{challenge.challengeName}</Text>
                        <Text style={tw.style(bodySmallRegular, 'mt-1 text-midgray')} numberOfLines={2}>{challenge.description}</Text>
                      </DebouncedPressable>
                    ))
                  )}
                </View>
              );

              return (
                <>
                  <Section title="ACTIVE CHALLENGES" items={active} />
                  <Section title="UPCOMING CHALLENGES" items={upcoming} />
                  <Section title="CLOSED CHALLENGES" items={closed} />
                  <Section title="CANCELLED CHALLENGES" items={cancelled} />
                </>
              );
            })()}

            {isOwner && (
              <View style={tw.style('mt-2')}>
                <PrimaryButton width="full" buttonSize="large" variant="solid-black" onPress={() => navigation.navigate('CreateChallenge', { groupId: id })}>
                  Create a challenge
                </PrimaryButton>
              </View>
            )}
          </View>
        )}

        {activeTab === 'members' && (
          <View style={tw.style('mx-5 mt-4')}>
            {members && members.length > 0 ? (
              members.map((member) => (
                <View key={member._id} style={tw.style('mb-2 flex-row items-center justify-between rounded-2xl border border-strokecream bg-white p-3', cardDrop)}>
                  <View>
                    <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>
                      {typeof member.userId === 'object' ? member.userId.name : 'User'}
                    </Text>
                    {member.role === 'OWNER' && (
                      <Text style={tw.style(bodySmallRegular, 'text-eggplant')}>Owner</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={tw.style(bodySmallRegular, 'text-center text-midgray')}>No members yet</Text>
            )}
          </View>
        )}

        {/* Invite Button (not shown on Challenges tab) */}
        {activeTab !== 'challenges' && (
          <View style={tw.style('mx-5 mt-6')}>
            <PrimaryButton width="full" buttonSize="large" variant="solid-black" onPress={handleShareCode}>
              Invite people to this group
            </PrimaryButton>
          </View>
        )}

        {/* Owner actions moved to settings modal */}

        {/* Settings Modal */}
        <ModalComponent
          heading="GROUP SETTINGS"
          isModalVisible={isSettingsOpen}
          setIsModalVisible={setIsSettingsOpen}
          horizontalPadding
        >
          <View style={tw.style('gap-3')}>
            <SecondaryButton width="full" buttonSize="large" onPress={() => { setIsSettingsOpen(false); navigation.navigate('EditGroup', { id }); }}>
              Edit group
            </SecondaryButton>
            <SecondaryButton width="full" buttonSize="large" onPress={() => { setIsSettingsOpen(false); Alert.alert('Transfer ownership', 'This feature will be available soon.'); }}>
              Transfer ownership
            </SecondaryButton>
            <SecondaryButton width="full" buttonSize="large" onPress={() => { setIsSettingsOpen(false); handleDeleteGroup(); }}>
              Delete group
            </SecondaryButton>
          </View>
        </ModalComponent>
      </ScrollView>
    </SafeAreaView>
  );
}
