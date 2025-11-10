import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useState } from "react";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (mock for now)
    alert("شكرا لرسالتك! سنعود إليك قريبا.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      content: "info@srvana.com",
      link: "mailto:info@srvana.com",
    },
    {
      icon: Phone,
      title: "الهاتف",
      content: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "العنوان",
      content: "123 شارع الخدمات، المدينة، الولاية 12345",
      link: "#",
    },
    {
      icon: Clock,
      title: "ساعات العمل",
      content: "من الاثنين إلى الجمعة: 9:00 صباحًا - 6:00 مساءً",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">اتصل بنا</h1>
          <p className="max-w-3xl mx-auto text-secondary-foreground/90">
            هل لديك أسئلة أو تحتاج إلى مساعدة؟ نحن هنا من أجلك. تواصل معنا وسيقوم فريقنا
            بالرد عليك في أقرب وقت ممكن.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="mb-6">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="اسمك"
                    required
                    className="bg-input-background"
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="بريدك.الإلكتروني@مثال.كوم"
                    required
                    className="bg-input-background"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">الموضوع</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="كيف يمكننا المساعدة؟"
                    required
                    className="bg-input-background"
                  />
                </div>
                <div>
                  <Label htmlFor="message">الرسالة</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="أخبرنا المزيد عن استفسارك..."
                    rows={6}
                    required
                    className="bg-input-background resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  إرسال الرسالة
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="mb-6">تواصل معنا</h2>
              <p className="text-muted-foreground mb-8">
                سواء كنت عميلاً تبحث عن خدمات أو عاملاً يرغب في الانضمام إلى منصتنا،
                نحن نحب أن نسمع منك.
              </p>
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <Card key={info.title}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                          <info.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="mb-1">{info.title}</h4>
                          {info.link !== "#" ? (
                            <a
                              href={info.link}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {info.content}
                            </a>
                          ) : (
                            <p className="text-muted-foreground">{info.content}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <Card className="mt-6">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4">الأسئلة الشائعة</h2>
          <p className="text-muted-foreground mb-8">
            هل تبحث عن إجابات سريعة؟ تحقق من قسم الأسئلة الشائعة لدينا للأسئلة الشائعة
            حول استخدام سرفانا، التسعير، وكيف تعمل منصتنا.
          </p>
          <Button variant="outline" size="lg">
            عرض الأسئلة الشائعة
          </Button>
        </div>
      </section>
    </div>
  );
}
