import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleOrder, clearCurrentViewingOrder } from "../redux/orderSlice";
import { useAddDisputeResponseMutation } from "../redux/disputeSlice";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ArrowLeft, MessageSquare, User, Calendar, MapPin, FileText, Coins } from "lucide-react";

export function DisputeDetailPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { currentViewingOrder, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [responseMessage, setResponseMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [addDisputeResponse, { isLoading: isAddingResponse }] = useAddDisputeResponseMutation();

  useEffect(() => {
    console.log('DisputeDetailPage useEffect triggered, orderId:', orderId);
    if (orderId) {
      console.log('Dispatching fetchSingleOrder with orderId:', orderId);
      dispatch(fetchSingleOrder(orderId));
    }

    return () => {
      console.log('Cleaning up - dispatching clearCurrentViewingOrder');
      dispatch(clearCurrentViewingOrder());
    };
  }, [dispatch, orderId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview("");
  };

  const handleRespondToDispute = async () => {
    if ((!responseMessage.trim() && !selectedFile) || !currentViewingOrder?.dispute) {
      return;
    }

    try {
      await addDisputeResponse({
        disputeId: currentViewingOrder.dispute.dispute_id,
        message: responseMessage,
        file_url: selectedFile // This will be a File object when selected, which the API will handle with FormData
      }).unwrap();
      
      // Clear form
      setResponseMessage("");
      setSelectedFile(null);
      setFilePreview("");
      setShowResponseInput(false);
      
      // Refetch the order data to update the UI with the new response
      await dispatch(fetchSingleOrder(orderId));
    } catch (error) {
      console.error("Failed to add response:", error);
    }
  };

  const getStatusBadge = (status) => {
    let translatedStatus = status;
    let className = "bg-gray-100 text-gray-800";

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
    return <Badge className={`px-3 py-1 text-sm font-medium ${className}`}>{translatedStatus}</Badge>;
  };

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل تفاصيل النزاع...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error.message || error}</div>;
  if (!currentViewingOrder || !currentViewingOrder.dispute) return <div className="text-center p-8" dir="rtl">النزاع غير موجود أو حدث خطأ.</div>;

  const dispute = currentViewingOrder.dispute;
  const order = currentViewingOrder;
  const isClient = user?.user_id === order.client_user?.user_id;
  const isTechnician = user?.user_id === order.technician_user;
  const canRespond = (isClient || isTechnician) && (dispute.status === "OPEN" || dispute.status === "IN_REVIEW");

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <ArrowLeft className="h-5 w-5 ml-2" />
                <span>العودة إلى لوحة التحكم</span>
              </Link>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">تفاصيل النزاع</h1>
              <p className="text-gray-600">الطلب #{order.order_id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Information Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6" />
                    <span>النزاع #{dispute.dispute_id}</span>
                  </CardTitle>
                  {getStatusBadge(dispute.status)}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 ml-2" />
                      <span className="font-medium">نوع الطلب:</span>
                    </div>
                    <p className="text-gray-800">{order.order_type}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 ml-2" />
                      <span className="font-medium">تاريخ الإنشاء:</span>
                    </div>
                    <p className="text-gray-800">{new Date(order.creation_timestamp).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-60">
                      <MapPin className="h-4 w-4 ml-2" />
                      <span className="font-medium">الموقع:</span>
                    </div>
                    <p className="text-gray-800">{order.requested_location}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Coins className="h-4 w-4 ml-2" />
                      <span className="font-medium">السعر النهائي:</span>
                    </div>
                    <p className="text-gray-80">${order.final_price}</p>
                  </div>
                </div>

                {/* Service Information */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 ml-2" />
                    معلومات الخدمة
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>الخدمة:</strong> {order.service?.service_name}</p>
                    <p><strong>التصنيف:</strong> {order.service?.category?.category_name}</p>
                    <p><strong>الوصف:</strong> {order.service?.description}</p>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">وصف المشكلة</h3>
                  <p className="text-gray-700 leading-relaxed">{order.problem_description}</p>
                </div>

                {/* Dispute Details */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">تفاصيل النزاع</h3>
                  <div className="space-y-3 text-gray-70">
                    <div>
                      <strong>المُبادر:</strong> {dispute.initiator?.first_name} {dispute.initiator?.last_name}
                    </div>
                    <div>
                      <strong>حجة العميل:</strong> {dispute.client_argument || "غير متوفر"}
                    </div>
                    <div>
                      <strong>حجة الفني:</strong> {dispute.technician_argument || "غير متوفر"}
                    </div>
                    <div>
                      <strong>ملاحظات المشرف:</strong> {dispute.admin_notes || "غير متوفر"}
                    </div>
                    <div>
                      <strong>تاريخ الإنشاء:</strong> {new Date(dispute.created_at).toLocaleString("ar-EG")}
                    </div>
                  </div>

                  {/* Dispute Responses */}
                  {dispute.responses && dispute.responses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-yellow-300">
                      <h4 className="text-md font-semibold text-yellow-800 mb-3">المحادثات</h4>
                      <div className="space-y-3">
                        {dispute.responses.map((response, index) => (
                          <div key={index} className={`p-3 rounded-lg ${response.sender?.user_id === user?.user_id ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-white text-gray-700 border border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-sm">
                                {response.sender?.first_name} {response.sender?.last_name} ({response.response_type})
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(response.created_at).toLocaleString("ar-EG")}
                              </span>
                            </div>
                            <p className="text-sm">{response.message}</p>
                            
                            {/* Display attached file */}
                            {response.file_url && (
                              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <FileText className="h-4 w-4" />
                                  <span>الملف المرفق:</span>
                                </div>
                                {response.file_url.endsWith('.jpg') || response.file_url.endsWith('.jpeg') || response.file_url.endsWith('.png') || response.file_url.endsWith('.gif') ? (
                                  <a href={response.file_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                                    <img
                                      src={response.file_url}
                                      alt="ملف مرفق"
                                      className="max-h-32 rounded border hover:opacity-90 transition-opacity"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={response.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-1 text-blue-600 hover:text-blue-800 underline text-sm"
                                  >
                                    تنزيل الملف
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resolution (if exists) */}
                {dispute.resolution && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-20">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">الحل</h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>القرار:</strong> {dispute.resolution.decision || "غير متوفر"}</p>
                      <p><strong>المبلغ للعميل:</strong> ${dispute.resolution.amount_to_client || 0}</p>
                      <p><strong>المبلغ للفني:</strong> ${dispute.resolution.amount_to_technician || 0}</p>
                      <p><strong>تاريخ الحل:</strong> {dispute.resolution.resolution_date ? new Date(dispute.resolution.resolution_date).toLocaleString("ar-EG") : "غير متوفر"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-800 text-white p-4">
                <CardTitle className="text-lg font-semibold">المستخدمين</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">العميل</h4>
                  <p className="text-sm text-gray-700">{order.client_user?.first_name} {order.client_user?.last_name}</p>
                  <p className="text-xs text-gray-500">{order.client_user?.user_type}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">الفني</h4>
                  <p className="text-sm text-gray-700">{order.associated_offer?.technician_user?.first_name} {order.associated_offer?.technician_user?.last_name}</p>
                  <p className="text-xs text-gray-500">{order.associated_offer?.technician_user?.user_type}</p>
                </div>
              </CardContent>
            </Card>

            {/* Response Section */}
            {canRespond && (
              <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
                <CardHeader className="bg-purple-600 text-white p-4">
                  <CardTitle className="text-lg font-semibold">الرد على النزاع</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <Button 
                    onClick={() => setShowResponseInput(!showResponseInput)} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {showResponseInput ? "إلغاء" : "إضافة رد"}
                  </Button>
                  {showResponseInput && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="responseMessage">الرسالة</Label>
                        <Textarea
                          id="responseMessage"
                          placeholder="اكتب ردك هنا..."
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      
                      {/* File Upload Section */}
                      <div className="space-y-2">
                        <Label>إرفاق ملف</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="flex-1 text-sm text-gray-500
                              file:mr-2 file:py-1 file:px-2
                              file:rounded-md file:border-0
                              file:text-sm file:font-medium
                              file:bg-violet-50 file:text-violet-700
                              file:hover:bg-violet-100
                              cursor-pointer"
                          />
                        </div>
                        
                        {/* File Preview */}
                        {filePreview && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FileText className="h-4 w-4" />
                                <span>الملف المرفق</span>
                              </div>
                              <Button
                                type="button"
                                onClick={removeFile}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                إزالة
                              </Button>
                            </div>
                            {selectedFile?.type?.startsWith('image/') ? (
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="mt-2 max-h-32 w-auto rounded border"
                              />
                            ) : (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600">
                                {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(2)} KB)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={handleRespondToDispute} 
                        disabled={isAddingResponse || (!responseMessage.trim() && !selectedFile)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isAddingResponse ? "جاري الإرسال..." : "إرسال الرد"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
