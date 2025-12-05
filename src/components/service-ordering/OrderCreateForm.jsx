import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder, clearError } from '../../redux/orderSlice'; // Import clearError
import api from '../../utils/api';
import OrderForm from '../OrderForm'; // Import the reusable OrderForm
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

import { useRef } from 'react';

const OrderCreateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.orders);
  const user = useSelector((state) => state.auth.user);
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [formKey, setFormKey] = useState(0); // Key to force OrderForm remount
  const [serverErrorMessage, setServerErrorMessage] = useState(null); // New state for global server error

  const formSetErrorRef = useRef(null); // Ref to hold setError function from OrderForm
  const formClearErrorsRef = useRef(null); // Ref to hold clearErrors function from OrderForm

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const response = await api.get('/services/services/?page_size=50');
        setServices(response.results);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        toast.error('فشل في تحميل الخدمات');
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

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
      service: parseInt(data.service_id), // Use service_id from OrderForm schema
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
      setFormKey(prevKey => prevKey + 1); // Increment key to reset form
      navigate('/client-dashboard/orders-offers'); // Navigate to client orders dashboard
    } catch (backendError) {
      // Backend error occurred, map them to form fields
      console.error('Backend error during order creation:', backendError);
      mapBackendErrorsToForm(backendError);
      // Ensure Redux error state is cleared to avoid double toast if Redux also catches it
      dispatch(clearError());
    }
  };

  const initialData = {
    service_id: '', // Ensure this matches the schema in OrderForm (service_id)
    problem_description: '',
    requested_location: '',
    scheduled_date: undefined, // Should be undefined or null for a fresh form
    scheduled_time_start: '',
    scheduled_time_end: '',
    expected_price: '', // Changed to expected_price
  };

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء طلب خدمة جديد</CardTitle>
          <CardDescription>
            انشر مشروعك ودع الفنيين المؤهلين يقدمون عروضهم عليه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm
            key={formKey} // Add key to force remount and reset
            initialData={initialData}
            onSubmit={handleSubmitOrderForm}
            isSubmitting={loading}
            services={services}
            isLoadingServices={isLoadingServices}
            submitButtonText="إنشاء طلب"
            showFinalPrice={false} // Changed to showFinalPrice, set to false
            showExpectedPrice={true} // New prop for expected_price
            showOfferDescription={false} 
            formSetError={formSetErrorRef} // Pass ref for setError
            formClearErrors={formClearErrorsRef} // Pass ref for clearErrors
            serverErrorMessage={serverErrorMessage} // Pass global server error message
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderCreateForm;
