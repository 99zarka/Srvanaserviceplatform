import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Users, UserPlus, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchPublicUsersPaginated } from "../../redux/authSlice";

export function AdminUsers() {
  const dispatch = useDispatch();
  const { users, isLoading, currentPage, totalPages, totalUsers } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPublicUsersPaginated({ page, pageSize: 10 })); // Assuming page size of 10 for admin view
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
    const config = variants[status] || variants["pending"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    // Assuming backend returns 'client' or 'worker'
    const displayType = type === "worker" ? "عامل" : "عميل";
    return (
      <Badge variant="outline" className={type === "worker" ? "border-primary text-primary" : "border-secondary text-secondary"}>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center space-x-2">
            <Users className="h-7 w-7" />
            <span>إدارة المستخدمين</span>
          </h1>
          <p className="text-muted-foreground">إدارة جميع مستخدمي المنصة</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>إضافة مستخدم جديد</span>
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center p-4">جاري تحميل المستخدمين...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الانضمام</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || user.username || "N/A"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getTypeBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.is_active ? "active" : "inactive")}</TableCell>
                        <TableCell>{formatDate(user.date_joined)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                            <Edit className="h-4 w-4" />
                            <span>تعديل</span>
                          </Button>
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
              <div className="flex justify-end items-center space-x-2 pt-4">
                <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page === 1}>
                  <ChevronRight className="h-4 w-4 mr-2 rtl:rotate-180" />
                  <span>السابق</span>
                </Button>
                <span className="text-sm text-muted-foreground">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages}>
                  <span>التالي</span>
                  <ChevronLeft className="h-4 w-4 ml-2 rtl:rotate-180" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
