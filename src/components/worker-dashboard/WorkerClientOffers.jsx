import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, DollarSign, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getTechnicianClientOffers, respondToClientOffer, clearError, clearSuccessMessage } from '../../redux/orderSlice';

export function WorkerClientOffers() {
  const dispatch = useDispatch();
  const { technicianClientOffers, loading, error, successMessage } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

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
  }, [technicianClientOffers, loading, error, successMessage]);

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

  if (loading && !technicianClientOffers) { // Fixed variable name
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل العروض...</p>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">عروض العملاء</h1>
      <p className="text-gray-600 mb-6">عرض والرد على عروض العملاء المباشرة.</p>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200" dir="rtl">
          <p className="text-sm text-red-600">خطأ: {error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200" dir="rtl">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {technicianClientOffers?.length === 0 ? (
        <Card className="text-center py-12" dir="rtl">
          <CardContent>
            <p className="text-lg font-medium text-gray-900 mb-2">لا توجد عروض عملاء حاليًا.</p>
            <p className="text-gray-600">عندما يقدم العملاء عروضًا مباشرة، ستظهر هنا.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {technicianClientOffers?.map((offer) => (
            <Card key={offer.offer_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">عرض من {offer.order?.client_user?.first_name || 'غير متاح'}</CardTitle>
                  <Badge className={`
                    ${offer.status === 'pending' && 'bg-yellow-100 text-yellow-800'}
                    ${offer.status === 'accepted' && 'bg-green-100 text-green-800'}
                    ${offer.status === 'rejected' && 'bg-red-100 text-red-800'}
                  `}>
                    {offer.status === 'pending' && 'معلق'}
                    {offer.status === 'accepted' && 'مقبول'}
                    {offer.status === 'rejected' && 'مرفوض'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">{offer.offered_price} ريال</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{offer.offer_description}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{offer.order?.requested_location || 'غير متاح'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{offer.order?.scheduled_date || 'غير متاح'} في {offer.order?.scheduled_time_start || 'غير متاح'} - {offer.order?.scheduled_time_end || 'غير متاح'}</span>
                </div>

                {offer.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="default" 
                      className="flex-1" 
                      onClick={() => handleRespondToOffer(offer.offer_id, 'accept')}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 ml-2" />
                      قبول
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => handleRespondToOffer(offer.offer_id, 'reject', 'Technician is not available.')}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 ml-2" />
                      رفض
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
