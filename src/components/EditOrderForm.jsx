import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import { getOrderOffers, updateClientOffer, clearError, clearSuccessMessage } from '../redux/orderSlice';
import { fetchServices } from '../redux/servicesSlice';

import GovernorateSelect from './common/GovernorateSelect';

const EditOrderForm = ({ orderId, onClose }) => {
  const dispatch = useDispatch();
  const { currentOrderOffers, loading, error, successMessage } = useSelector((state) => state.orders);
  const { services } = useSelector((state) => state.services);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    offered_price: '',
    problem_description: '',
    governorate: '',
    detailed_address: '',
    scheduled_date: new Date(),
    scheduled_time_start: '',
    scheduled_time_end: '',
    offer_description: '',
  });

  const [selectedService, setSelectedService] = useState(null);
  const [order, setOrder] = useState(null);

  const clientOffers = currentOrderOffers?.filter(offer => offer.offer_initiator === 'client') || [];
  const offerToEdit = clientOffers?.[0];

  useEffect(() => {
    if (offerToEdit) {
      const [governorate, detailed_address] = offerToEdit.order?.requested_location 
        ? offerToEdit.order.requested_location.split(',').map(s => s.trim()) 
        : ["", ""];

      if (offerToEdit.order) {
        setOrder(offerToEdit.order);
      }
      setFormData(prevData => ({
        ...prevData,
        offered_price: offerToEdit.offered_price?.toString() || '',
        problem_description: offerToEdit.order?.problem_description || '',
        governorate: governorate || '',
        detailed_address: detailed_address || '',
        scheduled_date: offerToEdit.order?.scheduled_date ? new Date(offerToEdit.order.scheduled_date) : new Date(),
        scheduled_time_start: offerToEdit.order?.scheduled_time_start || '',
        scheduled_time_end: offerToEdit.order?.scheduled_time_end || '',
        offer_description: offerToEdit.offer_description || '',
      }));
    }
  }, [offerToEdit]);

  useEffect(() => {
    if (orderId && user?.user_id) {
      dispatch(getOrderOffers(orderId));
    }
  }, [dispatch, orderId, user]);

  useEffect(() => {
    if (successMessage) {
      toast.success(`نجح: ${successMessage}`);
      dispatch(clearSuccessMessage());
      onClose();
    }
    if (error) {
      toast.error(error?.detail || error?.message || error || "حدث خطأ أثناء تحديث العرض.");
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, onClose]);

  useEffect(() => {
    dispatch(fetchServices({ page_size: 50 }));
  }, [dispatch]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({...prev, [id]: value}));
  }

  const handleServiceChange = (value) => {
    const serviceId = parseInt(value);
    const service = services.find(s => s.service_id === serviceId);
    setSelectedService(service);
    setFormData((prev) => ({ ...prev, service_id: serviceId }));
  };

  const handleDateSelect = (date) => {
    setFormData((prev) => ({ ...prev, scheduled_date: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!offerToEdit) {
      toast.error("لم يتم العثور على عرض صالح للتحديث.");
      return;
    }

    if (!formData.offered_price || !formData.problem_description || !formData.governorate || !formData.detailed_address || !formData.scheduled_date || !formData.scheduled_time_start || !formData.scheduled_time_end) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة.");
      return;
    }
    
    const requested_location = `${formData.governorate}, ${formData.detailed_address}`;

    const offerData = {
      offered_price: parseFloat(formData.offered_price),
      problem_description: formData.problem_description,
      requested_location: requested_location,
      scheduled_date: format(formData.scheduled_date, 'yyyy-MM-dd'),
      scheduled_time_start: formData.scheduled_time_start,
      scheduled_time_end: formData.scheduled_time_end,
      offer_description: formData.offer_description,
    };

    await dispatch(updateClientOffer({ offerId: offerToEdit.offer_id, offerData }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل تفاصيل العرض...</p>
      </div>
    );
  }

  if (!offerToEdit) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">لم يتم العثور على عرض من العميل لتعديله لهذا الطلب.</p>
          <Button onClick={onClose} className="mt-4">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  if (offerToEdit.status !== 'pending') {
    return (
      <div className="container max-w-4xl p-4 mx-auto sm:p-6 lg:p-8" dir="rtl">
        <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50">
          <h1 className="mb-2 text-2xl font-bold text-red-800">لا يمكن تعديل العرض</h1>
          <p className="mb-4 text-red-600">لا يمكن تعديل هذا العرض لأنه لم يعد في حالة الانتظار.</p>
          <Button onClick={onClose}>
            العودة
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل تفاصيل الطلب...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl p-4 mx-auto sm:p-6 lg:p-8" dir="rtl">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">تعديل العرض</h1>
        <p className="text-gray-600">تحديث تفاصيل طلب الخدمة الخاص بك.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-white border rounded-lg shadow-xl dark:bg-gray-800 sm:p-8 border-gray-20 dark:border-gray-700">
        <div className="p-6 mb-8 shadow-inner bg-linear-to-r from-primary-50 to-blue-100 dark:from-gray-700 dark:to-gray-900 rounded-xl">
          <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            طلب رقم #{order.order_id}
          </h3>
          <p className="mb-4 text-base text-gray-700 dark:text-gray-300">
            تعديل تفاصيل طلب الخدمة والعرض الخاص بك.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service_id">نوع الخدمة</Label>
            <Select onValueChange={handleServiceChange} value={order.service?.service_id?.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="اختر خدمة" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.service_id} value={service.service_id.toString()}>
                    {service.arabic_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedService && (
              <p className="mt-1 text-xs text-gray-50">رسوم الفحص الأساسية: {selectedService.base_inspection_fee} ج.م.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="offered_price">سعرك المعروض <span className="text-red-500">*</span></Label>
            <Input
              id="offered_price"
              type="number"
              step="1"
              placeholder="مثال: 250.00"
              value={formData.offered_price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="problem_description">وصف المشكلة <span className="text-red-500">*</span></Label>
          <Textarea
            id="problem_description"
            placeholder="صف المشكلة بالتفصيل (على سبيل المثال: 'صنبور مطبخ يسرب...')."
            value={formData.problem_description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="governorate">المحافظة <span className="text-red-500">*</span></Label>
            <GovernorateSelect
              id="governorate"
              value={formData.governorate}
              onChange={(e) => handleSelectChange('governorate', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detailed_address">العنوان التفصيلي <span className="text-red-500">*</span></Label>
            <Input
              id="detailed_address"
              placeholder="مثال: 123 الشارع الرئيسي، شقة 4ب"
              value={formData.detailed_address}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">التاريخ المحدد <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${
                    !formData.scheduled_date && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {formData.scheduled_date ? format(new Date(formData.scheduled_date), "PPP") : <span>اختر تاريخًا</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(formData.scheduled_date)}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_time_start">وقت البدء <span className="text-red-500">*</span></Label>
            <Input
              id="scheduled_time_start"
              type="time"
              value={formData.scheduled_time_start}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_time_end">وقت الانتهاء <span className="text-red-500">*</span></Label>
            <Input
              id="scheduled_time_end"
              type="time"
              value={formData.scheduled_time_end}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer_description">رسالتك (اختياري)</Label>
          <Textarea
            id="offer_description"
            placeholder="أضف أي ملاحظات أو أسئلة محددة."
            value={formData.offer_description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'تحديث العرض'
            )}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditOrderForm;
