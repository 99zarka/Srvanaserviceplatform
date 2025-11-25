import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileText, Eye } from "lucide-react";
import api from "../../utils/api"; // Import the API utility

export function ClientRequests() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientRequests = async () => {
      if (!token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch all client requests
        const data = await api.get("/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        }); // Adjust endpoint and query params as per your backend API
        setRequests(data.results.map(req => ({
          id: req.id,
          service: req.service_name, // Assuming service_name is available
          worker: req.worker_name, // Assuming worker_name is available
          status: req.status,
          date: new Date(req.created_at).toLocaleDateString("ar-EG"), // Format date
          amount: `$${req.total_price || 0}`,
          detailsLink: `/client-dashboard/requests/${req.id}`, // Placeholder for detail page
        })));
      } catch (err) {
        setError(err.message || "Failed to fetch client requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientRequests();
  }, [token]);


  const getStatusBadge = (status) => {
    const variants = {
      "pending": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "accepted": { variant: "default", className: "bg-blue-100 text-blue-800" },
      "completed": { variant: "default", className: "bg-green-100 text-green-800" },
      "cancelled": { variant: "default", className: "bg-red-100 text-red-800" },
    };
    const config = variants[status] || { variant: "default", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  if (loading) return <div className="text-center p-8">جاري تحميل الطلبات...</div>;
  if (error) return <div className="text-center p-8 text-red-500">خطأ: {error}</div>;

  if (requests.length === 0) {
    return <div className="text-center p-8">لا توجد طلبات خدمة حاليًا.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <FileText className="h-7 w-7" />
          <span>طلبات خدمتي</span>
        </h1>
        <p className="text-muted-foreground">تتبع وإدارة جميع طلبات خدمتك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الخدمة</TableHead>
                <TableHead>العامل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.service}</TableCell>
                  <TableCell>{request.worker || "N/A"}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{request.amount}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild className="flex items-center space-x-2">
                      <Link to={request.detailsLink}>
                        <Eye className="h-4 w-4" />
                        <span>عرض التفاصيل</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
