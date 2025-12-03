import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, PhoneCall, Send, HelpCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import api from "../utils/api";
import { toast } from "sonner";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactInfo, setContactInfo] = useState([]);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoError, setInfoError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  // const { toast } = useToast(); // No longer needed

  useEffect(() => {
    const fetchContactInfo = async () => {
      setIsLoadingInfo(true);
      setInfoError(null);
      try {
        const response = await api.get("/api/contact-info/"); // Assuming this endpoint exists
        // Map fetched data to the structure expected by the component
        const mappedInfo = [
          {
            icon: Mail,
            title: "البريد الإلكتروني",
            content: response.contact_email || "info@srvana.com",
            link: `mailto:${response.contact_email || "info@srvana.com"}`,
          },
          {
            icon: Phone,
            title: "الهاتف",
            content: response.support_phone || "+1 (555) 123-4567",
            link: `tel:${response.support_phone || "+15551234567"}`,
          },
          {
            icon: MapPin,
            title: "العنوان",
            content: response.address || "123 شارع الخدمات، المدينة، الولاية 12345",
            link: "#", // Could be a link to a map if coordinates are provided
          },
          {
            icon: Clock,
            title: "ساعات العمل",
            content: response.working_hours || "من الاثنين إلى الجمعة: 9:00 صباحًا - 6:00 مساءً",
            link: "#",
          },
        ];
        setContactInfo(mappedInfo);
      } catch (err) {
        console.error("Failed to fetch contact info:", err);
        setInfoError("فشل في جلب معلومات الاتصال.");
        // Fallback to static data
        setContactInfo([
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
        ]);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.post("/api/contact-submissions/", formData); // Assuming this endpoint exists
        toast.success("نجاح", {
          description: "شكرا لرسالتك! سنعود إليك قريبا.",
        });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Failed to submit contact form:", err);
      setSubmitError("فشل في إرسال رسالتك. الرجاء المحاولة لاحقًا.");
      toast.error("خطأ", {
        description: "فشل في إرسال رسالتك.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6 flex items-center justify-center space-x-2">
            <PhoneCall className="h-9 w-9" />
            <span>اتصل بنا</span>
          </h1>
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
              <h2 className="mb-6 flex items-center space-x-2">
                <Send className="h-6 w-6" />
                <span>أرسل لنا رسالة</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="أخبرنا المزيد عن استفسارك..."
                    rows={6}
                    required
                    className="bg-input-background resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  <span>إرسال الرسالة</span>
                </Button>
                {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="mb-6">تواصل معنا</h2>
              <p className="text-muted-foreground mb-8">
                سواء كنت عميلاً تبحث عن خدمات أو عاملاً يرغب في الانضمام إلى منصتنا،
                نحن نحب أن نسمع منك.
              </p>
              {isLoadingInfo ? (
                <div className="text-center p-4">جاري تحميل معلومات الاتصال...</div>
              ) : infoError ? (
                <div className="text-center p-4 text-red-500">{infoError}</div>
              ) : (
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <Card key={info.title}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center shrink-0">
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
              )}

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
          <h2 className="mb-4 flex items-center justify-center space-x-2">
            <HelpCircle className="h-6 w-6" />
            <span>الأسئلة الشائعة</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            هل تبحث عن إجابات سريعة؟ تحقق من قسم الأسئلة الشائعة لدينا للأسئلة الشائعة
            حول استخدام سرفانا، التسعير، وكيف تعمل منصتنا.
          </p>
          <Button variant="outline" size="lg" className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>عرض الأسئلة الشائعة</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
