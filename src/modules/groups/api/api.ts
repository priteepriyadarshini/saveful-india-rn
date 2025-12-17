import api from '../../../modules/api';
import { DataResponse } from '../../../modules/api/types';
import {
  Group,
  GroupBanner,
  GroupChallenge,
  GroupChallengeParticipant,
  GroupMember,
} from '../../../modules/groups/api/types';
import { Platform } from 'react-native';

const groupsApi = api
  .enhanceEndpoints({
    addTagTypes: [
      'Groups',
      'GroupMembers',
      'GroupMembersCount',
      'GroupChallenges',
    ],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      getUserGroups: builder.query<Group[] | null, void>({
        query: () => ({
          url: '/api/groups',
          method: 'GET',
        }),
        providesTags: ['Groups'],
        transformResponse: r => (r as DataResponse<Group[]>).data,
      }),
      getUserGroup: builder.query<Group | null, { id: string }>({
        query: params => ({
          url: `/api/groups/${params.id}`,
          method: 'GET',
        }),
        providesTags: ['Groups'],
        transformResponse: r => (r as DataResponse<Group>).data,
      }),
      getUserGroupBanner: builder.query<
        { banner: GroupBanner } | null,
        { id: string }
      >({
        query: params => ({
          url: `/api/groups/${params.id}/banner`,
          method: 'GET',
        }),
        providesTags: ['Groups'],
        transformResponse: r =>
          (r as DataResponse<{ banner: GroupBanner }>).data,
      }),
      createUserGroup: builder.mutation<
        Group | null,
        {
          name: string;
          description: string;
          banner?: string;
        }
      >({
        query: params => ({
          url: '/api/groups',
          method: 'POST',
          body: {
            group: params,
          },
        }),
        invalidatesTags: ['Groups'],
        transformResponse: r => (r as DataResponse<Group>).data,
      }),
      updateUserGroupBanner: builder.mutation<
        { banner: GroupBanner } | null,
        {
          id: string;
          banner: {
            uri: string;
            fileName: string;
            type: string;
          };
        }
      >({
        query: params => {
          const formData = new FormData();
          const banner = {
            uri:
              Platform.OS === `android`
                ? params.banner.uri
                : params.banner.uri.replace(`file://`, ''),
            name: params.banner.fileName,
            type: params.banner.type,
          };
          // @ts-ignore
          formData.append('banner', banner);

          return {
            url: `/api/groups/${params.id}/banner`,
            method: 'PATCH',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          };
        },
        invalidatesTags: ['Groups'],
        transformResponse: r =>
          (r as DataResponse<{ banner: GroupBanner }>).data,
      }),
      updateUserGroup: builder.mutation<Group | null, Partial<Group>>({
        query: params => ({
          url: `/api/groups/${params.id}`,
          method: 'PATCH',
          body: { group: params },
        }),
        invalidatesTags: ['Groups'],
        transformResponse: r => (r as DataResponse<Group>).data,
      }),
      updateUserGroupOwner: builder.mutation<
        Group | null,
        {
          id: string;
          email: string;
        }
      >({
        query: params => {
          const searchParams = new URLSearchParams();
          searchParams.set('email', params.email);

          return {
            url: `/api/groups/${params.id}/change_owner`,
            method: 'PATCH',
            params: searchParams,
          };
        },
        invalidatesTags: ['Groups'],
        transformResponse: r => (r as DataResponse<Group>).data,
      }),
      deleteUserGroup: builder.mutation<void, { id: string }>({
        query: params => ({
          url: `/api/groups/${params.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Groups'],
      }),
      joinUserGroup: builder.mutation<
        { group_member: GroupMember } | null,
        { code: string }
      >({
        query: params => ({
          url: `/api/group_members?code=${params.code}`,
          method: 'POST',
        }),
        invalidatesTags: ['Groups', 'GroupMembers'],
        transformResponse: r =>
          (r as DataResponse<{ group_member: GroupMember }>).data,
      }),
      getGroupMembers: builder.query<
        { group_members: GroupMember[] } | null,
        { id: string; userId?: string }
      >({
        query: params => {
          const searchParams = new URLSearchParams();

          searchParams.set('group_id', params.id);

          if (params.userId) {
            searchParams.set('user_id', params.userId);
          }

          return {
            url: `/api/group_members`,
            method: 'GET',
            params: searchParams,
          };
        },
        providesTags: ['GroupMembers'],
        transformResponse: r =>
          (r as DataResponse<{ group_members: GroupMember[] }>).data,
      }),
      getGroupMembersCount: builder.query<
        { count: number } | null,
        { id: string }
      >({
        query: params => {
          return {
            url: `/api/groups/${params.id}/members_count`,
            method: 'GET',
          };
        },
        providesTags: ['GroupMembersCount'],
        transformResponse: r => (r as DataResponse<{ count: number }>).data,
      }),
      removeMemberFromGroup: builder.mutation<
        GroupMember | null,
        { id: string }
      >({
        query: params => ({
          url: `/api/group_members/${params.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Groups', 'GroupMembers'],
        transformResponse: r => (r as DataResponse<GroupMember>).data,
      }),
      removeMemberFromGroupAsAdmin: builder.mutation<
        GroupMember | null,
        { id: string }
      >({
        query: params => ({
          url: `/api/group_members/${params.id}/remove`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Groups', 'GroupMembers'],
        transformResponse: r => (r as DataResponse<GroupMember>).data,
      }),
      getGroupChallenges: builder.query<
        { group_challenges: GroupChallenge[] } | null,
        { groupId: string }
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges`,
          method: 'GET',
        }),
        providesTags: ['GroupChallenges'],
        transformResponse: r =>
          (r as DataResponse<{ group_challenges: GroupChallenge[] }>).data,
      }),
      getGroupChallenge: builder.query<
        { group_challenge: GroupChallenge } | null,
        { groupId: string; id: string }
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges/${params.id}`,
          method: 'GET',
        }),
        providesTags: ['GroupChallenges'],
        transformResponse: r =>
          (r as DataResponse<{ group_challenge: GroupChallenge }>).data,
      }),
      createGroupChallenge: builder.mutation<
        { group_challenge: GroupChallenge } | null,
        { groupId: string } & Partial<GroupChallenge>
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges`,
          method: 'POST',
          body: params,
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
        transformResponse: r =>
          (r as DataResponse<{ group_challenge: GroupChallenge }>).data,
      }),
      cancelGroupChallenge: builder.mutation<
        { group_challenge: GroupChallenge } | null,
        { groupId: string; id: string }
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges/${params.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
        transformResponse: r =>
          (r as DataResponse<{ group_challenge: GroupChallenge }>).data,
      }),
      joinGroupChallenge: builder.mutation<
        { group_challenge_participant: GroupChallengeParticipant } | null,
        { groupId: string; id: string }
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges/${params.id}/participants`,
          method: 'POST',
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
        transformResponse: r =>
          (
            r as DataResponse<{
              group_challenge_participant: GroupChallengeParticipant;
            }>
          ).data,
      }),
      getGroupChallengeParticipants: builder.query<
        { group_challenge_participants: GroupChallengeParticipant[] } | null,
        { groupId: string; id: string }
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges/${params.id}/participants`,
          method: 'GET',
        }),
        providesTags: ['GroupChallenges'],
        transformResponse: r =>
          (
            r as DataResponse<{
              group_challenge_participants: GroupChallengeParticipant[];
            }>
          ).data,
      }),
      getGroupChallengeParticipant: builder.query<
        { group_challenge_participant: GroupChallengeParticipant } | null,
        { groupId: string; groupChallengeId: string; id: string }
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges/${params.groupChallengeId}/participants/${params.id}`,
          method: 'GET',
        }),
        providesTags: ['GroupChallenges'],
        transformResponse: r =>
          (
            r as DataResponse<{
              group_challenge_participant: GroupChallengeParticipant;
            }>
          ).data,
      }),
      getGroupChallengeCurrentParticipant: builder.query<
        { group_challenge_participant: GroupChallengeParticipant } | null,
        { groupId: string; groupChallengeId: string }
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges/${params.groupChallengeId}/participant`,
          method: 'GET',
        }),
        providesTags: ['GroupChallenges'],
        transformResponse: r =>
          (
            r as DataResponse<{
              group_challenge_participant: GroupChallengeParticipant;
            }>
          ).data,
      }),
      leaveGroupChallenge: builder.mutation<
        { group_challenge_participant: GroupChallengeParticipant } | null,
        { groupId: string; groupChallengeId: string; id: string }
      >({
        query: params => ({
          url: `/api/groups/${params.groupId}/challenges/${params.groupChallengeId}/participants/${params.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Groups', 'GroupChallenges'],
        transformResponse: r =>
          (
            r as DataResponse<{
              group_challenge_participant: GroupChallengeParticipant;
            }>
          ).data,
      }),
    }),
  });

export default groupsApi;

export const {
  useGetUserGroupsQuery,
  useGetUserGroupQuery,
  useGetUserGroupBannerQuery,
  useCreateUserGroupMutation,
  useUpdateUserGroupBannerMutation,
  useJoinUserGroupMutation,
  useGetGroupMembersQuery,
  useGetGroupMembersCountQuery,
  useUpdateUserGroupMutation,
  useUpdateUserGroupOwnerMutation,
  useDeleteUserGroupMutation,
  useRemoveMemberFromGroupMutation,
  useRemoveMemberFromGroupAsAdminMutation,
  useGetGroupChallengesQuery,
  useGetGroupChallengeQuery,
  useCreateGroupChallengeMutation,
  useCancelGroupChallengeMutation,
  useJoinGroupChallengeMutation,
  useGetGroupChallengeParticipantsQuery,
  useGetGroupChallengeParticipantQuery,
  useGetGroupChallengeCurrentParticipantQuery,
  useLeaveGroupChallengeMutation,
} = groupsApi;
