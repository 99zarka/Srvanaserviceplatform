import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getTechnicians, getTechnicianDetail, clearError, clearSuccessMessage } from '../../redux/orderSlice';
import { useGetServicesQuery } from '../../services/api.js';
import GovernorateSelect from '../common/GovernorateSelect';
import { 
  Star, 
  MapPin, 
  Clock, 
  Wrench, 
  Phone, 
  Mail, 
  Filter, 
  Search,
  Loader2,
  CheckCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TechnicianBrowse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { technicians, loading, error, successMessage, techniciansPagination } = useSelector((state) => state.orders);
  const { data: services, isLoading: servicesLoading, error: servicesError } = useGetServicesQuery({ page_size: 100 });
  
  const [filters, setFilters] = useState({
    specialization: 'all',
    location: '',
    min_rating: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // Default to 2 technicians per page

  useEffect(() => {
    dispatch(getTechnicians({
      ...filters,
      page: currentPage,
      page_size: pageSize
    }));
  }, [dispatch, filters, currentPage, pageSize]);

  useEffect(() => {
    // Clear messages after 5 seconds
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Reset to first page when search term changes
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewTechnicianProfile = (technicianId) => {
    navigate(`/profile/${technicianId}`); // Navigate to the UserProfilePage
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-40" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  // Calculate pagination info from the Redux store
  const totalItems = techniciansPagination?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentTechnicians = technicians || [];

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">تصفح الفنيين</h1>
        <p className="text-gray-600">ابحث عن الفنيين المعتمدين ووظفهم مباشرة</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-60">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                الفلاتر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">بحث</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث عن فنيين..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Specialization Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">التخصص</label>
                <Select onValueChange={(value) => handleFilterChange('specialization', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع التخصصات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التخصصات</SelectItem>
                    {servicesLoading && (
                      <SelectItem value="loading" disabled>
                        جاري التحميل...
                      </SelectItem>
                    )}
                    {servicesError && (
                      <SelectItem value="error" disabled>
                        خطأ في التحميل
                      </SelectItem>
                    )}
                    {services?.results?.map((service) => (
                      <SelectItem key={service.service_id} value={service.arabic_name || service.service_name}>
                        {service.arabic_name || service.service_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الموقع</label>
                <GovernorateSelect
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الحد الأدنى للتقييم</label>
                <Select onValueChange={(value) => handleFilterChange('min_rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="أي تقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">أي تقييم</SelectItem>
                    <SelectItem value="4.5">4.5+ نجوم</SelectItem>
                    <SelectItem value="4.0">4.0+ نجوم</SelectItem>
                    <SelectItem value="3.5">3.5+ نجوم</SelectItem>
                    <SelectItem value="3.0">3.0+ نجوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page Size Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">عدد العناصر في الصفحة</label>
                <Select onValueChange={handlePageSizeChange} defaultValue="6">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ specialization: 'all', location: '', min_rating: 'all' });
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                مسح الفلاتر
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Technicians List */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              {totalItems > 0 ? `عرض ${currentTechnicians.length} من ${totalItems} فنيين` : '0 فنيين تم العثور عليهم'}
            </p>
            <div className="flex items-center gap-2">
              <Select defaultValue="rating">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="الترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                  <SelectItem value="jobs">الأكثر خبرة</SelectItem>
                  <SelectItem value="name">الاسم أ-ي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading indicator for initial load */}
          {loading && (!technicians || technicians.length === 0) && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">جاري تحميل الفنيين...</span>
            </div>
          )}
          
          {/* Loading indicator for pagination/filter updates (replaces results) */}
          {loading && technicians && technicians.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-96 flex items-center justify-center">
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <span className="text-gray-600">جاري التحميل...</span>
              </div>
            </div>
          )}
          
          {/* No results */}
          {!loading && currentTechnicians.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على فنيين</h3>
                <p className="text-gray-600">حاول تعديل الفلاتر أو مصطلحات البحث الخاصة بك</p>
              </CardContent>
            </Card>
          )}
          
          {/* Technician cards */}
          {!loading && currentTechnicians.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentTechnicians.map((technician) => (
                <Card key={technician.user_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {technician.first_name} {technician.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Wrench className="h-4 w-4" />
                          {technician.specialization}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Rating and Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {renderStars(technician.overall_rating || 0)}
                        <span className="text-sm font-medium ml-1">
                          {technician.overall_rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {technician.num_jobs_completed || 0} وظائف
                      </div>
                    </div>

                    {/* Location */}
                    {technician.address && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {technician.address}
                      </div>
                    )}

                    {/* Availability */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      متاح للحجوزات الجديدة
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewTechnicianProfile(technician.user_id)}
                        className="flex-1"
                      >
                        عرض الملف الشخصي
                      </Button>
                      {/* "Hire Now" button removed as direct offer is now on profile page */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div className="text-sm text-gray-600 hidden sm:block">
                الصفحة {currentPage} من {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
                
                {/* Page number buttons */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 sm:hidden">
                {currentPage} من {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianBrowse;
