import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Briefcase, PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../utils/api";

export function AdminServices() {
  const { token } = useSelector((state) => state.auth);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Define page size for services

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.get(`/services/?page=${currentPage}&page_size=${pageSize}`, { headers });
        setServices(response.results);
        setTotalPages(Math.ceil(response.count / pageSize));
      } catch (err) {
        setError("فشل في جلب الخدمات. الرجاء المحاولة لاحقًا.");
        console.error("Failed to fetch services:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [token, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const getStatusBadge = (status) => {
    const variants = {
      "active": { variant: "default", className: "bg-green-100 text-green-800" },
      "inactive": { variant: "default", className: "bg-gray-100 text-gray-800" },
    };
    const config = variants[status] || variants["inactive"];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center space-x-2">
            <Briefcase className="h-7 w-7" />
            <span>إدارة الخدمات</span>
          </h1>
          <p className="text-muted-foreground">إدارة فئات الخدمات والقوائم</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2">
          <PlusCircle className="h-5 w-5" />
          <span>إضافة خدمة جديدة</span>
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center p-4">جاري تحميل الخدمات...</div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length > 0 ? (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.description.substring(0, 70)}...</TableCell>
                        <TableCell>{getStatusBadge(service.is_active ? "active" : "inactive")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                            <Edit className="h-4 w-4" />
                            <span>تعديل</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                            <span>حذف</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        لا توجد خدمات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end items-center space-x-2 pt-4">
                <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                  <ChevronRight className="h-4 w-4 mr-2 rtl:rotate-180" />
                  <span>السابق</span>
                </Button>
                <span className="text-sm text-muted-foreground">
                  صفحة {currentPage} من {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
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
