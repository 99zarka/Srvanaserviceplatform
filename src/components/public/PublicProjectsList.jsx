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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ backgroundColor: '#1A2B4C', padding: '2rem', borderRadius: '10px' }}>
          {filteredOrders.map((order) => (
            <div key={order.order_id} className="relative group" style={{ width: '100%', maxWidth: '320px', margin: '0 auto', color: 'white' }}>
              {/* Glassmorphism card */}
              <div
                style={{
                  width: '100%',
                  minHeight: '280px',
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.074)',
                  border: '1px solid rgba(255, 255, 255, 0.222)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '0.7rem',
                  transition: 'all ease 0.3s',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                className="hover:shadow-[0px_0px_20px_1px_rgba(244,196,48,0.25)] hover:border-[rgba(255,255,255,0.454)]"
              >
                {/* Card Content */}
                <div>
                  <h2 className="text-2xl font-medium mb-4" style={{ letterSpacing: '0.1em' }}>
                    {order.service?.arabic_name || 'غير متوفر'}
                  </h2>
                  
                  <div className="mb-4">
                    <strong className="block mb-2 text-sm">الوصف</strong>
                    <p className="text-sm font-light mb-0" style={{ letterSpacing: '0.1em' }}>
                      {order.problem_description.substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-light flex items-center mb-1">
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {order.requested_location}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-xs font-light flex items-center">
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {order.scheduled_date} {order.scheduled_time_start}
                    </span>
                  </div>
                  
                  {order.expected_price && (
                    <div className="mb-3">
                      <span className="text-xs font-light">السعر المتوقع: </span>
                      <span className="text-sm font-medium" style={{ marginRight: '0.2rem', color: '#F4C430' }}>
                        ${order.expected_price}
                      </span>
                    </div>
                  )}
                </div>

                {/* Buttons that appear on hover */}
                <div 
                  className="flex gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 mt-4"
                  style={{
                    transform: 'translateY(-10px)',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <Link
                    to={`/projects/${order.order_id}`}
                    className="flex-1 text-center py-2 px-3 rounded text-xs font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(244, 196, 48, 0.2)',
                      color: 'white',
                      textDecoration: 'none',
                      border: '1px solid rgba(244, 196, 48, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(244, 196, 48, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(244, 196, 48, 0.2)';
                    }}
                  >
                    عرض التفاصيل
                  </Link>
                  <Link
                    to={`/projects/${order.order_id}/offer`}
                    className="flex-1 text-center py-2 px-3 rounded text-xs font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: 'rgba(244, 196, 48, 0.2)',
                      color: 'white',
                      textDecoration: 'none',
                      border: '1px solid rgba(244, 196, 48, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(244, 196, 48, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(244, 196, 48, 0.2)';
                    }}
                  >
                    قدم عرض
                  </Link>
                </div>
              </div>

              {/* Decorative elements */}
              <div
                style={{
                  content: '""',
                  backgroundColor: 'rgba(244, 196, 48, 0.3)',
                  position: 'absolute',
                  borderRadius: '50%',
                  width: '6rem',
                  height: '6rem',
                  top: '30%',
                  right: '7%',
                  zIndex: -1,
                  pointerEvents: 'none'
                }}
              />
              <div
                style={{
                  content: '""',
                  position: 'absolute',
                  height: '3rem',
                  width: '3rem',
                  top: '8%',
                  right: '5%',
                  border: '1px solid rgba(244, 196, 48, 0.5)',
                  borderRadius: '0.3rem',
                  zIndex: -1,
                  pointerEvents: 'none'
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProjectsList;
