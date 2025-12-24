import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { X, Save, Calendar, Wrench, Loader2, CircleUser, DollarSign, MapPin } from 'lucide-react';
import OrderForm from '../OrderForm';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { createOrder, clearError } from '../../redux/orderSlice';
import { makeClientOffer, clearError as clearOfferError, clearSuccessMessage } from '../../redux/orderSlice';
import { fetchServices } from '../../redux/servicesSlice';
import { fetchPublicUserProfile } from '../../redux/authSlice';

const AIOrderForm = ({
  enhancedResponse,
  selectedTechnicianId,
  onClose,
  onSuccess,
  mode = 'order' // 'order' or 'offer'
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.orders);
  const { services } = useSelector((state) => state.services);
  const user = useSelector((state) => state.auth.user);

  const [serverErrorMessage, setServerErrorMessage] = useState(null);
  const formSetErrorRef = useRef(null);
  const formClearErrorsRef = useRef(null);

  const [localTechnician, setLocalTechnician] = useState(null);
  const [isTechnicianLoading, setIsTechnicianLoading] = useState(false);
  const [technicianError, setTechnicianError] = useState(null);

  const [currentFormData, setCurrentFormData] = useState(() => {
    if (mode === 'offer') {
      // Offer Mode: Use enhancedResponse.offer_data.order for order fields, enhancedResponse.offer_data for offer fields
      const offerData = enhancedResponse?.offer_data;
      const orderData = offerData?.order;
      let scheduledDate = new Date();
      if (orderData?.scheduled_date) {
        const date = new Date(orderData.scheduled_date);
        if (!isNaN(date.getTime())) {
          scheduledDate = date;
        }
      }

      return {
        service_id: orderData?.service ? String(orderData.service) : '',
        problem_description: orderData?.problem_description || '',
        requested_location: orderData?.requested_location || '',
        scheduled_date: scheduledDate,
        scheduled_time_start: orderData?.scheduled_time_start || '',
        scheduled_time_end: orderData?.scheduled_time_end || '',
        expected_price: offerData?.client_agreed_price || '',
        offered_price: offerData?.client_agreed_price || '',
        offer_description: offerData?.offer_description || '',
      };
    } else {
      // Order Mode: Use enhancedResponse.project_data for all fields
      const projectData = enhancedResponse?.project_data;
      let scheduledDate = new Date();
      if (projectData?.scheduled_date) {
        const date = new Date(projectData.scheduled_date);
        if (!isNaN(date.getTime())) {
          scheduledDate = date;
        }
      }

      return {
        service_id: projectData?.service_id ? String(projectData.service_id) : '',
        problem_description: projectData?.problem_description || '',
        requested_location: projectData?.requested_location || '',
        scheduled_date: scheduledDate,
        scheduled_time_start: projectData?.scheduled_time_start || '',
        scheduled_time_end: projectData?.scheduled_time_end || '',
        expected_price: projectData?.expected_price || '',
        offered_price: '',
        offer_description: '',
      };
    }
  });

  // Update form data when enhancedResponse changes
  useEffect(() => {
    if (mode === 'offer' && enhancedResponse?.offer_data) {
      // Offer Mode: Update with enhancedResponse.offer_data
      const offerData = enhancedResponse.offer_data;
      const orderData = offerData.order;
      let scheduledDate = new Date();
      if (orderData?.scheduled_date) {
        const date = new Date(orderData.scheduled_date);
        if (!isNaN(date.getTime())) {
          scheduledDate = date;
        }
      }

      setCurrentFormData(prev => ({
        ...prev,
        service_id: orderData?.service ? String(orderData.service) : '',
        problem_description: orderData?.problem_description || '',
        requested_location: orderData?.requested_location || '',
        scheduled_date: scheduledDate,
        scheduled_time_start: orderData?.scheduled_time_start || '',
        scheduled_time_end: orderData?.scheduled_time_end || '',
        expected_price: offerData.client_agreed_price || '',
        offered_price: offerData.client_agreed_price || '',
        offer_description: offerData.offer_description || '',
      }));
    } else if (mode === 'order' && enhancedResponse?.project_data) {
      // Order Mode: Update with enhancedResponse.project_data
      const projectData = enhancedResponse.project_data;
      let scheduledDate = new Date();
      if (projectData.scheduled_date) {
        const date = new Date(projectData.scheduled_date);
        if (!isNaN(date.getTime())) {
          scheduledDate = date;
        }
      }

      setCurrentFormData(prev => ({
        ...prev,
        service_id: projectData.service_id ? String(projectData.service_id) : '',
        problem_description: projectData.problem_description || '',
        requested_location: projectData.requested_location || '',
        scheduled_date: scheduledDate,
        scheduled_time_start: projectData.scheduled_time_start || '',
        scheduled_time_end: projectData.scheduled_time_end || '',
        expected_price: projectData.expected_price || '',
        offered_price: '',
        offer_description: '',
      }));
    }
  }, [enhancedResponse, mode]);

  // Debug: Log enhancedResponse when it changes
  useEffect(() => {
    console.log('AIOrderForm enhancedResponse:', enhancedResponse);
    console.log('AIOrderForm mode:', mode);
  }, [enhancedResponse, mode]);

  // Fetch services for order mode
  useEffect(() => {
    if (mode === 'order') {
      dispatch(fetchServices({ page_size: 50 }));
    }
  }, [dispatch, mode]);

  // Fetch technician profile for offer mode
  useEffect(() => {
    if (mode === 'offer' && selectedTechnicianId) {
      setIsTechnicianLoading(true);
      dispatch(fetchPublicUserProfile(selectedTechnicianId))
        .then((action) => {
          if (fetchPublicUserProfile.fulfilled.match(action)) {
            setLocalTechnician(action.payload);
            setTechnicianError(null);
          } else {
            setTechnicianError(action.error.message || 'فشل جلب تفاصيل الفني.');
            toast.error(action.error.message || 'فشل جلب تفاصيل الفني.');
          }
        })
        .finally(() => {
          setIsTechnicianLoading(false);
        });
    }
  }, [dispatch, selectedTechnicianId, mode]);

  // Handle success and errors from Redux
  useEffect(() => {
    if (successMessage) {
      toast.success(`نجح: ${successMessage}`);
      dispatch(clearSuccessMessage());
      onSuccess?.(mode, { success: true });
      if (mode === 'order') {
        navigate('/dashboard/orders-offers');
      } else {
        navigate('/dashboard');
      }
      // Reset form data
      setCurrentFormData({
        service_id: '',
        problem_description: '',
        governorate: '',
        detailed_address: '',
        scheduled_date: new Date(),
        scheduled_time_start: '',
        scheduled_time_end: '',
        expected_price: '',
        offered_price: '',
        offer_description: '',
      });
    }
    if (error) {
      toast.error(error?.detail || error?.message || error || "حدث خطأ أثناء العملية.");
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, navigate, onSuccess, mode]);

  const mapBackendErrorsToForm = (backendErrors) => {
    if (formClearErrorsRef.current) {
      formClearErrorsRef.current();
    }

    if (!backendErrors) {
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
        if (field === 'non_field_errors' || field === 'detail' || field === 'message') {
          let errorMessage = Array.isArray(messages) ? messages.join(', ') : messages;
          errorMessage = String(errorMessage).replace(/\\"/g, '"');
          toast.error(errorMessage);
          setServerErrorMessage(errorMessage);
        } else if (field === 'order' && typeof messages === 'object') {
          Object.entries(messages).forEach(([orderField, orderMessages]) => {
            let orderErrorMessage = Array.isArray(orderMessages) ? orderMessages.join(', ') : String(orderMessages);
            orderErrorMessage = String(orderErrorMessage).replace(/\\"/g, '"');
            formSetErrorRef.current(orderField, { type: 'server', message: orderErrorMessage });
          });
        } else {
          let fieldErrorMessage = Array.isArray(messages) ? messages.join(', ') : String(messages);
          fieldErrorMessage = String(fieldErrorMessage).replace(/\\"/g, '"');
          formSetErrorRef.current(field, { type: 'server', message: fieldErrorMessage });
        }
      });
    }
  };

  const handleSubmitOrderForm = async (data) => {
    if (mode === 'order') {
      const orderData = {
        service_id: parseInt(data.service_id),
        problem_description: data.problem_description,
        requested_location: data.requested_location,
        scheduled_date: data.scheduled_date.toISOString().split('T')[0],
        scheduled_time_start: data.scheduled_time_start,
        scheduled_time_end: data.scheduled_time_end,
        order_type: 'service_request',
        creation_timestamp: new Date().toISOString().split('T')[0],
        client_user: user?.user_id,
        expected_price: parseFloat(data.expected_price),
      };

      if (formClearErrorsRef.current) formClearErrorsRef.current();

      try {
        setServerErrorMessage(null);
        await dispatch(createOrder(orderData)).unwrap();
      } catch (backendError) {
        console.error('Backend error during order creation:', backendError);
        mapBackendErrorsToForm(backendError);
        dispatch(clearError());
      }
    } else if (mode === 'offer') {
      if (!localTechnician) {
        toast.error("بيانات الفني غير متوفرة.");
        return;
      }

      const offerData = {
        client_agreed_price: parseFloat(data.offered_price),
        offer_description: data.offer_description,
        order: {
          service: parseInt(data.service_id),
          problem_description: data.problem_description,
          requested_location: data.requested_location,
          scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
          scheduled_time_start: data.scheduled_time_start,
          scheduled_time_end: data.scheduled_time_end,
          order_type: 'direct_hire',
        }
      };

      try {
        setServerErrorMessage(null);
        await dispatch(makeClientOffer({ technicianId: localTechnician.user_id, offerData })).unwrap();
      } catch (backendError) {
        console.error('Backend error during direct offer:', backendError);
        mapBackendErrorsToForm(backendError);
        dispatch(clearError());
      }
    }
  };

  const handleClose = () => {
    if (formClearErrorsRef.current) {
      formClearErrorsRef.current();
    }
    onClose();
  };

  if (mode === 'offer' && isTechnicianLoading) {
    return (
      <div className="text-center text-gray-600 p-8" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin inline-block mr-2 text-primary" />
        <p className="mt-2 text-lg">جاري تحميل تفاصيل الفني...</p>
      </div>
    );
  }

  if (mode === 'offer' && technicianError) {
    return (
      <div className="text-center text-red-600 p-8" dir="rtl">
        <p className="text-lg">خطأ: {technicianError}</p>
        <p className="text-md mt-2">تعذر تحميل تفاصيل الفني. الرجاء المحاولة مرة أخرى لاحقًا.</p>
      </div>
    );
  }

  if (mode === 'offer' && !localTechnician) {
    return (
      <div className="text-center text-gray-600 p-8" dir="rtl">
        <p className="text-lg">لم يتم العثور على الفني.</p>
      </div>
    );
  }

  return (
    <div className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
      {/* Technician Info Card for Offer Mode */}
      {mode === 'offer' && localTechnician && (
        <div className="mb-8 p-6 bg-linear-to-r from-primary-50 to-blue-100 dark:from-gray-700 dark:to-gray-900 rounded-xl shadow-inner">
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-3xl text-gray-900 dark:text-gray-100 mb-2">
              أرسل عرضًا إلى {localTechnician.first_name} {localTechnician.last_name}
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
              أنت على وشك إرسال عرض خدمة مباشر لهذا الفني.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800 dark:text-gray-200">
              {localTechnician.specialization && (
                <p className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary-600" />
                  {localTechnician.specialization}
                </p>
              )}
              {localTechnician.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  {localTechnician.address}
                </p>
              )}
              {localTechnician.hourly_rate && (
                <p className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary-600" />
                السعر بالساعة: {localTechnician.hourly_rate} ج.م
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <CardHeader className="bg-white rounded-t-lg border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              {mode === 'order' ? (
                <Wrench className="h-6 w-6 text-white" />
              ) : (
                <Calendar className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {mode === 'order' ? 'نموذج إنشاء مشروع' : 'نموذج عرض سعر'}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {mode === 'order' ? 'Project Creation Form' : 'Offer Form'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            إغلاق
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {serverErrorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{serverErrorMessage}</p>
          </div>
        )}

        <OrderForm
          initialData={currentFormData}
          onSubmit={handleSubmitOrderForm}
          isSubmitting={loading}
          services={services}
          showOfferedPrice={mode === 'offer'}
          showOfferDescription={mode === 'offer'}
          showFinalPrice={false}
          showExpectedPrice={mode === 'order'}
          showCancelButton={true}
          onCancel={handleClose}
          formSetError={formSetErrorRef}
          formClearErrors={formClearErrorsRef}
          serverErrorMessage={serverErrorMessage}
        />
      </CardContent>
    </div>
  );
};

export default AIOrderForm;
