import { ExampleType, GetExampleParams } from './type';
import api from '../../api';
import { addPaginationParamsToURLSearchParams } from '../../../modules/api/helper';
import { DataResponse, PaginationParams } from '../../../modules/api/types';

const exampleApi = api
  .enhanceEndpoints({
    addTagTypes: ['ExampleTag'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      /* List example */
      listExample: builder.query<
        ExampleType[],
        GetExampleParams & PaginationParams
      >({
        query: params => {
          const searchParams = new URLSearchParams();
          addPaginationParamsToURLSearchParams(searchParams, params);

          if (params.example) {
            searchParams.set('example', params.example.toString());
          }

          return {
            url: `/api/example?${searchParams}`,
            method: 'GET',
          };
        },
        // Unwrap the data field from the response
        // e.g. {data: {example: true}} => {example: true}
        transformResponse: r => (r as DataResponse<ExampleType[]>).data,
      }),
    }),
  });

export default exampleApi;

export const { useListExampleQuery } = exampleApi;
