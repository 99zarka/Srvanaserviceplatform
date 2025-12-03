import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, DollarSign, MapPin, CheckCircle, XCircle, Edit, Loader2 } from 'lucide-react';
import { getClientOrders, clearError, clearSuccessMessage, updateClientOffer } from '../redux/orderSlice';
import { toast } from 'sonner';

export function ClientOffersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clientOrders, loading, error, successMessage } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.user_id) {
      dispatch(getClientOrders());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccessMessage());
    }
    if (error) {
      toast.error(error.detail || error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch]);

  const handleEditOffer = (order) => {
    // Navigate to edit offer page or open edit modal
    // For now, we'll navigate to a hypothetical edit page
    navigate(`/edit-offer/${order.order_id}`);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'معلقة';
      case 'awaiting_technician_response': return 'بانتظار رد الفني';
      case 'accepted': return 'مقبولة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتملة';
      case 'cancelled': return 'ملغاة';
      case 'rejected': return 'مرفوضة';
      default: return 'غير محدد';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting_technician_response': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

 if (loading && !clientOrders?.length) {
    return (
      <div className="flex items-center justify-center py-12" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-600">جاري تحميل عروضك...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">العروض والطلبات</h1>
        <p className="text-gray-600">عرض وإدارة طلبات وعروض الخدمة الخاصة بك.</p>
      </div>

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

      {clientOrders?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على عروض أو طلبات.</p>
            <p className="text-gray-600">عندما تنشئ طلبات أو عروض خدمة، ستظهر هنا.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {clientOrders?.map((order) => (
            <Card key={order.order_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">طلب رقم #{order.order_id}</CardTitle>
                  <Badge className={getStatusColor(order.order_status)}>
                    {getStatusText(order.order_status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">
                    {order.service?.base_inspection_fee ? `${order.service.base_inspection_fee} ريال` : 'غير متاح'}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{order.problem_description}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{order.requested_location || 'غير متاح'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{order.scheduled_date || 'غير متاح'} في {order.scheduled_time_start || 'غير متاح'} - {order.scheduled_time_end || 'غير متاح'}</span>
                </div>

                {/* Show any offers for this order */}
                {order.project_offers && order.project_offers.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">العروض المستلمة:</h4>
                    {order.project_offers.map((offer) => (
                      <div key={offer.offer_id} className="bg-gray-50 p-3 rounded-md mb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">عرض الفني</p>
                            <p className="text-xs text-gray-600">السعر: {offer.offered_price} ريال</p>
                          </div>
                          <Badge className={getStatusColor(offer.status)}>
                            {getStatusText(offer.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit button for pending and awaiting technician response orders */}
                {(order.order_status === 'pending' || order.order_status === 'awaiting_technician_response') && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => handleEditOffer(order)}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل الطلب
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
