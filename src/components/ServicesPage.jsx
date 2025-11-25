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
        const data = await api.get("/services/"); // Assuming "/services/" is your backend endpoint
        setServices(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const serviceIcons = {
    "النجارة": Hammer,
    "السباكة": Droplet,
    "الأعمال الكهربائية": Zap,
    "الدهانات": Paintbrush,
    "عامل صيانة عام": Wrench,
    "الحفر والتركيب": Drill,
    "خدمات التنظيف": Sparkles,
    "تجديد المنازل": Home,
  };

  if (loading) return <div className="text-center py-20">Loading services...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen">
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
            {services.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-all hover:border-primary group"
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    {serviceIcons[service.title] && React.createElement(serviceIcons[service.title], { className: "h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" })}
                  </div>
                  <h3 className="mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      {service.workers} عمال
                    </Badge>
                    <Badge variant="secondary">
                      ⭐ {service.avgRating}
                    </Badge>
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                      تبدأ من ${service.startingPrice}/hr
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
