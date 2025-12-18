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
  User,
  MessageCircle,
  Briefcase,
  Award,
  TrendingUp
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
      stars.push(<Star key={i} className="h-4 w-4 fill-primary text-primary" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-primary/50 text-primary" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }
    
    return stars;
  };

  // Calculate pagination info from the Redux store
  const totalItems = techniciansPagination?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentTechnicians = technicians || [];

  return (
    <div className="container mx-auto p-6 min-h-screen" dir="rtl">
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive text-destructive flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-primary/10 border border-primary text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 10-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-xl border-primary/20 sticky top-6">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 text-foreground rounded-t-lg p-5 border-b-2 border-primary/20">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                تصفية النتائج
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {/* Search */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  بحث سريع
                </label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن فني بالاسم..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pr-10 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Specialization Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  التخصص
                </label>
                <Select onValueChange={(value) => handleFilterChange('specialization', value)}>
                  <SelectTrigger className="border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm transition-all">
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
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  الموقع الجغرافي
                </label>
                <GovernorateSelect
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm transition-all"
                />
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  الحد الأدنى للتقييم
                </label>
                <Select onValueChange={(value) => handleFilterChange('min_rating', value)}>
                  <SelectTrigger className="border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm transition-all">
                    <SelectValue placeholder="أي تقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">أي تقييم</SelectItem>
                    <SelectItem value="4.5">4.5+ نجوم ⭐</SelectItem>
                    <SelectItem value="4.0">4.0+ نجوم ⭐</SelectItem>
                    <SelectItem value="3.5">3.5+ نجوم ⭐</SelectItem>
                    <SelectItem value="3.0">3.0+ نجوم ⭐</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page Size Selector */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  عدد النتائج
                </label>
                <Select onValueChange={handlePageSizeChange} defaultValue="6">
                  <SelectTrigger className="border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm transition-all">
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

              {/* Divider */}
              <div className="border-t-2 border-primary/20"></div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ specialization: 'all', location: '', min_rating: 'all', sort_by: 'rating' });
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="w-full border-2 border-primary/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-bold py-6 shadow-sm"
              >
                <Filter className="h-4 w-4 ml-2" />
                مسح جميع الفلاتر
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Technicians List */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {totalItems > 0 ? `${totalItems} فني متاح` : 'لم يتم العثور على فنيين'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalItems > 0 && `نعرض ${currentTechnicians.length} في هذه الصفحة`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">الترتيب:</span>
              <Select 
                value={filters.sort_by} 
                onValueChange={(value) => handleFilterChange('sort_by', value)}
              >
                <SelectTrigger className="w-48 border-primary/30 focus:border-primary focus:ring-primary shadow-sm">
                  <SelectValue placeholder="الترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      الأعلى تقييماً
                    </div>
                  </SelectItem>
                  <SelectItem value="jobs">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      الأكثر خبرة
                    </div>
                  </SelectItem>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      الاسم (أ-ي)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading indicator for initial load */}
          {loading && (!technicians || technicians.length === 0) && (
            <Card className="flex flex-col items-center justify-center py-20 col-span-full bg-gradient-to-br from-primary/5 to-transparent border-2 border-primary/20">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
              </div>
              <span className="mt-6 text-xl font-semibold text-foreground">جاري تحميل الفنيين المتاحين...</span>
              <p className="text-sm text-muted-foreground mt-2">يرجى الانتظار قليلاً</p>
            </Card>
          )}
          
          {/* Loading indicator for pagination/filter updates */}
          {loading && technicians && technicians.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-96 relative">
              {/* Overlay for loading */}
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20 border-2 border-primary/20">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                </div>
                <span className="mt-6 text-xl font-semibold text-foreground">جاري التحديث...</span>
              </div>
              {/* Render current technicians faded out */}
              {currentTechnicians.map((technician) => (
                <Card key={technician.user_id} className="opacity-30 pointer-events-none">
                  {/* Card content placeholder */}
                </Card>
              ))}
            </div>
          )}
          
          {/* No results */}
          {!loading && currentTechnicians.length === 0 && (
            <Card className="col-span-full bg-gradient-to-br from-muted/50 to-transparent border-2 border-dashed border-primary/30">
              <CardContent className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
                  <Wrench className="h-24 w-24 text-primary mx-auto relative z-10" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">لم نجد فنيين مطابقين</h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                  لا توجد نتائج تطابق معايير البحث الحالية. حاول تعديل الفلاتر أو البحث بكلمات مختلفة.
                </p>
                <Button 
                  onClick={() => {
                    setFilters({ specialization: 'all', location: '', min_rating: 'all', sort_by: 'rating' });
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Filter className="h-5 w-5 ml-2" />
                  مسح جميع الفلاتر والبحث من جديد
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Technician cards */}
          {!loading && currentTechnicians.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {currentTechnicians.map((technician) => (
                <div 
                  key={technician.user_id} 
                  style={{
                    background: '#243a5e',
                    width: '100%',
                    paddingTop: '25px',
                    paddingBottom: '25px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    border: '4px solid #3d5a7d',
                    boxShadow: '0 6px 10px rgba(207, 212, 222, 1)',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: '#fff',
                    fontFamily: '"Poppins", sans-serif',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover:-translate-y-3"
                >
                  {/* User Picture */}
                  <div 
                    style={{
                      overflow: 'hidden',
                      objectFit: 'cover',
                      width: '5rem',
                      height: '5rem',
                      border: '4px solid #3d5a7d',
                      borderRadius: '999px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: 'auto',
                      position: 'relative'
                    }}
                  >
                    {technician.profile_photo ? (
                      <img 
                        src={technician.profile_photo} 
                        alt={`${technician.first_name} ${technician.last_name}`} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <User style={{ width: '2.5rem', height: '2.5rem' }} />
                    )}
                    {/* Verification Badge */}
                    {technician.verification_status === "Verified" && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-5px',
                        right: '-5px',
                        background: '#F4C430',
                        borderRadius: '50%',
                        padding: '4px',
                        border: '2px solid #243a5e'
                      }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#243a5e' }} />
                      </div>
                    )}
                  </div>
                  
                  {/* Name */}
                  <h3 
                    style={{
                      margin: 0,
                      marginTop: '20px',
                      fontWeight: '600',
                      fontSize: '18px'
                    }}
                  >
                    {technician.first_name} {technician.last_name}
                    <span 
                      style={{
                        display: 'block',
                        fontWeight: '200',
                        fontSize: '14px',
                        marginTop: '5px'
                      }}
                    >
                      {technician.specialization || 'فني محترف'}
                    </span>
                  </h3>
                  
                  {/* Rating & Stats */}
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {renderStars(technician.overall_rating || 0)}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>
                        {technician.overall_rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontWeight: '700' }}>{technician.num_jobs_completed || 0}</span> وظيفة
                      </div>
                      <div style={{ width: '1px', background: '#3d5a7d' }}></div>
                      <div>
                        <span style={{ fontWeight: '700' }}>{technician.success_rate || 100}%</span> نجاح
                      </div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div style={{
                    width: '100%',
                    height: '2px',
                    margin: '20px 0',
                    background: '#3d5a7d'
                  }}></div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleViewTechnicianProfile(technician.user_id)}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        border: '2px solid #F4C430',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#243a5e',
                        background: '#F4C430',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        textTransform: 'uppercase'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#243a5e';
                        e.currentTarget.style.borderColor = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F4C430';
                        e.currentTarget.style.color = '#243a5e';
                        e.currentTarget.style.borderColor = '#F4C430';
                      }}
                    >
                      عرض الملف
                    </button>
                    <button
                      onClick={() => handleViewTechnicianProfile(technician.user_id)}
                      style={{
                        padding: '10px',
                        border: '2px solid #3d5a7d',
                        borderRadius: '6px',
                        color: '#fff',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#3d5a7d';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <MessageCircle style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t-2 border-primary/20 bg-muted/20 rounded-xl p-5">
              <div className="text-sm font-medium text-foreground mb-4 sm:mb-0 bg-background px-4 py-2 rounded-lg border border-border">
                <span className="text-primary font-bold">{currentTechnicians.length}</span> من <span className="text-primary font-bold">{totalItems}</span> فنيين
                <span className="mx-2 text-muted-foreground">•</span>
                الصفحة <span className="text-primary font-bold">{currentPage}</span> من <span className="text-primary font-bold">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-10 w-10 border-2 border-primary/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                  <span className="sr-only">السابق</span>
                </Button>
                
                {/* Page number buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 font-bold transition-all ${
                            currentPage === pageNum 
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg scale-110' 
                              : 'border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-muted-foreground font-bold">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 border-2 border-primary/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
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
