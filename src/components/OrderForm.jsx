import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import api from '../utils/api'; 

import GovernorateSelect from './common/GovernorateSelect';

const timeValidation = (data) => {
  if (!data.scheduled_time_start || !data.scheduled_time_end) return true;
  const [startHour, startMinute] = data.scheduled_time_start.split(':').map(Number);
  const [endHour, endMinute] = data.scheduled_time_end.split(':').map(Number);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  return endTime > startTime;
};

const baseOrderSchema = z.object({
  service_id: z.string().min(1, "نوع الخدمة مطلوب"),
  problem_description: z.string().min(10, "وصف المشكلة يجب أن يحتوي على 10 أحرف على الأقل"),
  governorate: z.string().min(1, "المحافظة مطلوبة"),
  detailed_address: z.string().min(5, "العنوان التفصيلي مطلوب"),
  scheduled_date: z.date({
    required_error: "التاريخ المحدد مطلوب",
  }),
  scheduled_time_start: z.string().min(1, "وقت البدء مطلوب"),
  scheduled_time_end: z.string().min(1, "وقت الانتهاء مطلوب"),
}).refine(timeValidation, {
  message: "وقت الانتهاء يجب أن يكون بعد وقت البدء",
  path: ["scheduled_time_end"],
});

const OrderForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  showOfferedPrice = false,
  showOfferDescription = false,
  showFinalPrice = false,
  showExpectedPrice = false,
  showCancelButton = false,
  onCancel,
  formSetError,
  formClearErrors,
  serverErrorMessage = null,
}) => {
  const [services, setServices] = useState([]);

  const formSchema = baseOrderSchema
    .safeExtend(showOfferedPrice ? { offered_price: z.coerce.number().min(0.01, "السعر المعروض مطلوب").or(z.nan()) } : {})
    .safeExtend(showOfferDescription ? { offer_description: z.string().optional() } : {})
    .safeExtend(showFinalPrice ? { final_price: z.coerce.number().min(0.01, "السعر النهائي مطلوب").or(z.nan()) } : {})
    .safeExtend(showExpectedPrice ? { expected_price: z.coerce.number().min(0.01, "السعر المتوقع مطلوب").or(z.nan()) } : {});

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_id: '',
      problem_description: '',
      governorate: '',
      detailed_address: '',
      scheduled_date: new Date(),
      scheduled_time_start: '',
      scheduled_time_end: '',
      ...(showOfferedPrice && { offered_price: '' }),
      ...(showOfferDescription && { offer_description: '' }),
      ...(showFinalPrice && { final_price: '' }),
      ...(showExpectedPrice && { expected_price: '' }),
      ...initialData,
    },
  });

  const watchedServiceId = watch('service_id');
  const selectedServiceDetails = services.find(s => s.service_id?.toString() === watchedServiceId);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services/services/?page_size=50');
        setServices(response.results);
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (initialData) {
      const [governorate, detailed_address] = initialData.requested_location 
        ? initialData.requested_location.split(',').map(s => s.trim()) 
        : ["", ""];
      
      reset({
        ...initialData,
        governorate: governorate,
        detailed_address: detailed_address,
        scheduled_date: initialData.scheduled_date ? new Date(initialData.scheduled_date) : new Date(),
      });
    }
    if (formSetError) formSetError.current = setError;
    if (formClearErrors) formClearErrors.current = clearErrors;

    return () => {
      if (formSetError) formSetError.current = null;
      if (formClearErrors) formClearErrors.current = null;
    };
  }, [initialData, reset, formSetError, formClearErrors, setError, clearErrors]);

  const handleFormSubmit = (data) => {
    const requested_location = `${data.governorate}, ${data.detailed_address}`;
    const submissionData = { ...data, requested_location };
    delete submissionData.governorate;
    delete submissionData.detailed_address;
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      {Object.keys(errors).length > 0 && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">الرجاء تصحيح الأخطاء التالية:</span>
          <ul className="mt-1.5 list-disc list-inside text-red-700 dark:text-red-300">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                {field}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {serverErrorMessage && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">خطأ من الخادم:</span>
          <p className="mt-1.5" dangerouslySetInnerHTML={{ __html: serverErrorMessage }}></p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_id">نوع الخدمة <span className="text-red-500">*</span></Label>
          <Controller
            name="service_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={errors.service_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="اختر خدمة" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.service_id} value={service.service_id.toString()}>
                      {service.arabic_name || service.service_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.service_id && (
            <p className="text-red-500 text-sm mt-1">{errors.service_id.message}</p>
          )}
          {selectedServiceDetails && (
            <p className="text-xs text-gray-500 mt-1">رسوم الفحص الأساسية: ${selectedServiceDetails.base_inspection_fee}</p>
          )}
        </div>

        {showOfferedPrice && (
          <div className="space-y-2">
            <Label htmlFor="offered_price">سعرك المعروض <span className="text-red-500">*</span></Label>
            <Controller
              name="offered_price"
              control={control}
              render={({ field }) => (
                <Input
                  id="offered_price"
                  type="number"
                  step="0.01"
                  placeholder="مثال: 250.00"
                  className={errors.offered_price ? "border-red-500" : ""}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  value={field.value === 0 ? '' : field.value}
                />
              )}
            />
            {errors.offered_price && (
              <p className="text-red-500 text-sm mt-1">{errors.offered_price.message}</p>
            )}
          </div>
        )}

        {showFinalPrice && (
          <div className="space-y-2">
            <Label htmlFor="final_price">السعر النهائي <span className="text-red-500">*</span></Label>
            <Controller
              name="final_price"
              control={control}
              render={({ field }) => (
                <Input
                  id="final_price"
                  type="number"
                  step="0.01"
                  placeholder="مثال: 100.00"
                  className={errors.final_price ? "border-red-500" : ""}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  value={field.value === 0 ? '' : field.value}
                />
              )}
            />
            {errors.final_price && (
              <p className="text-red-500 text-sm mt-1">{errors.final_price.message}</p>
            )}
          </div>
        )}

        {showExpectedPrice && (
          <div className="space-y-2">
            <Label htmlFor="expected_price">السعر المتوقع (اختياري)</Label>
            <Controller
              name="expected_price"
              control={control}
              render={({ field }) => (
                <Input
                  id="expected_price"
                  type="number"
                  step="0.01"
                  placeholder="مثال: 150.00"
                  className={errors.expected_price ? "border-red-500" : ""}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  value={field.value === 0 ? '' : field.value}
                />
              )}
            />
            {errors.expected_price && (
              <p className="text-red-500 text-sm mt-1">{errors.expected_price.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="problem_description">وصف المشكلة <span className="text-red-500">*</span></Label>
        <Controller
          name="problem_description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="problem_description"
              placeholder="صف المشكلة بالتفصيل (على سبيل المثال: 'صنبور مطبخ يسرب...')"
              rows={4}
              className={errors.problem_description ? "border-red-500" : ""}
              {...field}
            />
          )}
        />
        {errors.problem_description && (
          <p className="text-red-500 text-sm mt-1">{errors.problem_description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="governorate">المحافظة <span className="text-red-500">*</span></Label>
                    <Controller
                      name="governorate"
                      control={control}
                      render={({ field }) => (
                        <GovernorateSelect
                          id="governorate"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={`w-full ${errors.governorate ? "border-red-500" : ""}`}
                        />
                      )}
                    />
                    {errors.governorate && <p className="text-red-500 text-sm mt-1">{errors.governorate.message}</p>}
                  </div>        <div className="space-y-2">
          <Label htmlFor="detailed_address">العنوان التفصيلي <span className="text-red-500">*</span></Label>
          <Controller
            name="detailed_address"
            control={control}
            render={({ field }) => (
              <Input
                id="detailed_address"
                placeholder="مثال: 123 الشارع الرئيسي، شقة 4ب"
                className={errors.detailed_address ? "border-red-500" : ""}
                {...field}
              />
            )}
          />
          {errors.detailed_address && <p className="text-red-500 text-sm mt-1">{errors.detailed_address.message}</p>}
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">التاريخ المحدد <span className="text-red-500">*</span></Label>
            <Controller
              name="scheduled_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !field.value && "text-muted-foreground"
                      } ${errors.scheduled_date ? "border-red-500" : ""}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), "PPP") : <span>اختر تاريخًا</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : null}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.scheduled_date && (
              <p className="text-red-500 text-sm mt-1">{errors.scheduled_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_time_start">وقت البدء <span className="text-red-500">*</span></Label>
            <Controller
              name="scheduled_time_start"
              control={control}
              render={({ field }) => (
                <Input
                  id="scheduled_time_start"
                  type="time"
                  className={errors.scheduled_time_start ? "border-red-500" : ""}
                  {...field}
                />
              )}
            />
            {errors.scheduled_time_start && (
              <p className="text-red-500 text-sm mt-1">{errors.scheduled_time_start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_time_end">وقت الانتهاء <span className="text-red-500">*</span></Label>
            <Controller
              name="scheduled_time_end"
              control={control}
              render={({ field }) => (
                <Input
                  id="scheduled_time_end"
                  type="time"
                  className={errors.scheduled_time_end ? "border-red-500" : ""}
                  {...field}
                />
              )}
            />
            {errors.scheduled_time_end && (
              <p className="text-red-500 text-sm mt-1">{errors.scheduled_time_end.message}</p>
            )}
          </div>
        </div>

        {showOfferDescription && (
          <div className="space-y-2">
            <Label htmlFor="offer_description">رسالتك إلى الفني (اختياري)</Label>
            <Controller
              name="offer_description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="offer_description"
                  placeholder="أضف أي ملاحظات أو أسئلة محددة للفني."
                  rows={3}
                  {...field}
                />
              )}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row-reverse gap-4">
          <Button type="submit" className="w-full sm:w-auto flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              'إرسال'
            )}
          </Button>
          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
          )}
        </div>
      </form>
    );
  };

  export default OrderForm;
