import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Wrench
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingVerifications, approveVerification, rejectVerification } from "../../redux/adminSlice";
import BASE_URL from "../../config/api";

export function AdminVerifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const dispatch = useDispatch();
  const { pendingVerifications, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getPendingVerifications());
  }, [dispatch]);

  const handleApprove = async (verificationId) => {
    try {
      const result = await dispatch(approveVerification(verificationId));
      if (approveVerification.fulfilled.match(result)) {
        alert("تم قبول طلب التحقق بنجاح!");
        dispatch(getPendingVerifications()); // Refresh the list
      } else {
        throw new Error("فشل في قبول الطلب");
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert("حدث خطأ أثناء قبول الطلب");
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectionReason.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }

    try {
      const result = await dispatch(rejectVerification({
        verificationId: selectedVerification.id,
        reason: rejectionReason
      }));

      if (rejectVerification.fulfilled.match(result)) {
        alert("تم رفض طلب التحقق");
        setShowRejectModal(false);
        setSelectedVerification(null);
        setRejectionReason("");
        dispatch(getPendingVerifications()); // Refresh the list
      } else {
        throw new Error("فشل في رفض الطلب");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      alert("حدث خطأ أثناء رفض الطلب");
    }
  };

  const openRejectModal = (verification) => {
    setSelectedVerification(verification);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'قيد المراجعة';
      default:
        return 'غير محدد';
    }
  };

  // Filter verifications based on search term and status
  const filteredVerifications = pendingVerifications.filter(verification => {
    const matchesSearch = searchTerm === "" ||
      verification.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || verification.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">مراجعة طلبات التحقق</h1>
        <p className="text-muted-foreground">
          مراجعة وإدارة طلبات التحقق من هوية الفنيين
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            تصفية وبحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو التخصص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="approved">مقبول</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <div className="grid gap-4">
        {filteredVerifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات تحقق حالياً</p>
            </CardContent>
          </Card>
        ) : (
          filteredVerifications.map((verification) => (
            <Card key={verification.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {verification.user?.first_name} {verification.user?.last_name}
                      </CardTitle>
                      <CardDescription>
                        {verification.user?.email}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(verification.verification_status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(verification.verification_status)}
                        {getStatusText(verification.verification_status)}
                      </div>
                    </Badge>

                    {verification.verification_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRejectModal(verification)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          رفض
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(verification.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          قبول
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      المعلومات الشخصية
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">التخصص:</span>
                        <span>{verification.specialization || "غير محدد"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">سنوات الخبرة:</span>
                        <span>{verification.experience_years || "غير محدد"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">العنوان:</span>
                        <span className="truncate">{verification.address || "غير محدد"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      تفاصيل الخدمات
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">السعر/ساعة:</span>
                        <span>{verification.hourly_rate ? `${verification.hourly_rate} ريال` : "غير محدد"}</span>
                      </div>

                      <div>
                        <span className="font-medium">المهارات:</span>
                        <p className="text-muted-foreground mt-1">
                          {verification.skills || "غير محدد"}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">وصف الخدمات:</span>
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                          {verification.description || "غير محدد"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents and Timestamps */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      المستندات والتوقيت
                    </h4>

                    <div className="space-y-2 text-sm">
                      {verification.id_document && (
                        <div>
                          <span className="font-medium">وثيقة الهوية:</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={() => window.open(verification.id_document, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            عرض
                          </Button>
                        </div>
                      )}

                      {verification.certificate_document && (
                        <div>
                          <span className="font-medium">الشهادات:</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={() => window.open(verification.certificate_document, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            عرض
                          </Button>
                        </div>
                      )}

                      {verification.portfolio_document && (
                        <div>
                          <span className="font-medium">معرض الأعمال:</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={() => window.open(verification.portfolio_document, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            عرض
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">تاريخ التقديم:</span>
                        <span>
                          {verification.submitted_at
                            ? new Date(verification.submitted_at).toLocaleDateString('ar-EG')
                            : "غير محدد"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {verification.verification_status === 'rejected' && verification.rejection_reason && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>سبب الرفض:</strong> {verification.rejection_reason}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                رفض طلب التحقق
              </CardTitle>
              <CardDescription>
                {selectedVerification.user?.first_name} {selectedVerification.user?.last_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="rejection-reason" className="block text-sm font-medium mb-2">
                  سبب الرفض *
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اذكر سبب رفض طلب التحقق..."
                  className="w-full p-3 border border-input rounded-md resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedVerification(null);
                    setRejectionReason("");
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={!rejectionReason.trim()}
                >
                  تأكيد الرفض
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
