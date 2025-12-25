import React, { useState, useEffect } from "react";
import { Wrench, Droplet, Zap, Paintbrush, Hammer, Drill, Sparkles, Home, ListFilter, PlusCircle, HelpCircle, Mail, Star, Users, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../redux/servicesSlice';

export function ServicesPage() {
  const dispatch = useDispatch();
  const { services, loading, error } = useSelector((state) => state.services);

  useEffect(() => {
    dispatch(fetchServices({ page_size: 50 }));
  }, [dispatch]);

  const serviceImages = {
    "Plumbing Repair": "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop",
    "Electrical Services": "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop",
    "HVAC Maintenance": "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=600&fit=crop",
    "Appliance Repair": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop",
    "Painting Services": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop",
    "Carpentry": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop",
    "Roofing Repair": "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop",
    "Gutter Cleaning": "https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&h=600&fit=crop",
    "Oil Change": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop",
    "Brake Inspection & Repair": "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&h=600&fit=crop",
    "Tire Rotation & Balance": "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&h=600&fit=crop",
    "Battery Replacement": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
    "Diagnostic Services": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop",
    "Computer Repair": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=600&fit=crop",
    "Network Setup": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop",
    "Data Recovery": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
    "Software Installation & Support": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    "Deep Cleaning": "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop",
    "Carpet Cleaning": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&h=600&fit=crop",
    "Lawn Mowing & Maintenance": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop",
    "Tree Trimming": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
  };

  const getServiceImage = (service) => {
    return serviceImages[service.service_name] || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop";
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F4C430] mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">جاري تحميل الخدمات...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen" dir="rtl">
      <div className="text-center">
        <p className="text-xl text-red-500">خطأ: {typeof error === 'string' ? error : 'حدث خطأ في تحميل الخدمات'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero Header */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-[#1A2B4C] to-[#2A3B5C]">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            خدماتنا المتميزة
          </h1>
          <p className="mb-8 text-xl text-gray-200">
            نقدم مجموعة واسعة من الخدمات الاحترافية لتلبية جميع احتياجاتك
          </p>
        </div>
      </section>

      {/* Services Sections */}
      <section className="py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {(services || []).map((service, index) => {
            return (
              <div
                key={service.service_id || service.id}
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
                        src={getServiceImage(service)}
                        alt={service.arabic_name || service.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4C]/60 to-transparent"></div>
                      
                      {/* Floating Badge */}
                      <div className="absolute top-6 right-6 bg-[#F4C430] text-[#1A2B4C] px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                        {service.category?.arabic_name || 'خدمة مميزة'}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="w-full space-y-6 lg:w-1/2">
                    {/* Title */}
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-[#1A2B4C] mb-4">
                        {service.arabic_name || service.title}
                      </h2>
                      <div className="h-1 w-20 bg-gradient-to-r from-[#F4C430] to-[#FFD700] rounded-full"></div>
                    </div>

                    {/* Description */}
                    <p className="text-lg leading-relaxed text-gray-700">
                      {service.description || 'خدمة احترافية متميزة نقدمها بأعلى معايير الجودة'}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#F4C430]/20 flex items-center justify-center">
                          <Users className="w-6 h-6 text-[#F4C430]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#1A2B4C]">{service.workers || 0}</p>
                          <p className="text-sm text-gray-600">فني متخصص</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#F4C430]/20 flex items-center justify-center">
                          <Star className="w-6 h-6 text-[#F4C430]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#1A2B4C]">{service.avgRating || '5.0'}</p>
                          <p className="text-sm text-gray-600">تقييم العملاء</p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-r-4 border-[#F4C430]">
                      <p className="mb-2 text-sm text-gray-600">السعر يبدأ من</p>
                      <p className="text-3xl font-bold text-[#1A2B4C]">
                        {service.startingPrice || service.base_inspection_fee || 0} <span className="text-xl">ج.م/ساعة</span>
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Link 
                      to="/signup"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                    >
                      <span>اطلب الخدمة الآن</span>
                      <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Divider */}
                {index < (services || []).length - 1 && (
                  <div className="mt-16 border-b border-gray-200"></div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1A2B4C] to-[#2A3B5C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4C430] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F4C430] rounded-full filter blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <HelpCircle className="h-16 w-16 text-[#F4C430] mx-auto mb-6" />
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            ألا تجد ما تحتاجه؟
          </h2>
          <p className="max-w-2xl mx-auto mb-10 text-xl text-gray-200">
            تواصل معنا وسنساعدك في العثور على المحترف المناسب لاحتياجاتك الخاصة.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#F4C430] to-[#FFD700] text-[#1A2B4C] px-10 py-5 rounded-xl font-bold text-lg shadow-2xl hover:shadow-[#F4C430]/50 transition-all duration-300 hover:scale-105"
          >
            <Mail className="w-6 h-6" />
            <span>تواصل معنا الآن</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
