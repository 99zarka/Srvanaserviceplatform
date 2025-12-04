import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Calendar as CalendarIcon, Loader2, DollarSign, Wrench, MapPin, CircleUser } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import { getClientOrders, getOrderOffers, updateClientOffer, clearError, clearSuccessMessage } from '../redux/orderSlice';
import api from '../utils/api';

const EditOfferForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { clientOrders, currentOrderOffers, loading, error, successMessage } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    offered_price: '',
    problem_description: '',
    requested_location: '',
    scheduled_date: new Date(),
    scheduled_time_start: '',
    scheduled_time_end: '',
    offer_description: '',
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [order, setOrder] = useState(null); // Reintroduce order as a state variable

  // Derive offerToEdit here to make it available for conditional rendering
  const clientOffers = currentOrderOffers?.filter(offer => offer.offer_initiator === 'client') || [];
  const offerToEdit = clientOffers?.[0];

  // Update form data and set order when currentOrderOffers changes
  useEffect(() => {
    if (currentOrderOffers && currentOrderOffers.length > 0) {
      if (offerToEdit) {
        // Always set/update the order info from the offer data
        if (offerToEdit.order) {
          setOrder(offerToEdit.order); // Set order state
        }
        setFormData(prevData => ({
          ...prevData,
          offered_price: offerToEdit.offered_price?.toString() || prevData.offered_price,
          problem_description: offerToEdit.order?.problem_description || prevData.problem_description,
          requested_location: offerToEdit.order?.requested_location || prevData.requested_location,
          scheduled_date: offerToEdit.order?.scheduled_date ? new Date(offerToEdit.order.scheduled_date) : prevData.scheduled_date || new Date(),
          scheduled_time_start: offerToEdit.order?.scheduled_time_start || prevData.scheduled_time_start,
          scheduled_time_end: offerToEdit.order?.scheduled_time_end || prevData.scheduled_time_end,
          offer_description: offerToEdit.offer_description || prevData.offer_description,
        }));
      }
    }
  }, [currentOrderOffers, offerToEdit]); // Depend on currentOrderOffers and offerToEdit

  // Fetch specific order offers to ensure we have the most up-to-date data
  useEffect(() => {
    if (orderId && user?.user_id) {
      dispatch(getOrderOffers(orderId));
    }
  }, [dispatch, orderId, user]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      // Navigate back to client offers page after successful update
      navigate('/client-offers');
    }
    if (error) {
      toast.error(error?.detail || error?.message || error || "حدث خطأ أثناء تحديث العرض.");
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, navigate]);

  // Effect to fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services/services/');
        setServices(response.results);
      } catch (err) {
        toast.error('فشل جلب الخدمات.');
        console.error('Error fetching services:', err);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleServiceChange = (value) => {
    const serviceId = parseInt(value);
    const service = services.find(s => s.service_id === serviceId);
    setSelectedService(service);
    setFormData((prev) => ({ ...prev, service_id: serviceId }));
  };

  const handleDateSelect = (date) => {
    setFormData((prev) => ({ ...prev, scheduled_date: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // offerToEdit is already derived at the top of the component

    if (!offerToEdit) {
      toast.error("لم يتم العثور على عرض صالح للتحديث.");
      return;
    }

    // Basic validation
    if (!formData.offered_price || !formData.problem_description || !formData.requested_location || !formData.scheduled_date || !formData.scheduled_time_start || !formData.scheduled_time_end) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة.");
      return;
    }

    const offerData = {
      offered_price: parseFloat(formData.offered_price),
      problem_description: formData.problem_description,
      requested_location: formData.requested_location,
      scheduled_date: format(formData.scheduled_date, 'yyyy-MM-dd'),
      scheduled_time_start: formData.scheduled_time_start,
      scheduled_time_end: formData.scheduled_time_end,
      offer_description: formData.offer_description,
    };

    dispatch(updateClientOffer({ offerId: offerToEdit.offer_id, offerData }));
  };

  // Primary loading state: show spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل تفاصيل العرض...</p>
      </div>
    );
  }

  // If not loading, but no offerToEdit is found (meaning no client-initiated offer for this orderId)
  if (!offerToEdit) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">لم يتم العثور على عرض من العميل لتعديله لهذا الطلب.</p>
          <Button onClick={() => navigate('/client-offers')} className="mt-4">
            العودة إلى العروض
          </Button>
        </div>
      </div>
    );
  }

  // If offerToEdit exists but its status does not allow editing
  if (offerToEdit.status !== 'pending') {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">لا يمكن تعديل العرض</h1>
          <p className="text-red-600 mb-4">لا يمكن تعديل هذا العرض لأنه لم يعد في حالة الانتظار.</p>
          <Button onClick={() => navigate('/client-offers')}>
            العودة إلى العروض
          </Button>
        </div>
      </div>
    );
  }

  // Ensure 'order' is available before rendering the form itself, as it's used in the form's header and selects.
  // This check should pass if offerToEdit exists and was properly loaded.
  if (!order) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل تفاصيل الطلب...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">تعديل العرض</h1>
        <p className="text-gray-600">تحديث تفاصيل طلب الخدمة الخاص بك.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl border border-gray-20 dark:border-gray-700">
        <div className="mb-8 p-6 bg-linear-to-r from-primary-50 to-blue-100 dark:from-gray-700 dark:to-gray-900 rounded-xl shadow-inner">
          <h3 className="font-bold text-2xl text-gray-900 dark:text-gray-100 mb-2">
            طلب رقم #{order.order_id}
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
            تعديل تفاصيل طلب الخدمة والعرض الخاص بك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Type */}
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
              <p className="text-xs text-gray-50 mt-1">رسوم الفحص الأساسية: ${selectedService.base_inspection_fee}</p>
            )}
          </div>

          {/* Offered Price */}
          <div className="space-y-2">
            <Label htmlFor="offered_price">سعرك المعروض <span className="text-red-500">*</span></Label>
            <Input
              id="offered_price"
              type="number"
              step="0.01"
              placeholder="مثال: 250.00"
              value={formData.offered_price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Problem Description */}
        <div className="space-y-2">
          <Label htmlFor="problem_description">وصف المشكلة <span className="text-red-500">*</span></Label>
          <Textarea
            id="problem_description"
            placeholder="صف المشكلة بالتفصيل (على سبيل المثال: 'صنبور مطبخ يسرب، يحتاج إلى استبدال جزء معين')."
            value={formData.problem_description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        {/* Requested Location */}
        <div className="space-y-2">
          <Label htmlFor="requested_location">موقع الخدمة <span className="text-red-500">*</span></Label>
          <Input
            id="requested_location"
            placeholder="مثال: 123 الشارع الرئيسي، شقة 4ب، القاهرة"
            value={formData.requested_location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scheduled Date */}
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
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_date ? format(formData.scheduled_date, "PPP") : <span>اختر تاريخًا</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduled_date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Scheduled Time Start */}
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

          {/* Scheduled Time End */}
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

        {/* Offer Description (optional) */}
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

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'تحديث العرض'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/client-offers')} disabled={loading}>
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditOfferForm;
