import React, { useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

// أيقونات - using lucide-react instead of radix
import {
  ArrowLeft,
  Wrench,
  Droplets,
  Zap,
  Paintbrush,
  Plus,
} from "lucide-react";

// الصور - placeholder images
const acCleaningImg = "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800";
const plumbingImg = "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800";
const electricalImg = "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800";
const paintingImg = "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800";

// --- بيانات الخدمات ---
const quickServicesData = [
  {
    id: "plumbing",
    title: "السباكة",
    description:
      "الأعلى طلبًا يوميًا — حلول سريعة لجميع مشاكل السباكة في منزلك.",
    icon: Droplets,
    image: plumbingImg,
    features: [
      { name: "إصلاح تسريبات المياه", slug: "/services" },
      { name: "كشف وتسليك انسداد", slug: "/services" },
      { name: "تغيير المحابس والخلاطات", slug: "/services" },
      { name: "تركيب أحواض وتواليت", slug: "/services" },
      { name: "إصلاح مواسير مكسورة", slug: "/services" },
      { name: "صيانة السخانات", slug: "/services" },
      { name: "تركيب السخانات", slug: "/services" },
      { name: "كشف تسريب حراري", slug: "/services" },
    ],
  },
  {
    id: "electrical",
    title: "الكهرباء",
    description: "إصلاح وتركيب كهربائي آمن وموثوق لمنزلك ومكتبك.",
    icon: Zap,
    image: electricalImg,
    features: [
      { name: "إصلاح أعطال كهرباء", slug: "/services" },
      { name: "تغيير مفاتيح وبرايز", slug: "/services" },
      { name: "تركيب لمبات وسبوتات", slug: "/services" },
      { name: "تركيب نجف", slug: "/services" },
      { name: "تمديد كابلات", slug: "/services" },
      { name: "تركيب أجهزة كهربائية", slug: "/services" },
      { name: "إصلاح لوحة الكهرباء", slug: "/services" },
      { name: "كشف الأحمال ومشاكل الأمان", slug: "/services" },
    ],
  },
  {
    id: "hvac",
    title: "التكييف",
    description: "صيانة وتركيب وإصلاح جميع أنواع أجهزة التكييف.",
    icon: Wrench,
    image: acCleaningImg,
    features: [
      { name: "صيانة التكييف", slug: "/services" },
      { name: "تنظيف وغسيل التكييف", slug: "/services" },
      { name: "شحن فريون", slug: "/services" },
      { name: "تركيب تكييف سبليت", slug: "/services" },
      { name: "تركيب تكييف شباك", slug: "/services" },
      { name: "صيانة التكييف المركزي", slug: "/services" },
      { name: "إصلاح أعطال التكييف", slug: "/services" },
    ],
  },
  {
    id: "appliance-repair",
    title: "صيانة الأجهزة",
    description: "إصلاح وصيانة جميع الأجهزة الكهربائية المنزلية.",
    icon: Wrench,
    image: electricalImg,
    features: [
      { name: "صيانة الثلاجات", slug: "/services" },
      { name: "صيانة الديب فريزر", slug: "/services" },
      { name: "صيانة الغسالات", slug: "/services" },
      { name: "صيانة المجففات", slug: "/services" },
      { name: "صيانة الميكروويف", slug: "/services" },
      { name: "صيانة البوتاجازات والأفران", slug: "/services" },
      { name: "صيانة السخانات", slug: "/services" },
      { name: "صيانة المكانس", slug: "/services" },
      { name: "إصلاح الأجهزة الصغيرة", slug: "/services" },
      { name: "خدمات الطوارئ للأجهزة", slug: "/services" },
    ],
  },
  {
    id: "carpentry",
    title: "النجارة والحدادة",
    description: "أعمال نجارة وحدادة خفيفة لمنزلك ومكتبك.",
    icon: Paintbrush,
    image: paintingImg,
    features: [
      { name: "إصلاح أبواب خشب", slug: "/services" },
      { name: "تعديل وضبط مفصلات", slug: "/services" },
      { name: "تركيب غرف نوم", slug: "/services" },
      { name: "تركيب مطابخ جاهزة", slug: "/services" },
      { name: "تفصيل دواليب", slug: "/services" },
      { name: "تجميع أثاث", slug: "/services" },
      { name: "تصليح شبابيك خشب", slug: "/services" },
      { name: "تركيب أرفف وخزائن", slug: "/services" },
      { name: "تغييرات سريعة للديكور الخشبي", slug: "/services" },
    ],
  },
  {
    id: "handyman",
    title: "خدمات عامة",
    description: "أعمال تركيب وصيانة سريعة لجميع احتياجاتك المنزلية.",
    icon: Wrench,
    image: plumbingImg,
    features: [
      { name: "تركيب ستائر", slug: "/services" },
      { name: "تركيب شاشة", slug: "/services" },
      { name: "تعليق مرايا", slug: "/services" },
      { name: "تركيب أرفف", slug: "/services" },
      { name: "فك/تركيب غرف نوم", slug: "/services" },
      { name: "نقل أثاث وتركيبه", slug: "/services" },
      { name: "إصلاحات منزلية بسيطة", slug: "/services" },
      { name: "تبديل أكواد / مفاتيح", slug: "/services" },
      { name: "تركيب دش وريسيفر", slug: "/services" },
      { name: "إصلاح أبواب وشبابيك بسيطة", slug: "/services" },
    ],
  },
  {
    id: "roofing",
    title: "الأسقف والعزل",
    description: "حلول متكاملة لعزل وإصلاح الأسطح والأسقف.",
    icon: Droplets,
    image: acCleaningImg,
    features: [
      { name: "إصلاح تسريبات السقف", slug: "/services" },
      { name: "عزل الأسطح (مائي/حراري)", slug: "/services" },
      { name: "تركيب أسقف جديدة", slug: "/services" },
      { name: "أسقف قرميد", slug: "/services" },
      { name: "أسقف معدنية", slug: "/services" },
      { name: "دهان الأسطح", slug: "/services" },
      { name: "تنظيف الأسطح", slug: "/services" },
      { name: "سد الشقوق والفواصل", slug: "/services" },
      { name: "تركيب مظلات على الأسطح", slug: "/services" },
    ],
  },
];

const ServiceButton = memo(({ service, isSelected, onSelect }) => (
  <button
    onClick={() => onSelect(service)}
    onMouseEnter={() => onSelect(service)}
    className={cn(
      "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 ease-in-out transform hover-scale",
      isSelected ? "text-secondary" : "text-primary hover:text-secondary"
    )}
    aria-label={service.title}
  >
    <service.icon className="h-7 w-7 md:h-8 md:w-8" />
    <span className="text-xs md:text-sm font-semibold text-center leading-tight">
      {service.title}
    </span>
  </button>
));

ServiceButton.displayName = "ServiceButton";

export function FeaturedQuickServices() {
  const [selectedService, setSelectedService] = useState(quickServicesData[0]);

  const handleSelectService = useCallback((service) => {
    setSelectedService(service);
  }, []);

  return (
    <section className="w-full py-16 md:py-24 bg-background overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h4 className="text-md text-primary font-semibold mb-2 text-lg">
            خدمات سريعة
          </h4>
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-foreground leading-tight">
            ما الخدمة التي تبحث عنها؟
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            الحل الأمثل للخدمات اليومية السريعة.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {quickServicesData.map((service) => (
            <ServiceButton
              key={service.id}
              service={service}
              isSelected={selectedService.id === service.id}
              onSelect={handleSelectService}
            />
          ))}
          <Link to="/services">
            <button
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 ease-in-out transform text-muted-foreground hover:text-secondary hover-scale"
              aria-label="المزيد"
            >
              <Plus className="h-7 w-7 md:h-8 md:w-8" />
              <span className="text-xs md:text-sm font-semibold text-center leading-tight">
                تصفح المزيد
              </span>
            </button>
          </Link>
        </div>

        <Separator className="mb-10 mt-5 border-muted" />

        <div className="flex flex-col lg:flex-row gap-8 items-start mt-10 min-h-[350px]">
          <div className="w-full lg:w-7/12">
            <div
              key={selectedService.id + "-image"}
              className="overflow-hidden rounded-xl shadow-lg fade-in"
            >
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className="w-full h-full object-cover aspect-video"
                loading="lazy"
              />
            </div>
          </div>

          <div className="w-full lg:w-5/12 text-right flex flex-col items-start lg:items-end" dir="rtl">
            <div key={selectedService.id + "-details"} className="w-full fade-in">
              <h3 className="mb-2 text-3xl font-bold text-foreground">
                {selectedService.title}
              </h3>
              <p className="mb-6 text-base text-muted-foreground">
                {selectedService.description}
              </p>

              {/* --- badges --- */}
              <div className="flex flex-wrap justify-start gap-2 mb-6">
                {(selectedService.features || []).map((feature) => (
                  <Link to={feature.slug} key={feature.name}>
                    <Badge
                      variant="outline"
                      className={cn(
                        "cursor-pointer rounded-md bg-primary/5 text-primary border-primary/50 transition-colors duration-200 hover-scale",
                        "hover:bg-primary/10 hover:border-primary"
                      )}
                    >
                      {feature.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              <div className="mt-8 max-w-xs">
                <Button size="lg" variant="secondary" className="hover-lift">
                  احجز الخدمة
                  <ArrowLeft className="h-5 w-5 mr-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
