import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Create an order (client posts project)
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders/', orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get all orders (for clients to view their orders)
export const getClientOrders = createAsyncThunk(
  'orders/getClientOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/?page_size=50');
      return response; // Return the entire response object as `action.payload`
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch a single order by ID
export const fetchSingleOrder = createAsyncThunk(
  'orders/fetchSingleOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}/`);
      return response; // Corrected: Return the entire response, as api.get already returns parsed data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch single order');
    }
  }
);

// Fetch a single public order by ID
export const fetchPublicOrderDetail = createAsyncThunk(
  'orders/fetchPublicOrderDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/public-projects/${orderId}/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch public order detail');
    }
  }
);

// Get available orders for technicians (technicians view available orders to apply)
export const getAvailableOrders = createAsyncThunk(
  'orders/getAvailableOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/available-for-offer/');
      return response; // Return the entire response (paginated object)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get offers for a specific order (client views offers for their order)
export const getOrderOffers = createAsyncThunk(
  'orders/getOrderOffers',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}/offers/`);
      return response; // Return the entire response (paginated object)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Accept an offer (client accepts a technician's offer)
export const acceptOffer = createAsyncThunk(
  'orders/acceptOffer',
  async ({ orderId, offerId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/accept-offer/${offerId}/`);
      return response; // Return the full response data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a project offer (technician bids on an order)
export const createProjectOffer = createAsyncThunk(
  'orders/createProjectOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders/projectoffers/', offerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get technicians for browsing (public endpoint)
export const getTechnicians = createAsyncThunk(
  'orders/getTechnicians',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        user_type: 'technician', // Filter for technicians by name
        page_size: filters.page_size || 20, // Default page size or from filters
        page: filters.page || 1, // Default page or from filters
      });

      // Add other filters if they exist
      if (filters.specialization && filters.specialization !== 'all') {
        params.append('specialization', filters.specialization);
      }
      if (filters.location) {
        params.append('location', filters.location);
      }
      if (filters.min_rating && filters.min_rating !== 'all') {
        params.append('min_rating', filters.min_rating);
      }

      const url = `/users/public/all/?${params.toString()}`;
      const response = await api.get(url); // 'response' is already the parsed JSON data
      console.log('getTechnicians thunk: response', response);
      return response; // Return the parsed JSON data directly
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message); // Assuming ApiError can have .response.data
    }
  }
);

