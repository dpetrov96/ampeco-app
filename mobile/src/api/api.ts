import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Pin } from '@/types/pin';
import { getApiBaseUrl } from '@/utils/apiHost';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
  }),
  tagTypes: ['Pin'],
  refetchOnReconnect: true,
  endpoints: (build) => ({
    getPins: build.query<Pin[], void>({
      query: () => '/pins',
      providesTags: [{ type: 'Pin', id: 'LIST' }],
    }),
  }),
});

export const { useGetPinsQuery, useLazyGetPinsQuery } = api;
