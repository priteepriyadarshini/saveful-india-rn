import api from '../../../modules/api';
import {
  ChallengeResponse,
  ChallengeResult,
  ChallengesResponse,
} from '../../../modules/challenges/api/types';

const trackApi = api
  .enhanceEndpoints({
    addTagTypes: ['Challenges'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      getUserChallenges: builder.query<ChallengeResult[] | null, void>({
        query: () => ({
          url: '/api/challenges',
          method: 'get',
        }),
        providesTags: ['Challenges'],
        transformResponse: r => (r as ChallengesResponse).challenge,
      }),
      getUserChallenge: builder.query<ChallengeResult | null, { slug: string }>(
        {
          query: params => ({
            url: `/api/challenges/${params.slug}`,
            method: 'get',
          }),
          providesTags: ['Challenges'],
          transformResponse: r => (r as ChallengeResponse).challenge,
        },
      ),
      createUserChallenge: builder.mutation<
        ChallengeResult,
        {
          challengeSlug: string;
          data: any;
        }
      >({
        query: params => ({
          url: '/api/challenges',
          method: 'POST',
          body: {
            challenge_slug: params.challengeSlug,
            data: params.data,
          },
        }),
        invalidatesTags: ['Challenges'],
        transformResponse: r => (r as ChallengeResponse).challenge,
      }),
      updateUserChallenge: builder.mutation<
        ChallengeResult,
        {
          slug: string;
          data: any;
        }
      >({
        query: params => ({
          url: `/api/challenges/${params.slug}/update`,
          method: 'POST',
          body: {
            data: params.data,
          },
        }),
        invalidatesTags: ['Challenges'],
        transformResponse: r => (r as ChallengeResponse).challenge,
      }),
    }),
  });

export default trackApi;

export const {
  useGetUserChallengesQuery,
  useGetUserChallengeQuery,
  useCreateUserChallengeMutation,
  useUpdateUserChallengeMutation,
} = trackApi;
