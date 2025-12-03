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
  tagTypes: ['Order', 'Technician', 'User', 'Offer'],
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
} = api;
