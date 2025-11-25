import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bug, CheckCircle, Clock, XCircle, Users } from "lucide-react";
import api from "../../utils/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

export function AdminReports() {
  const { token } = useSelector((state) => state.auth);
  const [reportsSummary, setReportsSummary] = useState(null);
  const [issueReports, setIssueReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // Fetch summary data (corrected endpoint)
        const summaryResponse = await api.get("/dashboard/admin/reports-summary/", { headers });
        setReportsSummary(summaryResponse);

        // Fetch recent issue reports
        const issueReportsResponse = await api.get("/issue-reports/", { headers });
        setIssueReports(issueReportsResponse.results || []); // Assuming paginated results
      } catch (err) {
        setError("فشل في جلب بيانات التقارير. الرجاء المحاولة لاحقًا.");
        console.error("Failed to fetch reports data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, [token]);

  const getIssueStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive" className="bg-red-100 text-red-800 flex items-center"><Bug className="h-3 w-3 mr-1" /> مفتوح</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center"><Clock className="h-3 w-3 mr-1" /> قيد المعالجة</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> تم الحل</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 flex items-center"><XCircle className="h-3 w-3 mr-1" /> مغلق</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <BarChart className="h-7 w-7" />
          <span>التقارير والتحليلات</span>
        </h1>
        <p className="text-muted-foreground">عرض أداء المنصة والتحليلات</p>
      </div>

      {isLoading ? (
        <div className="text-center p-4">جاري تحميل التقارير...</div>
      ) : error ? (
        <div className="text-center p-4 text-red-500">{error}</div>
      ) : (
        <>
          {reportsSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                  <span className="h-4 w-4 text-muted-foreground">💰</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportsSummary.total_revenue || "0.00"} ر.س</div>
                  <p className="text-xs text-muted-foreground">{reportsSummary.revenue_change_percentage || "+0%"} عن الشهر الماضي</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الخدمات المكتملة</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportsSummary.completed_services || 0}</div>
                  <p className="text-xs text-muted-foreground">{reportsSummary.completed_services_change_percentage || "+0%"} عن الشهر الماضي</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المستخدمون الجدد</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportsSummary.new_users || 0}</div>
                  <p className="text-xs text-muted-foreground">{reportsSummary.new_users_change_percentage || "+0%"} عن الشهر الماضي</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>تقارير المشاكل الحديثة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>معرف المشكلة</TableHead>
                    <TableHead>الموضوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issueReports.length > 0 ? (
                    issueReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.id}</TableCell>
                        <TableCell>{report.subject}</TableCell>
                        <TableCell>{getIssueStatusBadge(report.status)}</TableCell>
                        <TableCell>{formatDate(report.created_at)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        لا توجد تقارير مشاكل حديثة.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
