import React from 'react';
import { Button } from '../ui/button';
import { Wrench, Handshake, ArrowRight, PlusCircle, Calendar } from 'lucide-react';

const ActionButtons = ({ 
  showPostProject, 
  showDirectHire, 
  onPostProject, 
  onDirectHire, 
  projectData, 
  selectedTechnicianId,
  isLoading = false,
  onShowOrderForm,
  onShowOfferForm
}) => {
  if (!showPostProject && !showDirectHire) return null;

  const handlePostProject = () => {
    if (onPostProject) {
      onPostProject();
    } else if (onShowOrderForm) {
      // Show OrderForm component directly in the chat
      onShowOrderForm(projectData);
    } else {
      // Fallback to redirect
      const params = new URLSearchParams();
      if (projectData) {
        if (projectData.service_type) params.set('service', projectData.service_type);
        if (projectData.location) params.set('location', projectData.location);
        if (projectData.problem_description) params.set('description', projectData.problem_description);
        if (projectData.budget_range) params.set('budget', projectData.budget_range);
        if (projectData.urgency) params.set('urgency', projectData.urgency);
        if (projectData.scheduled_date) params.set('date', projectData.scheduled_date);
        if (projectData.scheduled_time) params.set('time', projectData.scheduled_time);
      }
      window.open(`/#/order/create?${params.toString()}`, '_blank');
    }
  };

  const handleDirectHire = () => {
    if (onDirectHire && selectedTechnicianId) {
      onDirectHire(selectedTechnicianId);
    } else if (onShowOfferForm && selectedTechnicianId) {
      // Show OrderForm component directly in the chat for direct hire
      onShowOfferForm(projectData, selectedTechnicianId);
    } else if (selectedTechnicianId) {
      // Fallback to redirect
      const params = new URLSearchParams();
      if (projectData) {
        if (projectData.service_type) params.set('service', projectData.service_type);
        if (projectData.location) params.set('location', projectData.location);
        if (projectData.problem_description) params.set('description', projectData.problem_description);
        if (projectData.budget_range) params.set('budget', projectData.budget_range);
        if (projectData.urgency) params.set('urgency', projectData.urgency);
        if (projectData.scheduled_date) params.set('date', projectData.scheduled_date);
        if (projectData.scheduled_time) params.set('time', projectData.scheduled_time);
      }
      window.open(`/#/offer/${selectedTechnicianId}?${params.toString()}`, '_blank');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          اتخاذ إجراء الآن
        </h3>
        <p className="text-sm text-gray-600">
          اختر الطريقة الأنسب لطلب الخدمة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Post Project Button */}
        {showPostProject && (
          <Button
            onClick={handlePostProject}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-0"
          >
            <div className="flex items-center justify-center space-x-3">
              <PlusCircle className="h-5 w-5" />
              <div className="text-left">
                <div className="font-bold text-sm">نشر المشروع</div>
                <div className="text-xs opacity-90">Post Project</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Button>
        )}

        {/* Direct Hire Button */}
        {showDirectHire && (
          <Button
            onClick={handleDirectHire}
            disabled={isLoading || !selectedTechnicianId}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-0"
          >
            <div className="flex items-center justify-center space-x-3">
              <Handshake className="h-5 w-5" />
              <div className="text-left">
                <div className="font-bold text-sm">توظيف مباشر</div>
                <div className="text-xs opacity-90">Direct Hire</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Button>
        )}
      </div>

      {/* Alternative Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => window.open('/#/order/create', '_blank')}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
        >
          <Wrench className="h-4 w-4 mr-2" />
          نموذج إنشاء مشروع كامل
        </Button>
        {selectedTechnicianId && (
          <Button
            variant="outline"
            onClick={() => window.open(`/#/offer/${selectedTechnicianId}`, '_blank')}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
          >
            <Calendar className="h-4 w-4 mr-2" />
            نموذج عرض سعر كامل
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm">جارٍ المعالجة...</span>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4">
          <span>✅ البيانات جاهزة للإرسال</span>
          <span>📋 سيتم ملء النموذج تلقائيًا</span>
          <span>⚡ اكتمل في خطوة واحدة</span>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
