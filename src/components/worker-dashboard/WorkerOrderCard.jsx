import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, CheckCircle, XCircle, User, MapPin, Calendar, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const WorkerOrderCard = ({
  order,
  onViewDetails,
  onStartJob,
  onMarkCompleted,
  onInitiateDispute,
  loading
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
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
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return <CheckCircle className="h-4 w-4" />;
      case 'AWAITING_RELEASE':
      case 'DISPUTED':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
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
                <User className="h-4 w-4" />
                {order.client_user?.first_name || order.client_user?.username || 'عميل'}
              </div>
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
            </div>
          </div>

          <div className="text-left">
            <div className="text-lg font-bold text-green-600">
              {order.final_price || order.estimated_budget || 'N/A'} ج.م
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(order.order_id)}
            disabled={loading}
          >
            عرض التفاصيل
          </Button>

          {order.order_status === 'ACCEPTED' && (
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => onStartJob(order.order_id)}
              disabled={loading}
            >
              بدء المهمة
            </Button>
          )}

          {order.order_status === 'IN_PROGRESS' && (
            <Button
              variant="default"
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => onMarkCompleted(order.order_id)}
              disabled={loading}
            >
              إتمام المهمة
            </Button>
          )}

          {(order.order_status === 'IN_PROGRESS' || order.order_status === 'AWAITING_RELEASE') && (
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
              onClick={() => onInitiateDispute(order.order_id)}
              disabled={loading}
            >
              <Flag className="h-4 w-4 ml-1" />
              فتح نزاع
            </Button>
          )}

          {order.order_status === 'DISPUTED' && (
            <Link to={`/dashboard/disputes/${order.order_id}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                disabled={loading}
              >
                <Flag className="h-4 w-4 ml-1" />
                عرض النزاع
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkerOrderCard;
