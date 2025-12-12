import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DollarSign, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'react-router-dom';


const OfferCard = ({ 
  offer, 
  onAcceptOffer, 
  loading,
  orderStatus 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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
      default:
        return 'غير محدد';
    }
  };

  const canAcceptOffer = orderStatus === 'AWAITING_CLIENT_ESCROW_CONFIRMATION' && offer.status === 'pending';

  return (
    <Card className="mb-3 border-gray-200 hover:border-gray-30 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <Link 
              to={`/profile/${offer.technician_user?.user_id}`}
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              {offer.technician_user?.first_name} {offer.technician_user?.last_name}
            </Link>
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
            {format(new Date(offer.offer_date), 'PPP', { locale: ar })}
          </div>
        </div>
        
        {canAcceptOffer && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Button 
              onClick={() => onAcceptOffer(offer.offer_id)}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  جاري القبول...
                </span>
              ) : (
                'قبول العرض'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfferCard;
