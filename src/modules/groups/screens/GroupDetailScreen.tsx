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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import tw from '../../../common/tailwind';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import {
  useGetUserGroupQuery,
  useDeleteUserGroupMutation,
  useGetGroupChallengesQuery,
  useTransferGroupOwnershipMutation,
  useLeaveGroupMutation,
} from '../../../modules/groups/api/api';
import { useGetCurrentUserQuery } from '../../../modules/auth/api';
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

  const { data: currentUser } = useGetCurrentUserQuery();
  const { data, isLoading, refetch } = useGetUserGroupQuery({ id });
  const { data: challengesData } = useGetGroupChallengesQuery({ communityId: id });
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteUserGroupMutation();
  const [transferOwnership, { isLoading: isTransferring }] = useTransferGroupOwnershipMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();

  // All hooks must be declared before any conditional returns to keep order stable
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'food' | 'challenges' | 'members'>('food');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [pendingOwnerId, setPendingOwnerId] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Ensure the latest stats are fetched whenever screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

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
              const { getSafeErrorMessage } = require('../../../modules/forms/validation');
              Alert.alert('Error', getSafeErrorMessage(error, 'Failed to delete group'));
            }
          },
        },
      ],
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup({ groupId: id }).unwrap();
              Alert.alert('Success', 'Left group successfully');
              navigation.goBack();
            } catch (error: any) {
              const { getSafeErrorMessage } = require('../../../modules/forms/validation');
              Alert.alert('Error', getSafeErrorMessage(error, 'Failed to leave group'));
            }
          },
        },
      ],
    );
  };

  const confirmTransferToMember = async (memberName: string) => {
    if (!pendingOwnerId) return;
    Alert.alert(
      'Transfer Ownership',
      `Are you sure you want to transfer ownership to ${memberName}? You will become a regular member.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setPendingOwnerId(null) },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            try {
              await transferOwnership({ groupId: id, newOwnerId: pendingOwnerId }).unwrap();
              Alert.alert('Success', 'Ownership transferred successfully');
              setPendingOwnerId(null);
              setIsSettingsOpen(false);
              refetch();
            } catch (error: any) {
              const { getSafeErrorMessage } = require('../../../modules/forms/validation');
              Alert.alert('Error', getSafeErrorMessage(error, 'Failed to transfer ownership'));
              setPendingOwnerId(null);
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
  
  const toId = (val: any): string | undefined => {
    if (!val) return undefined;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val._id ?? val.id ?? undefined;
    }
    return undefined;
  };

  const ownerIdValue = toId(group.ownerId);
  const currentUserId = currentUser?.id;
  const isOwnerByOwnerId = !!(ownerIdValue && currentUserId && ownerIdValue === currentUserId);
  const isOwnerByMemberRole = !!members?.some(member => {
    const userId = toId(member.userId);
    return !!(userId && currentUserId && userId === currentUserId && member.role === 'OWNER');
  });
  const isOwner = isOwnerByOwnerId || isOwnerByMemberRole;

  
  const bannerImage = group.profilePhotoUrl ? { uri: group.profilePhotoUrl } : getGroupImage(group._id || group.name);
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
              const categorized = challengesData?.categorized || {
                active: [],
                upcoming: [],
                closed: [],
                cancelled: [],
              };

              const Section = ({ title, items }: { title: string; items: any[] }) => (
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
                  <Section title="ACTIVE CHALLENGES" items={categorized.active} />
                  <Section title="UPCOMING CHALLENGES" items={categorized.upcoming} />
                  <Section title="CLOSED CHALLENGES" items={categorized.closed} />
                  <Section title="CANCELLED CHALLENGES" items={categorized.cancelled} />
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
              members.map((member) => {
                const memberName = member.userId !== null && typeof member.userId === 'object' ? member.userId.name : 'User';
                const memberId = member.userId !== null && typeof member.userId === 'object' ? member.userId._id : member.userId;
                const isMemberOwner = member.role === 'OWNER';
                return (
                  <DebouncedPressable
                    key={member._id}
                    disabled={!isOwner || isMemberOwner}
                    onPress={() => {
                      setPendingOwnerId(memberId as string);
                      confirmTransferToMember(memberName);
                    }}
                    style={tw.style('mb-2 flex-row items-center justify-between rounded-2xl border border-strokecream bg-white p-3')}
                  >
                    <View>
                      <Text style={tw.style(bodySmallRegular, 'text-darkgray')}>
                        {memberName}
                      </Text>
                      {isMemberOwner && (
                        <Text style={tw.style(bodySmallRegular, 'text-eggplant')}>Owner</Text>
                      )}
                    </View>
                    {isOwner && !isMemberOwner && (
                      <Text style={tw.style(subheadSmallUppercase, 'text-eggplant')}>Tap to make owner</Text>
                    )}
                  </DebouncedPressable>
                );
              })
            ) : (
              <Text style={tw.style(bodySmallRegular, 'text-center text-midgray')}>No members yet</Text>
            )}
          </View>
        )}

        {/* Invite Button (not shown on Challenges tab) */}
        {activeTab !== 'challenges' && (
          <View style={tw.style('mx-5 mt-6 gap-3')}>
            <PrimaryButton width="full" buttonSize="large" variant="solid-black" onPress={() => setIsInviteModalOpen(true)}>
              Invite people to this group
            </PrimaryButton>
          </View>
        )}

        {/* Owner actions moved to settings modal */}

        {/* Invite Modal */}
        <ModalComponent
          heading="INVITE PEOPLE TO YOUR GROUP"
          isModalVisible={isInviteModalOpen}
          setIsModalVisible={setIsInviteModalOpen}
          horizontalPadding
        >
          <View style={tw.style('gap-6')}>
            <Text style={tw.style(bodySmallRegular, 'text-center text-darkgray')}>
              To join your group, people need your unique group code. Copy your code and share it with people from this community.
            </Text>

            <View style={tw.style('gap-3')}>
              <Text style={tw.style(subheadSmallUppercase, 'text-center text-darkgray')}>
                YOUR GROUP CODE IS
              </Text>
              <View style={tw.style('rounded-2xl bg-[#E6D4F5] px-6 py-8')}>
                <Text style={tw.style('text-center text-5xl font-bold text-eggplant')}>
                  {data?.group?.joinCode || ''}
                </Text>
              </View>
            </View>

            <View style={tw.style('gap-3')}>
              <PrimaryButton width="full" buttonSize="large" variant="outline-black" onPress={handleCopyCode}>
                Copy code
              </PrimaryButton>
              <SecondaryButton width="full" buttonSize="large" onPress={handleShareCode}>
                Share code
              </SecondaryButton>
            </View>
          </View>
        </ModalComponent>

        {/* Settings Modal */}
        <ModalComponent
          heading="GROUP SETTINGS"
          isModalVisible={isSettingsOpen}
          setIsModalVisible={setIsSettingsOpen}
          horizontalPadding
        >
          <View style={tw.style('gap-3')}>
            {isOwner && (
              <SecondaryButton width="full" buttonSize="large" onPress={() => { setIsSettingsOpen(false); navigation.navigate('EditGroup', { id }); }}>
                Edit group
              </SecondaryButton>
            )}

            {isOwner && (
              <View style={tw.style('gap-2')}>
                <Text style={tw.style(subheadSmallUppercase, 'text-midgray')}>TRANSFER OWNERSHIP</Text>
                <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
                  Tap a member in the Members tab to transfer ownership.
                </Text>
              </View>
            )}

            {isOwner ? (
              <SecondaryButton width="full" buttonSize="large" onPress={() => { setIsSettingsOpen(false); handleDeleteGroup(); }}>
                Delete group
              </SecondaryButton>
            ) : (
              <SecondaryButton width="full" buttonSize="large" onPress={() => { setIsSettingsOpen(false); handleLeaveGroup(); }}>
                Leave group
              </SecondaryButton>
            )}
          </View>
        </ModalComponent>
      </ScrollView>
    </SafeAreaView>
  );
}
