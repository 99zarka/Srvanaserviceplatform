import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../ui/utils';
import { createOrder } from '../../redux/orderSlice';
import { useNavigate } from 'react-router-dom';

// Form validation schema
const orderSchema = z.object({
  service: z.string().min(1, 'الرجاء اختيار خدمة'),
  problem_description: z.string().min(10, 'يجب أن يكون الوصف 10 أحرف على الأقل'),
  requested_location: z.string().min(5, 'الرجاء تقديم موقع صحيح'),
  scheduled_date: z.date({ required_error: 'الرجاء اختيار تاريخ' }),
  scheduled_time_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة وقت غير صالحة'),
  scheduled_time_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة وقت غير صالحة'),
});

const OrderCreateForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.orders);
  const user = useSelector((state) => state.auth.user); // Move useSelector outside the function
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(orderSchema),
  });

  // Mock services - in real app, these would come from an API
  useEffect(() => {
    // This would typically be fetched from your services API
    const mockServices = [
      { service_id: 1, service_name: 'سباكة', category: { category_name: 'خدمات منزلية' } },
      { service_id: 2, service_name: 'كهرباء', category: { category_name: 'خدمات منزلية' } },
      { service_id: 3, service_name: 'تكييف وتدفئة', category: { category_name: 'خدمات منزلية' } },
      { service_id: 4, service_name: 'تنظيف', category: { category_name: 'خدمات منزلية' } },
    ];
    setServices(mockServices);
  }, []);

  const onSubmit = async (data) => {
    try {
      // Get the full service object from the services list
      const selectedService = services.find(s => s.service_id.toString() === data.service);
      
      const orderData = {
        service: selectedService.service_id, // Use the service ID
        problem_description: data.problem_description,
        requested_location: data.requested_location,
        scheduled_date: data.scheduled_date.toISOString().split('T')[0],
        scheduled_time_start: data.scheduled_time_start,
        scheduled_time_end: data.scheduled_time_end,
        order_type: 'service_request',
        creation_timestamp: new Date().toISOString().split('T')[0],
        client_user: user?.user_id // Include the client_user ID
      };

      const result = await dispatch(createOrder(orderData));
      
      // Show success message and redirect
      if (result && !result.error) {
        // Navigate to order details or dashboard
        navigate('/client-dashboard');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="service">نوع الخدمة</Label>
              <Select onValueChange={(value) => setValue('service', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر خدمة" />
                </SelectTrigger>
                <SelectContent>
                  {(services || []).map((service) => (
                    <SelectItem key={service.service_id} value={service.service_id.toString()}>
                      {service.service_name} - {service.category?.category_name || 'غير معروف'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service && (
                <p className="text-sm text-red-600">{errors.service.message}</p>
              )}
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <Label htmlFor="problem_description">وصف المشكلة</Label>
              <Textarea
                id="problem_description"
                placeholder="صف المشكلة التي تحتاج إلى مساعدة بها..."
                className="min-h-[120px]"
                {...register('problem_description')}
              />
              {errors.problem_description && (
                <p className="text-sm text-red-600">{errors.problem_description.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="requested_location">موقع الخدمة</Label>
              <Input
                id="requested_location"
                placeholder="123 الشارع الرئيسي، القاهرة، مصر"
                {...register('requested_location')}
              />
              {errors.requested_location && (
                <p className="text-sm text-red-600">{errors.requested_location.message}</p>
              )}
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>التاريخ المفضل</Label>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
                onClick={() => {
                  // This would open a date picker - for now just set a date
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                  setValue('scheduled_date', tomorrow);
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'اختر تاريخ'}
              </Button>
              {errors.scheduled_date && (
                <p className="text-sm text-red-600">{errors.scheduled_date.message}</p>
              )}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_time_start">وقت البدء</Label>
                <Input
                  id="scheduled_time_start"
                  type="time"
                  {...register('scheduled_time_start')}
                />
                {errors.scheduled_time_start && (
                  <p className="text-sm text-red-600">{errors.scheduled_time_start.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_time_end">وقت الانتهاء</Label>
                <Input
                  id="scheduled_time_end"
                  type="time"
                  {...register('scheduled_time_end')}
                />
                {errors.scheduled_time_end && (
                  <p className="text-sm text-red-600">{errors.scheduled_time_end.message}</p>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 rounded-md bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري إنشاء الطلب...
                </>
              ) : (
                'إنشاء طلب'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderCreateForm;
