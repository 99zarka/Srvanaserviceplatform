import { CheckCircle, Users, Shield, Award } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function AboutPage() {
  const stats = [
    { label: "المستخدمون النشطون", value: "10,000+", icon: Users },
    { label: "الخدمات المكتملة", value: "50,000+", icon: CheckCircle },
    { label: "العمال الموثقون", value: "2,500+", icon: Shield },
    { label: "رضا العملاء", value: "98%", icon: Award },
  ];

  const values = [
    {
      title: "الثقة والموثوقية",
      description: "يتم التحقق من جميع العمال ومراجعتهم لضمان جودة الخدمة",
      icon: Shield,
    },
    {
      title: "جودة الحرفية",
      description: "تواصل مع المهنيين المهرة الذين يفخرون بعملهم",
      icon: Award,
    },
    {
      title: "سهولة الاتصال",
      description: "منصة بسيطة للعثور على المحترف المناسب لاحتياجاتك وتوظيفه",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">عن سرفانا</h1>
          <p className="max-w-3xl mx-auto text-secondary-foreground/90">
            نحن في مهمة لسد الفجوة بين العمال المهرة والعملاء الذين يحتاجون إلى خدمات منزلية عالية الجودة.
            سرفانا هي أكثر من مجرد منصة - إنها مجتمع مبني على الثقة والجودة والاحترام المتبادل.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">مهمتنا</h2>
              <p className="text-muted-foreground mb-4">
                في سرفانا، نؤمن بأن العثور على محترفين موثوقين للخدمات المنزلية
                يجب ألا يكون صعبًا أو غير مؤكد. منصتنا تربط أصحاب المنازل
                والشركات بالحرفيين المهرة الذين لديهم شغف بعملهم.
              </p>
              <p className="text-muted-foreground mb-4">
                نتحقق بعناية من كل عامل على منصتنا، لضمان امتلاكهم للمهارات،
                الخبرة، والاحترافية التي يستحقها عملاؤنا. سواء كنت بحاجة إلى
                نجار، سباك، كهربائي، أو رسام، سرفانا تجعل من السهل العثور على
                الشخص المناسب للوظيفة.
              </p>
              <p className="text-muted-foreground">
                بالنسبة للعمال، نوفر منصة لعرض مهاراتهم، بناء سمعتهم، وتنمية
                أعمالهم من خلال التواصل مع العملاء الذين يقدرون الحرفية عالية الجودة.
              </p>
            </div>
            <div className="grid gap-6">
              {values.map((value) => (
                <Card key={value.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <value.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6">رؤيتنا</h2>
          <p className="text-muted-foreground mb-6">
            نتصور عالمًا تكون فيه الخدمات المنزلية عالية الجودة متاحة للجميع،
            ويتمتع العمال المهرة بالأدوات التي يحتاجونها للنجاح. من خلال إنشاء
            سوق شفاف وجدير بالثقة، نبني مجتمعات أقوى حيث يتم تقدير الحرفية ومكافأتها.
          </p>
          <p className="text-muted-foreground">
            انضم إلينا في مهمتنا للارتقاء بصناعة الخدمات المنزلية - مشروع واحد في كل مرة.
          </p>
        </div>
      </section>
    </div>
  );
}
