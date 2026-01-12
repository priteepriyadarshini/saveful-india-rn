import api from '../../../modules/api';
import { DataResponse } from '../../../modules/api/types';
import {
  Group,
  GroupBanner,
  GroupChallenge,
  GroupChallengeParticipant,
  GroupMember,
  GroupResponse,
} from '../../../modules/groups/api/types';
import { Platform } from 'react-native';

const groupsApi = api
  .enhanceEndpoints({
    addTagTypes: [
      'Groups',
      'GroupMembers',
      'GroupMembersCount',
      'GroupChallenges',
      'Challenges',
    ],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      // Get all user's groups (created by user)
      getUserGroups: builder.query<Group[], void>({
        query: () => ({
          url: '/api/community-groups/individual-created',
          method: 'GET',
        }),
        transformResponse: (response: Group[]) =>
          Array.isArray(response) ? response.filter(g => !(g as any).isDeleted) : [],
        refetchOnFocus: true,
        refetchOnReconnect: true,
        providesTags: ['Groups'],
      }),

      // Get groups where the user is a member (not just owner)
      getMemberGroups: builder.query<Group[], void>({
        query: () => ({
          url: '/api/community-groups/userGroups',
          method: 'GET',
        }),
        // The backend returns an array of objects { role, joinedViaCode, group: { ... } }
        // Server already filters isDeleted; map cleanly to Group[]
        transformResponse: (response: any[]) =>
          Array.isArray(response)
            ? response
                .filter(item => !!item?.group)
                .map(item => item.group as Group)
            : [],
        refetchOnFocus: true,
        refetchOnReconnect: true,
        providesTags: ['Groups'],
      }),
      
      // Get specific group by ID with members
      getUserGroup: builder.query<GroupResponse, { id: string }>({
        query: params => ({
          url: `/api/community-groups/${params.id}`,
          method: 'GET',
        }),
        refetchOnFocus: true,
        refetchOnReconnect: true,
        providesTags: ['Groups', 'GroupMembers'],
      }),

      // Create a new group
      createUserGroup: builder.mutation<
        Group,
        {
          name: string;
          description: string;
          profileImage?: {
            uri: string;
            name: string;
            type: string;
          };
        }
      >({
        query: params => {
          // If no image, send JSON to simplify request
          if (!params.profileImage) {
            return {
              url: '/api/community-groups',
              method: 'POST',
              body: {
                name: params.name,
                description: params.description,
              },
            };
          }

          const formData = new FormData();
          formData.append('name', params.name);
          formData.append('description', params.description);

          // @ts-ignore - React Native FormData accepts this format
          formData.append('profileImage', {
            uri:
              Platform.OS === 'android'
                ? params.profileImage.uri
                : params.profileImage.uri.replace('file://', ''),
            name: params.profileImage.name,
            // Force a standard MIME type for reliability
            type: 'image/jpeg',
          } as any);

          return {
            url: '/api/community-groups',
            method: 'POST',
            body: formData,
          };
        },
        invalidatesTags: ['Groups'],
      }),

      // Update group
      updateUserGroup: builder.mutation<
        Group,
        {
          groupId: string;
          name?: string;
          description?: string;
          groupProfileImage?: {
            uri: string;
            name: string;
            type: string;
          };
        }
      >({
        query: params => {
          // If no image, send JSON body
          if (!params.groupProfileImage) {
            return {
              url: '/api/community-groups',
              method: 'PATCH',
              body: {
                groupId: params.groupId,
                name: params.name,
                description: params.description,
              },
            };
          }

          const formData = new FormData();
          formData.append('groupId', params.groupId);
          if (params.name) formData.append('name', params.name);
          if (params.description) formData.append('description', params.description);

          // @ts-ignore - React Native FormData accepts this format
          formData.append('groupProfileImage', {
            uri:
              Platform.OS === 'android'
                ? params.groupProfileImage.uri
                : params.groupProfileImage.uri.replace('file://', ''),
            name: params.groupProfileImage.name,
            type: 'image/jpeg',
          } as any);

          return {
            url: '/api/community-groups',
            method: 'PATCH',
            body: formData,
          };
        },
        invalidatesTags: ['Groups'],
      }),

      // Delete group
      deleteUserGroup: builder.mutation<void, { id: string }>({
        query: params => ({
          url: `/api/community-groups/${params.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Groups', 'GroupMembers', 'Challenges'],
      }),

      // Join group by code
      joinUserGroup: builder.mutation<
        { message: string },
        { code: string }
      >({
        query: params => ({
          url: '/api/community-groups/join-group',
          method: 'POST',
          body: { code: params.code },
        }),
        invalidatesTags: ['Groups', 'GroupMembers'],
      }),

      // Challenge endpoints
      getGroupChallenges: builder.query<
        {
          challenges: GroupChallenge[];
          categorized: {
            active: GroupChallenge[];
            upcoming: GroupChallenge[];
            closed: GroupChallenge[];
            cancelled: GroupChallenge[];
          };
        },
        { communityId: string }
      >({
        query: params => ({
          url: `/api/community-groups/${params.communityId}/challenges`,
          method: 'GET',
        }),
        providesTags: ['GroupChallenges'],
      }),

      getGroupChallenge: builder.query<
        GroupChallenge,
        { challengeId: string }
      >({
        query: params => ({
          url: `/api/community-groups/challenges/${params.challengeId}`,
          method: 'GET',
        }),
        providesTags: ['GroupChallenges'],
      }),

      createGroupChallenge: builder.mutation<
        GroupChallenge,
        {
          communityId: string;
          challengeName: string;
          description: string;
          startDate: Date;
          endDate: Date;
          challengeGoals: number;
        }
      >({
        query: params => ({
          url: '/api/community-groups/challenges',
          method: 'POST',
          body: params,
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
      }),

      joinGroupChallenge: builder.mutation<
        { message: string; result: GroupChallengeParticipant },
        { communityId: string; challnageId: string }
      >({
        query: params => ({
          url: '/api/community-groups/challenges/join',
          method: 'POST',
          body: params,
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
      }),

      leaveGroupChallenge: builder.mutation<
        { message: string; status: boolean },
        { communityId: string; challengeId: string }
      >({
        query: params => ({
          url: '/api/community-groups/challenges/leave',
          method: 'POST',
          body: params,
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
      }),

      transferGroupOwnership: builder.mutation<
        { message: string; newOwner: any },
        { groupId: string; newOwnerId: string }
      >({
        query: params => ({
          url: '/api/community-groups/transfer-ownership',
          method: 'POST',
          body: params,
        }),
        invalidatesTags: ['Groups', 'GroupMembers'],
      }),

      updateGroupChallenge: builder.mutation<
        GroupChallenge,
        {
          challengeId: string;
          challengeName?: string;
          description?: string;
          startDate?: Date;
          endDate?: Date;
          challengeGoals?: number;
          status?: boolean;
        }
      >({
        query: ({ challengeId, ...body }) => ({
          url: `/api/community-groups/challenges/${challengeId}`,
          method: 'PATCH',
          body,
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
      }),

      deleteGroupChallenge: builder.mutation<
        { message: string },
        { challengeId: string }
      >({
        query: params => ({
          url: `/api/community-groups/challenges/${params.challengeId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
      }),

      leaveGroup: builder.mutation<
        { message: string },
        { groupId: string }
      >({
        query: params => ({
          url: `/api/community-groups/${params.groupId}/leave`,
          method: 'POST',
        }),
        invalidatesTags: ['Groups', 'GroupMembers'],
      }),
    }),
  });

export default groupsApi;

export const {
  useGetUserGroupsQuery,
  useGetMemberGroupsQuery,
  useGetUserGroupQuery,
  useCreateUserGroupMutation,
  useJoinUserGroupMutation,
  useUpdateUserGroupMutation,
  useDeleteUserGroupMutation,
  useGetGroupChallengesQuery,
  useGetGroupChallengeQuery,
  useCreateGroupChallengeMutation,
  useJoinGroupChallengeMutation,
  useLeaveGroupChallengeMutation,
  useTransferGroupOwnershipMutation,
  useUpdateGroupChallengeMutation,
  useDeleteGroupChallengeMutation,
  useLeaveGroupMutation,
} = groupsApi;
