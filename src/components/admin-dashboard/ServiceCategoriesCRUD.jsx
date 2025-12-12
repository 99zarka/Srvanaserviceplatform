import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useGetServiceCategoriesQuery, useCreateServiceCategoryMutation, useUpdateServiceCategoryMutation, useDeleteServiceCategoryMutation } from "../../services/api";
import { useSelector } from "react-redux";
import { Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";

export function ServiceCategoriesCRUD() {
  const { token } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: categories = {}, isLoading, refetch } = useGetServiceCategoriesQuery({ page, page_size: pageSize });
  const [createCategory] = useCreateServiceCategoryMutation();
  const [updateCategory] = useUpdateServiceCategoryMutation();
  const [deleteCategory] = useDeleteServiceCategoryMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: "",
    arabic_name: "",
    description: ""
  });

  const totalPages = Math.ceil((categories.count || 0) / pageSize);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory({ categoryId: editingCategory.category_id, ...formData }).unwrap();
      } else {
        await createCategory(formData).unwrap();
      }
      setFormData({ category_name: "", arabic_name: "", description: "" });
      setIsModalOpen(false);
      setEditingCategory(null);
      refetch();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      arabic_name: category.arabic_name || "",
      description: category.description || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      try {
        await deleteCategory(categoryId).unwrap();
        refetch();
      } catch (error) {
        console.error("Error deleting category:", error);
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
          <h2 className="text-xl font-semibold">فئات الخدمات</h2>
          <p className="text-muted-foreground">إدارة فئات الخدمات</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setFormData({ category_name: "", arabic_name: "", description: "" });
            }} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2">
              <PlusCircle className="h-5 w-5" />
              <span>إضافة فئة جديدة</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category_name">الاسم الإنجليزي</Label>
                <Input
                  id="category_name"
                  name="category_name"
                  value={formData.category_name}
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
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCategory ? "تحديث" : "إنشاء"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center p-4">جاري تحميل الفئات...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم الإنجليزي</TableHead>
                    <TableHead>الاسم العربي</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categories.results || []).map((category) => (
                    <TableRow key={category.category_id}>
                      <TableCell>{category.category_name}</TableCell>
                      <TableCell>{category.arabic_name || "-"}</TableCell>
                      <TableCell>{category.description || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>تعديل</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.category_id)}
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
