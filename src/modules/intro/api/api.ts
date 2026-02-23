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
    addTagTypes: ['Onboarding', 'DietaryProfile'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      // Update dietary profile (new endpoint)
      updateDietaryProfile: builder.mutation<
        any,
        {
          vegType?: 'OMNI' | 'VEGETARIAN' | 'VEGAN';
          dairyFree?: boolean;
          nutFree?: boolean;
          glutenFree?: boolean;
          hasDiabetes?: boolean;
          otherAllergies?: string[];
          noOfAdults?: number;
          noOfChildren?: number;
          country?: string;
          pincode?: string;
        }
      >({
        query: data => ({
          url: '/api/auth/dietary-profile',
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['DietaryProfile', 'CurrentUser', 'Onboarding'],
        transformResponse: (r: any) => {
          console.log('updateDietaryProfile response (intro):', r);
          // Normalize the MongoDB response
          const normalizedId = r?._id ?? r?.id;
          return {
            ...r,
            id: normalizedId,
            _id: normalizedId,
          };
        },
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            // Refetch current user to get updated dietary profile
            dispatch(api.util.invalidateTags(['CurrentUser']));
          } catch (error) {
            console.error('updateDietaryProfile error:', error);
          }
        },
      }),
      
      getUserOnboarding: builder.query<
        Onboarding | null,
        { accessToken?: string } | void
      >({
        query: params => ({
          url: '/api/auth/onboarding',
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
          dietaryRequirements?: string[];
          allergies?: string[];
          tastePreference: string[];
          trackSurveyDay: string;
        }
      >({
        query: params => ({
          url: '/api/auth/onboarding',
          method: 'POST',
          body: {
            postcode: params.postcode,
            suburb: params.suburb,
            noOfAdults: params.noOfAdults,
            noOfChildren: params.noOfChildren,
            dietaryRequirements: params.dietaryRequirements,
            allergies: params.allergies,
            tastePreference: params.tastePreference,
            trackSurveyDay: params.trackSurveyDay,
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
          tastePreference?: string[];
          trackSurveyDay?: string;
        }
      >({
        query: params => ({
          url: '/api/auth/onboarding',
          method: 'POST',
          body: {
            postcode: params.postcode,
            suburb: params.suburb,
            noOfAdults: params.noOfAdults,
            noOfChildren: params.noOfChildren,
            dietaryRequirements: params.dietaryRequirements,
            allergies: params.allergies,
            tastePreference: params.tastePreference,
            trackSurveyDay: params.trackSurveyDay,
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
  useUpdateDietaryProfileMutation,
  useDeleteUserOnboardingMutation,
  useSearchLocationsQuery,
  useGetLocationQuery,
  useLazyGetLocationQuery,
} = introApi;
