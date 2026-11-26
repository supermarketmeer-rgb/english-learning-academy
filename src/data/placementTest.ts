import { PlacementQuestion } from '../types/academy';

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // Pre-A1 & A1 Vocabulary
  {
    id: 'pt_v1',
    skill: 'vocabulary',
    level: 'Pre-A1',
    type: 'mcq',
    promptAr: 'اختر الكلمة الإنجليزية التي تعني "كتاب":',
    options: ['Book', 'Chair', 'Window', 'Apple'],
    correctAnswer: 'Book',
    weight: 1,
  },
  {
    id: 'pt_v2',
    skill: 'vocabulary',
    level: 'A1',
    type: 'mcq',
    promptAr: 'ما الكلمة المناسبة لإكمال الجملة؟ "My father works in a ____." (والدي يعمل في مستشفى)',
    options: ['hospital', 'kitchen', 'pencil', 'weather'],
    correctAnswer: 'hospital',
    weight: 1.5,
  },
  {
    id: 'pt_v3',
    skill: 'vocabulary',
    level: 'A2+',
    type: 'mcq',
    promptAr: 'اختر المعنى الأقرب لكلمة "responsible":',
    options: ['مسؤول ويمكن الاعتماد عليه', 'متأخر دائماً', 'سريع الغضب', 'غير مهتم'],
    correctAnswer: 'مسؤول ويمكن الاعتماد عليه',
    weight: 2,
  },
  {
    id: 'pt_v4',
    skill: 'vocabulary',
    level: 'B1',
    type: 'mcq',
    promptAr: 'أكمل الجملة بالمفردة الدقيقة: "Solar energy is a ____ source of power that does not run out."',
    options: ['renewable', 'fragile', 'crowded', 'temporary'],
    correctAnswer: 'renewable',
    weight: 2.5,
  },

  // Grammar across levels
  {
    id: 'pt_g1',
    skill: 'grammar',
    level: 'Pre-A1',
    type: 'mcq',
    promptAr: 'اختر الفعل الصحيح مع الضمير: "She ____ a good student."',
    options: ['is', 'are', 'am', 'be'],
    correctAnswer: 'is',
    weight: 1,
  },
  {
    id: 'pt_g2',
    skill: 'grammar',
    level: 'A1',
    type: 'mcq',
    promptAr: 'اختر الصيغة الصحيحة للمضارع البسيط: "Omar ____ football every Friday."',
    options: ['plays', 'play', 'playing', 'played'],
    correctAnswer: 'plays',
    weight: 1.5,
  },
  {
    id: 'pt_g3',
    skill: 'grammar',
    level: 'A2',
    type: 'mcq',
    promptAr: 'اختر الزمن الماضي الصحيح: "Yesterday, we ____ to the science museum."',
    options: ['went', 'go', 'going', 'will go'],
    correctAnswer: 'went',
    weight: 2,
  },
  {
    id: 'pt_g4',
    skill: 'grammar',
    level: 'B1',
    type: 'mcq',
    promptAr: 'أكمل الجملة الشرطية: "If it rains tomorrow, we ____ the picnic indoors."',
    options: ['will hold', 'held', 'would held', 'holding'],
    correctAnswer: 'will hold',
    weight: 2.5,
  },

  // Listening
  {
    id: 'pt_l1',
    skill: 'listening',
    level: 'A1',
    type: 'listening_mcq',
    promptAr: 'استمع إلى الجملة الصوتية، ثم اختر ما قاله المتحدث:',
    audioScriptEn: 'My sister goes to school at seven thirty in the morning.',
    options: [
      'She goes to school at 7:30 AM.',
      'She goes to the market at 7:30 PM.',
      'She reads a book at 8:00 AM.',
      'She plays tennis on Friday.',
    ],
    correctAnswer: 'She goes to school at 7:30 AM.',
    weight: 1.5,
  },
  {
    id: 'pt_l2',
    skill: 'listening',
    level: 'A2+',
    type: 'listening_mcq',
    promptAr: 'استمع إلى الرسالة الصوتية، ثم حدد الغرض الرئيسي منها:',
    audioScriptEn:
      'Please remember to bring your science notebook tomorrow because we are doing an experiment on plants.',
    options: [
      'تذكير بإحضار دفتر العلوم لتجربة النباتات غداً',
      'إلغاء حصة العلوم الأسبوع القادم',
      'طلب شراء كتب جديدة من المكتبة',
      'تغيير موعد الاختبار النهائي',
    ],
    correctAnswer: 'تذكير بإحضار دفتر العلوم لتجربة النباتات غداً',
    weight: 2,
  },

  // Reading
  {
    id: 'pt_r1',
    skill: 'reading',
    level: 'A1',
    type: 'mcq',
    promptAr: 'اقرأ الفقرة القصيرة ثم أجب عن السؤال:',
    passageEn:
      'Noura lives in a quiet town with her parents and two brothers. Every morning, she waters the flowers in the garden before walking to school.',
    options: [
      'She waters the flowers in the garden.',
      'She rides a train to another city.',
      'She cooks dinner before school.',
      'She lives alone in a big city.',
    ],
    correctAnswer: 'She waters the flowers in the garden.',
    weight: 1.5,
  },
  {
    id: 'pt_r2',
    skill: 'reading',
    level: 'B1',
    type: 'mcq',
    promptAr: 'اقرأ النص التعليمي ثم اختر الاستنتاج الصحيح:',
    passageEn:
      'Although public libraries have existed for centuries, modern libraries now offer digital e-books and quiet study rooms. Students who visit libraries regularly often improve both their reading speed and research skills.',
    options: [
      'Modern libraries combine traditional reading spaces with digital resources.',
      'Public libraries have stopped lending paper books completely.',
      'Students only visit libraries to play online games.',
      'Reading speed cannot be improved by visiting libraries.',
    ],
    correctAnswer: 'Modern libraries combine traditional reading spaces with digital resources.',
    weight: 2.5,
  },

  // Sentence Construction
  {
    id: 'pt_s1',
    skill: 'sentence_construction',
    level: 'A1',
    type: 'reorder',
    promptAr: 'رتّب الكلمات التالية لتكوين جملة إنجليزية صحيحة (أنا أقرأ كتاباً كل يوم):',
    wordsToOrder: ['every day', 'read', 'I', 'a book'],
    correctAnswer: 'I read a book every day',
    weight: 1.5,
  },
  {
    id: 'pt_s2',
    skill: 'sentence_construction',
    level: 'A2+',
    type: 'reorder',
    promptAr: 'رتّب الكلمات لتكوين سؤال صحيح بالزمن الماضي:',
    wordsToOrder: ['you', 'did', 'finish', 'when', 'your homework?'],
    correctAnswer: 'when did you finish your homework?',
    weight: 2,
  },

  // Writing Structure & Mechanics
  {
    id: 'pt_w1',
    skill: 'writing',
    level: 'A2',
    type: 'writing_check',
    promptAr: 'اختر الجملة المكتوبة بعلامات ترقيم وقواعد كتابية صحيحة لافتتاح رسالة رسمية لمعلمك:',
    options: [
      'Dear Mr. Tariq, Thank you for helping our class with the project.',
      'dear mr tariq thank you for helping our class with the project',
      'Mr tariq. thanks helping project our class,',
      'Hi teacher!! project help thank u.',
    ],
    correctAnswer: 'Dear Mr. Tariq, Thank you for helping our class with the project.',
    weight: 2,
  },
  {
    id: 'pt_w2',
    skill: 'writing',
    level: 'B1',
    type: 'writing_check',
    promptAr: 'أي جملة تستخدم رابطاً منطقياً صحيحاً لربط السبب بالنتيجة؟',
    options: [
      'Because we practiced every afternoon, our English presentation was clear and confident.',
      'Because we practiced every afternoon, but our presentation clear.',
      'Although we practiced every afternoon, therefore we was confident.',
      'So we practiced every afternoon because our presentation was clear.',
    ],
    correctAnswer:
      'Because we practiced every afternoon, our English presentation was clear and confident.',
    weight: 2.5,
  },

  // Preparatory B2 Check
  {
    id: 'pt_b2_g1',
    skill: 'grammar',
    level: 'B2',
    type: 'mcq',
    promptAr: 'أكمل الجملة بالتركيب الشرطي الدقيق (الشرط الثالث): "If the students ____ earlier, they would have finished the research on time."',
    options: ['had started', 'started', 'would start', 'have started'],
    correctAnswer: 'had started',
    weight: 3,
  },
  {
    id: 'pt_b2_v1',
    skill: 'vocabulary',
    level: 'B2',
    type: 'mcq',
    promptAr: 'اختر الفعل الأكاديمي الأنسب: "Before reaching a conclusion, researchers carefully ____ all collected data."',
    options: ['evaluate', 'postpone', 'borrow', 'hesitate'],
    correctAnswer: 'evaluate',
    weight: 3,
  },

  // Optional Speaking
  {
    id: 'pt_sp1',
    skill: 'speaking',
    level: 'A1',
    type: 'speaking_optional',
    promptAr:
      'اختياري (حسب دعم المتصفح): استمع للجملة التالية ثم انطقها بصوت واضح، أو اختر التقييم الذاتي:',
    audioScriptEn: 'I like learning English step by step.',
    correctAnswer: 'I like learning English step by step',
    weight: 1,
  },
];
