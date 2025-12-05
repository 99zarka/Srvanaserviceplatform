import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Loader2, DollarSign, Wrench, MapPin, CircleUser } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import OrderForm from '../OrderForm';

import { makeClientOffer, clearError, clearSuccessMessage } from '../../redux/orderSlice';
import { fetchPublicUserProfile } from '../../redux/authSlice';

import { useRef } from 'react';

const DirectOfferForm = ({ onOfferSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { technicianId } = useParams();
  const { loading, error, successMessage } = useSelector((state) => state.orders);
  
  const [serverErrorMessage, setServerErrorMessage] = useState(null);
  const formSetErrorRef = useRef(null);
  const formClearErrorsRef = useRef(null);

  const [localTechnician, setLocalTechnician] = useState(null);
  const [isTechnicianLoading, setIsTechnicianLoading] = useState(true);
  const [technicianError, setTechnicianError] = useState(null);

  const [currentFormData, setCurrentFormData] = useState({
    service_id: '',
    problem_description: '',
    client_agreed_price: 50.00, // Changed from final_price
    requested_location: '',
    scheduled_date: new Date(),
    scheduled_time_start: '',
    scheduled_time_end: '',
    offer_description: '',
  });

  useEffect(() => {
    if (technicianId) {
      setIsTechnicianLoading(true);
      dispatch(fetchPublicUserProfile(technicianId))
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
  }, [dispatch, technicianId]);

  useEffect(() => {
    console.log('DirectOfferForm useEffect - loading:', loading, 'successMessage:', successMessage, 'error:', error); // Debug log
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      onOfferSuccess?.();
      navigate('/client-dashboard');
      setCurrentFormData({
        service_id: '',
        problem_description: '',
        client_agreed_price: 0.01, // Changed from final_price
        requested_location: '',
        scheduled_date: new Date(),
        scheduled_time_start: '',
        scheduled_time_end: '',
        offer_description: '',
      });
    }
    if (error) {
      toast.error(error?.detail || error?.message || error || "حدث خطأ أثناء تقديم العرض.");
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, navigate, onOfferSuccess, loading]);

  const mapBackendErrorsToForm = (backendErrors) => {
    if (formClearErrorsRef.current) {
      formClearErrorsRef.current();
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

  const handleSubmitOfferForm = async (data) => {
    if (!localTechnician) {
      toast.error("بيانات الفني غير متوفرة.");
      return;
    }

    // Correctly read from data.offered_price which is managed by OrderForm
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
  };

  if (isTechnicianLoading) {
    return (
      <div className="text-center text-gray-600 p-8" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin inline-block mr-2 text-primary" />
        <p className="mt-2 text-lg">جاري تحميل تفاصيل الفني...</p>
      </div>
    );
  }

  if (technicianError) {
    return (
      <div className="text-center text-red-600 p-8" dir="rtl">
        <p className="text-lg">خطأ: {technicianError}</p>
        <p className="text-md mt-2">تعذر تحميل تفاصيل الفني. الرجاء المحاولة مرة أخرى لاحقًا.</p>
      </div>
    );
  }

  if (!localTechnician) {
    return (
      <div className="text-center text-gray-600 p-8" dir="rtl">
        <p className="text-lg">لم يتم العثور على الفني.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center">
        تقديم عرض مباشر
      </h1>
      <div className="mb-8 p-6 bg-linear-to-r from-primary-50 to-blue-100 dark:from-gray-700 dark:to-gray-900 rounded-xl shadow-inner flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary-400 shadow-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {localTechnician.profile_photo ? (
            <img
              src={localTechnician.profile_photo}
              alt={`صورة الملف الشخصي لـ ${localTechnician.first_name} ${localTechnician.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <CircleUser className="w-full h-full text-gray-400 p-2" />
          )}
        </div>
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
                السعر بالساعة: ${localTechnician.hourly_rate}
              </p>
            )}
          </div>
        </div>
      </div>

      <OrderForm
        initialData={currentFormData}
        onSubmit={handleSubmitOfferForm}
        isSubmitting={loading}
        showOfferedPrice={true} // Changed from showFinalPrice to showOfferedPrice
        showOfferDescription={true}
        formSetError={formSetErrorRef}
        formClearErrors={formClearErrorsRef}
        serverErrorMessage={serverErrorMessage}
      />
    </div>
  );
};

export default DirectOfferForm;
