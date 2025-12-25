import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleOrder, clearCurrentViewingOrder } from "../../redux/orderSlice";
import { useAddDisputeResponseMutation, useResolveDisputeMutation } from "../../redux/disputeSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  Coins, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Users,
  Shield,
  Clock,
  Eye,
  Download,
  History,
  Activity
} from "lucide-react";

export function AdminDisputeDetailPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { currentViewingOrder, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  const [responseMessage, setResponseMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [addDisputeResponse, { isLoading: isAddingResponse }] = useAddDisputeResponseMutation();
  const [resolveDispute, { isLoading: isResolving, isSuccess: isResolved, isError: resolveError }] = useResolveDisputeMutation();

  // Admin resolution state
  const [resolutionType, setResolutionType] = useState("");
  const [clientRefundAmount, setClientRefundAmount] = useState("");
  const [technicianPayoutAmount, setTechnicianPayoutAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  useEffect(() => {
    console.log('AdminDisputeDetailPage useEffect triggered, orderId:', orderId);
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
        file_url: selectedFile
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

  const handleResolveDispute = async () => {
    if (!resolutionType || !adminNotes) {
      alert("يرجى تحديد نوع القرار وملاحظات المشرف");
      return;
    }

    if (resolutionType === "SPLIT_PAYMENT" && (!clientRefundAmount || !technicianPayoutAmount)) {
      alert("يرجى إدخال المبالغ عند اختيار تقسيم الدفع");
      return;
    }

    try {
      const resolutionData = {
        resolution: resolutionType,
        admin_notes: adminNotes
      };

      if (resolutionType === "SPLIT_PAYMENT") {
        resolutionData.client_refund_amount = parseFloat(clientRefundAmount);
        resolutionData.technician_payout_amount = parseFloat(technicianPayoutAmount);
      }

      await resolveDispute({
        disputeId: currentViewingOrder.dispute.dispute_id,
        resolutionData
      }).unwrap();

      // Clear form
      setResolutionType("");
      setClientRefundAmount("");
      setTechnicianPayoutAmount("");
      setAdminNotes("");
      setShowResolutionForm(false);
      
      // Refetch the order data to update the UI with the resolution
      await dispatch(fetchSingleOrder(orderId));
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      alert("فشل في حل النزاع: " + (error.data?.detail || error.message));
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
        translatedStatus = "تم الحل";
        className = "bg-green-100 text-green-800";
        break;
      default:
        translatedStatus = status;
        break;
    }
    return <Badge className={`px-3 py-1 text-sm font-medium ${className}`}>{translatedStatus}</Badge>;
  };

  const getResolutionBadge = (resolution) => {
    if (!resolution) return null;
    
    let translatedResolution = resolution;
    let className = "bg-purple-100 text-purple-800";

    switch (resolution) {
      case "REFUND_CLIENT":
        translatedResolution = "استرداد للعميل";
        className = "bg-red-100 text-red-800";
        break;
      case "PAY_TECHNICIAN":
        translatedResolution = "دفع للفني";
        className = "bg-green-100 text-green-800";
        break;
      case "SPLIT_PAYMENT":
        translatedResolution = "تقسيم الدفع";
        className = "bg-orange-100 text-orange-800";
        break;
      default:
        translatedResolution = resolution;
        break;
    }
    return <Badge className={className}>{translatedResolution}</Badge>;
  };

  if (loading) return <div className="text-center p-8" dir="rtl">جاري تحميل تفاصيل النزاع...</div>;
  if (error) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ: {error.message || error}</div>;
  if (!currentViewingOrder || !currentViewingOrder.dispute) return <div className="text-center p-8" dir="rtl">النزاع غير موجود أو حدث خطأ.</div>;

  const dispute = currentViewingOrder.dispute;
  const order = currentViewingOrder;
  const isClient = user?.user_id === order.client_user?.user_id;
  const isTechnician = user?.user_id === order.technician_user;
  const isAdmin = user?.user_type === 'admin';
  const canRespond = (isClient || isTechnician) && (dispute.status === "OPEN" || dispute.status === "IN_REVIEW");
  const canResolve = isAdmin && (dispute.status === "OPEN" || dispute.status === "IN_REVIEW");

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/admin-disputes" className="flex items-center text-red-600 hover:text-red-700 transition-colors">
                <ArrowLeft className="h-5 w-5 ml-2" />
                <span>العودة إلى قائمة النزاعات</span>
              </Link>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">تفاصيل النزاع الإداري</h1>
              <p className="text-gray-600">الطلب #{order.order_id} • النزاع #{dispute.dispute_id}</p>
            </div>
          </div>
          
          {/* Admin Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">حالة النزاع</p>
                  <p className="text-lg font-bold text-blue-800">{getStatusBadge(dispute.status)}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">مدة النزاع</p>
                  <p className="text-lg font-bold text-green-800">
                    {Math.ceil((new Date() - new Date(dispute.created_at)) / (1000 * 60 * 60 * 24))} يوم
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">عدد الردود</p>
                  <p className="text-lg font-bold text-purple-800">
                    {dispute.responses?.length || 0}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">نوع القرار</p>
                  <p className="text-lg font-bold text-orange-800">
                    {getResolutionBadge(dispute.resolution) || <span className="text-gray-500">غير محدد</span>}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Information Card */}
            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center space-x-2">
                    <MessageSquare className="h-6 w-6" />
                    <span>معلومات النزاع</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    {getStatusBadge(dispute.status)}
                    {getResolutionBadge(dispute.resolution)}
                  </div>
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
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 ml-2" />
                      <span className="font-medium">الموقع:</span>
                    </div>
                    <p className="text-gray-80">{order.requested_location}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Coins className="h-4 w-4 ml-2" />
                      <span className="font-medium">السعر النهائي:</span>
                    </div>
                    <p className="text-gray-80">{order.final_price} ج.م</p>
                  </div>
                </div>

                {/* Service Information */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <FileText className="h-5 w-5 ml-2" />
                    معلومات الخدمة
                  </h3>
                  <div className="space-y-2 text-gray-70">
                    <p><strong>الخدمة:</strong> {order.service?.service_name}</p>
                    <p><strong>التصنيف:</strong> {order.service?.category?.category_name}</p>
                    <p><strong>الوصف:</strong> {order.service?.description}</p>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 ml-2" />
                    وصف المشكلة
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{order.problem_description}</p>
                </div>

                {/* Dispute Arguments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <User className="h-5 w-5 ml-2" />
                      حجة العميل
                    </h3>
                    <p className="text-gray-700">{dispute.client_argument || "غير متوفر"}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                      <User className="h-5 w-5 ml-2" />
                      حجة الفني
                    </h3>
                    <p className="text-gray-700">{dispute.technician_argument || "غير متوفر"}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 ml-2" />
                    ملاحظات المشرف
                  </h3>
                  <p className="text-gray-700">{dispute.admin_notes || "لا توجد ملاحظات"}</p>
                </div>

                {/* Dispute Responses */}
                {dispute.responses && dispute.responses.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-gray-800 flex items-center">
                        <MessageSquare className="h-5 w-5 ml-2" />
                        سجل المحادثات
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAuditTrail(!showAuditTrail)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <History className="h-4 w-4 ml-2" />
                        سجل الأحداث
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
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
                                  <Download className="h-4 w-4 inline ml-1" />
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

                {/* Resolution Section */}
                {dispute.resolution && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 ml-2" />
                      القرار النهائي
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong>القرار:</strong> 
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium mr-2">
                            {dispute.resolution === 'REFUND_CLIENT' ? 'استرداد للعميل' : 
                             dispute.resolution === 'PAY_TECHNICIAN' ? 'دفع للفني' : 
                             dispute.resolution === 'SPLIT_PAYMENT' ? 'تقسيم الدفع' : dispute.resolution}
                          </span>
                        </div>
                        <div>
                          <strong>تاريخ الحل:</strong> {dispute.resolution_date ? new Date(dispute.resolution_date).toLocaleString("ar-EG") : "غير متوفر"}
                        </div>
                      </div>
                      <div>
                        <strong>ملاحظات المشرف:</strong> {dispute.admin_notes || "غير متوفر"}
                      </div>
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
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Users className="h-5 w-5 ml-2" />
                  معلومات المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <User className="h-4 w-4 ml-2" />
                    العميل
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>الاسم:</strong> {dispute.initiator?.first_name} {dispute.initiator?.last_name}</p>
                    <p><strong>البريد:</strong> {dispute.initiator?.email || "غير متوفر"}</p>
                    <p><strong>النوع:</strong> {dispute.initiator?.user_type}</p>
                    <p><strong>تاريخ التسجيل:</strong> {new Date(dispute.initiator?.registration_date).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <User className="h-4 w-4 ml-2" />
                    الفني
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>الاسم:</strong> {dispute.technician_user?.first_name} {dispute.technician_user?.last_name}</p>
                    <p><strong>التخصص:</strong> {dispute.technician_user?.specialization}</p>
                    <p><strong>النوع:</strong> {dispute.technician_user?.user_type}</p>
                    <p><strong>التحقق:</strong> 
                      <Badge variant="outline" className={`text-xs ${dispute.technician_user?.verification_status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {dispute.technician_user?.verification_status || 'غير متحقق'}
                      </Badge>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions */}
            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-red-600 text-white p-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Shield className="h-5 w-5 ml-2" />
                  إجراءات المشرف
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowResolutionForm(!showResolutionForm)} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                    disabled={dispute.status === 'RESOLVED'}
                  >
                    <CheckCircle className="h-5 w-5 ml-2" />
                    {showResolutionForm ? "إلغاء" : "حل النزاع"}
                  </Button>
                  
                  <Button 
                    onClick={() => setShowResponseInput(!showResponseInput)} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                    disabled={dispute.status === 'RESOLVED'}
                  >
                    <MessageSquare className="h-5 w-5 ml-2" />
                    {showResponseInput ? "إلغاء" : "إضافة رد"}
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                    asChild
                  >
                    <Link to={`/dashboard/orders/${order.order_id}`} className="flex items-center justify-center">
                      <Eye className="h-5 w-5 ml-2" />
                      عرض تفاصيل الطلب
                    </Link>
                  </Button>
                </div>

                {/* Resolution Form */}
                {showResolutionForm && (
                  <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="space-y-2">
                      <Label htmlFor="resolutionType">نوع القرار</Label>
                      <Select value={resolutionType} onValueChange={setResolutionType}>
                        <SelectTrigger id="resolutionType" className="w-full">
                          <SelectValue placeholder="اختر نوع القرار" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REFUND_CLIENT">رد الأموال للعميل</SelectItem>
                          <SelectItem value="PAY_TECHNICIAN">دفع الأموال للفني</SelectItem>
                          <SelectItem value="SPLIT_PAYMENT">تقسيم الدفع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {resolutionType === "SPLIT_PAYMENT" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="clientRefundAmount">مبلغ رد العميل (ج.م)</Label>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <input
                              type="number"
                              id="clientRefundAmount"
                              placeholder="0.00"
                              value={clientRefundAmount}
                              onChange={(e) => setClientRefundAmount(e.target.value)}
                              className="flex-1 border border-gray-300 rounded-md p-2 text-right"
                              step="1"
                              min="0"
                              max={order.final_price || 0}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="technicianPayoutAmount">مبلغ دفع الفني (ج.م)</Label>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <input
                              type="number"
                              id="technicianPayoutAmount"
                              placeholder="0.00"
                              value={technicianPayoutAmount}
                              onChange={(e) => setTechnicianPayoutAmount(e.target.value)}
                              className="flex-1 border border-gray-300 rounded-md p-2 text-right"
                              step="1"
                              min="0"
                              max={order.final_price || 0}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="adminNotes">ملاحظات المشرف</Label>
                      <Textarea
                        id="adminNotes"
                        placeholder="اكتب قرارك وملاحظاتك هنا..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleResolveDispute} 
                        disabled={isResolving || !resolutionType || !adminNotes}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isResolving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>جاري الحل...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>حل النزاع</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Response Form */}
                {showResponseInput && (
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
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
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
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
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleRespondToDispute} 
                        disabled={isAddingResponse || (!responseMessage.trim() && !selectedFile)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isAddingResponse ? "جاري الإرسال..." : "إرسال الرد"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dispute Statistics */}
            <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-800 text-white p-4">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Activity className="h-5 w-5 ml-2" />
                  إحصائيات النزاع
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <span className="font-medium">{new Date(dispute.created_at).toLocaleString("ar-EG")}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">مدة النزاع:</span>
                  <span className="font-medium text-blue-600">
                    {Math.ceil((new Date() - new Date(dispute.created_at)) / (1000 * 60 * 60 * 24))} يوم
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">عدد الردود:</span>
                  <span className="font-medium text-purple-600">{dispute.responses?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">الحالة:</span>
                  <span className="font-medium">{dispute.status}</span>
                </div>
                {dispute.resolution_date && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">تاريخ الحل:</span>
                    <span className="font-medium text-green-600">{new Date(dispute.resolution_date).toLocaleString("ar-EG")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
