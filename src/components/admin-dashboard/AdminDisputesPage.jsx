import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from '../ui/label';
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  useGetDisputesQuery,
  useResolveDisputeMutation 
} from "../../redux/disputeSlice";
import { 
  Flag, 
  Eye, 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  FileText, 
  Users,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

export function AdminDisputesPage() {
  const { token } = useSelector((state) => state.auth);

  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // RTK Query for fetching disputes
  const { 
    data: disputesData, 
    isLoading, 
    isFetching,
    error,
    refetch 
  } = useGetDisputesQuery({ 
    page, 
    page_size: pageSize,
    search: searchTerm,
    status: statusFilter === "ALL" ? undefined : statusFilter
  }, { skip: !token });

  // State for quick resolution modal
  const [showQuickResolve, setShowQuickResolve] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionType, setResolutionType] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [resolveDispute, { isLoading: isResolving }] = useResolveDisputeMutation();

  // Handle pagination
  useEffect(() => {
    if (disputesData && disputesData.count !== undefined) {
      setTotalCount(disputesData.count);
    }
  }, [disputesData]);

  // Filter disputes based on search term and status
  const disputes = disputesData?.results || [];
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

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
    return <Badge className={className}>{translatedStatus}</Badge>;
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

  const handleQuickResolve = async () => {
    if (!selectedDispute || !resolutionType || !adminNotes) {
      alert("يرجى اختيار نوع القرار وإضافة ملاحظات المشرف");
      return;
    }

    try {
      await resolveDispute({
        disputeId: selectedDispute.dispute_id,
        resolutionData: {
          resolution: resolutionType,
          admin_notes: adminNotes
        }
      }).unwrap();

      setShowQuickResolve(false);
      setSelectedDispute(null);
      setResolutionType("");
      setAdminNotes("");
      refetch(); // Refresh the list
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      alert("فشل في حل النزاع: " + (error.data?.detail || error.message));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل النزاعات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
        <Card className="max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">خطأ في التحميل</h3>
              <p className="text-red-500">{error?.message || "فشل في جلب بيانات النزاعات"}</p>
              <Button 
                onClick={() => refetch()} 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-600 rounded-xl">
              <Flag className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-red-700">إدارة النزاعات</h1>
              <p className="text-gray-600 text-lg mt-1">مراجعة وإدارة جميع النزاعات على المنصة</p>
            </div>
          </div>
          <div className="text-start">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">إجمالي النزاعات</div>
              <div className="text-2xl font-bold text-red-600">{totalCount}</div>
              
            </div>
          </div>
        </div>
        <div className="h-1 w-48 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
      </div>

      {/* Filters and Search Section */}
      <Card className="mb-6 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="بحث بالرقم الطلب، اسم العميل، أو رقم النزاع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">جميع الحالات</SelectItem>
                  <SelectItem value="OPEN">مفتوح</SelectItem>
                  <SelectItem value="IN_REVIEW">قيد المراجعة</SelectItem>
                  <SelectItem value="RESOLVED">تم الحل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size Filter */}
            <div>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(parseInt(value));
                setPage(1);
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="عدد العناصر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 عناصر</SelectItem>
                  <SelectItem value="10">10 عناصر</SelectItem>
                  <SelectItem value="20">20 عناصر</SelectItem>
                  <SelectItem value="50">50 عنصر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>نتائج البحث: {disputes.length} من {totalCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${isFetching ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setPage(1);
                }} 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">قائمة النزاعات</CardTitle>
            <div className="text-sm opacity-90">
              {isFetching && <span className="animate-pulse">جارٍ التحديث...</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {disputes.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-gray-200 bg-gray-50">
                      <TableHead className="text-right font-bold text-gray-700">رقم النزاع</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">رقم الطلب</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">العميل</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">الفني</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">الخدمة</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">الحالة</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">القرار</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => {
                      const order = dispute.order;
                      const client = dispute.client_user || dispute.initiator;
                      const technician = dispute.technician_user;
                      const service = order?.service;
                      
                      return (
                        <TableRow 
                          key={dispute.dispute_id} 
                          className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <TableCell className="font-medium text-red-600">
                            <Link 
                              to={`/dashboard/disputes/${order}`}
                              className="hover:text-red-700 hover:underline"
                            >
                              #{dispute.dispute_id}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link 
                              to={`/dashboard/orders-offers/view/${order}`}
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              #{order}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <Link 
                                to={`/dashboard/profile/${client?.user_id || client?.id}`}
                                className="font-medium hover:text-blue-600 hover:underline"
                              >
                                {client?.first_name} {client?.last_name}
                              </Link>
                              <span className="text-xs text-gray-500">
                                {client?.user_type === 'client' ? 'عميل' : 
                                 client?.user_type === 'technician' ? 'فني' : 
                                 client?.user_type === 'admin' ? 'مشرف' : 
                                 client?.user_type || 'غير محدد'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {technician ? (
                              <div className="flex flex-col">
                                <Link 
                                  to={`/dashboard/profile/${technician.user_id || technician.id}`}
                                  className="font-medium hover:text-blue-600 hover:underline"
                                >
                                  {technician.first_name} {technician.last_name}
                                </Link>
                                <span className="text-xs text-gray-500">
                                  {technician.user_type === 'client' ? 'عميل' : 
                                   technician.user_type === 'technician' ? 'فني' : 
                                   technician.user_type === 'admin' ? 'مشرف' : 
                                   technician.user_type || 'غير محدد'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">غير متوفر</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{service?.arabic_name || service?.service_name}</span>
                              <span className="text-xs text-gray-500">{service?.category?.category_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(dispute.status)}
                          </TableCell>
                          <TableCell>
                            {getResolutionBadge(dispute.resolution)}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            <div className="flex flex-col">
                              <span>{new Date(dispute.created_at).toLocaleDateString("ar-EG")}</span>
                              <span className="text-xs text-gray-400">{new Date(dispute.created_at).toLocaleTimeString("ar-EG")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                asChild 
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Link to={`/dashboard/disputes/${order}`} className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>عرض</span>
                                </Link>
                              </Button>
                              {dispute.status !== 'RESOLVED' && (
                                <Button 
                                  size="sm" 
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => {
                                    setSelectedDispute(dispute);
                                    setShowQuickResolve(true);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 ml-1" />
                                  <span>حل سريع</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between p-6 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    عرض {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} من {totalCount} نزاع
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setPage(1)}
                    disabled={!hasPrevPage || isLoading}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    الأول
                  </Button>
                  <Button
                    onClick={() => setPage(page - 1)}
                    disabled={!hasPrevPage || isLoading}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    الصفحة {page} من {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={!hasNextPage || isLoading}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </Button>
                  <Button
                    onClick={() => setPage(totalPages)}
                    disabled={!hasNextPage || isLoading}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    الأخير
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="p-6 bg-gray-50 rounded-full inline-block mb-4">
                <Flag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد نزاعات</h3>
              <p className="text-gray-500 mb-6">لا توجد نزاعات حاليًا في النظام.</p>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث البيانات
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Resolve Modal */}
      {showQuickResolve && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-red-600 text-white p-4">
              <CardTitle className="text-lg font-bold">حل النزاع بسرعة</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="adminNotes">ملاحظات المشرف</Label>
                <Input
                  id="adminNotes"
                  placeholder="اكتب قرارك وملاحظاتك هنا..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowQuickResolve(false);
                    setSelectedDispute(null);
                    setResolutionType("");
                    setAdminNotes("");
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleQuickResolve} 
                  disabled={isResolving || !resolutionType || !adminNotes}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
