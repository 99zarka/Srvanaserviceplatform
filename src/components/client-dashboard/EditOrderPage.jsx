import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import OrderForm from '../OrderForm';

import { fetchSingleOrder, updateOrder, updateClientOffer, clearError, clearSuccessMessage, clearCurrentViewingOrder, cancelOrder } from '../../redux/orderSlice'; // Updated imports

import { useRef } from 'react';

const EditOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentViewingOrder, loading, error, successMessage } = useSelector((state) => state.orders); // Use currentViewingOrder

  const [serverErrorMessage, setServerErrorMessage] = useState(null); // New state for global server error
  const formSetErrorRef = useRef(null); // Ref to hold setError function from OrderForm
  const formClearErrorsRef = useRef(null); // Ref to hold clearErrors function from OrderForm

  useEffect(() => {
    if (orderId) {
      dispatch(fetchSingleOrder(orderId));
    }

    // Clean up currentViewingOrder on unmount
    return () => {
      dispatch(clearCurrentViewingOrder());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (successMessage) {
      console.log('EditOrderPage: successMessage received:', successMessage); // Debug log
      console.log('EditOrderPage: navigating to:', `/dashboard/orders-offers/view/${orderId}`); // Debug log
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      if (successMessage.includes("cancelled")) {
        navigate('/dashboard/orders-offers');
      } else {
        navigate(`/dashboard/orders-offers/view/${orderId}`);
      }
    }
    if (error) {
      // If there's a global Redux error, display it as a toast
      toast.error(error?.detail || error?.message || error || "حدث خطأ أثناء تحديث الطلب.");
      dispatch(clearError());
      // If there's an error fetching a single order, navigate back to the list
      // navigate('/dashboard/orders-offers'); // Removed this, as it might redirect too aggressively
    }
  }, [successMessage, error, dispatch, navigate, orderId]);

  // Function to map backend errors to form fields
  const mapBackendErrorsToForm = (backendErrors) => {
    if (formClearErrorsRef.current) {
      formClearErrorsRef.current(); // Clear all previous form errors
    }

    if (!backendErrors) { // Added check for undefined or null backendErrors
      console.error("mapBackendErrorsToForm received undefined or null errors.");
      toast.error("حدث خطأ غير معروف أثناء معالجة استجابة الخادم.");
      setServerErrorMessage("حدث خطأ غير معروف أثناء معالجة استجابة الخادم.");
      return;
    }

    if (formSetErrorRef.current && backendErrors) {
      if (typeof backendErrors === 'string') {
        const errorMessage = backendErrors.replace(/\\"/g, '"');
        toast.error(errorMessage);
        setServerErrorMessage(errorMessage);
        return;
      }

      if (Object.keys(backendErrors).length === 0 && backendErrors.constructor === Object) {
        toast.error("حدث خطأ غير معروف من الخادم.");
        setServerErrorMessage("حدث خطأ غير معروف من الخادم.");
        return;
      }

      Object.entries(backendErrors).forEach(([field, messages]) => {
        // Handle non_field_errors or global errors
        if (field === 'non_field_errors' || field === 'detail' || field === 'message') {
          let errorMessage = Array.isArray(messages) ? messages.join(', ') : messages;
          errorMessage = String(errorMessage).replace(/\\"/g, '"');
          toast.error(errorMessage);
          setServerErrorMessage(errorMessage); // Set global server error message
        } else if (field === 'order' && typeof messages === 'object') { // Handle nested order errors
          Object.entries(messages).forEach(([orderField, orderMessages]) => {
            let orderErrorMessage = Array.isArray(orderMessages) ? orderMessages.join(', ') : String(orderMessages);
            orderErrorMessage = String(orderErrorMessage).replace(/\\"/g, '"');
            formSetErrorRef.current(orderField, { type: 'server', message: orderErrorMessage });
          });
        }
        else {
          // Map field-specific errors
          let fieldErrorMessage = Array.isArray(messages) ? messages.join(', ') : String(messages);
          fieldErrorMessage = String(fieldErrorMessage).replace(/\\"/g, '"');
          formSetErrorRef.current(field, { type: 'server', message: fieldErrorMessage });
        }
      });
    }
  };

  const handleSubmitOrderForm = async (data) => {
    if (!currentViewingOrder) {
      toast.error("لم يتم العثور على طلب صالح للتحديث.");
      return;
    }

    if (formClearErrorsRef.current) formClearErrorsRef.current();
    setServerErrorMessage(null);

    try {
      if (currentViewingOrder.order_type === 'direct_hire') {
        // For direct hire, we are updating the client's initial offer
        const clientOffer = currentViewingOrder.project_offers?.[0];
        if (!clientOffer) {
          toast.error("لم يتم العثور على العرض المرتبط بهذا الطلب.");
          return;
        }

        const offerData = {
          // Order-related fields
          problem_description: data.problem_description,
          requested_location: data.requested_location,
          scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
          scheduled_time_start: data.scheduled_time_start,
          scheduled_time_end: data.scheduled_time_end,
          // Offer-related field
          offered_price: parseFloat(data.offered_price),
          offer_description: data.offer_description,
        };

        await dispatch(updateClientOffer({ offerId: clientOffer.offer_id, offerData })).unwrap();

      } else if (currentViewingOrder.order_type === 'service_request') {
        // For service request, we are updating the order itself
        const orderData = {
          problem_description: data.problem_description,
          requested_location: data.requested_location,
          scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
          scheduled_time_start: data.scheduled_time_start,
          scheduled_time_end: data.scheduled_time_end,
          expected_price: parseFloat(data.expected_price),
        };

        await dispatch(updateOrder({ orderId: currentViewingOrder.order_id, orderData })).unwrap();
      }
    } catch (backendError) {
      console.error('Backend error during update:', backendError);
      mapBackendErrorsToForm(backendError);
      dispatch(clearError());
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/orders-offers');
  };

  const handleCancelOrder = async () => {
    try {
      await dispatch(cancelOrder({ orderId, cancellationReason: 'Cancelled by user from edit page' })).unwrap();
    } catch (err) {
      // Error is handled by the global error handler in the slice
    }
  };

  // Display loading state if the order is being fetched
  if (loading || !currentViewingOrder) { // Use currentViewingOrder
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل تفاصيل الطلب...</p>
      </div>
    );
  }

  if (currentViewingOrder.order_status !== 'OPEN' && currentViewingOrder.order_status !== 'AWAITING_TECHNICIAN_RESPONSE') { // 'PENDING' usually means an offer is pending, which is allowed for editing
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">لا يمكن تعديل الطلب</h1>
          <p className="text-red-600 mb-4">لا يمكن تعديل هذا الطلب لأنه ليس في حالة "مفتوحة" أو "في انتظار رد الفني". حالته الحالية هي: {currentViewingOrder.order_status}.</p>
          <Button onClick={() => navigate('/dashboard/orders-offers')}>
            العودة إلى الطلبات
          </Button>
        </div>
      </div>
    );
  }

  const initialFormData = currentViewingOrder ? {
    service_id: currentViewingOrder.service?.service_id?.toString() || '',
    problem_description: currentViewingOrder.problem_description || '',
    requested_location: currentViewingOrder.requested_location || '',
    scheduled_date: currentViewingOrder.scheduled_date ? new Date(currentViewingOrder.scheduled_date) : new Date(),
    scheduled_time_start: currentViewingOrder.scheduled_time_start || '',
    scheduled_time_end: currentViewingOrder.scheduled_time_end || '',
    // For direct_hire, the editable price is the offered_price from the client's offer
    ...(currentViewingOrder.order_type === 'direct_hire' && {
      offered_price: currentViewingOrder.project_offers?.[0]?.offered_price || '',
      offer_description: currentViewingOrder.project_offers?.[0]?.offer_description || '',
    }),
    // For service_request, it's the expected_price
    ...(currentViewingOrder.order_type === 'service_request' && {
      expected_price: currentViewingOrder.expected_price || '',
    }),
  } : null;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">تعديل الطلب #{orderId}</h1>
          <p className="text-gray-600">تحديث تفاصيل طلب الخدمة الخاص بك.</p>
        </div>
        {(currentViewingOrder.order_status === 'OPEN' || currentViewingOrder.order_status === 'AWAITING_TECHNICIAN_RESPONSE' || currentViewingOrder.order_status === 'PENDING' || currentViewingOrder.order_status === 'ACCEPTED' ) && (
          <Button onClick={handleCancelOrder} variant="destructive" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إلغاء الطلب'}
          </Button>
        )}
      </div>

      {initialFormData && (
        <OrderForm
          initialData={initialFormData}
          onSubmit={handleSubmitOrderForm}
          isSubmitting={loading}
          showCancelButton={true}
          onCancel={handleCancel}
          showOfferedPrice={currentViewingOrder.order_type === 'direct_hire'} // Use the new prop for offered price
          showExpectedPrice={currentViewingOrder.order_type === 'service_request'}
          showOfferDescription={currentViewingOrder.order_type === 'direct_hire'}
          formSetError={formSetErrorRef}
          formClearErrors={formClearErrorsRef}
          serverErrorMessage={serverErrorMessage}
        />
      )}
    </div>
  );
};

export default EditOrderPage;
