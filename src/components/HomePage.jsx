import { ArrowRight, CheckCircle, Users, Wrench, Star, Search, UserPlus, Zap, Sparkles, MessageSquareQuote, Rocket } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FeaturedQuickServices } from "./FeaturedQuickServices";
import { FaqSection } from "./FaqSection";

export function HomePage() {
  const services = [
    {
      title: "النجارة",
      description: "خدمات النجارة والأثاث الاحترافية",
      image: "https://images.unsplash.com/photo-1626081063434-79a2169791b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjYXJwZW50ZXIlMjB3b29kJTIwd29ya2luZ3xlbnwxfHx8fDE3NjI0MzA2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "السباكة",
      description: "إصلاحات وتركيبات السباكة الاحترافية",
      image: "https://images.unsplash.com/photo-1563197906-c1466d8e2edd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwbHVtYmVyJTIwZml4aW5nJTIwcGlwZXN8ZW58MXx8fHwxNzYyMzU5MDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "الكهرباء",
      description: "أعمال وصيانة كهربائية معتمدة",
      image: "https://images.unsplash.com/photo-1744113511604-235e7010981f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxlbGVjdHJpY2lhbiUyMGVsZWN0cmljYWwlMjB3b3JrfGVufDF8fHx8MTc2MjQzMDYwNHww&ixlib=rb-4.1.0&q=80&w=1080",
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
      icon: Wrench,
    },
    {
      step: "2",
      title: "ابحث عن عامل",
      description: "تصفح المهنيين المعتمدين وتحقق من تقييماتهم",
      icon: Search,
    },
    {
      step: "3",
      title: "أنجز العمل",
      description: "حدد موعد الخدمة واحصل على عمل عالي الجودة",
      icon: CheckCircle,
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
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="relative py-24 text-foreground md:py-40 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-left bg-no-repeat z-0"
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwc2VydmljZXMlMjBoYW5keW1hbnxlbnwxfHx8fDE3NjI0MzA2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080)` 
          }}
        >
          {/* Gradient overlay - from left to right (man on left, text on right) */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-white/95"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center lg:grid-cols-2">
            <motion.div
              className="space-y-8 max-w-2xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-primary text-primary-foreground hover:bg-primary/90 animate-fade-in text-base px-4 py-2">
                موثوق به من قبل أكثر من 10,000 مستخدم
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 animate-fade-in-up">
                تواصل مع المهنيين المهرة لكل خدمة منزلية
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 animate-fade-in-up max-w-xl">
                سرفانا تجعل من السهل العثور على عمال موثوقين لأعمال النجارة، السباكة،
                الأعمال الكهربائية، والمزيد. خدمة عالية الجودة، مضمونة.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up">
                <Button
                  size="lg"
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground hover-lift text-lg px-8 py-6"
                >
                  <Link to="/services" className="flex items-center space-x-2">
                    <span>ابحث عن خدمة</span>
                    <Search className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  className="flex items-center space-x-2 bg-[#1e3a5f] hover:bg-[#2c4a6f] text-white hover-lift text-lg px-8 py-6"
                >
                  <Link to="/signup">
                    <span>انضم كعامل</span>
                    <UserPlus className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
            {/* Empty column for spacing on large screens */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4">كيف تعمل</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              ابدأ بثلاث خطوات بسيطة
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="transition-colors border-2 hover:border-primary hover-lift">
                  <CardContent className="pt-6 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-primary-foreground animate-float">
                      {item.icon && <item.icon className="w-6 h-6" />}
                    </div>
                    <h3 className="mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quick Services */}
      <FeaturedQuickServices />

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="flex items-center justify-center mb-4 space-x-2">
              <MessageSquareQuote className="h-7 w-7 text-primary" />
              <span>ماذا يقول مستخدمونا</span>
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              انضم إلى آلاف العملاء والعمال الراضين
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-4 text-muted-foreground">"{testimonial.content}"</p>
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
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="flex items-center justify-center mb-4 space-x-2">
            <Rocket className="h-7 w-7" />
            <span>هل أنت مستعد للبدء؟</span>
          </h2>
          <p className="mb-8 text-secondary-foreground/90">
            سواء كنت بحاجة إلى خدمة أو ترغب في تقديم مهاراتك، سرفانا هنا من أجلك
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link to="/services">
                <span>تصفح الخدمات</span>
                <Search className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="flex items-center space-x-2 border-secondary-foreground/30 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <Link to="/signup">
                <span>كن عاملاً</span>
                <UserPlus className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />
    </div>
  );
}
