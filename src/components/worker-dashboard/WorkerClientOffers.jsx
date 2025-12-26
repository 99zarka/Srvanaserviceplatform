import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, DollarSign, MapPin, CheckCircle, XCircle, Loader2, User, Calendar, MessageCircle, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTechnicianClientOffers, respondToClientOffer, clearError, clearSuccessMessage } from '../../redux/orderSlice';
import BASE_URL from '../../config/api'; // Import BASE_URL

export function WorkerClientOffers() {
  const dispatch = useDispatch();
  const { technicianClientOffers, loading, error, successMessage, technicianClientOffersPagination } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    console.log("WorkerClientOffers - user state:", user);
    if (user?.user_id) {
      // Fetch client-initiated offers for the logged-in technician
      dispatch(getTechnicianClientOffers()); 
    }
  }, [dispatch, user]);

  useEffect(() => {
    console.log("WorkerClientOffers - technicianClientOffers:", technicianClientOffers);
    console.log("WorkerClientOffers - loading:", loading);
    console.log("WorkerClientOffers - error:", error);
    console.log("WorkerClientOffers - successMessage:", successMessage);
    console.log("WorkerClientOffers - pagination:", technicianClientOffersPagination);
  }, [technicianClientOffers, loading, error, successMessage, technicianClientOffersPagination]);

  useEffect(() => {
    // Clear messages after 5 seconds
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleRespondToOffer = (offerId, actionType, rejectionReason = '') => {
    dispatch(respondToClientOffer({
      technicianId: user.user_id,
      offerId,
      actionType,
      rejectionReason
    }));
  };

  const handleLoadMore = async () => {
    if (technicianClientOffersPagination.next && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        // Calculate the next page number
        const nextPage = technicianClientOffersPagination.currentPage + 1;
        await dispatch(getTechnicianClientOffers({ page: nextPage })).unwrap();
      } catch (error) {
        console.error('Failed to load more offers:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(parseFloat(price));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !technicianClientOffers) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
          </div>
          <p className="text-lg text-gray-600 font-medium">جاري تحميل العروض...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary mb-2">
              عروض العملاء
            </h1>
            <p className="text-gray-600 text-lg">عرض والرد على عروض العملاء المباشرة</p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">عروض مباشرة</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 shadow-sm" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-600 font-medium">خطأ: {error?.message || 'حدث خطأ غير معروف.'}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 shadow-sm" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-600 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {technicianClientOffers?.length === 0 && !loading ? (
        <Card className="text-center py-16 border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 mb-2">لا توجد عروض عملاء حاليًا</p>
              <p className="text-gray-600">عندما يقدم العملاء عروضًا مباشرة، ستظهر هنا</p>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-600">كن مستعدًا لفرص العمل الجديدة</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 relative">
          {(loading && technicianClientOffers) && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                </div>
                <p className="text-lg text-gray-600 font-medium">جاري تحميل البيانات...</p>
              </div>
            </div>
          )}
          <div className={!loading ? "" : "opacity-50 pointer-events-none"}>
            {technicianClientOffers?.map((offer) => (
              <Card 
                key={offer.offer_id}
                className="group hover:shadow-lg transition-all duration-300 border-secondary/50 hover:border-secondary/70 hover:-translate-y-1 bg-secondary/5"
              >
                <CardHeader className="bg-gradient-to-br from-white to-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/profile/${offer.order?.client_user?.user_id}`}
                        onClick={(e) => {
                          // Prevent the link from interfering with card interactions
                          e.stopPropagation();
                        }}
                      >
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors overflow-hidden">
                          <img
                            src={`${BASE_URL}/users/${offer.order?.client_user?.user_id}/profile_photo/`}
                            alt={`${offer.order?.client_user?.first_name || 'العميل'} الصورة الشخصية`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-secondary transition-colors">
                          عرض من 
                          { " "}
                          <Link 
                            to={`/profile/${offer.order?.client_user?.user_id}`}
                            className="text-secondary hover:text-secondary/80 hover:underline font-bold"
                            onClick={(e) => {
                              // Prevent the link from interfering with card interactions
                              e.stopPropagation();
                            }}
                          >
                            {offer.order?.client_user?.first_name || 'غير متاح'} {offer.order?.client_user?.last_name || ''}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(offer.offer_date)}</span>
                        </CardDescription>
                        <div className="mt-2 space-y-1">
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">الخدمة:</span> {offer.order?.service?.arabic_name || offer.order?.service?.service_name || 'غير متوفر'}
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">وصف المشكلة:</span> {offer.order?.problem_description || 'غير متوفر'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={getStatusBadgeVariant(offer.status)}
                      className="text-sm font-medium px-3 py-1"
                    >
                      {getStatusIcon(offer.status)}
                      <span className="mr-2">
                        {offer.status === 'pending' && 'معلق'}
                        {offer.status === 'accepted' && 'مقبول'}
                        {offer.status === 'rejected' && 'مرفوض'}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg border border-primary/20">
                      <DollarSign className="h-5 w-5 text-secondary" />
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(offer.offered_price)}</span>
                        <span className="text-sm text-gray-500 mr-2">سعر العرض</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {offer.offer_description || 'لا يوجد وصف للعرض'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-gray-700">{offer.order?.requested_location || 'غير متاح'}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-gray-700">
                          {offer.order?.scheduled_date || 'غير متاح'} في {offer.order?.scheduled_time_start || 'غير متاح'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {offer.status === 'pending' && offer.order.order_status !== 'AWAITING_CLIENT_ESCROW_CONFIRMATION' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                      <Button 
                        variant="default" 
                        className="flex-1 bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary hover:to-secondary/80 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        onClick={() => handleRespondToOffer(offer.offer_id, 'accept')}
                        disabled={loading}
                      >
                        <CheckCircle className="h-5 w-5 ml-2" />
                        قبول العرض
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-semibold py-3 transition-all duration-200"
                        onClick={() => handleRespondToOffer(offer.offer_id, 'reject', 'Technician is not available.')}
                        disabled={loading}
                      >
                        <XCircle className="h-5 w-5 ml-2" />
                        رفض العرض
                      </Button>
                    </div>
                  )}

                  {offer.status !== 'pending' && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        offer.status === 'accepted' 
                          ? 'bg-green-50 border border-green-200 text-green-700' 
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                        <span className="text-sm font-medium">
                          {offer.status === 'accepted' ? 'تم القبول' : 'تم الرفض'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {offer.status === 'accepted' ? 'تمت الموافقة على العرض' : 'تم رفض العرض'}
                      </div>
                    </div>
                  )}

                  {offer.status === 'pending' && offer.order.order_status === 'AWAITING_CLIENT_ESCROW_CONFIRMATION' && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">تم القبول</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          في انتظار تأكيد العميل للدفع
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-semibold py-3 transition-all duration-200"
                          onClick={() => handleRespondToOffer(offer.offer_id, 'reject', 'Technician changed mind.')}
                          disabled={loading}
                        >
                          <XCircle className="h-5 w-5 ml-2" />
                          إلغاء القبول
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {technicianClientOffers?.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              {/* Pagination Summary */}
              <div className="text-sm text-gray-600">
                {technicianClientOffersPagination.count > 0 ? (
                  <span>
                    عرض {technicianClientOffers.length} من {technicianClientOffersPagination.count} عرض
                  </span>
                ) : (
                  <span>لا توجد عروض</span>
                )}
              </div>

              {/* Load More Button */}
              {technicianClientOffersPagination.next && (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore || loading}
                  className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary hover:to-secondary/80 text-white font-semibold py-3 px-6 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      تحميل المزيد
                    </>
                  )}
                </Button>
              )}

              {/* No More Offers Message */}
              {!technicianClientOffersPagination.next && technicianClientOffersPagination.count > 10 && (
                <div className="text-sm text-gray-500 italic">
                  تم عرض جميع العروض
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
