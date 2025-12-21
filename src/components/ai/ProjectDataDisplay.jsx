import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit, Save, X, MapPin, Wrench, DollarSign, Clock, Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ProjectDataDisplay = ({ 
  projectData, 
  onEdit, 
  onPostProject, 
  canEdit = true,
  isEditing = false,
  onToggleEdit
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(projectData || {});

  const handleEditToggle = () => {
    if (isEditing) {
      onToggleEdit();
    } else {
      setEditMode(!editMode);
      if (!editMode) {
        setEditedData(projectData || {});
      }
    }
  };

  const handleSave = () => {
    if (isEditing) {
      onEdit(editedData);
    } else {
      onEdit(editedData);
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      onToggleEdit();
    } else {
      setEditMode(false);
      setEditedData(projectData || {});
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!projectData) return null;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="bg-white rounded-t-lg border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                بيانات المشروع المستخرجة
              </CardTitle>
              <p className="text-sm text-gray-600">Project Data Extracted</p>
            </div>
          </div>
          {canEdit && (
            <div className="flex space-x-2">
              {editMode || isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
                  >
                    <X className="h-4 w-4 mr-2" />
                    إلغاء
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    حفظ التغييرات
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل البيانات
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Type */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Wrench className="h-4 w-4" />
              <span>نوع الخدمة</span>
            </div>
            {editMode || isEditing ? (
              <Input
                value={editedData.service_type || ''}
                onChange={(e) => handleFieldChange('service_type', e.target.value)}
                placeholder="ادخل نوع الخدمة..."
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <Badge variant="secondary" className="text-sm py-1 px-3 bg-white border border-gray-300">
                {editedData.service_type || 'غير محدد'}
              </Badge>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4" />
              <span>الموقع</span>
            </div>
            {editMode || isEditing ? (
              <Input
                value={editedData.location || ''}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="ادخل الموقع..."
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <Badge variant="secondary" className="text-sm py-1 px-3 bg-white border border-gray-300">
                {editedData.location || 'غير محدد'}
              </Badge>
            )}
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              <span>درجة الأهمية</span>
            </div>
            {editMode || isEditing ? (
              <Select
                value={editedData.urgency || ''}
                onValueChange={(value) => handleFieldChange('urgency', value)}
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="اختر درجة الأهمية..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge 
                variant="outline" 
                className={`text-sm py-1 px-3 ${
                  editedData.urgency === 'high' ? 'border-red-300 text-red-600' :
                  editedData.urgency === 'medium' ? 'border-yellow-300 text-yellow-600' :
                  'border-green-300 text-green-600'
                }`}
              >
                {editedData.urgency === 'high' ? 'عالي' :
                 editedData.urgency === 'medium' ? 'متوسط' :
                 editedData.urgency === 'low' ? 'منخفض' : 'غير محدد'}
              </Badge>
            )}
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4" />
              <span>النطاق السعري</span>
            </div>
            {editMode || isEditing ? (
              <Input
                value={editedData.budget_range || ''}
                onChange={(e) => handleFieldChange('budget_range', e.target.value)}
                placeholder="ادخل النطاق السعري..."
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <Badge variant="secondary" className="text-sm py-1 px-3 bg-white border border-gray-300">
                {editedData.budget_range || 'غير محدد'}
              </Badge>
            )}
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              <span>تاريخ التنفيذ</span>
            </div>
            {editMode || isEditing ? (
              <Input
                type="date"
                value={editedData.scheduled_date || ''}
                onChange={(e) => handleFieldChange('scheduled_date', e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <Badge variant="secondary" className="text-sm py-1 px-3 bg-white border border-gray-300">
                {editedData.scheduled_date || 'غير محدد'}
              </Badge>
            )}
          </div>

          {/* Scheduled Time */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              <span>وقت التنفيذ</span>
            </div>
            {editMode || isEditing ? (
              <Input
                type="time"
                value={editedData.scheduled_time || ''}
                onChange={(e) => handleFieldChange('scheduled_time', e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <Badge variant="secondary" className="text-sm py-1 px-3 bg-white border border-gray-300">
                {editedData.scheduled_time || 'غير محدد'}
              </Badge>
            )}
          </div>
        </div>

        {/* Problem Description */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Wrench className="h-4 w-4" />
            <span>وصف المشكلة</span>
          </div>
          {editMode || isEditing ? (
            <Textarea
              value={editedData.problem_description || ''}
              onChange={(e) => handleFieldChange('problem_description', e.target.value)}
              placeholder="ادخل وصف المشكلة..."
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          ) : (
            <div className="bg-white p-3 rounded-lg border border-gray-300 min-h-[80px]">
              <p className="text-gray-800 whitespace-pre-wrap">
                {editedData.problem_description || 'غير محدد'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onPostProject}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Wrench className="h-5 w-5 mr-2" />
            نشر المشروع
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/#/order/create', '_blank')}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
          >
            <Wrench className="h-5 w-5 mr-2" />
            الانتقال للنموذج الكامل
          </Button>
        </div>

        {/* Data Source Info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          هذه البيانات تم استخراجها تلقائيًا من محادثتك مع الذكاء الاصطناعي
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDataDisplay;
