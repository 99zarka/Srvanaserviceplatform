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
  ChevronRight,
  User // Added User icon for placeholder
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
    sort_by: 'rating',
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
      stars.push(<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-amber-200 text-amber-400" />);
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
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">تصفح الفنيين المعتمدين</h1>
        <p className="text-lg text-gray-700">ابحث عن الفني المثالي لاحتياجاتك ووظفه مباشرة</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-100 border border-red-400 text-red-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-green-100 border border-green-400 text-green-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50 text-blue-800 rounded-t-lg p-4 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Filter className="h-6 w-6 text-blue-600" />
                تصفية النتائج
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">بحث سريع</label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث عن فنيين بالاسم..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pr-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Specialization Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">التخصص</label>
                <Select onValueChange={(value) => handleFilterChange('specialization', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-amber-500 focus:ring-amber-500">
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
                <label className="text-sm font-medium text-gray-700">الموقع الجغرافي</label>
                <GovernorateSelect
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">الحد الأدنى للتقييم</label>
                <Select onValueChange={(value) => handleFilterChange('min_rating', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-amber-500 focus:ring-amber-500">
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
                <label className="text-sm font-medium text-gray-700">عدد الفنيين في الصفحة</label>
                <Select onValueChange={handlePageSizeChange} defaultValue="6">
                  <SelectTrigger className="border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 فنيين</SelectItem>
                    <SelectItem value="12">12 فنيين</SelectItem>
                    <SelectItem value="24">24 فنيين</SelectItem>
                    <SelectItem value="48">48 فنيين</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ specialization: 'all', location: '', min_rating: 'all', sort_by: 'rating' });
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                مسح جميع الفلاتر
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Technicians List */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-md text-gray-600">
              {totalItems > 0 ? `نعرض ${currentTechnicians.length} من أصل ${totalItems} فنيين` : 'لم يتم العثور على فنيين'}
            </p>
              <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">الترتيب حسب:</span>
              <Select 
                value={filters.sort_by} 
                onValueChange={(value) => handleFilterChange('sort_by', value)}
              >
                <SelectTrigger className="w-48 border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                  <SelectValue placeholder="الترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                  <SelectItem value="jobs">الأكثر خبرة</SelectItem>
                  <SelectItem value="name">الاسم (أ-ي)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading indicator for initial load */}
          {loading && (!technicians || technicians.length === 0) && (
            <Card className="flex items-center justify-center py-12 col-span-full">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
              <span className="ml-3 text-lg text-gray-700">جاري تحميل الفنيين...</span>
            </Card>
          )}
          
          {/* Loading indicator for pagination/filter updates (replaces results) */}
          {loading && technicians && technicians.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-96 relative">
              {/* Overlay for loading */}
              <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center rounded-lg z-10">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
                <span className="text-lg text-gray-700">جاري التحميل...</span>
              </div>
              {/* Render current technicians faded out */}
              {currentTechnicians.map((technician) => (
                <Card key={technician.user_id} className="opacity-50 pointer-events-none">
                  {/* Card content from above for reference, will be covered by overlay */}
                </Card>
              ))}
            </div>
          )}
          
          {/* No results */}
          {!loading && currentTechnicians.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Wrench className="h-16 w-16 text-amber-500 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">عذرًا، لم يتم العثور على فنيين</h3>
                <p className="text-gray-600 text-lg">
                  حاول تعديل الفلاتر أو مصطلحات البحث الخاصة بك للعثور على الفني المناسب.
                </p>
                <Button 
                  onClick={() => {
                    setFilters({ specialization: 'all', location: '', min_rating: 'all', sort_by: 'rating' });
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  مسح جميع الفلاتر
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Technician cards */}
          {!loading && currentTechnicians.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentTechnicians.map((technician) => (
                <Card key={technician.user_id} className="hover:shadow-lg transition-shadow border-t-4 border-amber-200 rounded-lg overflow-hidden">
                  <CardHeader className="p-4 flex flex-col items-center text-center">
                    <div className="relative w-24 h-24 mb-3 rounded-full overflow-visible flex items-center justify-center bg-gray-200">
                      {technician.profile_photo ? (
                        <img 
                          src={technician.profile_photo} 
                          alt={`${technician.first_name} ${technician.last_name}`} 
                          className="w-full h-full object-cover border-2 border-blue-400 shadow-md rounded-full"
                        />
                      ) : (
                        <User className="h-16 w-16 text-blue-500" /> 
                      )}
                      {technician.verification_status === "Verified" && (
                        <CheckCircle className="absolute bottom-[-2px] right-[-2px] h-7 w-7 fill-blue-500 text-white stroke-white p-0.5 rounded-full bg-white border border-white" />
                      )}
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-800">
                      {technician.first_name} {technician.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-md text-gray-600">
                      <Wrench className="h-5 w-5 text-gray-500" />
                      {technician.specialization || 'غير محدد'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-3 border-t bg-gray-50">
                    {/* Rating and Stats */}
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(technician.overall_rating || 0)}
                        <span className="text-sm font-semibold text-gray-800 ml-1">
                          {technician.overall_rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                          <span className="text-sm font-bold text-gray-80">{technician.num_jobs_completed || 0}</span>
                        </div>
                        <span className="text-xs text-gray-600 ml-1">
                          وظائف مكتملة
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    {technician.bio && (
                      <p className="text-sm text-gray-700 text-center mb-3 line-clamp-2">
                        {technician.bio}
                      </p>
                    )}

                    {/* Location */}
                    {technician.address && (
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{technician.address}</span>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex justify-center pt-2">
                      <Button
                        onClick={() => handleViewTechnicianProfile(technician.user_id)}
                        className="w-full max-w-xs bg-amber-400 hover:bg-amber-300 text-white font-bold py-2 px-4 rounded-md transition-colors"
                      >
                        عرض الملف الشخصي
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                عرض {currentTechnicians.length} من {totalItems} فنيين | الصفحة {currentPage} من {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-9 w-9 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                >
                  <ChevronRight className="h-4 w-4" /> {/* Corrected for RTL */}
                  <span className="sr-only">السابق</span>
                </Button>
                
                {/* Page number buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    // Only show a limited number of page buttons around the current page
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 ${currentPage === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400'}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      // Add ellipses for skipped pages
                      return <span key={pageNum} className="text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                >
                  <ChevronLeft className="h-4 w-4" /> {/* Corrected for RTL */}
                  <span className="sr-only">التالي</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianBrowse;
