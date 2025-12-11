import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Clock,
  CreditCard,
  Rocket,
  Globe,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const iconMap = {
  clock: Clock,
  "credit-card": CreditCard,
  truck: Rocket,
  globe: Globe,
  package: Package,
  "shield-check": ShieldCheck,
};

const faqItems = [
  {
    id: "item-1",
    icon: "clock",
    question: "ما هي أوقات عمل سيرفانا؟",
    answer:
      "يعمل فريق دعم سيرفانا طوال أيام الأسبوع من الساعة 9:00 صباحًا حتى 8:00 مساءً، ما عدا يوم الجمعة. وفي حال وجود عطلات رسمية، يتم الإعلان عن المواعيد الجديدة على موقعنا الإلكتروني.",
  },
  {
    id: "item-2",
    icon: "credit-card",
    question: "كيف تعمل اشتراكات سيرفانا والدفع التلقائي؟",
    answer:
      "يتم خصم رسوم الاشتراك تلقائيًا من وسيلة الدفع الافتراضية في حسابك في نفس اليوم من كل شهر أو سنة، حسب نوع الخطة التي اخترتها. يمكنك تعديل معلومات الدفع أو مراجعة الفواتير من لوحة التحكم في حسابك.",
  },
  {
    id: "item-3",
    icon: "truck",
    question: "هل يمكن تسريع تنفيذ مشروعي؟",
    answer:
      "نعم، يمكنك اختيار أولوية التنفيذ مقابل رسوم إضافية. تتيح لك هذه الخدمة تسليم المشروع خلال فترة أقصر من الزمن المتفق عليه مسبقًا، بشرط توفر الموارد التقنية المناسبة.",
  },
  {
    id: "item-4",
    icon: "globe",
    question: "هل تقدم سيرفانا دعمًا بلغات متعددة؟",
    answer:
      "نعم، يوفر فريق سيرفانا دعمًا فنيًا باللغتين العربية والإنجليزية حاليًا، وذلك عبر البريد الإلكتروني أو المحادثة المباشرة داخل الموقع. نحن نعمل على إضافة لغات أخرى قريبًا لخدمة عملائنا حول العالم.",
  },
  {
    id: "item-5",
    icon: "package",
    question: "كيف يمكنني متابعة حالة طلبي أو مشروعي؟",
    answer:
      "بمجرد بدء تنفيذ طلبك، ستتلقى إشعارات عبر البريد الإلكتروني ولوحة التحكم داخل حسابك حول حالة التقدم في المشروع. يمكنك أيضًا التواصل مباشرة مع فريق الدعم من خلال صفحة 'طلباتي'.",
  },
  {
    id: "item-6",
    icon: "shield-check",
    question: "هل بياناتي ومشاريعي آمنة على المنصة؟",
    answer:
      "نعم، نولي أهمية كبيرة لحماية خصوصيتك. يتم تخزين جميع البيانات باستخدام بروتوكولات أمان حديثة، ولا يتم مشاركتها مع أي طرف ثالث دون موافقتك الصريحة.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-background py-16 md:py-24 w-full text-foreground overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6 container">
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div className="md:w-1/3">
            <div>
              <h4 className="text-lg text-primary font-semibold mb-2 tracking-wider">
                الأسئلة الشائعة
              </h4>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                ما الأسئلة التي تدور في ذهنك؟
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                لم تجد ما تبحث عنه؟ تواصل مع&nbsp;
                <Link
                  to="/contact"
                  className="text-primary font-medium hover:underline"
                >
                  فريق دعم سيرفانا
                </Link>
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-4"
              defaultValue={faqItems[0].id}
            >
              {faqItems.map((item) => {
                const IconComponent = iconMap[item.icon];
                return (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="bg-card shadow-sm rounded-lg border px-4 last:border-b"
                  >
                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex size-6">
                          {IconComponent && (
                            <IconComponent className="m-auto size-4" />
                          )}
                        </div>
                        <h3 className="font-medium text-card-foreground">
                          {item.question}
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <div className="px-9">
                        <p className="text-muted-foreground">{item.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
