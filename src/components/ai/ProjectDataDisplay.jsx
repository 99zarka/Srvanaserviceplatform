import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Wrench, MapPin, Clock, DollarSign, Calendar } from 'lucide-react';

const ProjectDataDisplay = ({
  projectData,
  onPostProject
}) => {
  const { services } = useSelector((state) => state.services);

  if (!projectData) return null;

  // Find the service by service_id to get arabic_name
  const service = services.find(s => s.service_id === projectData.service_id);
  const serviceName = service?.arabic_name || service?.service_name || 'غير محدد';

  return (
    <Card className="border border-gray-200 shadow-sm" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Wrench className="h-5 w-5 text-gray-600" />
          <CardTitle className="text-lg font-medium text-gray-900">
            بيانات المشروع
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Service Name */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Wrench className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">اسم الخدمة</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {serviceName || 'غير محدد'}
            </Badge>
          </div>

          {/* Expected Price */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">السعر المتوقع</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {projectData.expected_price ? `${projectData.expected_price} ج.م` : 'غير محدد'}
            </Badge>
          </div>

        {/* Problem Description */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 space-x-reverse mb-2">
            <Wrench className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">وصف المشكلة</span>
          </div>
          <p className="text-gray-800 text-sm leading-relaxed">
            {projectData.problem_description || 'غير محدد'}
          </p>
        </div>

          {/* Requested Location */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">الموقع</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {projectData.requested_location || 'غير محدد'}
            </Badge>
          </div>

          {/* Creation Timestamp */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">تاريخ الإنشاء</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {projectData.scheduled_date || 'غير محدد'}
            </Badge>
          </div>

          {/* Scheduled Time Start */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">وقت البداية</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {projectData.scheduled_time_start || 'غير محدد'}
            </Badge>
          </div>

          {/* Scheduled Time End */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">وقت النهاية</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {projectData.scheduled_time_end || 'غير محدد'}
            </Badge>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button
            onClick={onPostProject}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
          >
            <Wrench className="h-4 w-4 mr-2" />
            نشر المشروع
          </Button>
        </div>

        {/* Data Source Info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          هذه البيانات تم استخراجها تلقائيًا من محادثتك مع الذكاء الاصطناعي
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDataDisplay;
