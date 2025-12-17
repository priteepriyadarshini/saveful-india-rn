import api from '../../api';
import {
  AutocompleteResult,
  LocationAutocomplete,
  LocationMetadata,
  Onboarding,
  OnboardingResponse,
} from '../../../modules/intro/api/types';

const introApi = api
  .enhanceEndpoints({
    addTagTypes: ['Onboarding'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      getUserOnboarding: builder.query<
        Onboarding | null,
        { accessToken?: string } | void
      >({
        query: params => ({
          url: '/api/onboarding',
          method: 'get',
          headers: params?.accessToken
            ? { authorization: `Bearer ${params?.accessToken}` }
            : undefined,
        }),
        providesTags: ['Onboarding'],
        transformResponse: r => (r as OnboardingResponse).onboarding,
      }),
      createUserOnboarding: builder.mutation<
        Onboarding,
        {
          postcode: string;
          suburb: string;
          noOfAdults: number;
          noOfChildren: number;
          dietaryRequirements: string[];
          allergies: string[];
          tastePreference: string[];
          trackSurveyDay: string;
        }
      >({
        query: params => ({
          url: '/api/onboarding',
          method: 'POST',
          body: {
            postcode: params.postcode,
            suburb: params.suburb,
            no_of_people: {
              adults: params.noOfAdults,
              children: params.noOfChildren,
            },
            dietary_requirements: params.dietaryRequirements,
            allergies: params.allergies,
            taste_preference: params.tastePreference,
            track_survey_day: params.trackSurveyDay,
          },
        }),
        invalidatesTags: ['Onboarding'],
        transformResponse: r => (r as OnboardingResponse).onboarding,
      }),
      updateUserOnboarding: builder.mutation<
        Onboarding,
        {
          postcode?: string;
          suburb?: string;
          noOfAdults?: number;
          noOfChildren?: number;
          dietaryRequirements?: string[];
          allergies?: string[];
          trackSurveyDay?: string;
        }
      >({
        query: params => ({
          url: '/api/onboarding/update',
          method: 'POST',
          body: {
            postcode: params.postcode,
            suburb: params.suburb,
            no_of_people: {
              adults: params.noOfAdults,
              children: params.noOfChildren,
            },
            dietary_requirements: params.dietaryRequirements,
            allergies: params.allergies,
            track_survey_day: params.trackSurveyDay,
          },
        }),
        invalidatesTags: ['Onboarding'],
        transformResponse: r => (r as OnboardingResponse).onboarding,
      }),
      deleteUserOnboarding: builder.mutation<void, void>({
        query: () => ({
          url: '/api/onboarding',
          method: 'DELETE',
        }),
        invalidatesTags: ['Onboarding'],
      }),
      searchLocations: builder.query<
        LocationAutocomplete[] | undefined,
        { search: string; postcodesOnly: boolean }
      >({
        query: ({ search }) => {
          return {
            method: 'GET',
            url: `/api/locations/autocomplete?search=${search}`,
          };
        },
        extraOptions: {
          credentials: 'same-origin',
        },
        transformResponse: (
          r: AutocompleteResult,
          _meta,
          { postcodesOnly },
        ) => {
          if (!postcodesOnly) return r.completions;

          // Filter out completions that don't end in a postcode!
          return r.completions?.filter(
            r => r.full_location.match(/\d+$/) != null,
          );
        },
      }),
      getLocation: builder.query<LocationMetadata, { id: string }>({
        query: ({ id }) => {
          return {
            method: 'GET',
            url: `/api/locations/details/?id=${id}`,
          };
        },
        extraOptions: {
          credentials: 'same-origin',
        },
        transformResponse: (r: LocationMetadata) => {
          return {
            ...r,
            location_type: 'locality',
          };
        },
      }),
    }),
  });

export default introApi;

export const {
  useCreateUserOnboardingMutation,
  useGetUserOnboardingQuery,
  useUpdateUserOnboardingMutation,
  useDeleteUserOnboardingMutation,
  useSearchLocationsQuery,
  useGetLocationQuery,
  useLazyGetLocationQuery,
} = introApi;