// Get technician detail
export const getTechnicianDetail = createAsyncThunk(
  'orders/getTechnicianDetail',
  async (technicianId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/users/${technicianId}/technician_detail/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Client makes a direct offer to a technician
export const makeClientOffer = createAsyncThunk(
  'orders/makeClientOffer',
  async ({ technicianId, offerData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/users/${technicianId}/make-offer-to-technician/`, offerData);
      return response; // On success, returns data
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'An unknown error occurred';
      return rejectWithValue(errorMessage); // On error, returns error data
    }
  }
);

// Technician responds to a client's direct offer
export const respondToClientOffer = createAsyncThunk(
  'orders/respondToClientOffer',
  async ({ technicianId, offerId, actionType, rejectionReason }, { rejectWithValue }) => {
    try {
      const data = { action: actionType };
      if (rejectionReason) {
        data.rejection_reason = rejectionReason;
      }
      const response = await api.post(`/users/users/${technicianId}/offers/${offerId}/respond-to-client-offer/`, data);
      console.log("respondToClientOffer thunk: response before return:", response); // Updated debug log
      return response; // Corrected: return response directly as api.post already returns parsed data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get orders assigned to a technician
export const getTechnicianOrders = createAsyncThunk(
  'orders/getTechnicianOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/worker-tasks/');
      return response; // Return the entire response (paginated object)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get client-initiated offers for a specific technician
export const getTechnicianClientOffers = createAsyncThunk(
  'orders/getTechnicianClientOffers',
  async (_, { rejectWithValue }) => {
    try {
      console.log("getTechnicianClientOffers thunk: Making API call...");
      const data = await api.get('/orders/projectoffers/client-offers-for-technician/');
      console.log("getTechnicianClientOffers thunk: API response data:", data);
      return data;
    } catch (error) {
      console.error("getTechnicianClientOffers thunk: API error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update a client's offer
export const updateClientOffer = createAsyncThunk(
  'orders/updateClientOffer',
  async ({ offerId, offerData }, { rejectWithValue }) => {
    try {
      // Corrected URL from update_client_offer to update-client-offer
      const response = await api.patch(`/orders/projectoffers/${offerId}/update-client-offer/`, offerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an order
export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, orderData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${orderId}/`, orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Client cancels an order
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, cancellationReason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel-order/`, {
        reason: cancellationReason
      });
      return response;
    }
    catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Client releases funds for a completed order
export const releaseFunds = createAsyncThunk(
  'orders/releaseFunds',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/release-funds/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Client submits a review for a completed order
export const submitReview = createAsyncThunk(
  'orders/submitReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      // reviewData should contain { order, technician, rating, comment }
      const response = await api.post('/reviews/reviews/', reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Technician marks an assigned order as done
export const markJobDone = createAsyncThunk(
  'orders/markJobDone',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/mark-job-done/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Technician starts an assigned job
export const startJob = createAsyncThunk(
  'orders/startJob',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/start-job/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initiate a dispute for an order
export const initiateDispute = createAsyncThunk(
  'orders/initiateDispute',
  async ({ orderId, argument }, { rejectWithValue }) => {
    try {
      // Corrected API endpoint to use the specific order initiate-dispute action
      const response = await api.post(`/orders/${orderId}/initiate-dispute/`, { argument });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch a single dispute by ID
export const fetchSingleDispute = createAsyncThunk(
  'orders/fetchSingleDispute',
  async (disputeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/disputes/${disputeId}/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Resolve a dispute (Admin action)
export const resolveDispute = createAsyncThunk(
  'orders/resolveDispute',
  async ({ disputeId, resolution, adminNotes }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/disputes/${disputeId}/resolve-dispute/`, {
        resolution,
        admin_notes: adminNotes,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    clientOrders: [],
    availableOrders: [],
    technicianOrders: [],
    technicianClientOffers: [], // New state to hold client-initiated offers for technicians
    currentOrderOffers: [],
    technicians: [],
    selectedTechnician: null,
    currentViewingOrder: null, // New state for a single order being viewed/edited
    currentViewingDispute: null, // New state for a single dispute being viewed
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentOrderOffers: (state, action) => {
      state.currentOrderOffers = action.payload;
    },
    addOfferToCurrentOrder: (state, action) => {
      state.currentOrderOffers.push(action.payload);
    },
    clearTechnicians: (state) => {
      state.technicians = [];
    },
    clearSelectedTechnician: (state) => {
      state.selectedTechnician = null;
    },
    clearCurrentViewingOrder: (state) => { // New action to clear the single order state
      state.currentViewingOrder = null;
    },
    clearCurrentViewingDispute: (state) => { // New action to clear the single dispute state
      state.currentViewingDispute = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Order created successfully';
        state.clientOrders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        // Ensure state.error is always an object with a message property
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to create order.');
        state.error = { message: errorMessage };
      })
      
      // Get client orders
      .addCase(getClientOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClientOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.clientOrders = action.payload?.results || [];
      })
      .addCase(getClientOrders.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch client orders.');
        state.error = { message: errorMessage };
      })

      // Fetch Single Order
      .addCase(fetchSingleOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentViewingOrder = null; // Clear previous order when fetching new one
      })
      .addCase(fetchSingleOrder.fulfilled, (state, action) => {
        console.log('fetchSingleOrder.fulfilled:', action.payload); // Added debug log
        state.loading = false;
        state.currentViewingOrder = action.payload;
      })
      .addCase(fetchSingleOrder.rejected, (state, action) => {
        console.error('fetchSingleOrder.rejected:', action.payload); // Added debug log
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch single order.');
        state.error = { message: errorMessage };
        state.currentViewingOrder = null; // Ensure it's cleared on error
      })

      // Fetch Public Order Detail
      .addCase(fetchPublicOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentViewingOrder = null;
      })
      .addCase(fetchPublicOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentViewingOrder = action.payload;
      })
      .addCase(fetchPublicOrderDetail.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch public order detail.');
        state.error = { message: errorMessage };
        state.currentViewingOrder = null;
      })
      
      // Get available orders
      .addCase(getAvailableOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.availableOrders = action.payload?.results || [];
      })
      .addCase(getAvailableOrders.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch available orders.');
        state.error = { message: errorMessage };
      })
      
  // Get order offers
      .addCase(getOrderOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrderOffers = action.payload?.results || [];
      })
      .addCase(getOrderOffers.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch order offers.');
        state.error = { message: errorMessage };
      })
      
      // Accept offer
      .addCase(acceptOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Offer accepted successfully';
        console.log('acceptOffer.fulfilled action.payload:', action.payload); // Debug log for full payload
        const updatedOrder = action.payload.order; // Correctly extract the order object

        if (updatedOrder) {
            const orderIndex = state.clientOrders.findIndex(order => order.order_id === updatedOrder.order_id);
            if (orderIndex !== -1) {
              // Merge the updated order data to ensure all fields are current, including associated_offer status
              state.clientOrders[orderIndex] = { ...state.clientOrders[orderIndex], ...updatedOrder };
              console.log('clientOrders updated:', state.clientOrders[orderIndex]); // Debug log for updated order
            } else {
              console.warn('acceptOffer.fulfilled: Updated order not found in clientOrders for direct update.');
              // If not found, a full refresh (via getClientOrders) will eventually pick it up.
            }
        }
      })
      .addCase(acceptOffer.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to accept offer.');
        state.error = { message: errorMessage };
      })
      
      // Create project offer
      .addCase(createProjectOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProjectOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Offer created successfully';
        // Add the new offer to current order offers if applicable
        if (action.meta?.arg?.orderId) {
          state.currentOrderOffers.push(action.payload);
        }
      })
      .addCase(createProjectOffer.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to create project offer.');
        state.error = { message: errorMessage };
      })
      
      // Get technicians
      .addCase(getTechnicians.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTechnicians.fulfilled, (state, action) => {
        state.loading = false;
        // The new endpoint returns paginated data directly in action.payload.results
        state.technicians = action.payload.results || [];
      })
      .addCase(getTechnicians.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch technicians.');
        state.error = { message: errorMessage };
      })
      
      // Get technician detail
      .addCase(getTechnicianDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTechnicianDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTechnician = action.payload;
      })
      .addCase(getTechnicianDetail.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch technician detail.');
        state.error = { message: errorMessage };
      })
      
      // Get technician orders
      .addCase(getTechnicianOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTechnicianOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.technicianOrders = action.payload?.results || [];
      })
      .addCase(getTechnicianOrders.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch technician orders.');
        state.error = { message: errorMessage };
      })

      // Get client-initiated offers for a specific technician
      .addCase(getTechnicianClientOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTechnicianClientOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.technicianClientOffers = action.payload?.results || [];
      })
      .addCase(getTechnicianClientOffers.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch technician client offers.');
        state.error = { message: errorMessage };
      })

      // Make Client Offer
      .addCase(makeClientOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(makeClientOffer.fulfilled, (state, action) => {
        console.log('makeClientOffer.fulfilled:', action.payload); // Debug log
        state.loading = false;
        state.successMessage = action.payload?.message || 'Offer made successfully!';
        // Add the new order to clientOrders
        if (action.payload?.order) {
          state.clientOrders.push(action.payload.order);
        }
        // Potentially update selectedTechnician with offer details if needed for UI feedback
      })
      .addCase(makeClientOffer.rejected, (state, action) => {
        console.error('makeClientOffer.rejected:', action.payload); // Debug log
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to make client offer.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Respond to Client Offer
      .addCase(respondToClientOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(respondToClientOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Offer response sent successfully!';
        console.log("respondToClientOffer.fulfilled: Full action.payload:", action.payload); // Add detailed logging here

        let updatedOfferData = action.payload?.offer; // Try to extract the nested offer object first

        if (!updatedOfferData) {
          // If action.payload.offer is not found, assume offer_id and status are directly on action.payload
          updatedOfferData = action.payload;
        }

        // Defensive check for the offer data and its properties
        if (!updatedOfferData || typeof updatedOfferData.offer_id === 'undefined' || typeof updatedOfferData.status === 'undefined') {
          console.error("respondToClientOffer.fulfilled: Offer data is missing expected properties (offer_id, status)", action.payload);
          // If essential data is missing, we still want to proceed to avoid blocking,
          // but logging this error is crucial for debugging.
        } else {
            state.technicianClientOffers = state.technicianClientOffers.map(offer =>
              offer.offer_id === updatedOfferData.offer_id ? { ...offer, status: updatedOfferData.status } : offer
            );
        }
        // Also update the current viewing order if it's relevant and contains this offer
        if (state.currentViewingOrder && action.payload?.order_status) { // Assuming order_status is returned
          state.currentViewingOrder = {
            ...state.currentViewingOrder,
            order_status: action.payload.order_status, // Update order status
            project_offers: state.currentViewingOrder.project_offers?.map(pOffer =>
              pOffer.offer_id === updatedOfferData.offer_id ? { ...pOffer, status: updatedOfferData.status } : pOffer
            ) || []
          };
        }
      })
      .addCase(respondToClientOffer.rejected, (state, action) => {
        state.loading = false;
        // Ensure state.error is always an object with a message property, defaulting to a generic message
        let errorMessage = 'Failed to respond to offer. An unknown error occurred.';
        if (typeof action.payload === 'object' && action.payload !== null) {
          if (typeof action.payload.message === 'string') {
            errorMessage = action.payload.message;
          } else if (typeof action.payload.detail === 'string') { // Common Django REST Framework error field
            errorMessage = action.payload.detail;
          } else if (Object.values(action.payload).some(val => typeof val === 'string')) {
            // If payload is an object with some string values (e.e.g., field errors)
            errorMessage = Object.values(action.payload).filter(val => typeof val === 'string').join(', ');
          }
        } else if (typeof action.payload === 'string') {
          errorMessage = action.payload;
        }
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Update Client Offer
      .addCase(updateClientOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateClientOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Offer updated successfully!';
      
        // Add a defensive check here
        if (!action.payload || !action.payload.offer) {
          console.error("updateClientOffer.fulfilled: action.payload or action.payload.offer is undefined", action.payload);
          // If the offer object is missing, we cannot update the state reliably,
          // so we'll just rely on the success message and potentially a re-fetch.
          return; 
        }

        const updatedOffer = action.payload.offer;
      
        if (updatedOffer) {
          // Update the offer in the technician-facing list
          state.technicianClientOffers = state.technicianClientOffers.map(offer =>
            offer.offer_id === updatedOffer.offer_id ? { ...offer, ...updatedOffer } : offer
          );
      
          // Find and update the order in the main clientOrders list
          state.clientOrders = state.clientOrders.map(order => {
            // Need to check if updatedOffer.order is an object or an ID
            const orderIdFromOffer = updatedOffer.order?.order_id || updatedOffer.order;

            if (order.order_id === orderIdFromOffer) {
              // Find the specific offer within this order and update it
              const updatedProjectOffers = order.project_offers.map(pOffer => 
                pOffer.offer_id === updatedOffer.offer_id ? updatedOffer : pOffer
              );
              // Optimistically update the order's fields that were part of the request
              // Note: This won't reflect any other server-side changes to the order.
              // A re-fetch would be more robust, but this is a good optimistic update.
              return { 
                ...order, 
                project_offers: updatedProjectOffers,
                // We can't update other order fields because they aren't returned.
                // The UI will show the change locally, and it will be correct on next fetch.
              };
            }
            return order;
          });
      
          // Also update the current viewing order if it's the one being edited
          if (state.currentViewingOrder && (state.currentViewingOrder.order_id === updatedOffer.order?.order_id || state.currentViewingOrder.order_id === updatedOffer.order)) {
            const updatedProjectOffers = state.currentViewingOrder.project_offers.map(pOffer => 
              pOffer.offer_id === updatedOffer.offer_id ? updatedOffer : pOffer
            );
            state.currentViewingOrder = { 
              ...state.currentViewingOrder, 
              project_offers: updatedProjectOffers 
            };
          }
        }
      })
      .addCase(updateClientOffer.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to update client offer.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Order cancelled successfully!';
        
        // Add a defensive check to ensure action.payload and action.payload.order exist
        if (action.payload && action.payload.order) {
          const updatedOrder = action.payload.order;
          
          // Find the order in the state and update it with the data from the backend
          state.clientOrders = state.clientOrders.map(order =>
            order.order_id === updatedOrder.order_id ? updatedOrder : order
          );
        }
        // If payload is not as expected, the success message is still set,
        // and the component's useEffect will trigger a refresh. This prevents a crash.
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        // Ensure state.error is always an object with a message property
        const errorMessage = typeof action.payload === 'object' && action.payload?.message 
                             ? String(action.payload.message) 
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to cancel order.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Release Funds
      .addCase(releaseFunds.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(releaseFunds.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Funds released successfully!';
        // Update the order in clientOrders
        state.clientOrders = state.clientOrders.map(order =>
          order.order_id === action.payload.order_id ? action.payload : order // Changed to order_id
        );
      })
      .addCase(releaseFunds.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to release funds.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Submit Review
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Review submitted successfully!';
        // No direct state update needed for orders, as review is separate
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to submit review.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Mark Job Done (Technician)
      .addCase(markJobDone.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(markJobDone.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Job marked as done!';
        // Update the current viewing order status
        if (state.currentViewingOrder && state.currentViewingOrder.order_id === action.meta.arg) {
          state.currentViewingOrder.order_status = action.payload.order_status;
        }
        // Update the order in technicianOrders list
        state.technicianOrders = state.technicianOrders.map(order =>
          order.order_id === action.meta.arg ? { ...order, order_status: action.payload.order_status } : order
        );
      })
      .addCase(markJobDone.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to mark job as done.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Start Job (Technician)
      .addCase(startJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(startJob.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Job started successfully!';
        // Update the current viewing order status
        if (state.currentViewingOrder && state.currentViewingOrder.order_id === action.meta.arg) {
          state.currentViewingOrder.order_status = action.payload.order_status;
        }
        // Update the order in technicianOrders list
        state.technicianOrders = state.technicianOrders.map(order =>
          order.order_id === action.meta.arg ? { ...order, order_status: action.payload.order_status } : order
        );
      })
      .addCase(startJob.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to start job.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Initiate Dispute
      .addCase(initiateDispute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(initiateDispute.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Dispute initiated successfully!';
        // Update the order status in currentViewingOrder if applicable
        if (state.currentViewingOrder && state.currentViewingOrder.order_id === action.payload.order) {
          state.currentViewingOrder.order_status = 'DISPUTED';
        }
        // Update the order in clientOrders
        state.clientOrders = state.clientOrders.map(order =>
          order.order_id === action.payload.order ? { ...order, order_status: 'DISPUTED' } : order
        );
      })
      .addCase(initiateDispute.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to initiate dispute.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Fetch Single Dispute
      .addCase(fetchSingleDispute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentViewingDispute = null;
      })
      .addCase(fetchSingleDispute.fulfilled, (state, action) => {
        state.loading = false;
        state.currentViewingDispute = action.payload;
      })
      .addCase(fetchSingleDispute.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to fetch dispute details.');
        state.error = { message: errorMessage };
        state.currentViewingDispute = null;
      })

      // Resolve Dispute
      .addCase(resolveDispute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resolveDispute.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Dispute resolved successfully!';
        // Update the dispute in currentViewingDispute if applicable
        if (state.currentViewingDispute && state.currentViewingDispute.dispute_id === action.payload.dispute_id) {
          state.currentViewingDispute = action.payload; // Backend should return updated dispute
        }
        // Optionally update the associated order's status if returned in payload
        if (action.payload.order_id && action.payload.order_status) {
          state.clientOrders = state.clientOrders.map(order =>
            order.order_id === action.payload.order_id ? { ...order, order_status: action.payload.order_status } : order
          );
          if (state.currentViewingOrder && state.currentViewingOrder.order_id === action.payload.order_id) {
            state.currentViewingOrder.order_status = action.payload.order_status;
          }
        }
      })
      .addCase(resolveDispute.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to resolve dispute.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      })

      // Update Order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || 'Order updated successfully!';

        if (action.payload && (action.payload.order_id || action.payload.id)) {
          const updatedOrderData = action.payload;
          const orderToUpdateId = updatedOrderData.order_id || updatedOrderData.id;

          state.clientOrders = state.clientOrders.map(order =>
            (order.order_id === orderToUpdateId || order.id === orderToUpdateId)
              ? { ...order, ...updatedOrderData } // Merge existing order with updated data
              : order
          );
          // If the updated order is the current viewing order, update it too
          if (state.currentViewingOrder && (state.currentViewingOrder.order_id === orderToUpdateId || state.currentViewingOrder.id === orderToUpdateId)) {
            state.currentViewingOrder = { ...state.currentViewingOrder, ...updatedOrderData };
          }
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = typeof action.payload === 'object' && action.payload?.message
                             ? String(action.payload.message)
                             : (typeof action.payload === 'string' ? action.payload : 'Failed to update order.');
        state.error = { message: errorMessage };
        state.successMessage = null;
      });
  },
});

export const { 
  clearError, 
  clearSuccessMessage, 
  setCurrentOrderOffers, 
  addOfferToCurrentOrder,
  clearTechnicians,
  clearSelectedTechnician,
  clearCurrentViewingOrder,
  clearCurrentViewingDispute
} = orderSlice.actions;
export default orderSlice.reducer;
