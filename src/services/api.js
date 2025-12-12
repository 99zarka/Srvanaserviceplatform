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
  tagTypes: ['Order', 'Technician', 'User', 'Offer', 'Dispute', 'Service', 'ServiceCategory'],
  endpoints: (builder) => ({
    // Service Category endpoints
    getServiceCategories: builder.query({
      query: (params = {}) => {
        let url = '/services/categories/';
        if (params.page) {
          url += `?page=${params.page}`;
          if (params.page_size) url += `&page_size=${params.page_size}`;
        } else if (params.page_size) {
          url += `?page_size=${params.page_size}`;
        }
        return url;
      },
      providesTags: ['ServiceCategory'],
    }),

    createServiceCategory: builder.mutation({
      query: (newCategory) => ({
        url: '/services/categories/',
        method: 'POST',
        body: newCategory,
      }),
      invalidatesTags: ['ServiceCategory'],
    }),

    updateServiceCategory: builder.mutation({
      query: ({ categoryId, ...patch }) => ({
        url: `/services/categories/${categoryId}/`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['ServiceCategory'],
    }),

    deleteServiceCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/services/categories/${categoryId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceCategory'],
    }),

    // Service endpoints
    getServices: builder.query({
      query: (params = {}) => {
        let url = '/services/';
        if (params.page || params.page_size || params.category) {
          const queryParams = [];
          if (params.page) queryParams.push(`page=${params.page}`);
          if (params.page_size) queryParams.push(`page_size=${params.page_size}`);
          if (params.category) queryParams.push(`category=${params.category}`);
          url += `?${queryParams.join('&')}`;
        }
        return url;
      },
      providesTags: ['Service'],
    }),

    createService: builder.mutation({
      query: (newService) => ({
        url: '/services/',
        method: 'POST',
        body: newService,
      }),
      invalidatesTags: ['Service'],
    }),

    updateService: builder.mutation({
      query: ({ serviceId, ...patch }) => ({
        url: `/services/${serviceId}/`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Service'],
    }),

    deleteService: builder.mutation({
      query: (serviceId) => ({
        url: `/services/${serviceId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),

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
        if (params.specialization || params.location || params.min_rating) {
          const queryParams = [];
          if (params.specialization) queryParams.push(`specialization=${params.specialization}`);
          if (params.location) queryParams.push(`location=${params.location}`);
          if (params.min_rating) queryParams.push(`min_rating=${params.min_rating}`);
          return `/users/users/technicians/?${queryParams.join('&')}`;
        }
        return '/users/users/technicians/';
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

    // Orders with disputes endpoint for technicians
    getTechnicianOrdersWithDisputes: builder.query({
      query: () => '/orders/worker-tasks/?has_dispute=true',
      providesTags: ['Order'],
    }),
    // Orders with disputes endpoint for clients
    getClientOrdersWithDisputes: builder.query({
      query: () => '/orders/?has_dispute=true&role=client',
      providesTags: ['Order'],
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
  useGetServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
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
  useGetOrdersWithDisputesQuery,
  useGetTechnicianOrdersWithDisputesQuery,
  useGetClientOrdersWithDisputesQuery,
} = api;
