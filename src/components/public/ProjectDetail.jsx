import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPublicOrderDetail, createProjectOffer, updateProjectOffer, deleteProjectOffer } from '../../redux/orderSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Sparkles, Loader2, MapPin, Calendar, DollarSign, Clock, User, Briefcase, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import BASE_URL from '../../config/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const ProjectDetail = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated, token } = useSelector((state) => state.auth);
  const { currentViewingOrder: orderData, loading, error } = useSelector((state) => state.orders);

  // Extract order and project offers from the response
  const selectedOrder = orderData?.order || orderData;
  const projectOffers = orderData?.project_offers || [];

  const [offerPrice, setOfferPrice] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Project images mapping (same as PublicProjectsList)
  const projectImages = [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop",
  ];

  const getProjectImage = () => {
    // Use order_id to consistently get the same image for this project
    const index = parseInt(order_id) || 0;
    return projectImages[index % projectImages.length];
  };

  useEffect(() => {
    if (order_id) {
      dispatch(fetchPublicOrderDetail(order_id));
    }
  }, [dispatch, order_id]);

  const isTechnician = currentUser?.user_type === 'technician' || currentUser?.user_type === 'worker';
  const hasAlreadyOffered = selectedOrder?.project_offers?.some(
    (offer) => offer.technician_user === currentUser?.user_id
  );

  const generateProposal = async () => {
    if (!currentUser || !currentUser.user_id) {
      toast.error('يجب أن تكون مسجلاً دخولك لاستخدام هذه الميزة.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${BASE_URL}/ai/generate-proposal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: parseInt(order_id),
          technician_id: currentUser.user_id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOfferDescription(data.proposal);
        setOfferPrice(data.price);
        toast.success('تم توليد العرض والسعر بنجاح!');
      } else {
        toast.error('فشل في توليد العرض: ' + (data.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerPrice || !offerDescription) {
      toast.error('يرجى تقديم كل من سعر العرض ووصفه.');
      return;
    }
    if (!currentUser || !currentUser.user_id) {
      toast.error('يجب أن تكون مسجلاً دخولك لإرسال عرض.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createProjectOffer({
        order: order_id,
        offered_price: parseFloat(offerPrice),
        offer_description: offerDescription,
        technician_user: currentUser.user_id, // Ensure technician_user is sent
      })).unwrap();
      toast.success('تم إرسال العرض بنجاح!');
      setOfferPrice('');
      setOfferDescription('');
      // Optionally refresh the order to show the new offer immediately
      dispatch(fetchPublicOrderDetail(order_id));
    } catch (err) {
      const errorMessage = err.message || 'فشل في إرسال العرض.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F4C430] mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري تحميل تفاصيل المشروع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-6">خطأ: {error.message || 'فشل في جلب تفاصيل المشروع'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all"
          >
            العودة إلى المشاريع
          </button>
        </div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <Briefcase className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-6">المشروع غير موجود أو لا توجد بيانات.</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all"
          >
            العودة إلى المشاريع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero Header with Back Button */}
      <section className="py-8 px-4 bg-gradient-to-r from-[#1A2B4C] to-[#2A3B5C]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-white hover:text-[#F4C430] transition-colors mb-4 font-semibold"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة إلى المشاريع</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            تفاصيل المشروع
          </h1>
        </div>
      </section>

      {/* Main Project Details Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="flex flex-col lg:flex-row-reverse gap-8 lg:gap-12 items-start">
              {/* Image Section - Always on RIGHT */}
              <div className="w-full lg:w-1/2">
                <div 
                  className="relative overflow-hidden rounded-2xl shadow-2xl group sticky top-8"
                  style={{
                    aspectRatio: '16/10',
                    background: `linear-gradient(135deg, rgba(26, 43, 76, 0.1) 0%, rgba(244, 196, 48, 0.1) 100%)`
                  }}
                >
                  <img
                    src={getProjectImage()}
                    alt={selectedOrder.service?.arabic_name || 'مشروع'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4C]/70 to-transparent"></div>
                  
                  {/* Floating Status Badge */}
                  <div className="absolute top-6 right-6 bg-[#F4C430] text-[#1A2B4C] px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {selectedOrder.order_status === 'OPEN' ? 'مشروع مفتوح' : selectedOrder.order_status?.toLowerCase().replace(/_/g, ' ')}
                  </div>

                  {/* Price Badge */}
                  {selectedOrder.expected_price && (
                    <div className="absolute bottom-6 right-6 bg-white/95 text-[#1A2B4C] px-6 py-3 rounded-xl font-bold text-xl shadow-xl">
                      {selectedOrder.expected_price} ج.م
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section - Always on LEFT */}
              <div className="w-full lg:w-1/2 space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1A2B4C] mb-4">
                    {selectedOrder.service?.arabic_name || 'مشروع خدمة'}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-[#F4C430] to-[#FFD700] rounded-full"></div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-6 border-r-4 border-[#F4C430]">
                  <h3 className="text-lg font-bold text-[#1A2B4C] mb-3">وصف المشروع</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {selectedOrder.problem_description || 'لا يوجد وصف متاح'}
                  </p>
                </div>

                {/* Project Details Grid */}
                <div className="space-y-4">
                  {/* Client Info */}
                  <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border-r-4 border-[#F4C430]">
                    <User className="w-6 h-6 text-[#F4C430] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-gray-500 mb-1">العميل</p>
                      <Link 
                        to={`/profile/${selectedOrder.client_user?.user_id}`}
                        className="text-lg font-semibold text-[#1A2B4C] hover:text-[#F4C430] transition-colors"
                      >
                        {selectedOrder.client_user?.first_name} {selectedOrder.client_user?.last_name}
                      </Link>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border-r-4 border-[#F4C430]">
                    <MapPin className="w-6 h-6 text-[#F4C430] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-gray-500 mb-1">الموقع</p>
                      <p className="text-lg font-semibold text-[#1A2B4C]">
                        {selectedOrder.requested_location || 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border-r-4 border-[#F4C430]">
                    <Calendar className="w-6 h-6 text-[#F4C430] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-500 mb-1">التاريخ والوقت</p>
                      <p className="text-lg font-semibold text-[#1A2B4C]">
                        {selectedOrder.scheduled_date}
                      </p>
                      {selectedOrder.scheduled_time_start && (
                        <p className="text-md text-gray-600 mt-1">
                          <Clock className="inline w-4 h-4 ml-1" />
                          {selectedOrder.scheduled_time_start} - {selectedOrder.scheduled_time_end}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expected Price */}
                  {selectedOrder.expected_price && (
                    <div className="flex items-start gap-4 bg-gradient-to-r from-[#F4C430]/10 to-[#FFD700]/10 rounded-xl p-4 border-r-4 border-[#F4C430]">
                      <DollarSign className="w-6 h-6 text-[#F4C430] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">الميزانية المتوقعة</p>
                        <p className="text-2xl font-bold text-[#1A2B4C]">
                          {selectedOrder.expected_price} ج.م
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button for Non-Technicians */}
                {!isTechnician && (
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group w-full sm:w-auto"
                  >
                    <span>سجل كفني لتقديم عرض</span>
                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Offer Section for Technicians */}
      {isTechnician && selectedOrder.order_status === 'OPEN' && !hasAlreadyOffered && (
        <section className="py-8 bg-gradient-to-b from-white to-gray-50">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-white border-2 border-[#F4C430] rounded-2xl shadow-2xl hover:shadow-[#F4C430]/20 transition-all duration-300 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#1A2B4C] to-[#2A3B5C] px-6 sm:px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#F4C430] to-[#FFD700] rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-7 h-7 text-[#1A2B4C]" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">قدّم عرضك للمشروع</h2>
                    <p className="text-gray-300 text-sm">املأ النموذج أدناه لتقديم عرضك الاحترافي</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmitOffer} className="space-y-8">
                  {/* Price and AI Generator Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Price Input */}
                    <div>
                      <label htmlFor="offerPrice" className="block text-[#1A2B4C] text-base font-bold mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#F4C430]" />
                        سعر عرضك (ج.م)
                      </label>
                      <input
                        type="number"
                        id="offerPrice"
                        className="w-full py-4 px-5 border-2 border-gray-300 rounded-xl text-gray-700 text-lg leading-tight focus:outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 transition-all"
                        placeholder="مثل 150.00"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        required
                        min="1"
                        step="0.01"
                      />
                      <p className="text-sm text-gray-500 mt-2">أدخل السعر المناسب لخدماتك</p>
                    </div>
                    
                    {/* AI Generator Button */}
                    <div>
                      <label className="block text-[#1A2B4C] text-base font-bold mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#F4C430]" />
                        توليد عرض بالذكاء الاصطناعي
                      </label>
                      <button
                        type="button"
                        onClick={generateProposal}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-lg">جاري التوليد...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-6 h-6" />
                            <span className="text-lg">توليد العرض تلقائياً</span>
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gray-500 mt-2">اضغط لتوليد عرض وسعر احترافي</p>
                    </div>
                  </div>

                  {/* Offer Description */}
                  <div>
                    <label htmlFor="offerDescription" className="block text-[#1A2B4C] text-base font-bold mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#F4C430]" />
                      وصف العرض
                    </label>
                    <textarea
                      id="offerDescription"
                      className="w-full py-4 px-5 border-2 border-gray-300 rounded-xl text-gray-700 text-lg leading-relaxed focus:outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 transition-all resize-none"
                      rows="8"
                      placeholder="صف نهجك في العمل، خبرتك، توافرك، أو أي تفاصيل أخرى ذات صلة...&#10;&#10;مثال:&#10;• خبرة 5 سنوات في المجال&#10;• متاح للبدء فوراً&#10;• أستخدم أدوات ومعدات حديثة&#10;• التزام بالمواعيد والجودة"
                      value={offerDescription}
                      onChange={(e) => setOfferDescription(e.target.value)}
                      required
                    ></textarea>
                    <p className="text-sm text-gray-500 mt-2">اكتب وصفاً تفصيلياً يوضح مؤهلاتك وخبرتك</p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t-2 border-gray-200">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#F4C430] to-[#FFD700] hover:from-[#FFD700] hover:to-[#F4C430] text-[#1A2B4C] font-bold py-5 px-8 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#F4C430]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <span>إرسال العرض الآن</span>
                          <ArrowLeft className="w-6 h-6" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-3">سيتم إرسال عرضك مباشرة إلى العميل</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Alert Messages */}
      {isTechnician && hasAlreadyOffered && (
        <section className="py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-r-4 border-blue-500 text-blue-700 p-6 rounded-xl shadow-md">
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-lg mb-1">تم إرسال العرض</p>
                  <p>لقد قدمت عرضًا بالفعل لهذا المشروع. يمكنك مراجعته في قسم العروض أدناه.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!isTechnician && currentUser && (
        <section className="py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-r-4 border-yellow-500 text-yellow-700 p-6 rounded-xl shadow-md">
              <div className="flex items-start gap-3">
                <Briefcase className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-lg mb-1">حساب عميل</p>
                  <p>فقط الفنيون يمكنهم تقديم عروض على المشاريع. سجل كفني لتقديم عروضك!</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!currentUser && (
        <section className="py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-r-4 border-yellow-500 text-yellow-700 p-6 rounded-xl shadow-md">
              <div className="flex items-start gap-3">
                <User className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-lg mb-1">سجل الدخول للعرض</p>
                  <p className="mb-4">يرجى تسجيل الدخول بحساب فني لتقديم عرض على هذا المشروع.</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
                  >
                    <span>تسجيل الدخول</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {selectedOrder.order_status !== 'OPEN' && (isTechnician || currentUser) && (
        <section className="py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-r-4 border-orange-500 text-orange-700 p-6 rounded-xl shadow-md">
              <div className="flex items-start gap-3">
                <Briefcase className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-lg mb-1">المشروع غير مفتوح</p>
                  <p>هذا المشروع لم يعد مفتوحًا للعروض (الحالة الحالية: {selectedOrder.order_status?.toLowerCase().replace(/_/g, ' ')}).</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Display existing offers for this project */}
      {projectOffers && projectOffers.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A2B4C] mb-3">العروض المقدمة على المشروع</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-[#F4C430] to-[#FFD700] rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">إجمالي العروض: {projectOffers.length}</p>
            </div>
            
            <div className="space-y-6 max-w-full">
              {projectOffers.map((offer, index) => (
                <div 
                  key={offer.offer_id} 
                  className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-[#F4C430] overflow-hidden"
                >
                  {/* Offer Card Header with Status Bar */}
                  <div className="bg-gradient-to-r from-[#1A2B4C] to-[#2A3B5C] px-6 py-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                          <p className="text-sm text-gray-300 mb-1">رقم العرض</p>
                          <p className="text-xl font-bold text-white">#{offer.offer_id}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                          <p className="text-sm text-gray-300 mb-1">التاريخ</p>
                          <p className="text-md font-semibold text-white">{offer.offer_date}</p>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-block px-6 py-2 rounded-full text-sm font-bold shadow-md ${
                          offer.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                          offer.status === 'accepted' ? 'bg-green-400 text-green-900' :
                          offer.status === 'rejected' ? 'bg-red-400 text-red-900' :
                          'bg-gray-300 text-gray-800'
                        }`}>
                          {offer.status === 'pending' ? '⏳ قيد الانتظار' : 
                           offer.status === 'accepted' ? '✓ مقبول' : 
                           offer.status === 'rejected' ? '✗ مرفوض' :
                           offer.status?.toLowerCase().replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Offer Card Body */}
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      {/* Price Section */}
                      <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-[#F4C430]/10 to-[#FFD700]/10 rounded-xl p-6 border-2 border-[#F4C430] h-full flex flex-col justify-center">
                          <p className="text-sm font-bold text-gray-600 mb-2">سعر العرض</p>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-8 h-8 text-[#F4C430]" />
                            <p className="text-4xl font-bold text-[#1A2B4C]">{offer.offered_price}</p>
                            <span className="text-xl text-gray-600">ج.م</span>
                          </div>
                        </div>
                      </div>

                      {/* Technician Info Section */}
                      <div className="lg:col-span-2">
                        {offer.technician_user && (
                          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 h-full">
                            <p className="text-sm font-bold text-gray-600 mb-4">معلومات الفني</p>
                            <div className="flex items-center gap-4">
                              <Link 
                                to={`/profile/${offer.technician_user.user_id}`}
                                className="w-16 h-16 bg-gradient-to-br from-[#F4C430] to-[#FFD700] rounded-full flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden hover:scale-105 transition-transform"
                              >
                                {offer.technician_user.profile_photo ? (
                                  <img
                                    src={offer.technician_user.profile_photo}
                                    alt={`${offer.technician_user.first_name} ${offer.technician_user.last_name}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const parent = e.target.parentElement;
                                      const fallback = document.createElement('span');
                                      fallback.className = 'text-[#1A2B4C] font-bold text-2xl';
                                      fallback.textContent = `${offer.technician_user.first_name?.charAt(0)}${offer.technician_user.last_name?.charAt(0)}`;
                                      parent.appendChild(fallback);
                                    }}
                                  />
                                ) : (
                                  <span className="text-[#1A2B4C] font-bold text-2xl">
                                    {offer.technician_user.first_name?.charAt(0)}{offer.technician_user.last_name?.charAt(0)}
                                  </span>
                                )}
                              </Link>
                              <div className="flex-1">
                                <Link 
                                  to={`/profile/${offer.technician_user.user_id}`}
                                  className="text-xl font-bold text-[#1A2B4C] mb-1 hover:text-[#F4C430] transition-colors"
                                >
                                  {offer.technician_user.first_name} {offer.technician_user.last_name}
                                </Link>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <p className="text-md text-gray-600">فني محترف</p>
                                </div>
                                {offer.technician_user.phone && (
                                  <p className="text-sm text-gray-500 mt-1">📞 {offer.technician_user.phone}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Offer Description Section */}
                    <div className="mb-6">
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Briefcase className="w-5 h-5 text-[#F4C430]" />
                          <h3 className="text-lg font-bold text-[#1A2B4C]">وصف العرض</h3>
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                          {offer.offer_description || 'لا يوجد وصف متاح'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons for Technician's Own Offers */}
                    {isTechnician && currentUser?.user_id === offer.technician_user?.user_id && offer.status === 'pending' && (
                      <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-200">
                        <button
                          onClick={() => {
                            setEditingOffer(offer);
                            setEditPrice(offer.offered_price);
                            setEditDescription(offer.offer_description);
                            setIsEditing(true);
                          }}
                          className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-md font-bold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          <span>تعديل العرض</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeletingOffer(offer);
                            setIsDeleting(true);
                          }}
                          className="flex-1 min-w-[200px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-md font-bold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        >
                          <span>حذف العرض</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Edit Offer Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تحرير عرضك</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              // Handle edit form submission
              if (!editPrice || !editDescription) {
                toast.error('يرجى تقديم كل من سعر العرض ووصفه.');
                return;
              }

              try {
                await dispatch(updateProjectOffer({
                  offerId: editingOffer.offer_id,
                  offerData: {
                    offered_price: parseFloat(editPrice),
                    offer_description: editDescription
                  }
                })).unwrap();

                toast.success('تم تحديث العرض بنجاح!');
                setIsEditing(false);
                // Refresh the order to show the updated offer
                dispatch(fetchPublicOrderDetail(order_id));
              } catch (err) {
                const errorMessage = err.message || 'فشل في تحديث العرض.';
                toast.error(errorMessage);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="editPrice" className="block text-gray-700 text-sm font-bold mb-2">
                سعر العرض (ج.م)
              </label>
              <input
                type="number"
                id="editPrice"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
                min="1"
                step="1"
              />
            </div>

            <div>
              <label htmlFor="editDescription" className="block text-gray-700 text-sm font-bold mb-2">
                وصف العرض
              </label>
              <textarea
                id="editDescription"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                تحديث العرض
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Offer Confirmation Modal */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد حذف العرض</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا العرض؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>

          {deletingOffer && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>السعر:</strong> {deletingOffer.offered_price} ج.م
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>الوصف:</strong> {deletingOffer.offer_description}
              </p>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsDeleting(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              إلغاء
            </button>
            <button
              onClick={async () => {
                try {
                  await dispatch(deleteProjectOffer(deletingOffer.offer_id)).unwrap();
                  toast.success('تم حذف العرض بنجاح!');
                  setIsDeleting(false);
                  setDeletingOffer(null);
                  dispatch(fetchPublicOrderDetail(order_id));
                } catch (err) {
                  const errorMessage = err.message || 'فشل في حذف العرض.';
                  toast.error(errorMessage);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              حذف العرض
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
