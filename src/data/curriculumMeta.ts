import { CEFRLevel, ModuleId } from '../types/academy';
import { getCEFRLevelImage, getModuleImage } from '../utils/assetLoader';

export interface CEFRLevelMeta {
  level: CEFRLevel;
  order: number;
  titleAr: string;
  titleEn: string;
  stageAr: string;
  immersionModeAr: string;
  descriptionAr: string;
  cambridgeRef: string;
  illustrationPath: string;
}

export const CEFR_LEVELS: CEFRLevelMeta[] = [
  {
    level: 'Pre-A1',
    order: 1,
    titleAr: 'التمهيدي التأسيسي',
    titleEn: 'Pre-A1 Foundation',
    stageAr: 'المرحلة الابتدائية المبكرة / المبتدئ التام',
    immersionModeAr: 'شرح عربي كامل مع أمثلة إنجليزية أساسية',
    descriptionAr:
      'التعرف على الحروف والأصوات والكلمات اليومية الأساسية وتكوين جمل بسيطة جداً.',
    cambridgeRef: 'Pre A1 Starters',
    illustrationPath: getCEFRLevelImage('Pre-A1'),
  },
  {
    level: 'A1',
    order: 2,
    titleAr: 'المبتدئ الأول',
    titleEn: 'A1 Beginner',
    stageAr: 'المرحلة الابتدائية',
    immersionModeAr: 'شرح عربي واضح مع تدريبات إنجليزية متزايدة',
    descriptionAr:
      'التعريف بالنفس والأسرة والمدرسة، واستخدام الأزمنة الأساسية في مواقف يومية مألوفة.',
    cambridgeRef: 'A1 Movers',
    illustrationPath: getCEFRLevelImage('A1'),
  },
  {
    level: 'A2',
    order: 3,
    titleAr: 'الأساسي المتقدم',
    titleEn: 'A2 Elementary',
    stageAr: 'نهاية الابتدائية وبداية المتوسطة',
    immersionModeAr: 'شرح عربي مع مصطلحات وتدريبات إنجليزية موسعة',
    descriptionAr:
      'التحدث عن الماضي والمستقبل، وفهم النصوص القصيرة والمحادثات اليومية بثقة.',
    cambridgeRef: 'A2 Flyers / A2 Key for Schools',
    illustrationPath: getCEFRLevelImage('A2'),
  },
  {
    level: 'A2+',
    order: 4,
    titleAr: 'فوق الأساسي',
    titleEn: 'A2+ Pre-Intermediate',
    stageAr: 'المرحلة المتوسطة',
    immersionModeAr: 'تدرج متوازن بين الشرح الإنجليزي والدعم العربي',
    descriptionAr:
      'الربط بين الأزمنة، استخدام الأفعال المساعدة، وكتابة فقرات ورسائل منظمة.',
    cambridgeRef: 'A2 Key for Schools (Upper)',
    illustrationPath: getCEFRLevelImage('A2+'),
  },
  {
    level: 'B1',
    order: 5,
    titleAr: 'المتوسط المستقل',
    titleEn: 'B1 Intermediate',
    stageAr: 'المرحلة المتوسطة العليا',
    immersionModeAr: 'محتوى إنجليزي رئيسي مع دعم عربي عند الحاجة',
    descriptionAr:
      'فهم المقالات التعليمية، التعبير عن الآراء، واستخدام الجمل الشرطية والمبني للمجهول.',
    cambridgeRef: 'B1 Preliminary for Schools',
    illustrationPath: getCEFRLevelImage('B1'),
  },
  {
    level: 'B2',
    order: 6,
    titleAr: 'فوق المتوسط (المرحلة الإعدادية)',
    titleEn: 'B2 Upper-Intermediate',
    stageAr: 'المرحلة الإعدادية',
    immersionModeAr: 'انغماس إنجليزي متكامل مع إرشاد عربي أكاديمي عند الحاجة',
    descriptionAr:
      'مسار متكامل لطلاب المرحلة الإعدادية يركز على التفكير النقدي، الكتابة الجدلية والأكاديمية، التراكيب الشرطية المتقدمة، وفهم المحاضرات العلمية.',
    cambridgeRef: 'B2 First for Schools',
    illustrationPath: getCEFRLevelImage('B2'),
  },
];

