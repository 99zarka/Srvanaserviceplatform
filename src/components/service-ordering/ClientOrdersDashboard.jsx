import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  getClientOrders, 
  getOrderOffers, 
  acceptOffer, 
  clearError, 
  clearSuccessMessage 
} from '../../redux/orderSlice';
import { Clock, CheckCircle, XCircle, DollarSign, User, MapPin, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ClientOrdersDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    clientOrders, 
    currentOrderOffers, 
    loading, 
    error, 
    successMessage 
  } = useSelector((state) => state.orders);
  
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    dispatch(getClientOrders());
  }, [dispatch]);

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

  const handleViewOffers = (orderId) => {
    setSelectedOrderId(orderId);
    dispatch(getOrderOffers(orderId));
  };

  const handleAcceptOffer = async (orderId, offerId) => {
    try {
      await dispatch(acceptOffer({ orderId, offerId }));
      // Refresh orders after accepting offer
      dispatch(getClientOrders());
    } catch (error) {
      console.error('Failed to accept offer:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'معلقة';
      case 'accepted':
        return 'مقبولة';
      case 'rejected':
        return 'مرفوضة';
      case 'completed':
        return 'مكتملة';
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">طلباتي للخدمة</h1>
        <p className="text-gray-600">إدارة طلباتك ومراجعة عروض الفنيين</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>طلباتي</CardTitle>
              <CardDescription>
                {Array.isArray(clientOrders) ? clientOrders.length : 0} طلبات تم إنشاؤها
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (!clientOrders || clientOrders.length === 0) ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">جاري تحميل الطلبات...</span>
                </div>
              ) : (!clientOrders || clientOrders.length === 0) ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">لا توجد طلبات بعد</p>
                  <Button onClick={() => navigate('/order-create')}>
                    إنشاء طلبك الأول
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientOrders.map((order) => (
                    <div
                      key={order.order_id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedOrderId === order.order_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleViewOffers(order.order_id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {order.problem_description}
                            </h3>
                            <Badge className={getStatusColor(order.order_status)}>
                              {getStatusIcon(order.order_status)}
                              <span className="ml-1">{getStatusText(order.order_status)}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {order.requested_location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(order.scheduled_date), 'PPP')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {order.scheduled_time_start} - {order.scheduled_time_end}
                            </div>
                            {order.technician_user && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                تم التعيين لـ {order.technician_user.first_name}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {order.offers_count > 0 && (
                            <Badge variant="outline">
                              {order.offers_count} عروض
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Offers Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedOrderId ? 'العروض المستلمة' : 'اختر طلبًا'}
              </CardTitle>
              <CardDescription>
                {selectedOrderId 
                  ? 'راجع واقبل العروض من الفنيين'
                  : 'انقر على طلب لعرض العروض'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedOrderId ? (
                <div className="text-center py-8 text-gray-500">
                  اختر طلبًا لعرض العروض
                </div>
              ) : loading && (!currentOrderOffers || currentOrderOffers.length === 0) ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">جاري تحميل العروض...</span>
                </div>
              ) : (!currentOrderOffers || currentOrderOffers.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <p>لم يتم استلام عروض بعد</p>
                  <p className="text-sm">سيقدم الفنيون عروضهم على طلبك قريبًا</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentOrderOffers.map((offer) => (
                    <div key={offer.offer_id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {offer.technician_user?.first_name} {offer.technician_user?.last_name}
                          </span>
                        </div>
                        <Badge className={getStatusColor(offer.status)}>
                          {getStatusText(offer.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            ${offer.offered_price}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          {offer.offer_description}
                        </p>
                        
                        <div className="text-xs text-gray-500">
                          {format(new Date(offer.offer_date), 'PPP')}
                        </div>
                      </div>
                      
                      {offer.status === 'pending' && (
                        <div className="mt-4 pt-3 border-t">
                          <Button 
                            onClick={() => handleAcceptOffer(selectedOrderId, offer.offer_id)}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2">جاري القبول...</span>
                              </>
                            ) : (
                              'قبول العرض'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientOrdersDashboard;
