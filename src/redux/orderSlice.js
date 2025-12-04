import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Create an order (client posts project)
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders/', orderData);
      return response.data;
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
      const response = await api.get('/orders/');
      return response; // Return the entire response object as `action.payload`
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get available orders for technicians (technicians view available orders to apply)
export const getAvailableOrders = createAsyncThunk(
  'orders/getAvailableOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/orders/available_for_offer/');
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
      const response = await api.post(`/orders/orders/${orderId}/accept-offer/${offerId}/`);
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return response.data;
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
      const response = await api.put(`/orders/projectoffers/${offerId}/update_client_offer/`, offerData);
      return response.data;
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
      const response = await api.patch(`/orders/orders/${orderId}/cancel/`, { 
        status: 'CANCELLED',
        cancellation_reason: cancellationReason 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Client releases funds for a completed order
export const releaseFunds = createAsyncThunk(
  'orders/releaseFunds',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/orders/${orderId}/release-funds/`);
      return response.data;
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
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Technician marks an assigned order as completed
export const markOrderAsCompleted = createAsyncThunk(
  'orders/markOrderAsCompleted',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/orders/${orderId}/mark-as-completed/`, { 
        status: 'AWAITING_RELEASE' // Or 'COMPLETED', based on backend logic
      });
      return response.data;
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
    }
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      })
      
      // Accept offer
      .addCase(acceptOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Offer accepted successfully';
        // Update the order in clientOrders with assigned technician
        const updatedOrder = action.payload;
        const orderIndex = state.clientOrders.findIndex(order => order.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.clientOrders[orderIndex] = updatedOrder;
        }
      })
      .addCase(acceptOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      })

      // Get technician client offers
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
        state.error = action.payload;
      })

      // Make Client Offer
      .addCase(makeClientOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(makeClientOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Offer made successfully!';
        // Add the new order to clientOrders
        if (action.payload.order) {
          state.clientOrders.push(action.payload.order);
        }
        // Potentially update selectedTechnician with offer details if needed for UI feedback
      })
      .addCase(makeClientOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.successMessage = action.payload.message || 'Offer response sent successfully!';
        // Update the status of the offer in relevant arrays (e.g., technician's offers)
        // Also update the associated order's status if accepted
        state.technicianClientOffers = state.technicianClientOffers.map(offer =>
          offer.offer_id === action.payload.offer_id ? { ...offer, status: action.payload.status } : offer
        );
      })
      .addCase(respondToClientOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        // Update the offer in the relevant arrays
        if (action.payload?.offer) {
          state.technicianClientOffers = state.technicianClientOffers.map(offer =>
            offer.offer_id === action.payload.offer.offer_id ? action.payload.offer : offer
          );
        }
      })
      .addCase(updateClientOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.successMessage = 'Order cancelled successfully!';
        // Update the cancelled order in clientOrders
        state.clientOrders = state.clientOrders.map(order =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(releaseFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.error = action.payload;
        state.successMessage = null;
      })

      // Mark Order As Completed (Technician)
      .addCase(markOrderAsCompleted.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(markOrderAsCompleted.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Order marked as completed!';
        // Update the order in technicianOrders
        state.technicianOrders = state.technicianOrders.map(order =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(markOrderAsCompleted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
  clearSelectedTechnician
} = orderSlice.actions;
export default orderSlice.reducer;
