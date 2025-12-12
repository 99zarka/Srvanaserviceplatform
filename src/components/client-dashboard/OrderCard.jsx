import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, CheckCircle, XCircle, User, MapPin, Calendar, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const OrderCard = ({
  order,
  isSelected,
  onToggleExpand,
  onEdit,
  onView,
  onCancel,
  onReleaseFunds,
  onInitiateDispute,
  onSubmitReview,
  onAcceptOffer,
  loading
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800';
      case 'AWAITING_RELEASE':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-teal-100 text-teal-800';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-pink-100 text-pink-800';
      case 'AWAITING_CLIENT_ESCROW_CONFIRMATION':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN':
        return 'مفتوحة';
      case 'PENDING':
        return 'معلقة';
      case 'ACCEPTED':
        return 'مقبولة';
      case 'IN_PROGRESS':
        return 'قيد التنفيذ';
      case 'AWAITING_RELEASE':
        return 'بانتظار الإفراج';
      case 'COMPLETED':
        return 'مكتملة';
      case 'DISPUTED':
        return 'متنازع عليها';
      case 'CANCELLED':
        return 'ملغاة';
      case 'REFUNDED':
        return 'مستردة';
      case 'AWAITING_CLIENT_ESCROW_CONFIRMATION':
        return 'بانتظار تأكيد العميل للدفع';
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
      case 'PENDING':
      case 'AWAITING_RELEASE':
      case 'DISPUTED':
      case 'AWAITING_CLIENT_ESCROW_CONFIRMATION':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return <CheckCircle className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isAcceptOfferButtonDisabled = 
    order.order_status !== 'AWAITING_CLIENT_ESCROW_CONFIRMATION' ||
    (order.associated_offer && order.associated_offer.status === 'accepted') ||
    order.order_status === 'ACCEPTED' ||
    loading;

  const acceptOfferButtonText = 
    (order.order_status === 'ACCEPTED' || (order.associated_offer && order.associated_offer.status === 'accepted'))
      ? 'تم التأكيد' 
      : 'تأكيد وتمويل الضمان';

  return (
    <Card className={`transition-all duration-300 ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-lg' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">
                {order.service?.arabic_name || order.service?.service_name || order.problem_description}
              </h3>
              <Badge className={getStatusColor(order.order_status)}>
                {getStatusIcon(order.order_status)}
                <span className="ml-1">{getStatusText(order.order_status)}</span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {order.requested_location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(order.scheduled_date), 'PPP', { locale: ar })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {order.scheduled_time_start} - {order.scheduled_time_end}
              </div>
              {(order.technician_user || order.associated_offer?.technician_user) && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  تم التعيين لـ 
                  <Link 
                    to={`/profile/${order.associated_offer?.technician_user?.user_id || order.technician_user}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {order.associated_offer?.technician_user?.first_name || order.technician_user?.first_name || 'فني'} {order.associated_offer?.technician_user?.last_name || order.technician_user?.last_name || ''}
                  </Link>
                </div>
              )}
              {(order.review_rating || order.review_comment) && (
                <div className="w-full md:w-auto md:col-span-2 mt-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    {order.review_rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < order.review_rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-yellow-70 bg-yellow-100 px-2 py-1 rounded-full">
                          {order.review_rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                  {order.review_comment && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900 block mb-1">تعليق المراجعة: </span>
                      <p className="bg-white p-2 rounded border border-gray-200 italic text-gray-800">
                        "{order.review_comment}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right flex items-center gap-2">
            {order.project_offers && order.project_offers.length > 0 && (
              <div className="flex flex-col items-end gap-1">
                <Badge className="bg-blue-100 text-blue-800 px-2 py-1 text-sm font-medium">
                  {order.project_offers.length} عروض
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpand}
                  className="p-1 text-xs text-blue-60 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1"
                >
                  {isSelected ? (
                    <>
                      <span>إخفاء</span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>عرض</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            )}
            {(!order.project_offers || order.project_offers.length === 0) && order.offers_count !== undefined && (
              <Badge variant="outline" className="mr-2 px-2 py-1 text-sm">
                {order.offers_count} عروض
              </Badge>
            )}
          </div>
        </div>

          <div className="flex flex-wrap gap-2">
            {/* Always show View Details button */}
            <Link to={`/dashboard/orders-offers/view/${order.order_id}`}>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={loading}
              >
                عرض تفاصيل الطلب
              </Button>
            </Link>
            
            {(order.order_status === 'OPEN' || order.order_status === 'PENDING') && (
              <>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onCancel(order.order_id)}
                  disabled={loading}
                >
                  إلغاء الطلب
                </Button>
                <Link to={`/dashboard/orders-offers/edit/${order.order_id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={loading}
                  >
                    تعديل الطلب
                  </Button>
                </Link>
              </>
            )}
            {order.order_status === 'AWAITING_RELEASE' && (
              <>
                <Button 
                  variant="success" 
                  size="sm" 
                  onClick={() => onReleaseFunds(order.order_id)}
                  disabled={loading}
                >
                  تحرير الأموال
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onInitiateDispute(order.order_id)}
                  disabled={loading}
                >
                  فتح نزاع
                </Button>
              </>
            )}
            {order.order_status === 'COMPLETED' && (order.technician_user || order.associated_offer?.technician_user) && !order.review_rating && !order.review_comment && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onSubmitReview(order.order_id, order.associated_offer?.technician_user?.user_id || order.technician_user)}
                disabled={loading}
              >
                كتابة مراجعة
              </Button>
            )}
            {order.order_status === 'DISPUTED' && (
              <Link to={`/dashboard/disputes/${order.order_id}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={loading}
                >
                  عرض النزاع
                </Button>
              </Link>
            )}
            {order.order_status === 'AWAITING_CLIENT_ESCROW_CONFIRMATION' && order.associated_offer && (
              <Button
                variant="success"
                size="sm"
                onClick={() => onAcceptOffer(order.order_id, order.associated_offer.offer_id)}
                disabled={isAcceptOfferButtonDisabled}
              >
                {acceptOfferButtonText}
              </Button>
            )}
          </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
