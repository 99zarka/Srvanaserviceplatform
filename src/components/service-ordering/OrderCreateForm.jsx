import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createOrder, clearError } from '../../redux/orderSlice'; // Import clearError
import { fetchServices } from '../../redux/servicesSlice'; // Import fetchServices
import OrderForm from '../OrderForm'; // Import the reusable OrderForm
import { toast } from 'sonner';

import { useRef } from 'react';

const OrderCreateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.orders);
  const { services } = useSelector((state) => state.services);
  const user = useSelector((state) => state.auth.user);
  const [formKey, setFormKey] = useState(0); // Key to force OrderForm remount
  const [serverErrorMessage, setServerErrorMessage] = useState(null); // New state for global server error
  const [searchParams] = useSearchParams();
  const [currentFormData, setCurrentFormData] = useState(() => {
    // Parse URL parameters and create initial form data
    const urlParams = {
      service_id: searchParams.get('service_id') || '',
      problem_description: searchParams.get('problem_description') || '',
      governorate: searchParams.get('governorate') || '',
      detailed_address: searchParams.get('detailed_address') || '',
      scheduled_date: searchParams.get('scheduled_date') || '',
      scheduled_time_start: searchParams.get('scheduled_time_start') || '',
      scheduled_time_end: searchParams.get('scheduled_time_end') || '',
      expected_price: searchParams.get('expected_price') || '',
    };

    // Convert scheduled_date to Date object if provided
    let scheduledDate = undefined;
    if (urlParams.scheduled_date) {
      const date = new Date(urlParams.scheduled_date);
      if (!isNaN(date.getTime())) {
        scheduledDate = date;
      }
    }

    return {
      service_id: urlParams.service_id,
      problem_description: urlParams.problem_description,
      governorate: urlParams.governorate,
      detailed_address: urlParams.detailed_address,
      scheduled_date: scheduledDate,
      scheduled_time_start: urlParams.scheduled_time_start,
      scheduled_time_end: urlParams.scheduled_time_end,
      expected_price: urlParams.expected_price,
    };
  });

  const formSetErrorRef = useRef(null); // Ref to hold setError function from OrderForm
  const formClearErrorsRef = useRef(null); // Ref to hold clearErrors function from OrderForm

  useEffect(() => {
    dispatch(fetchServices({ page_size: 50 }));
  }, [dispatch]);

  // Function to map backend errors to form fields
  const mapBackendErrorsToForm = (backendErrors) => {
    if (formClearErrorsRef.current) {
      formClearErrorsRef.current(); // Clear all previous form errors
    }

    if (formSetErrorRef.current && backendErrors) {
      Object.entries(backendErrors).forEach(([field, messages]) => {
        // Handle non_field_errors or global errors
        if (field === 'non_field_errors' || field === 'detail' || field === 'message') {
          const errorMessage = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMessage);
          setServerErrorMessage(errorMessage); // Set global server error message
        } else {
          // Map field-specific errors
          formSetErrorRef.current(field, { type: 'server', message: Array.isArray(messages) ? messages.join(', ') : messages });
        }
      });
    }
  };

  const handleSubmitOrderForm = async (data) => {
    const orderData = {
      service_id: parseInt(data.service_id), // Use service_id from OrderForm schema
      problem_description: data.problem_description,
      requested_location: data.requested_location,
      scheduled_date: data.scheduled_date.toISOString().split('T')[0],
      scheduled_time_start: data.scheduled_time_start,
      scheduled_time_end: data.scheduled_time_end,
      order_type: 'service_request',
      creation_timestamp: new Date().toISOString().split('T')[0],
      client_user: user?.user_id,
      expected_price: parseFloat(data.expected_price), // Changed to expected_price
    };

    if (formClearErrorsRef.current) formClearErrorsRef.current(); // Clear previous client-side errors before submission

    try {
      setServerErrorMessage(null); // Clear previous server error before submission
      const result = await dispatch(createOrder(orderData)).unwrap(); // Use .unwrap() to catch rejections

      toast.success(result?.message || 'تم إنشاء الطلب بنجاح!');
      // Update form data instead of clearing it
      setCurrentFormData({
        service_id: data.service_id,
        problem_description: data.problem_description,
        requested_location: data.requested_location,
        scheduled_date: data.scheduled_date,
        scheduled_time_start: data.scheduled_time_start,
        scheduled_time_end: data.scheduled_time_end,
        expected_price: data.expected_price,
      });
      navigate('/dashboard/orders-offers'); // Navigate to client orders dashboard
    } catch (backendError) {
      // Backend error occurred, map them to form fields
      console.error('Backend error during order creation:', backendError);
      mapBackendErrorsToForm(backendError);
      // Ensure Redux error state is cleared to avoid double toast if Redux also catches it
      dispatch(clearError());
    }
  };

  // Use currentFormData as initialData for the form
  const initialData = currentFormData;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إنشاء طلب خدمة جديد</h2>
        <p className="text-gray-600 mb-6">انشر مشروعك ودع الفنيين المؤهلين يقدمون عروضهم عليه</p>
        <div>
          <OrderForm
            key={formKey} // Add key to force remount and reset
            initialData={initialData}
            onSubmit={handleSubmitOrderForm}
            isSubmitting={loading}
            services={services}
            submitButtonText="إنشاء طلب"
            showFinalPrice={false} // Changed to showFinalPrice, set to false
            showExpectedPrice={true} // New prop for expected_price
            showOfferDescription={false}
            formSetError={formSetErrorRef} // Pass ref for setError
            formClearErrors={formClearErrorsRef} // Pass ref for clearErrors
            serverErrorMessage={serverErrorMessage} // Pass global server error message
          />
        </div>
      </div>
    </div>
  );
};

export default OrderCreateForm;
