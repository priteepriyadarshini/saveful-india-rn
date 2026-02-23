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
        // POST /api/auth/onboarding doesn't exist on the backend.
        // The dietary-profile endpoint is the canonical way to persist these
        // fields; map legacy field names (suburb→country, postcode→pincode).
        // trackSurveyDay has no backend storage yet, so it is omitted.
        query: params => ({
          url: '/api/auth/dietary-profile',
          method: 'PUT',
          body: {
            country: params.suburb,
            pincode: params.postcode,
            noOfAdults: params.noOfAdults,
            noOfChildren: params.noOfChildren,
            otherAllergies: params.allergies,
          },
        }),
        invalidatesTags: ['Onboarding', 'CurrentUser'],
        // dietary-profile returns the updated profile, not an Onboarding shape.
        // Re-use the cached onboarding object — the tags invalidation above will
        // trigger a fresh getUserOnboarding fetch to keep the cache in sync.
        transformResponse: (_r, _meta, params) => ({
          suburb: params.suburb ?? '',
          postcode: params.postcode ?? '',
          no_of_people: {
            adults: params.noOfAdults ?? 0,
            children: params.noOfChildren ?? 0,
          },
          dietary_requirements: params.dietaryRequirements ?? [],
          allergies: params.allergies ?? [],
          taste_preference: params.tastePreference ?? [],
          track_survey_day: params.trackSurveyDay ?? 'monday',
        }),
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
