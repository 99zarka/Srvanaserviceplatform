import React, { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { X, Save, Calendar, Wrench } from 'lucide-react';
import OrderForm from '../OrderForm';
import api from '../../utils/api';

const AIOrderForm = ({ 
  projectData, 
  selectedTechnicianId, 
  onClose, 
  onSuccess,
  mode = 'order' // 'order' or 'offer'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [currentFormData, setCurrentFormData] = useState({
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

  // Refs for form error handling
  const formSetErrorRef = React.useRef(null);
  const formClearErrorsRef = React.useRef(null);

  // Update form data when projectData changes
  useEffect(() => {
    if (projectData) {
      setCurrentFormData({
        service_id: '',
        problem_description: projectData.problem_description || '',
        governorate: projectData.location || '',
        detailed_address: '',
        scheduled_date: projectData.scheduled_date ? new Date(projectData.scheduled_date) : new Date(),
        scheduled_time_start: projectData.scheduled_time || '',
        scheduled_time_end: projectData.scheduled_time ? 
          // Add 2 hours to start time for end time if not provided
          new Date(new Date(projectData.scheduled_time).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5) : '',
        expected_price: projectData.budget_range ? parseFloat(projectData.budget_range.replace(/[^\d.]/g, '')) : '',
        offered_price: '',
        offer_description: '',
      });
    }
  }, [projectData]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setServerError(null);
    setFormError(null);

    try {
      if (mode === 'order') {
        // Create order with correct structure - match OrderCreateForm pattern
        const orderData = {
          service_id: parseInt(formData.service_id),
          problem_description: formData.problem_description,
          requested_location: `${formData.governorate}, ${formData.detailed_address}`,
          scheduled_date: formData.scheduled_date.toISOString().split('T')[0],
          scheduled_time_start: formData.scheduled_time_start,
          scheduled_time_end: formData.scheduled_time_end,
          order_type: 'service_request',
          expected_price: parseFloat(formData.expected_price) || null
        };
        const response = await api.post('/orders/orders/', orderData);
        onSuccess('order', response);
      } else if (mode === 'offer' && selectedTechnicianId) {
        // Create offer with correct structure - match DirectOfferForm pattern
        const offerData = {
          client_agreed_price: parseFloat(formData.offered_price),
          offer_description: formData.offer_description,
          order: {
            service: parseInt(formData.service_id),
            problem_description: formData.problem_description,
            requested_location: `${formData.governorate}, ${formData.detailed_address}`,
            scheduled_date: formData.scheduled_date.toISOString().split('T')[0],
            scheduled_time_start: formData.scheduled_time_start,
            scheduled_time_end: formData.scheduled_time_end,
            order_type: 'direct_hire'
          }
        };
        const response = await api.post('/orders/projectoffers/', offerData);
        onSuccess('offer', response);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      if (error.response) {
        // Server returned error response
        const errorData = error.response.data;
        setServerError(JSON.stringify(errorData, null, 2));
        
        // Set form field errors if available
        if (formSetErrorRef.current && errorData) {
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              formSetErrorRef.current(field, { type: 'server', message: messages[0] });
            }
          });
        }
      } else if (error.request) {
        // Network error
        setFormError('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
      } else {
        // Other error
        setFormError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clear any form errors before closing
    if (formClearErrorsRef.current) {
      formClearErrorsRef.current();
    }
    onClose();
  };

  return (
    <div className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
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
        {formError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{formError}</p>
          </div>
        )}

        {serverError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium mb-2">خطأ من الخادم:</p>
            <pre className="text-red-600 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
              {serverError}
            </pre>
          </div>
        )}

        <OrderForm
          initialData={currentFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          showOfferedPrice={mode === 'offer'}
          showOfferDescription={mode === 'offer'}
          showFinalPrice={false}
          showExpectedPrice={mode === 'order'}
          showCancelButton={true}
          onCancel={handleClose}
          formSetError={formSetErrorRef}
          formClearErrors={formClearErrorsRef}
          serverErrorMessage={serverError}
        />
      </CardContent>
    </div>
  );
};

export default AIOrderForm;
