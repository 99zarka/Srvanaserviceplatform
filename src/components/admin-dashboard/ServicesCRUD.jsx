import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useGetServicesQuery, useCreateServiceMutation, useUpdateServiceMutation, useDeleteServiceMutation, useGetServiceCategoriesQuery } from "../../services/api";
import { useSelector } from "react-redux";
import { Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";

export function ServicesCRUD() {
  const { token } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: services = {}, isLoading: servicesLoading, refetch: refetchServices } = useGetServicesQuery({ page, page_size: pageSize });
  const { data: categories = {}, isLoading: categoriesLoading } = useGetServiceCategoriesQuery({});
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    service_name: "",
    arabic_name: "",
    description: "",
    service_type: "",
    base_inspection_fee: "",
    estimated_price_range_min: "",
    estimated_price_range_max: "",
    emergency_surcharge_percentage: ""
  });

  const totalPages = Math.ceil((services.count || 0) / pageSize);

  useEffect(() => {
    if (editingService) {
      setFormData({
        category: editingService.category?.category_id || editingService.category || "",
        service_name: editingService.service_name,
        arabic_name: editingService.arabic_name || "",
        description: editingService.description || "",
        service_type: editingService.service_type,
        base_inspection_fee: editingService.base_inspection_fee || "",
        estimated_price_range_min: editingService.estimated_price_range_min || "",
        estimated_price_range_max: editingService.estimated_price_range_max || "",
        emergency_surcharge_percentage: editingService.emergency_surcharge_percentage || ""
      });
    }
  }, [editingService]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...formData,
        category_id: parseInt(formData.category),
        base_inspection_fee: parseFloat(formData.base_inspection_fee),
        estimated_price_range_min: formData.estimated_price_range_min ? parseFloat(formData.estimated_price_range_min) : null,
        estimated_price_range_max: formData.estimated_price_range_max ? parseFloat(formData.estimated_price_range_max) : null,
        emergency_surcharge_percentage: formData.emergency_surcharge_percentage ? parseFloat(formData.emergency_surcharge_percentage) : null
      };

      if (editingService) {
        await updateService({ serviceId: editingService.service_id, ...serviceData }).unwrap();
      } else {
        await createService(serviceData).unwrap();
      }
      setFormData({
        category: "",
        service_name: "",
        arabic_name: "",
        description: "",
        service_type: "",
        base_inspection_fee: "",
        estimated_price_range_min: "",
        estimated_price_range_max: "",
        emergency_surcharge_percentage: ""
      });
      setIsModalOpen(false);
      setEditingService(null);
      refetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
      try {
        await deleteService(serviceId).unwrap();
        refetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePreviousPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPage(1); // Reset to first page when page size changes
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">الخدمات</h2>
          <p className="text-muted-foreground">إدارة الخدمات</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingService(null);
              setFormData({
                category: "",
                service_name: "",
                arabic_name: "",
                description: "",
                service_type: "",
                base_inspection_fee: "",
                estimated_price_range_min: "",
                estimated_price_range_max: "",
                emergency_surcharge_percentage: ""
              });
            }} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2">
              <PlusCircle className="h-5 w-5" />
              <span>إضافة خدمة جديدة</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingService ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الفئة</option>
                    {(categories.results || []).map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_type">نوع الخدمة</Label>
                  <Input
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_name">الاسم الإنجليزي</Label>
                  <Input
                    id="service_name"
                    name="service_name"
                    value={formData.service_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arabic_name">الاسم العربي</Label>
                  <Input
                    id="arabic_name"
                    name="arabic_name"
                    value={formData.arabic_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_inspection_fee">رسوم الفحص الأساسية</Label>
                  <Input
                    id="base_inspection_fee"
                    name="base_inspection_fee"
                    type="number"
                    step="0.01"
                    value={formData.base_inspection_fee}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_price_range_min">الحد الأدنى للسعر</Label>
                  <Input
                    id="estimated_price_range_min"
                    name="estimated_price_range_min"
                    type="number"
                    step="0.01"
                    value={formData.estimated_price_range_min}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_price_range_max">الحد الأعلى للسعر</Label>
                  <Input
                    id="estimated_price_range_max"
                    name="estimated_price_range_max"
                    type="number"
                    step="0.01"
                    value={formData.estimated_price_range_max}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_surcharge_percentage">نسبة الرسوم الإضافية للطوارئ (%)</Label>
                <Input
                  id="emergency_surcharge_percentage"
                  name="emergency_surcharge_percentage"
                  type="number"
                  step="0.01"
                  value={formData.emergency_surcharge_percentage}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingService ? "تحديث" : "إنشاء"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {servicesLoading || categoriesLoading ? (
            <div className="text-center p-4">جاري تحميل الخدمات...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الخدمة</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>رسوم الفحص</TableHead>
                    <TableHead>السعر المقدر</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(services.results || []).map((service) => (
                    <TableRow key={service.service_id}>
                      <TableCell>
                        <div>
                          <div>{service.service_name}</div>
                          {service.arabic_name && <div className="text-sm text-gray-50">{service.arabic_name}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{service.category?.category_name || service.category || "-"}</TableCell>
                      <TableCell>{service.service_type}</TableCell>
                      <TableCell>{service.base_inspection_fee} ر.س</TableCell>
                      <TableCell>
                        {service.estimated_price_range_min && service.estimated_price_range_max
                          ? `${service.estimated_price_range_min} - ${service.estimated_price_range_max} ر.س`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(service)}
                          className="flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>تعديل</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.service_id)}
                          className="flex items-center space-x-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>حذف</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <span>عدد النتائج لكل صفحة:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="border rounded p-1"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span>الصفحة {page} من {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === totalPages || totalPages === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
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
