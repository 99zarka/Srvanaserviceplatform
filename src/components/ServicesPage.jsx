import React, { useState, useEffect } from "react";
import { Wrench, Droplet, Zap, Paintbrush, Hammer, Drill, Sparkles, Home, ListFilter, PlusCircle, HelpCircle, Mail } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import api from "../utils/api"; // Import the API utility

export function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Try the correct endpoint
        const data = await api.get("/services/?page_size=50"); // Backend endpoint (without duplicate /services/)
        // Handle paginated response or direct array
        const servicesData = data.results || data || [];
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        console.error('Error details:', err.status, err.message);
        setError(err);
        setServices([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const serviceIcons = {
    // Home Repair
    "Plumbing Repair": Droplet,
    "Electrical Services": Zap,
    "HVAC Maintenance": Wrench,
    "Appliance Repair": Home,
    "Painting Services": Paintbrush,
    "Carpentry": Hammer,
    "Roofing Repair": Home,
    "Gutter Cleaning": Sparkles,
    // Automotive
    "Oil Change": Droplet,
    "Brake Inspection & Repair": Wrench,
    "Tire Rotation & Balance": Drill,
    "Battery Replacement": Zap,
    "Diagnostic Services": HelpCircle,
    // IT Services
    "Computer Repair": HelpCircle,
    "Network Setup": Zap,
    "Data Recovery": Mail,
    "Software Installation & Support": Mail,
    // Cleaning Services
    "Deep Cleaning": Sparkles,
    "Carpet Cleaning": Sparkles,
    // Gardening & Landscaping
    "Lawn Mowing & Maintenance": Home,
    "Tree Trimming": Paintbrush,
  };

  if (loading) return <div className="text-center py-20">جاري تحميل الخدمات...</div>;
  if (error) return <div className="text-center py-20 text-red-500">خطأ: {error.message}</div>;

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6 flex items-center justify-center space-x-2">
            <ListFilter className="h-9 w-9" />
            <span>خدماتنا</span>
          </h1>
          <p className="max-w-3xl mx-auto text-secondary-foreground/90">
            تصفح مجموعتنا الواسعة من الخدمات المنزلية الاحترافية. جميع العمال موثقون،
            ومقيمون، ومستعدون للمساعدة في مشاريعك.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(services || []).map((service) => (
              <div
                key={service.service_id || service.id}
                style={{
                  width: '320px',
                  minHeight: '350px',
                  padding: '20px',
                  color: 'white',
                  background: 'linear-gradient(#1A2B4C, #1A2B4C) padding-box, linear-gradient(145deg, transparent 35%, #F4C430, #1A2B4C) border-box',
                  border: '2px solid transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transformOrigin: 'right bottom',
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)'
                }}
                className="hover:rotate-[8deg]"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-400 text-sm">
                      {service.category?.arabic_name || 'خدمة'}
                    </span>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F4C430] to-[#1A2B4C] rounded-lg flex items-center justify-center">
                      {serviceIcons[service.service_name] && React.createElement(serviceIcons[service.service_name], { className: "h-6 w-6 text-white" })}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-4">{service.arabic_name || service.title}</h3>
                  <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                    {service.description}
                  </p>
                  
                  {/* Categories/Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span 
                      style={{
                        backgroundColor: '#F4C430',
                        padding: '4px 8px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '12px',
                        borderRadius: '50em',
                        color: '#1A2B4C'
                      }}
                    >
                      {service.workers || 0} عمال
                    </span>
                    <span 
                      style={{
                        backgroundColor: '#F4C430',
                        padding: '4px 8px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '12px',
                        borderRadius: '50em',
                        color: '#1A2B4C'
                      }}
                    >
                      ⭐ {service.avgRating || 0}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto">
                  <div className="text-gray-400 font-semibold mb-3 text-sm">
                    تبدأ من ${service.startingPrice || service.base_inspection_fee || 0}/hr
                  </div>
                  <Link 
                    to="/signup"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#F4C430',
                      color: '#1A2B4C',
                      fontWeight: 600,
                      borderRadius: '6px',
                      transition: 'all 0.3s',
                      textDecoration: 'none'
                    }}
                    className="hover:bg-[#FFD700] hover:scale-105"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>طلب خدمة</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 flex items-center justify-center space-x-2">
            <HelpCircle className="h-7 w-7" />
            <span>ألا تجد ما تحتاجه؟</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            تواصل معنا وسنساعدك في العثور على المحترف المناسب لاحتياجاتك الخاصة.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center space-x-2"
          >
            <Link to="/contact">
              <Mail className="h-5 w-5" />
              <span>اتصل بنا</span>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
