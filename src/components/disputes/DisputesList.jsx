import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Flag, Eye, Clock, User, MapPin, Calendar, DollarSign, MessageSquare, FileText, Users } from "lucide-react";
import { 
 useGetClientOrdersWithDisputesQuery, 
  useGetTechnicianOrdersWithDisputesQuery 
} from "../../services/api";

export function DisputesList({ 
  userType = "client", // "client" or "technician"
  title = "نزاعاتي",
  subtitle = "إدارة النزاعات",
  orderLinkPrefix = "/orders/dashboard",
  orderLinkParam = "orderId"
}) {
  const { token } = useSelector((state) => state.auth);

  // Use appropriate RTK Query hook based on user type
 const { 
    data: ordersData, 
    isLoading: disputesLoading, 
    error: disputesError 
  } = userType === "technician" 
    ? useGetTechnicianOrdersWithDisputesQuery(undefined, { skip: !token })
    : useGetClientOrdersWithDisputesQuery(undefined, { skip: !token });

  // Handle both paginated (with results) and direct array responses
  const [ordersWithDisputes, setOrdersWithDisputes] = useState([]);

  useEffect(() => {
    let array = [];
    if (ordersData) {
      if (Array.isArray(ordersData)) {
        array = ordersData;
      } else if (ordersData.results && Array.isArray(ordersData.results)) {
        array = ordersData.results;
      } else if (ordersData.results !== undefined) {
        array = Array.isArray(ordersData.results) ? ordersData.results : [];
      }
    }
    // Filter to only include orders that have a dispute
    const ordersWithDispute = array.filter(order => order.dispute);
    setOrdersWithDisputes(ordersWithDispute);
  }, [ordersData]);

  const getStatusBadge = (status) => {
    let translatedStatus = status;
    let className = "bg-gray-100 text-gray-800"; // Default

    switch (status) {
      case "OPEN":
        translatedStatus = "مفتوح";
        className = "bg-blue-100 text-blue-800";
        break;
      case "IN_REVIEW":
        translatedStatus = "قيد المراجعة";
        className = "bg-yellow-100 text-yellow-800";
        break;
      case "RESOLVED":
        translatedStatus = "تم حل النزاع";
        className = "bg-green-100 text-green-800";
        break;
      case "CLOSED":
        translatedStatus = "مغلق";
        className = "bg-red-100 text-red-800";
        break;
      default:
        translatedStatus = status;
        break;
    }
    return <Badge className={className}>{translatedStatus}</Badge>;
  };

 if (disputesLoading) return <div className="text-center p-8" dir="rtl">جاري تحميل النزاعات...</div>;
  if (disputesError) return <div className="text-center p-8 text-red-50" dir="rtl">خطأ: {disputesError?.message || disputesError}</div>;

  if (ordersWithDisputes.length === 0) {
    return <div className="text-center p-8" dir="rtl">لا توجد نزاعات حاليًا.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Flag className="h-7 w-7" />
          <span>{title}</span>
        </h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="space-y-4">
        {ordersWithDisputes.map((order) => {
          const dispute = order.dispute;
          const service = order.service;
          const technician = order.associated_offer?.technician_user;
          
          return (
            <Card key={dispute.dispute_id} className="hover:shadow-lg transition-shadow duration-200 w-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">
                    <span className="text-muted-foreground text-sm font-normal">النزاع #</span>
                    {dispute.dispute_id}
                  </CardTitle>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(dispute.status)}
                      {dispute.resolution && (
                        <Badge className="bg-purple-100 text-purple-800">
                          {dispute.resolution === 'REFUND_CLIENT' ? 'استرداد للعميل' : 
                           dispute.resolution === 'PAY_TECHNICIAN' ? 'دفع للفني' : 
                           dispute.resolution === 'SPLIT_PAYMENT' ? 'تقسيم الدفع' : dispute.resolution}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>تم الإنشاء: {new Date(dispute.created_at).toLocaleDateString("ar-EG", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      {dispute.resolution_date && (
                        <>
                          <span>•</span>
                          <span>تم الحل: {new Date(dispute.resolution_date).toLocaleDateString("ar-EG")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Service Information */}
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{service?.arabic_name || service?.service_name}</h3>
                    <p className="text-xs text-muted-foreground">{service?.description}</p>
                    <p className="text-sm font-medium mt-1">
                      <DollarSign className="h-3 w-3 inline mr-1" />
                      السعر النهائي: {order.final_price} جنيه
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                    <User className="h-4 w-4 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">رقم الطلب</p>
                      <Link 
                        to={`${orderLinkPrefix}?${orderLinkParam}=${order.order_id}`} 
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        #{order.order_id}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">الموقع</p>
                      <p className="text-sm font-medium truncate">{order.requested_location}</p>
                    </div>
                  </div>
                </div>

                {/* Technician Information */}
                {technician && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">
                        {technician.first_name} {technician.last_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{technician.specialization}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {technician.verification_status === 'Verified' && (
                          <Badge className="bg-green-100 text-green-800 text-xs">تم التحقق</Badge>
                        )}
                        {technician.overall_rating && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            ⭐ {technician.overall_rating}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dispute Arguments */}
                <div className="space-y-3">
                  {dispute.client_argument && (
                    <div className="p-3 bg-red-50 border-red-20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-sm text-red-800">حجة العميل</span>
                      </div>
                      <p className="text-sm">{dispute.client_argument}</p>
                    </div>
                  )}
                  
                  {dispute.technician_argument && (
                    <div className="p-3 bg-blue-50 border border-blue-20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm text-blue-800">حجة الفني</span>
                      </div>
                      <p className="text-sm">{dispute.technician_argument}</p>
                    </div>
                  )}
                  
                  {dispute.admin_notes && (
                    <div className="p-3 bg-purple-50 border border-purple-20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-sm text-purple-800">ملاحظات المشرف</span>
                      </div>
                      <p className="text-sm">{dispute.admin_notes}</p>
                    </div>
                  )}
                </div>

                {/* Response Count */}
                {dispute.responses && dispute.responses.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{dispute.responses.length} ردود</span>
                  </div>
                )}

                {/* View Details Button */}
                <div className="pt-3">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={`/dashboard/disputes/${order.order_id}`}>
                      <Eye className="h-4 w-4 ml-2" />
                      عرض التفاصيل الكاملة
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
