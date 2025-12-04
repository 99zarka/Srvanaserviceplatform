import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTransactionDetail, clearCurrentTransaction } from "../redux/transactionSlice";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, DollarSign } from "lucide-react";

export function TransactionDetailPage() {
  const { transactionId } = useParams();
  const dispatch = useDispatch();
  const { currentTransaction, loading, error } = useSelector((state) => state.transactions);

  useEffect(() => {
    if (transactionId) {
      dispatch(getTransactionDetail(transactionId));
    }
    return () => {
      dispatch(clearCurrentTransaction()); // Clear transaction details on unmount
    };
  }, [transactionId, dispatch]);

  const getTransactionTypeBadge = (type) => {
    let translatedType = type;
    let className = "bg-gray-100 text-gray-800"; // Default

    switch (type) {
      case "DEPOSIT":
        translatedType = "إيداع";
        className = "bg-green-100 text-green-800";
        break;
      case "WITHDRAWAL":
        translatedType = "سحب";
        className = "bg-red-100 text-red-800";
        break;
      case "ESCROW_FUNDING":
        translatedType = "تمويل الضمان";
        className = "bg-blue-100 text-blue-800";
        break;
      case "ESCROW_RELEASE":
        translatedType = "إفراج الضمان";
        className = "bg-purple-100 text-purple-800";
        break;
      case "DISPUTE_SETTLEMENT":
        translatedType = "تسوية نزاع";
        className = "bg-orange-100 text-orange-800";
        break;
      case "SERVICE_PAYMENT":
        translatedType = "دفعة خدمة";
        className = "bg-indigo-100 text-indigo-800";
        break;
      case "SERVICE_REFUND":
        translatedType = "استرداد خدمة";
        className = "bg-pink-100 text-pink-800";
        break;
      default:
        translatedType = type;
        break;
    }
    return <Badge className={className}>{translatedType}</Badge>;
  };

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل تفاصيل المعاملة...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;
  if (!currentTransaction) return <div className="text-center p-8" dir="rtl">المعاملة غير موجودة أو حدث خطأ.</div>;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <Link to={-1} className="flex items-center text-blue-600 hover:underline mb-4">
        <ArrowLeft className="h-4 w-4 ml-2" />
        <span>العودة</span>
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center space-x-2">
            <DollarSign className="h-6 w-6" />
            <span>تفاصيل المعاملة #{currentTransaction.id}</span>
          </CardTitle>
          {getTransactionTypeBadge(currentTransaction.transaction_type)}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <p><strong>المبلغ:</strong> ${currentTransaction.amount}</p>
            <p><strong>المرسل:</strong> {currentTransaction.sender_user?.username || 'غير متاح'}</p>
            <p><strong>المستلم:</strong> {currentTransaction.receiver_user?.username || 'غير متاح'}</p>
            <p><strong>العملة:</strong> {currentTransaction.currency}</p>
            <p><strong>الحالة:</strong> {currentTransaction.status}</p>
            <p><strong>الوصف:</strong> {currentTransaction.description}</p>
            <p><strong>تاريخ المعاملة:</strong> {new Date(currentTransaction.timestamp).toLocaleString("ar-EG")}</p>
            {currentTransaction.related_order && (
              <p><strong>الطلب المرتبط:</strong> <Link to={`/orders/dashboard?orderId=${currentTransaction.related_order}`} className="text-blue-600 hover:underline">#{currentTransaction.related_order}</Link></p>
            )}
            {currentTransaction.related_dispute && (
              <p><strong>النزاع المرتبط:</strong> <Link to={`/disputes/${currentTransaction.related_dispute}`} className="text-blue-600 hover:underline">#{currentTransaction.related_dispute}</Link></p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
