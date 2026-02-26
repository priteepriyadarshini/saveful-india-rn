import api from '../../api';
import {
  QantasFFNResponse,
  QantasDashboardResponse,
  LinkFFNDto,
  UnlinkFFNResponse,
} from './types';

const qantasApi = api
  .enhanceEndpoints({
    addTagTypes: ['QantasFFN'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      /**
       * GET /api/qantas
       * Returns linked FFN data or null.
       */
      getFFN: builder.query<QantasFFNResponse | null, void>({
        query: () => ({
          url: '/api/qantas',
          method: 'GET',
        }),
        providesTags: ['QantasFFN'],
      }),

      /**
       * GET /api/qantas/dashboard
       * Returns full Qantas dashboard: progress, points, tier.
       */
      getQantasDashboard: builder.query<QantasDashboardResponse | null, void>({
        query: () => ({
          url: '/api/qantas/dashboard',
          method: 'GET',
        }),
        providesTags: ['QantasFFN'],
      }),

      /**
       * POST /api/qantas/link
       * Link a QFF account. Auto-verifies via Qantas API.
       */
      linkFFN: builder.mutation<QantasFFNResponse, LinkFFNDto>({
        query: (body) => ({
          url: '/api/qantas/link',
          method: 'POST',
          body,
        }),
        invalidatesTags: ['QantasFFN'],
      }),

      /**
       * DELETE /api/qantas/unlink
       * Unlink the user's QFF account.
       */
      unlinkFFN: builder.mutation<UnlinkFFNResponse, void>({
        query: () => ({
          url: '/api/qantas/unlink',
          method: 'DELETE',
        }),
        invalidatesTags: ['QantasFFN'],
      }),
    }),
  });

export default qantasApi;

export const {
  useGetFFNQuery,
  useGetQantasDashboardQuery,
  useLinkFFNMutation,
  useUnlinkFFNMutation,
} = qantasApi;
