import { Wrench, Droplet, Zap, Paintbrush, Hammer, Drill, Sparkles, Home } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

export function ServicesPage() {
  const services = [
    {
      id: 1,
      title: "النجارة",
      description: "أثاث مخصص، إصلاحات، تركيب أبواب ونوافذ، صناعة خزائن، وخدمات نجارة عامة.",
      icon: Hammer,
      workers: 450,
      avgRating: 4.8,
      startingPrice: "$50/hr",
    },
    {
      id: 2,
      title: "السباكة",
      description: "إصلاح الأنابيب، التركيب، إصلاح التسربات، تنظيف المصارف، خدمات سباكة الحمامات والمطابخ.",
      icon: Droplet,
      workers: 380,
      avgRating: 4.9,
      startingPrice: "$60/hr",
    },
    {
      id: 3,
      title: "الأعمال الكهربائية",
      description: "الأسلاك، تركيب الإضاءة، الإصلاحات الكهربائية، خدمات قواطع الدائرة، وفحوصات السلامة.",
      icon: Zap,
      workers: 320,
      avgRating: 4.7,
      startingPrice: "$65/hr",
    },
    {
      id: 4,
      title: "الدهانات",
      description: "الدهان الداخلي والخارجي، تشطيب الجدران، استشارات الألوان، وخدمات الدهان الزخرفي.",
      icon: Paintbrush,
      workers: 520,
      avgRating: 4.8,
      startingPrice: "$40/hr",
    },
    {
      id: 5,
      title: "عامل صيانة عام",
      description: "إصلاحات بسيطة، صيانة، تجميع، تركيب، ومختلف الأعمال المنزلية المتفرقة.",
      icon: Wrench,
      workers: 680,
      avgRating: 4.6,
      startingPrice: "$45/hr",
    },
    {
      id: 6,
      title: "الحفر والتركيب",
      description: "حفر الجدران، تركيب أجهزة التلفزيون والأرفف، تركيب التجهيزات، وأعمال الحفر الدقيقة.",
      icon: Drill,
      workers: 290,
      avgRating: 4.7,
      startingPrice: "$35/hr",
    },
    {
      id: 7,
      title: "خدمات التنظيف",
      description: "تنظيف عميق، تنظيف صيانة دورية، تنظيف بعد البناء، وتنظيف متخصص.",
      icon: Sparkles,
      workers: 840,
      avgRating: 4.9,
      startingPrice: "$30/hr",
    },
    {
      id: 8,
      title: "تجديد المنازل",
      description: "تجديد الغرف بالكامل، إعادة تصميم المطابخ والحمامات، التغييرات الهيكلية، والترقيات.",
      icon: Home,
      workers: 210,
      avgRating: 4.8,
      startingPrice: "$80/hr",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">خدماتنا</h1>
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
                    <service.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
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
                      تبدأ من {service.startingPrice}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    asChild
                  >
                    <Link to="/signup">طلب خدمة</Link>
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
          <h2 className="mb-4">ألا تجد ما تحتاجه؟</h2>
          <p className="text-muted-foreground mb-8">
            تواصل معنا وسنساعدك في العثور على المحترف المناسب لاحتياجاتك الخاصة.
          </p>
          <Button 
            size="lg"
            asChild
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Link to="/contact">اتصل بنا</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
