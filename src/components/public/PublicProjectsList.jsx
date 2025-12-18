import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableOrders } from '../../redux/orderSlice';
import { Link } from 'react-router-dom';
import { Search, Filter, X, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';

const PublicProjectsList = () => {
  const dispatch = useDispatch();
  const { availableOrders, loading, error } = useSelector((state) => state.orders);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getAvailableOrders());
  }, [dispatch]);

  // Extract unique services and locations from orders
  const { services, locations } = useMemo(() => {
    if (!availableOrders?.length) return { services: [], locations: [] };
    
    const servicesSet = new Set();
    const locationsSet = new Set();
    
    availableOrders.forEach(order => {
      if (order.service?.arabic_name) servicesSet.add(order.service.arabic_name);
      if (order.requested_location) locationsSet.add(order.requested_location);
    });
    
    return {
      services: Array.from(servicesSet),
      locations: Array.from(locationsSet)
    };
  }, [availableOrders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!availableOrders?.length) return [];
    
    let filtered = availableOrders.filter(order => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        order.service?.arabic_name?.toLowerCase().includes(searchLower) ||
        order.problem_description?.toLowerCase().includes(searchLower) ||
        order.requested_location?.toLowerCase().includes(searchLower);
      
      // Service filter
      const matchesService = selectedService === 'all' || 
        order.service?.arabic_name === selectedService;
      
      // Price filter
      const price = parseFloat(order.expected_price);
      const matchesMinPrice = !minPrice || price >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || price <= parseFloat(maxPrice);
      
      // Location filter
      const matchesLocation = selectedLocation === 'all' || 
        order.requested_location === selectedLocation;
      
      return matchesSearch && matchesService && matchesMinPrice && matchesMaxPrice && matchesLocation;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (parseFloat(a.expected_price) || 0) - (parseFloat(b.expected_price) || 0);
        case 'price-desc':
          return (parseFloat(b.expected_price) || 0) - (parseFloat(a.expected_price) || 0);
        case 'date-asc':
          return new Date(a.scheduled_date) - new Date(b.scheduled_date);
        case 'date-desc':
          return new Date(b.scheduled_date) - new Date(a.scheduled_date);
        default:
          return 0;
      }
    });

    return filtered;
  }, [availableOrders, searchTerm, selectedService, minPrice, maxPrice, selectedLocation, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedService('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedLocation('all');
    setSortBy('date-desc');
  };

  if (loading) {
    return <div className="text-center py-8">جاري تحميل المشاريع المتاحة...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">خطأ: {error.message || 'فشل في جلب المشاريع'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">المشاريع المتاحة للفنيين</h1>
      
      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="ابحث عن المشاريع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
              style={showFilters ? {
                backgroundColor: '#F4C430',
                color: '#1A2B4C',
                border: 'none'
              } : {
                backgroundColor: 'transparent',
                color: '#1A2B4C',
                border: '2px solid #1A2B4C'
              }}
            >
              <Filter className="h-4 w-4" />
              <span>تصفية</span>
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Service Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الخدمة
                  </label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الخدمات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الخدمات</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع المواقع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المواقع</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأدنى
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الأقصى
                  </label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Sort and Reset */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    ترتيب حسب:
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">الأحدث أولاً</SelectItem>
                      <SelectItem value="date-asc">الأقدم أولاً</SelectItem>
                      <SelectItem value="price-desc">السعر: الأعلى أولاً</SelectItem>
                      <SelectItem value="price-asc">السعر: الأقل أولاً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 hover:bg-[#F4C430]/20"
                  style={{ color: '#1A2B4C' }}
                >
                  <X className="h-4 w-4" />
                  <span>إعادة تعيين</span>
                </Button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            عرض {filteredOrders.length} من {availableOrders?.length || 0} مشروع
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">لا توجد مشاريع تطابق معايير البحث</p>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="mt-4"
            style={{
              backgroundColor: 'transparent',
              color: '#1A2B4C',
              border: '2px solid #1A2B4C'
            }}
          >
            إعادة تعيين التصفية
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full px-4 sm:px-6 lg:px-8">
          {filteredOrders.map((order) => (
            <div
              key={order.order_id}
              style={{
                width: '100%',
                minHeight: '380px',
                padding: '20px',
                color: 'white',
                background: 'linear-gradient(#1A2B4C, #1A2B4C) padding-box, linear-gradient(145deg, transparent 35%, #F4C430, #1A2B4C) border-box',
                border: '2px solid transparent',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out'
              }}
              className="hover:-translate-y-2 hover:shadow-xl"
            >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-400 text-sm">
                      مشروع متاح
                    </span>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F4C430] to-[#1A2B4C] rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-4">{order.service?.arabic_name || 'غير متوفر'}</h3>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                    {order.problem_description}
                  </p>
                  
                  {/* Info Badges */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="h-4 w-4 ml-2" />
                      {order.requested_location}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="h-4 w-4 ml-2" />
                      {order.scheduled_date} {order.scheduled_time_start}
                    </div>
                    {order.expected_price && (
                      <div className="flex items-center text-sm text-gray-300">
                        <DollarSign className="h-4 w-4 ml-2" />
                        <span className="font-semibold" style={{ color: '#F4C430' }}>
                          {order.expected_price} ج.م
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-auto space-y-2">
                  <Link
                    to={`/projects/${order.order_id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'transparent',
                      color: '#F4C430',
                      fontWeight: 600,
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '2px solid #F4C430',
                      transition: 'all 0.3s',
                      textDecoration: 'none'
                    }}
                    className="hover:bg-[#F4C430] hover:text-[#1A2B4C]"
                  >
                    عرض التفاصيل
                  </Link>
                  <Link
                    to={`/projects/${order.order_id}/offer`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#F4C430',
                      color: '#1A2B4C',
                      fontWeight: 600,
                      fontSize: '14px',
                      borderRadius: '6px',
                      transition: 'all 0.3s',
                      textDecoration: 'none'
                    }}
                    className="hover:bg-[#FFD700] hover:scale-105"
                  >
                    قدم عرض
                  </Link>
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProjectsList;
