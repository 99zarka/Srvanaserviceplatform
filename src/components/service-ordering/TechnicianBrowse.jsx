import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getTechnicians, getTechnicianDetail, clearError, clearSuccessMessage } from '../../redux/orderSlice';
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
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TechnicianBrowse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { technicians, loading, error, successMessage } = useSelector((state) => state.orders);
  
  const [filters, setFilters] = useState({
    specialization: 'all',
    location: '',
    min_rating: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getTechnicians(filters));
  }, [dispatch, filters]);

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
  };

  const handleViewTechnicianProfile = (technicianId) => {
    navigate(`/profile/${technicianId}`); // Navigate to the UserProfilePage
  };

  // Removed handleHireTechnician as direct hire is now on UserProfilePage

  const filteredTechnicians = technicians?.filter(technician => {
    const matchesSearch = technician.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technician.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         technician.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">تصفح الفنيين</h1>
        <p className="text-gray-600">ابحث عن الفنيين المعتمدين ووظفهم مباشرة</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{successMessage}</p>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <SelectItem value="plumbing">سباكة</SelectItem>
                    <SelectItem value="electrical">كهرباء</SelectItem>
                    <SelectItem value="hvac">تكييف وتدفئة</SelectItem>
                    <SelectItem value="cleaning">تنظيف</SelectItem>
                    <SelectItem value="carpentry">نجارة</SelectItem>
                    <SelectItem value="painting">دهانات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الموقع</label>
                <Input
                  placeholder="أدخل الموقع..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
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

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ specialization: 'all', location: '', min_rating: 'all' });
                  setSearchTerm('');
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
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredTechnicians.length} فنيين تم العثور عليهم
            </p>
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

          {loading && (!technicians || technicians.length === 0) ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">جاري تحميل الفنيين...</span>
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على فنيين</h3>
                <p className="text-gray-600">حاول تعديل الفلاتر أو مصطلحات البحث الخاصة بك</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTechnicians.map((technician) => (
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
        </div>
      </div>
    </div>
  );
};

export default TechnicianBrowse;
