import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, PhoneCall, Send, HelpCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import api from "../utils/api";
import { toast } from "sonner";
import { FaqSection } from "./FaqSection";

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
            content: response.support_phone || "+20 10 1234 5678",
            link: `tel:${response.support_phone || "+201012345678"}`,
          },
          {
            icon: MapPin,
            title: "العنوان",
            content: response.address || "123 شارع النيل، القاهرة، مصر",
            link: "#", // Could be a link to a map if coordinates are provided
          },
          {
            icon: Clock,
            title: "ساعات العمل",
            content: response.working_hours || "من الأحد إلى الخميس: 9:00 صباحًا - 6:00 مساءً",
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
            content: "+20 10 1234 5678",
            link: "tel:+201012345678",
          },
          {
            icon: MapPin,
            title: "العنوان",
            content: "123 شارع النيل، القاهرة، مصر",
            link: "#",
          },
          {
            icon: Clock,
            title: "ساعات العمل",
            content: "من الأحد إلى الخميس: 9:00 صباحًا - 6:00 مساءً",
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
    <div className="min-h-screen bg-neutral-50" dir="rtl">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden text-white" style={{ background: 'linear-gradient(to right, #243a5e, #1A2B4C, #2d4a6e)' }}>
        <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-5"></div>
        <div className="relative z-10 px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center p-4 mb-6 bg-white/10 backdrop-blur-sm rounded-2xl">
            <PhoneCall className="w-12 h-12 text-accent" />
          </div>
          <h1 className="mb-6 text-5xl font-extrabold">
            اتصل بنا
          </h1>
          <p className="max-w-3xl mx-auto text-xl leading-relaxed text-white/90">
            هل لديك أسئلة أو تحتاج إلى مساعدة؟ نحن هنا من أجلك. تواصل معنا وسيقوم فريقنا
            بالرد عليك في أقرب وقت ممكن.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-white/80">دعم متواصل</div>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">10k+</div>
              <div className="text-sm text-white/80">عميل راضٍ</div>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">&lt;2h</div>
              <div className="text-sm text-white/80">وقت الرد</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-xl">
                <div className="p-6 border-b-2 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <h2 className="flex items-center gap-3 text-3xl font-bold text-primary">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Send className="w-6 h-6 text-primary" />
                    </div>
                    <span>أرسل لنا رسالة</span>
                  </h2>
                  <p className="mt-2 text-neutral-600">املأ النموذج وسنتواصل معك خلال 24 ساعة</p>
                </div>
                <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="block mb-2 text-sm font-bold text-neutral-700">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الكامل"
                    required
                    className="h-12 transition-all border-2 rounded-lg border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="block mb-2 text-sm font-bold text-neutral-700">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    className="h-12 transition-all border-2 rounded-lg border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="block mb-2 text-sm font-bold text-neutral-700">الموضوع</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="كيف يمكننا مساعدتك؟"
                    required
                    className="h-12 transition-all border-2 rounded-lg border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="block mb-2 text-sm font-bold text-neutral-700">الرسالة</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="اكتب رسالتك هنا... أخبرنا بالتفاصيل"
                    rows={6}
                    required
                    className="transition-all border-2 rounded-lg resize-none border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="flex items-center justify-center w-full gap-3 text-lg font-semibold text-white transition-all duration-300 shadow-lg bg-primary hover:bg-primary-600 h-14 hover:shadow-xl group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      <span>إرسال الرسالة</span>
                    </>
                  )}
                </Button>
                {submitError && (
                  <div className="p-4 border-2 rounded-lg bg-danger/10 border-danger/30">
                    <p className="text-sm font-medium text-danger">{submitError}</p>
                  </div>
                )}
              </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="p-8 bg-white border shadow-xl rounded-2xl border-primary/10">
                <h2 className="mb-3 text-3xl font-bold text-primary">تواصل معنا</h2>
                <p className="text-lg leading-relaxed text-neutral-600">
                  سواء كنت عميلاً تبحث عن خدمات أو فنياً يرغب في الانضمام إلى منصتنا،
                  نحن نحب أن نسمع منك.
                </p>
              </div>

              {isLoadingInfo ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-neutral-600">جاري تحميل معلومات الاتصال...</p>
                  </CardContent>
                </Card>
              ) : infoError ? (
                <Card className="border-2 border-danger/30 bg-danger/5">
                  <CardContent className="p-8 text-center">
                    <p className="font-medium text-danger">{infoError}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <Card 
                      key={info.title}
                      className="transition-all duration-300 border-0 shadow-lg hover:shadow-xl group"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center transition-transform duration-300 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shrink-0 group-hover:scale-110">
                            <info.icon className="w-7 h-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="mb-2 text-lg font-bold text-primary">{info.title}</h4>
                            {info.link !== "#" ? (
                              <a
                                href={info.link}
                                className="text-base font-medium transition-colors text-neutral-700 hover:text-primary"
                              >
                                {info.content}
                              </a>
                            ) : (
                              <p className="text-base text-neutral-700">{info.content}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Egyptian-specific notice */}
              <Card className="border-2 shadow-lg border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-primary">ملاحظة مهمة</h3>
                      <p className="leading-relaxed text-neutral-700">
                        هذه الخدمة متاحة حالياً فقط للمقيمين في مصر. للحصول على الدعم باللغة العربية، 
                        يرجى الاتصال بنا على الرقم المذكور أعلاه أو إرسال بريد إلكتروني إلينا.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center rounded-lg aspect-video bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl">
                      <MapPin className="w-16 h-16 mx-auto mb-3 text-primary" />
                      <p className="font-medium text-neutral-700">خريطة الموقع قريباً</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />
    </div>
  );
}
