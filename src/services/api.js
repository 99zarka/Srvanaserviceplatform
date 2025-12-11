import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../config/api.js';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes: ['Order', 'Technician', 'User', 'Offer', 'Dispute'],
  endpoints: (builder) => ({
    // Order endpoints
    getClientOrders: builder.query({
      query: () => '/orders/orders/?role=client',
      providesTags: ['Order'],
    }),

    getAvailableOrders: builder.query({
      query: () => '/orders/orders/available_for_offer/',
      providesTags: ['Order'],
    }),

    getOrderOffers: builder.query({
      query: (orderId) => `/orders/orders/${orderId}/offers/`,
      providesTags: (result, error, orderId) => [{ type: 'Offer', id: orderId }],
    }),

    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: '/orders/orders/',
        method: 'POST',
        body: newOrder,
      }),
      invalidatesTags: ['Order'],
    }),

    acceptOffer: builder.mutation({
      query: ({ orderId, offerId }) => ({
        url: `/orders/orders/${orderId}/accept-offer/${offerId}/`,
        method: 'POST',
      }),
      invalidatesTags: ['Order', 'Offer'],
    }),

    // Project offer endpoints
    createProjectOffer: builder.mutation({
      query: (newOffer) => ({
        url: '/orders/projectoffers/',
        method: 'POST',
        body: newOffer,
      }),
      invalidatesTags: ['Offer'],
    }),

    // Technician endpoints
    getTechnicians: builder.query({
      query: (params = {}) => {
        const url = new URL(`${BASE_URL}/users/users/technicians/`);
        if (params.specialization) url.searchParams.append('specialization', params.specialization);
        if (params.location) url.searchParams.append('location', params.location);
        if (params.min_rating) url.searchParams.append('min_rating', params.min_rating);
        return url.pathname + url.search;
      },
      providesTags: ['Technician'],
    }),

    getTechnicianDetail: builder.query({
      query: (technicianId) => `/users/users/${technicianId}/technician_detail/`,
      providesTags: (result, error, technicianId) => [{ type: 'Technician', id: technicianId }],
    }),

    // Dispute endpoints
    getDisputes: builder.query({
      query: () => '/disputes/disputes/',
      providesTags: ['Dispute'],
    }),

    getDisputeDetail: builder.query({
      query: (disputeId) => `/disputes/disputes/${disputeId}/`,
      providesTags: (result, error, disputeId) => [{ type: 'Dispute', id: disputeId }],
    }),

    createDispute: builder.mutation({
      query: (disputeData) => ({
        url: '/disputes/disputes/',
        method: 'POST',
        body: disputeData,
      }),
      invalidatesTags: ['Dispute'],
    }),

    updateDispute: builder.mutation({
      query: ({ disputeId, ...patch }) => ({
        url: `/disputes/disputes/${disputeId}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { disputeId }) => [{ type: 'Dispute', id: disputeId }],
    }),

    resolveDispute: builder.mutation({
      query: ({ disputeId, resolutionData }) => ({
        url: `/disputes/disputes/${disputeId}/resolve/`,
        method: 'POST',
        body: resolutionData,
      }),
      invalidatesTags: (result, error, { disputeId }) => [{ type: 'Dispute', id: disputeId }],
    }),

    // Add response to dispute
    addDisputeResponse: builder.mutation({
      query: ({ disputeId, message, file_url }) => {
        if (file_url instanceof File) {
          // If file_url is a File object, use FormData
          const formData = new FormData();
          formData.append('message', message);
          formData.append('file_url', file_url);
          return {
            url: `/disputes/disputes/${disputeId}/add_response/`,
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - let fetch set it automatically with boundary
          };
        } else {
          // If no file, send as JSON
          const body = { message };
          if (file_url) {
            body.file_url = file_url;
          }
          return {
            url: `/disputes/disputes/${disputeId}/add_response/`,
            method: 'POST',
            body: body,
            headers: {
              'Content-Type': 'application/json',
            },
          };
        }
      },
      invalidatesTags: (result, error, { disputeId }) => [{ type: 'Dispute', id: disputeId }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetClientOrdersQuery,
  useGetAvailableOrdersQuery,
  useGetOrderOffersQuery,
  useCreateOrderMutation,
  useAcceptOfferMutation,
  useCreateProjectOfferMutation,
  useGetTechniciansQuery,
  useGetTechnicianDetailQuery,
  // Dispute hooks
  useGetDisputesQuery,
  useGetDisputeDetailQuery,
  useCreateDisputeMutation,
  useUpdateDisputeMutation,
  useResolveDisputeMutation,
} = api;
