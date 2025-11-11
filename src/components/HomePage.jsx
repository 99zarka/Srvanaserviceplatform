import { ArrowRight, CheckCircle, Users, Wrench, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link } from "react-router-dom";

export function HomePage() {
  const services = [
    {
      title: "النجارة",
      description: "خدمات النجارة والأثاث الاحترافية",
      image: "https://images.unsplash.com/photo-1626081063434-79a2169791b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50ZXIlMjB3b29kJTIwd29ya2luZ3xlbnwxfHx8fDE3NjI0MzA2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "السباكة",
      description: "إصلاحات وتركيبات السباكة الاحترافية",
      image: "https://images.unsplash.com/photo-1563197906-c1466d8e2edd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmVyJTIwZml4aW5nJTIwcGlwZXN8ZW58MXx8fHwxNzYyMzU5MDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "الكهرباء",
      description: "أعمال وصيانة كهربائية معتمدة",
      image: "https://images.unsplash.com/photo-1744113511604-235e7010981f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMGVsZWN0cmljYWwlMjB3b3JrfGVufDF8fHx8MTc2MjQzMDYwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "الدهانات",
      description: "خدمات دهان وتشطيب عالية الجودة",
      image: "https://images.unsplash.com/photo-1629941633816-a1d688cb2d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGVyJTIwcGFpbnRpbmclMjB3YWxsfGVufDF8fHx8MTc2MjQxNDMzOHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "اختر خدمة",
      description: "اختر من مجموعتنا الواسعة من الخدمات الاحترافية",
    },
    {
      step: "2",
      title: "ابحث عن عامل",
      description: "تصفح المهنيين المعتمدين وتحقق من تقييماتهم",
    },
    {
      step: "3",
      title: "أنجز العمل",
      description: "حدد موعد الخدمة واحصل على عمل عالي الجودة",
    },
  ];

  const testimonials = [
    {
      name: "سارة جونسون",
      role: "صاحبة منزل",
      content: "وجدت نجارًا رائعًا من خلال سرفانا. جودة العمل فاقت توقعاتي!",
      rating: 5,
    },
    {
      name: "مايك تشن",
      role: "مدير عقارات",
      content: "أصبحت سرفانا منصتي المفضلة لجميع احتياجات الصيانة. موثوقة واحترافية.",
      rating: 5,
    },
    {
      name: "إميلي رودريغيز",
      role: "صاحبة عمل",
      content: "الكهربائيون الذين استأجرتهم كانوا سريعين، ماهرين، وبأسعار معقولة جدًا. أوصي بهم بشدة!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">
                موثوق به من قبل أكثر من 10,000 مستخدم
              </Badge>
              <h1 className="mb-6">
                تواصل مع المهنيين المهرة لكل خدمة منزلية
              </h1>
              <p className="mb-8 text-secondary-foreground/90">
                سرفانا تجعل من السهل العثور على عمال موثوقين لأعمال النجارة، السباكة،
                الأعمال الكهربائية، والمزيد. خدمة عالية الجودة، مضمونة.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Link to="/services">
                    ابحث عن خدمة
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-secondary-foreground/30 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                >
                  <Link to="/signup">انضم كعامل</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwc2VydmljZXMlMjBoYW5keW1hbnxlbnwxfHx8fDE3NjI0MzA2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Professional worker"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">كيف تعمل</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ابدأ بثلاث خطوات بسيطة
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <Card key={item.step} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground mb-4">
                    <span>{item.step}</span>
                  </div>
                  <h3 className="mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">خدمات مميزة</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              مهنيون خبراء مستعدون للمساعدة في مشاريع منزلك
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link 
                key={service.title} 
                to="/services"
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2 text-primary"
                    asChild
                  >
                    <Link to="/services">
                      تعلم المزيد <ArrowRight className="mr-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">ماذا يقول مستخدمونا</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              انضم إلى آلاف العملاء والعمال الراضين
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p>{testimonial.name}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4">هل أنت مستعد للبدء؟</h2>
          <p className="mb-8 text-secondary-foreground/90">
            سواء كنت بحاجة إلى خدمة أو ترغب في تقديم مهاراتك، سرفانا هنا من أجلك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link to="/services">تصفح الخدمات</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-secondary-foreground/30 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <Link to="/signup">كن عاملاً</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
