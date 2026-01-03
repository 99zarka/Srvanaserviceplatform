// Mock conversation data
export const mockMessages = [
  {
    id: 1,
    type: 'ai',
    content: 'مرحباً! أنا مساعدك الذكي لحل مشاكل منزلك. كيف يمكنني مساعدتك اليوم؟',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    suggestions: [
      "تسريب ماء",
      "مشاكل كهربائية", 
      "صيانة أجهزة",
      "دهانات وطلاء"
    ]
  },
  {
    id: 2,
    type: 'user',
    content: 'لدي مشكلة في صنبور المطبخ يسرب ماء',
    timestamp: new Date(Date.now() - 4 * 60 * 1000), // 4 minutes ago
  },
  {
    id: 3,
    type: 'ai',
    content: 'أفهم المشكلة! دعنا نبدأ بالتحقق من بعض الأمور...\n\nهل يمكنك وصف لي طبيعة التسريب؟ (قطرات صغيرة، تدفق خفيف، إلخ)',
    timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
  },
  {
    id: 4,
    type: 'user',
    content: 'قطرات صغيرة من المفصل',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  },
  {
    id: 5,
    type: 'ai',
    content: 'شكراً لوصفك! إليك بعض الخطوات التي يمكنك تجربتها أولاً:\n\n1. أغلق ماء الصنبور مؤقتاً\n2. جرب شد المفصل بلطف باستخدام مفتاح ربط\n3. تأكد من أن الغasket ليس تالف\n4. إذا استمر التسريب، قد تحتاج لاستبدال الغasket الداخلي',
    timestamp: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
  },
  {
    id: 6,
    type: 'user',
    content: 'جربت هذه الخطوات لكن المشكلة لا تزال موجودة',
    timestamp: new Date(Date.now() - 30 * 1000), // 30 seconds ago
  },
  {
    id: 7,
    type: 'ai',
    content: 'أفهم! في هذه الحالة، من الأفضل استدعاء فني سباكة متخصص.\n\nهل ترغب في أن أوصي لك بفني سباكة قريب منك؟ كما يمكنني مساعدتك في إنشاء طلب خدمة إذا رغبت.',
    timestamp: new Date(Date.now() - 20 * 1000), // 20 seconds ago
    suggestions: [
      "أوصي لي بفني سباكة",
      "أنشئ طلب خدمة",
      "أحتاج مساعدة في شيء آخر"
    ]
  }
];

// Quick action buttons for the input area
export const quickActions = [
  { label: 'رشح فنيين', icon: '👷' },
  { label: 'أسعارنا التنافسية', icon: '💰' },
  { label: 'طلب خدمة', icon: '📋' },
  { label: 'طلب استشارة', icon: '💬' },
  { label: 'عرض الخدمات', icon: '🛠️' },
  { label: 'فني قريب', icon: '📍' }
];

// AI assistant information
export const assistantInfo = {
  name: 'مساعد سرفانا الذكي',
  description: 'خبير في حل مشاكل المنزل بسرعة ودقة',
  specialties: ['سباكة', 'كهرباء', 'دهانات', 'صيانة'],
  availability: '24/7',
  responseTime: '< 1 دقيقة'
};
