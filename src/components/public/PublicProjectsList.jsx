import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableOrders } from '../../redux/orderSlice';
import { Link } from 'react-router-dom';
import { Search, Filter, X, MapPin, Calendar, DollarSign, Loader2, ArrowLeft, Briefcase, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const PublicProjectsList = () => {
  const dispatch = useDispatch();
  const { availableOrders, loading, error, availableOrdersPagination } = useSelector((state) => state.orders);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Initial load
    dispatch(getAvailableOrders({ page: 1, page_size: 10 }));
  }, [dispatch]);

  // Project images mapping
  const projectImages = [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop",
  ];

  const getProjectImage = (index) => {
    return projectImages[index % projectImages.length];
  };

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

  // Load more function
  const loadMore = () => {
    if (loading || !hasMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    dispatch(getAvailableOrders({ page: nextPage, page_size: 10 })).then((action) => {
      if (action.payload?.next) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedService('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedLocation('all');
    setSortBy('date-desc');
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F4C430] mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">جاري تحميل المشاريع المتاحة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <p className="mb-6 text-xl text-red-500">خطأ: {error.message || 'فشل في جلب المشاريع'}</p>
          <Button 
            onClick={() => dispatch(getAvailableOrders({ page: 1, page_size: 10 }))}
            className="bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] hover:shadow-xl"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Search and Filter Section */}
      <section className="sticky top-0 z-30 py-8 bg-white shadow-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
              <Input
                type="text"
                placeholder="ابحث عن المشاريع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 h-12 text-lg border-2 focus:border-[#F4C430]"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 h-12 px-6 ${showFilters ? 'bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] border-none' : 'border-2 border-[#1A2B4C] text-[#1A2B4C]'}`}
            >
              <Filter className="w-5 h-5" />
              <span className="font-bold">تصفية</span>
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-6 border-2 border-gray-200 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-4">{/* Service Filter */}
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    نوع الخدمة
                  </label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="border-2">
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
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    الموقع
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="border-2">
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
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    السعر الأدنى
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="border-2"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    السعر الأقصى
                  </label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="border-2"
                  />
                </div>
              </div>

              {/* Sort and Reset */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-gray-700">
                    ترتيب حسب:
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px] border-2">
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
                  className="flex items-center gap-2 hover:bg-[#F4C430]/20 font-bold"
                  style={{ color: '#1A2B4C' }}
                >
                  <X className="w-5 h-5" />
                  <span>إعادة تعيين</span>
                </Button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-base font-semibold text-gray-700">
            عرض {filteredOrders.length} من {availableOrdersPagination.count || 0} مشروع
            {availableOrdersPagination.totalPages > 1 && (
              <span className="mr-2 text-gray-500">
                (الصفحة {currentPage} من {availableOrdersPagination.totalPages})
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Projects Sections */}
      {filteredOrders.length === 0 ? (
        <section className="py-20">
          <div className="text-center">
            <Briefcase className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <p className="mb-6 text-2xl font-bold text-gray-600">لا توجد مشاريع تطابق معايير البحث</p>
            <Button
              onClick={handleResetFilters}
              className="bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] hover:shadow-xl px-8 py-6 text-lg font-bold"
            >
              إعادة تعيين التصفية
            </Button>
          </div>
        </section>
      ) : (
        <>
          <section className="py-12">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              {filteredOrders.map((order, index) => {
                return (
                  <div
                    key={order.order_id}
                    className="mb-16 last:mb-0"
                  >
                    <div className="flex flex-col items-center gap-8 lg:flex-row-reverse lg:gap-12">
                      {/* Image Section */}
                      <div className="w-full lg:w-1/2">
                        <div 
                          className="relative overflow-hidden shadow-2xl rounded-2xl group"
                          style={{
                            aspectRatio: '16/10',
                            background: `linear-gradient(135deg, rgba(26, 43, 76, 0.1) 0%, rgba(244, 196, 48, 0.1) 100%)`
                          }}
                        >
                          <img
                            src={getProjectImage(index)}
                            alt={order.service?.arabic_name || 'مشروع'}
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4C]/70 to-transparent"></div>
                          
                          {/* Floating Badge */}
                          <div className="absolute top-6 right-6 bg-[#F4C430] text-[#1A2B4C] px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            مشروع متاح
                          </div>

                          {/* Price Badge */}
                          {order.expected_price && (
                            <div className="absolute bottom-6 right-6 bg-white/95 text-[#1A2B4C] px-6 py-3 rounded-xl font-bold text-xl shadow-xl">
                              {order.expected_price} ج.م
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="w-full space-y-6 lg:w-1/2">
                        {/* Title */}
                        <div>
                          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2B4C] mb-4">
                            {order.service?.arabic_name || 'مشروع جديد'}
                          </h2>
                          <div className="h-1 w-20 bg-gradient-to-r from-[#F4C430] to-[#FFD700] rounded-full"></div>
                        </div>

                        {/* Description */}
                        <p className="text-lg leading-relaxed text-gray-700">
                          {order.problem_description || 'لا يوجد وصف متاح'}
                        </p>

                        {/* Project Details */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border-r-4 border-[#F4C430]">
                            <MapPin className="w-6 h-6 text-[#F4C430] flex-shrink-0 mt-1" />
                            <div>
                              <p className="mb-1 text-sm font-bold text-gray-500">الموقع</p>
                              <p className="text-lg font-semibold text-[#1A2B4C]">
                                {order.requested_location || 'غير محدد'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border-r-4 border-[#F4C430]">
                            <Calendar className="w-6 h-6 text-[#F4C430] flex-shrink-0 mt-1" />
                            <div>
                              <p className="mb-1 text-sm font-bold text-gray-500">التاريخ والوقت</p>
                              <p className="text-lg font-semibold text-[#1A2B4C]">
                                {order.scheduled_date} {order.scheduled_time_start && `- ${order.scheduled_time_start}`}
                              </p>
                            </div>
                          </div>

                          {order.expected_price && (
                            <div className="flex items-start gap-4 bg-gradient-to-r from-[#F4C430]/10 to-[#FFD700]/10 rounded-xl p-4 border-r-4 border-[#F4C430]">
                              <DollarSign className="w-6 h-6 text-[#F4C430] flex-shrink-0 mt-1" />
                              <div>
                                <p className="mb-1 text-sm font-bold text-gray-500">الميزانية المتوقعة</p>
                                <p className="text-2xl font-bold text-[#1A2B4C]">
                                  {order.expected_price} ج.م
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                          <Link
                            to={`/projects/${order.order_id}/offer`}
                            className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                          >
                            <span>قدم عرضك الآن</span>
                            <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                          </Link>

                          <Link
                            to={`/projects/${order.order_id}`}
                            className="flex-1 inline-flex items-center justify-center gap-3 bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300"
                          >
                            عرض التفاصيل الكاملة
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    {index < filteredOrders.length - 1 && (
                      <div className="mt-16 border-b border-gray-200"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Load More Button */}
          {hasMore && (
            <section className="py-12 text-center">
              <Button
                onClick={loadMore}
                disabled={loading}
                className="px-12 py-6 text-xl font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 ml-3 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <span>تحميل المزيد من المشاريع</span>
                    <ArrowLeft className="inline-block w-6 h-6 mr-3" />
                  </>
                )}
              </Button>
            </section>
          )}

          {/* End of results message */}
          {!hasMore && availableOrders.length > 0 && (
            <section className="py-12 text-center">
              <div className="max-w-2xl mx-auto">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold text-gray-500">لقد وصلت إلى نهاية القائمة</p>
                <p className="mt-2 text-gray-400">تحقق لاحقًا من المشاريع الجديدة</p>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default PublicProjectsList;
