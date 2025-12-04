import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getDisputeDetail, respondToDispute, clearCurrentDispute } from "../redux/disputeSlice";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ArrowLeft, MessageSquare } from "lucide-react";

export function DisputeDetailPage() {
  const { disputeId } = useParams();
  const dispatch = useDispatch();
  const { currentDispute, loading, error, successMessage } = useSelector((state) => state.disputes);
  const { user } = useSelector((state) => state.auth); // Assuming user object has id and user_type

  const [responseMessage, setResponseMessage] = useState("");
  const [showResponseInput, setShowResponseInput] = useState(false);

  useEffect(() => {
    if (disputeId) {
      dispatch(getDisputeDetail(disputeId));
    }
    return () => {
      dispatch(clearCurrentDispute()); // Clear dispute details on unmount
    };
  }, [disputeId, dispatch]);

  const handleRespondToDispute = async () => {
    if (responseMessage.trim() && currentDispute) {
      await dispatch(respondToDispute({
        disputeId: currentDispute.id,
        responseData: { message: responseMessage },
      }));
      setResponseMessage("");
      setShowResponseInput(false);
      // Re-fetch dispute to show updated conversation
      dispatch(getDisputeDetail(disputeId));
    }
  };

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

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل تفاصيل النزاع...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error}</div>;
  if (!currentDispute) return <div className="text-center p-8" dir="rtl">النزاع غير موجود أو حدث خطأ.</div>;

  const isClient = user?.user_id === currentDispute.order.client; // Assuming client is stored as client ID
  const isTechnician = user?.user_id === currentDispute.order.assigned_technician; // Assuming technician is stored as ID

  // Determine if the current user can respond
  const canRespond = (isClient || isTechnician) && (currentDispute.status === "OPEN" || currentDispute.status === "IN_REVIEW");

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <Link to={-1} className="flex items-center text-blue-600 hover:underline mb-4">
        <ArrowLeft className="h-4 w-4 ml-2" />
        <span>العودة</span>
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span>تفاصيل النزاع #{currentDispute.id}</span>
          </CardTitle>
          {getStatusBadge(currentDispute.status)}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <p><strong>الطلب:</strong> <Link to={`/order/${currentDispute.order.id}`} className="text-blue-600 hover:underline">#{currentDispute.order.id}</Link></p>
            <p><strong>العميل:</strong> {currentDispute.order.client_user?.username || 'غير متاح'}</p>
            <p><strong>الفني:</strong> {currentDispute.order.assigned_technician_user?.username || 'غير متاح'}</p>
            <p><strong>السبب:</strong> {currentDispute.reason}</p>
            <p><strong>الوصف:</strong> {currentDispute.description}</p>
            <p><strong>تاريخ الإنشاء:</strong> {new Date(currentDispute.created_at).toLocaleString("ar-EG")}</p>

            {currentDispute.resolution && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-xl font-semibold mb-2">قرار النزاع</h3>
                <p><strong>القرار:</strong> {currentDispute.resolution.decision}</p>
                <p><strong>تم الحل بواسطة:</strong> {currentDispute.resolution.resolved_by?.username || 'غير متاح'}</p>
                <p><strong>المبلغ للعميل:</strong> ${currentDispute.resolution.amount_to_client || 0}</p>
                <p><strong>المبلغ للفني:</strong> ${currentDispute.resolution.amount_to_technician || 0}</p>
                <p><strong>تاريخ الحل:</strong> {new Date(currentDispute.resolution.resolved_at).toLocaleString("ar-EG")}</p>
              </div>
            )}

            {currentDispute.responses && currentDispute.responses.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-xl font-semibold mb-2">المحادثة</h3>
                <div className="space-y-3">
                  {currentDispute.responses.map((response, index) => (
                    <div key={index} className={`p-3 rounded-lg ${response.sender_id === user?.user_id ? 'bg-blue-50 text-blue-800 self-end' : 'bg-gray-50 text-gray-800 self-start'}`}>
                      <p className="font-semibold">{response.sender_username || 'مستخدم'}:</p>
                      <p>{response.message}</p>
                      <p className="text-xs text-gray-500 text-left mt-1">{new Date(response.created_at).toLocaleString("ar-EG")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canRespond && (
              <div className="border-t pt-4 mt-4">
                <Button onClick={() => setShowResponseInput(!showResponseInput)} className="mb-4">
                  {showResponseInput ? "إلغاء الرد" : "الرد على النزاع"}
                </Button>
                {showResponseInput && (
                  <div className="grid gap-2">
                    <Label htmlFor="responseMessage">رسالتك</Label>
                    <Textarea
                      id="responseMessage"
                      placeholder="اكتب ردك هنا..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                    />
                    <Button onClick={handleRespondToDispute} className="mt-2">
                      إرسال الرد
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
