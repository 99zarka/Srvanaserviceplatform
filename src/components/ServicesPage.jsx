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
        const data = await api.get("/services/services/?page_size=50"); // Backend endpoint
        // Handle paginated response or direct array
        const servicesData = data.results || data || [];
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error('Failed to fetch services:', err);
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

  if (loading) return <div className="text-center py-20">Loading services...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error.message}</div>;

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
              <Card
                key={service.service_id || service.id}
                className="hover:shadow-lg transition-all hover:border-primary group"
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    {serviceIcons[service.service_name] && React.createElement(serviceIcons[service.service_name], { className: "h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" })}
                  </div>
                  <h3 className="mb-3">{service.arabic_name || service.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      {service.workers || 0} عمال
                    </Badge>
                    <Badge variant="secondary">
                      ⭐ {service.avgRating || 0}
                    </Badge>
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                      تبدأ من ${service.startingPrice || service.base_inspection_fee || 0}/hr
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2"
                    asChild
                  >
                    <Link to="/signup">
                      <PlusCircle className="h-5 w-5" />
                      <span>طلب خدمة</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
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
