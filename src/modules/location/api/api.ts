import api from '../../api';
import { DataResponse } from '../../../modules/api/types';
import {
  CurrentUserLocation,
  CurrentUserLocationRequest,
} from '../../../modules/location/api/types';

const locationApi = api
  .enhanceEndpoints({
    addTagTypes: ['CurrentUserLocation'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      createCurrentUserLocation: builder.mutation<
        CurrentUserLocation,
        CurrentUserLocationRequest
      >({
        query: ({ ip, lat, lng, source }) => ({
          url: '/api/current_user/locations',
          body: {
            ip,
            lat,
            lng,
            source,
          },
          method: 'post',
        }),
        invalidatesTags: ['CurrentUserLocation'],
        transformResponse: r => (r as DataResponse<CurrentUserLocation>).data,
      }),
    }),
  });

export default locationApi;

export const { useCreateCurrentUserLocationMutation } = locationApi;