export interface BadgeDefinition {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  criteriaTextAr: string;
  targetType: 'lessons' | 'points' | 'streak' | 'placement' | 'vocab';
  threshold: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'badge_first_step',
    titleAr: 'الخطوة الأولى',
    titleEn: 'First Step',
    descriptionAr: 'إكمال أول درس بنجاح في الأكاديمية.',
    criteriaTextAr: 'أكمل 1 درس',
    targetType: 'lessons',
    threshold: 1,
  },
  {
    id: 'badge_placement_explorer',
    titleAr: 'مكتشف المستوى',
    titleEn: 'Pathfinder',
    descriptionAr: 'إتمام اختبار تحديد المستوى وتخصيص المسار.',
    criteriaTextAr: 'أكمل اختبار تحديد المستوى',
    targetType: 'placement',
    threshold: 1,
  },
  {
    id: 'badge_vocab_collector',
    titleAr: 'جامع المفردات',
    titleEn: 'Word Collector',
    descriptionAr: 'مراجعة وإتقان 15 مفردة عبر نظام التكرار المتباعد.',
    criteriaTextAr: 'تعلّم 15 كلمة',
    targetType: 'vocab',
    threshold: 15,
  },
  {
    id: 'badge_steady_scholar',
    titleAr: 'الطالب المثابر',
    titleEn: 'Steady Scholar',
    descriptionAr: 'إكمال 5 دروس في مختلف المهارات.',
    criteriaTextAr: 'أكمل 5 دروس',
    targetType: 'lessons',
    threshold: 5,
  },
  {
    id: 'badge_streak_3',
    titleAr: 'سلسلة التزام 3 أيام',
    titleEn: '3-Day Streak',
    descriptionAr: 'المواظبة على التعلم لمدة 3 أيام متتالية.',
    criteriaTextAr: 'سلسلة 3 أيام',
    targetType: 'streak',
    threshold: 3,
  },
  {
    id: 'badge_academy_star',
    titleAr: 'نجم الأكاديمية',
    titleEn: 'Academy Star',
    descriptionAr: 'جمع 500 نقطة تعليمية من الدروس والتدريبات.',
    criteriaTextAr: 'اجمع 500 نقطة',
    targetType: 'points',
    threshold: 500,
  },
];

export interface ModuleMeta {
  id: ModuleId;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  route: string;
  illustrationPath: string;
}

export const ACADEMY_MODULES: ModuleMeta[] = [
  {
    id: 'vocabulary',
    titleAr: 'بناء المفردات',
    titleEn: 'Vocabulary Builder',
    descriptionAr: '16 محوراً حياتياً وعلمياً مع النطق والأمثلة ونظام المراجعة المتباعدة.',
    route: '/modules/vocabulary',
    illustrationPath: getModuleImage('vocabulary'),
  },
  {
    id: 'grammar',
    titleAr: 'أكاديمية القواعد',
    titleEn: 'Grammar Academy',
    descriptionAr: 'منهج متدرج من الحروف والضمائر حتى الجمل الشرطية والمبني للمجهول.',
    route: '/modules/grammar',
    illustrationPath: getModuleImage('grammar'),
  },
  {
    id: 'reading',
    titleAr: 'أكاديمية القراءة',
    titleEn: 'Reading Academy',
    descriptionAr: 'قصص وحوارات ونصوص معرفية مع دعم المفردات وأسئلة الفهم.',
    route: '/modules/reading',
    illustrationPath: getModuleImage('reading'),
  },
  {
    id: 'listening',
    titleAr: 'أكاديمية الاستماع',
    titleEn: 'Listening Academy',
    descriptionAr: 'تدريبات استماع تفاعلية مع التحكم بالسرعة وأسئلة الكلمة المفقودة.',
    route: '/modules/listening',
    illustrationPath: getModuleImage('listening'),
  },
  {
    id: 'speaking',
    titleAr: 'أكاديمية المحادثة',
    titleEn: 'Speaking Academy',
    descriptionAr: 'نطق الكلمات والجمل ووصف الصور وتمثيل الأدوار مع بديل ذاتي متكامل.',
    route: '/modules/speaking',
    illustrationPath: getModuleImage('speaking'),
  },
  {
    id: 'writing',
    titleAr: 'أكاديمية الكتابة',
    titleEn: 'Writing Academy',
    descriptionAr: 'التدرج من بناء الجملة إلى كتابة الفقرات والرسائل والقصص القصيرة.',
    route: '/modules/writing',
    illustrationPath: getModuleImage('writing'),
  },
  {
    id: 'exams',
    titleAr: 'الاستعداد للاختبارات',
    titleEn: 'Exam Preparation',
    descriptionAr: 'نماذج تدريبية أصلية متوافقة مع أهداف CEFR ومهارات المدارس.',
    route: '/modules/exams',
    illustrationPath: getModuleImage('exams'),
  },
  {
    id: 'audio_lab',
    titleAr: 'المختبر الصوتي والنطق',
    titleEn: 'Pronunciation & Audio Lab',
    descriptionAr: 'مقارنة الأصوات وتحليل النطق ومتابعة دقة التلفظ خطوة بخطوة.',
    route: '/audio-lab',
    illustrationPath: getModuleImage('audio_lab'),
  },
];

export const CURRICULUM_DISCLAIMER_AR =
  'ملاحظة تربوية: يستند تصميم المناهج والاختبارات التدريبية إلى الإطار الأوروبي المرجعي (CEFR) وممارسات تعليم الإنجليزية كلغة إضافية (EAL) وأهداف اختبارات المدارس الدولية للمراحل الابتدائية والمتوسطة والإعدادية (Starters, Movers, Flyers, Key, Preliminary, B2 First for Schools) كمرجع أكاديمي، ولا يدّعي هذا التطبيق اعتماداً رسمياً من أي جهة خارجية؛ جميع الدروس والأسئلة أصلية بالكامل.';
