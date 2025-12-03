import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar as CalendarIcon, Loader2, DollarSign, Wrench, MapPin, CircleUser } from 'lucide-react'; // Added Wrench, MapPin, and CircleUser
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toast } from 'sonner';

import { makeClientOffer, clearError, clearSuccessMessage } from '../../redux/orderSlice';
import { fetchPublicUserProfile } from '../../redux/authSlice'; // Import fetchPublicUserProfile
import api from '../../utils/api'; // Assuming you have an api utility for services

const DirectOfferForm = ({ onOfferSuccess }) => { // Removed technician prop
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { technicianId } = useParams(); // Get technicianId from URL
  const { loading, error, successMessage } = useSelector((state) => state.orders);

  const [localTechnician, setLocalTechnician] = useState(null); // State for fetched technician data
  const [isTechnicianLoading, setIsTechnicianLoading] = useState(true); // Loading state for technician
  const [technicianError, setTechnicianError] = useState(null); // Error state for technician

  const [formData, setFormData] = useState({
    service_id: '',
    problem_description: '',
    offered_price: '',
    requested_location: '',
    scheduled_date: new Date(),
    scheduled_time_start: '',
    scheduled_time_end: '',
    offer_description: '',
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

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

  // Effect to fetch technician details
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

  // Effect for offer success/error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
      onOfferSuccess?.(); // Call optional callback from parent
      navigate('/client-dashboard'); // Redirect to client dashboard after successful offer
    }
    if (error) {
      toast.error(error.detail || "حدث خطأ.");
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, navigate, onOfferSuccess]);

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
    if (!localTechnician) {
      toast.error("بيانات الفني غير متوفرة.");
      return;
    }

    // Basic validation
    if (!formData.service_id || !formData.problem_description || !formData.offered_price || !formData.requested_location || !formData.scheduled_date || !formData.scheduled_time_start || !formData.scheduled_time_end) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة.");
      return;
    }

    const offerData = {
      ...formData,
      scheduled_date: format(formData.scheduled_date, 'yyyy-MM-dd'),
      offered_price: parseFloat(formData.offered_price),
    };
    
    dispatch(makeClientOffer({ technicianId: localTechnician.user_id, offerData }));
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
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="service_id">نوع الخدمة <span className="text-red-500">*</span></Label>
            <Select onValueChange={handleServiceChange} value={formData.service_id.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="اختر خدمة" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.service_id} value={service.service_id.toString()}>
                    {service.service_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedService && (
              <p className="text-xs text-gray-500 mt-1">رسوم الفحص الأساسية: ${selectedService.base_inspection_fee}</p>
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
          <Label htmlFor="offer_description">رسالتك إلى الفني (اختياري)</Label>
          <Textarea
            id="offer_description"
            placeholder="أضف أي ملاحظات أو أسئلة محددة للفني."
            value={formData.offer_description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            `أرسل عرضًا إلى ${localTechnician?.first_name || 'الفني'}`
          )}
        </Button>
      </form>
    </div>
  );
};

export default DirectOfferForm;
