import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Users, UserPlus, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchUsersPaginated } from "../../redux/authSlice";

export function AdminUsers() {
  const dispatch = useDispatch();
  const { users, isLoading, currentPage, totalPages, totalUsers } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsersPaginated({ page, pageSize: 10 })); // Assuming page size of 10 for admin view
  }, [dispatch, page]);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const getStatusBadge = (status) => {
    const variants = {
      "active": { variant: "default", className: "bg-green-100 text-green-800" },
      "pending": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "inactive": { variant: "default", className: "bg-gray-100 text-gray-800" },
      "نشط": { variant: "default", className: "bg-green-100 text-green-800" }, // For Arabic
      "معلق": { variant: "default", className: "bg-yellow-100 text-yellow-800" }, // For Arabic
      "غير نشط": { variant: "default", className: "bg-gray-100 text-gray-800" }, // For Arabic
    };
    let translatedStatus = status;
    switch (status) {
      case "active":
        translatedStatus = "نشط";
        break;
      case "pending":
        translatedStatus = "معلق";
        break;
      case "inactive":
        translatedStatus = "غير نشط";
        break;
    }
    const config = variants[status] || variants["pending"];
    return <Badge variant={config.variant} className={config.className}>{translatedStatus}</Badge>;
  };

  const getTypeBadge = (type) => {
    // Backend returns 'technician', 'client', 'admin'
    const typeMap = {
      "technician": "فني",
      "client": "عميل",
      "admin": "مدير"
    };
    const displayType = typeMap[type] || "عميل";
    return (
      <Badge variant="outline" className={type === "technician" ? "border-primary text-primary" : type === "admin" ? "border-destructive text-destructive" : "border-secondary text-secondary"}>
        {displayType}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center space-x-2">
            <Users className="h-7 w-7" />
            <span>إدارة المستخدمين</span>
          </h1>
          <p className="text-muted-foreground">إدارة جميع مستخدمي المنصة</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-accent mb-4"></div>
              <p className="text-neutral-600 text-lg">جاري تحميل المستخدمين...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>تاريخ الانضمام</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <Link
                            to={`/profile/${user.user_id}`}
                            className="text-secondary hover:underline"
                          >
                            {`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "غير متاح"}
                          </Link>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getTypeBadge(user.user_type)}</TableCell>
                        <TableCell>{user.phone_number || "غير متاح"}</TableCell>
                        <TableCell>{formatDate(user.registration_date)}</TableCell>
                        <TableCell>
                          <Link to={`/profile/${user.user_id}`}>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                              <Eye className="h-4 w-4" />
                              <span>عرض</span>
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        لا يوجد مستخدمون لعرضهم.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  عرض {users.length} من {totalUsers} مستخدم
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page === 1}>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    <span>السابق</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages}>
                    <span>التالي</span>
                    <ChevronLeft className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
