import { ListeningLesson } from '../types/academy';

export const LISTENING_LESSONS: ListeningLesson[] = [
  {
    id: 'ls_classroom_words',
    level: 'Pre-A1',
    categoryAr: 'كلمات ونطق',
    titleEn: 'Listening for School Objects',
    titleAr: 'الاستماع لأدوات الصف الدراسي',
    instructionsAr: 'اضغط على زر التشغيل للاستماع إلى الجمل، ثم أكمل الفراغات وأجب عن الأسئلة.',
    scriptLines: [
      {
        speaker: 'Teacher',
        textEn: 'Good morning, class! Please put your notebook on the desk.',
        textAr: 'صباح الخير أيها الصف! من فضلكم ضعوا دفاتركم على الطاولة.',
      },
      {
        speaker: 'Teacher',
        textEn: 'Open your blue book to page twelve and take a sharp pencil.',
        textAr: 'افتحوا كتابكم الأزرق على الصفحة الثانية عشرة وخذوا قلم رصاص مبري.',
      },
    ],
    missingWordExercises: [
      {
        id: 'ls1_mw1',
        sentenceBefore: 'Please put your',
        sentenceAfter: 'on the desk.',
        missingWord: 'notebook',
        options: ['notebook', 'window', 'apple', 'jacket'],
        hintAr: 'أداة نكتب فيها الملاحظات.',
      },
      {
        id: 'ls1_mw2',
        sentenceBefore: 'Open your blue book to page',
        sentenceAfter: '.',
        missingWord: 'twelve',
        options: ['twelve', 'twenty', 'two', 'ten'],
        hintAr: 'رقم الصفحة التي ذكرتها المعلمة.',
      },
    ],
    comprehensionQuestions: [
      {
        id: 'ls1_q1',
        type: 'mcq',
        promptAr: 'ما لون الكتاب الذي طلبت المعلمة فتحه؟',
        options: ['Blue', 'Green', 'Yellow', 'Red'],
        correctAnswer: 'Blue',
        explanationAr: 'ذكرت المعلمة: Open your blue book.',
      },
    ],
  },
  {
    id: 'ls_at_the_bookshop',
    level: 'A1',
    categoryAr: 'محادثة قصيرة',
    titleEn: 'Buying a Dictionary at the Bookshop',
    titleAr: 'شراء قاموس من المكتبة',
    instructionsAr: 'استمع إلى المحادثة بين عمر والبائع، ويمكنك إبطاء السرعة عند الحاجة.',
    scriptLines: [
      {
        speaker: 'Omar',
        textEn: 'Excuse me, how much is this English picture dictionary?',
        textAr: 'عفواً، كم سعر هذا القاموس الإنجليزي المصور؟',
      },
      {
        speaker: 'Clerk',
        textEn: 'It is eight dollars, and it includes practice cards inside.',
        textAr: 'سعره ثمانية دولارات، ويتضمن بطاقات تدريب بالداخل.',
      },
      {
        speaker: 'Omar',
        textEn: 'Great! I will take one dictionary and two green notebooks, please.',
        textAr: 'رائع! سآخذ قاموساً واحداً ودفتري ملاحظات باللون الأخضر من فضلك.',
      },
    ],
    missingWordExercises: [
      {
        id: 'ls2_mw1',
        sentenceBefore: 'It is',
        sentenceAfter: 'dollars, and it includes practice cards.',
        missingWord: 'eight',
        options: ['eight', 'eighteen', 'five', 'ten'],
        hintAr: 'استمع جيداً للسعر الذي ذكره البائع.',
      },
    ],
    comprehensionQuestions: [
      {
        id: 'ls2_q1',
        type: 'mcq',
        promptAr: 'ماذا اشترى عمر بالإضافة إلى القاموس؟',
        options: ['Two green notebooks', 'Three blue pens', 'One red backpack', 'A story book'],
        correctAnswer: 'Two green notebooks',
        explanationAr: 'قال عمر: one dictionary and two green notebooks.',
      },
    ],
  },
  {
    id: 'ls_weather_forecast',
    level: 'A2',
    categoryAr: 'موقف يومي',
    titleEn: 'Weekend Weather Announcement',
    titleAr: 'نشرة الطقس لعطلة نهاية الأسبوع',
    instructionsAr: 'استمع للنشرة الجوية لتعرف كيف تستعد للرحلة المدرسية.',
    scriptLines: [
      {
        speaker: 'Announcer',
        textEn: 'Good afternoon! Tomorrow morning will be sunny and warm with gentle breezes.',
        textAr: 'مساء الخير! سيكون صباح الغد مشمساً ودافئاً مع نسائم لطيفة.',
      },
      {
        speaker: 'Announcer',
        textEn: 'However, cool winds will arrive by four o’clock, so bring a light jacket.',
        textAr: 'ومع ذلك، ستصل رياح باردة بحلول الرابعة، لذا أحضروا سترة خفيفة.',
      },
    ],
    missingWordExercises: [
      {
        id: 'ls3_mw1',
        sentenceBefore: 'Tomorrow morning will be',
        sentenceAfter: 'and warm.',
        missingWord: 'sunny',
        options: ['sunny', 'snowy', 'stormy', 'foggy'],
        hintAr: 'حالة الجو في الصباح.',
      },
      {
        id: 'ls3_mw2',
        sentenceBefore: 'Cool winds will arrive by four o’clock, so bring a light',
        sentenceAfter: '.',
        missingWord: 'jacket',
        options: ['jacket', 'umbrella', 'bicycle', 'camera'],
        hintAr: 'ملابس تحميك من الهواء البارد.',
      },
    ],
    comprehensionQuestions: [
      {
        id: 'ls3_q1',
        type: 'mcq',
        promptAr: 'متى يُتوقع وصول الرياح الباردة؟',
        options: ['At four o’clock', 'At eight in the morning', 'At midnight', 'Next Monday'],
        correctAnswer: 'At four o’clock',
        explanationAr: 'النشرة تذكر: cool winds will arrive by four o’clock.',
      },
    ],
  },
  {
    id: 'ls_school_science_club',
    level: 'A2+',
    categoryAr: 'فهم المسموع',
    titleEn: 'Joining the School Science Club',
    titleAr: 'الانضمام إلى نادي العلوم المدرسي',
    instructionsAr: 'استمع لإعلان المعلم طارق حول موعد ومكان نادي العلوم.',
    scriptLines: [
      {
        speaker: 'Mr. Tariq',
        textEn: 'Attention middle-school students! Our Science Club meets every Wednesday after lunch in Lab Two.',
        textAr: 'انتباه يا طلاب المرحلة المتوسطة! يجتمع نادي العلوم كل أربعاء بعد الغداء في المختبر الثاني.',
      },
      {
        speaker: 'Mr. Tariq',
        textEn: 'This month, we are building small solar cars and testing water filters.',
        textAr: 'هذا الشهر، نقوم ببناء سيارات شمسية صغيرة واختبار مرشحات المياه.',
      },
    ],
    missingWordExercises: [
      {
        id: 'ls4_mw1',
        sentenceBefore: 'Our Science Club meets every',
        sentenceAfter: 'after lunch.',
        missingWord: 'Wednesday',
        options: ['Wednesday', 'Sunday', 'Tuesday', 'Friday'],
        hintAr: 'يوم الاجتماع الأسبوعي.',
      },
    ],
    comprehensionQuestions: [
      {
        id: 'ls4_q1',
        type: 'mcq',
        promptAr: 'ما المشروعان اللذان يعمل عليهما النادي هذا الشهر؟',
        options: [
          'Building solar cars and testing water filters',
          'Painting classroom walls and planting trees',
          'Writing poems and acting a play',
          'Learning chess and basketball',
        ],
        correctAnswer: 'Building solar cars and testing water filters',
        explanationAr: 'ذكر المعلم بناء السيارات الشمسية واختبار مرشحات المياه.',
      },
    ],
  },
  {
    id: 'ls_museum_audio_guide',
    level: 'B1',
    categoryAr: 'فهم متقدم',
    titleEn: 'Audio Guide: Ancient Navigation Tools',
    titleAr: 'دليل صوتي: أدوات الملاحة القديمة',
    instructionsAr: 'استمع لشرح الدليل الصوتي داخل متحف العلوم والتاريخ، ثم أجب بدقة.',
    scriptLines: [
      {
        speaker: 'Guide',
        textEn: 'Welcome to Hall Four. Before modern satellites existed, travelers relied on the astrolabe to measure the height of stars above the horizon.',
        textAr: 'مرحباً بكم في القاعة الرابعة. قبل وجود الأقمار الصناعية الحديثة، اعتمد المسافرون على الإسطرلاب لقياس ارتفاع النجوم فوق الأفق.',
      },
      {
        speaker: 'Guide',
        textEn: 'Notice the brass engravings on the plate; astronomers used them to calculate time and direction accurately during long journeys.',
        textAr: 'لاحظوا النقوش النحاسية على الصفيحة؛ استخدمها الفلكيون لحساب الوقت والاتجاه بدقة خلال الرحلات الطويلة.',
      },
    ],
    missingWordExercises: [
      {
        id: 'ls5_mw1',
        sentenceBefore: 'Travelers relied on the astrolabe to measure the height of',
        sentenceAfter: 'above the horizon.',
        missingWord: 'stars',
        options: ['stars', 'clouds', 'waves', 'mountains'],
        hintAr: 'أجرام سماوية ليلية.',
      },
    ],
    comprehensionQuestions: [
      {
        id: 'ls5_q1',
        type: 'mcq',
        promptAr: 'ما الغرضان الرئيسيان لاستخدام الإسطرلاب كما ورد في الدليل الصوتي؟',
        options: [
          'Calculating time and direction',
          'Measuring wind speed and rainfall',
          'Drawing maps of oceans only',
          'Weighing gold and silver coins',
        ],
        correctAnswer: 'Calculating time and direction',
        explanationAr: 'استُخدم الإسطرلاب لحساب الوقت والاتجاه بدقة (calculate time and direction).',
      },
    ],
  },
  {
    id: 'ls_b2_university_lecture',
    level: 'B2',
    categoryAr: 'استماع المرحلة الإعدادية B2',
    titleEn: 'Preparatory Seminar: Effective Study & Note-Taking',
    titleAr: 'ندوة للمرحلة الإعدادية: استراتيجيات المذاكرة الفعّالة',
    instructionsAr: 'استمع إلى مقتطف من ندوة توجيهية لطلاب المرحلة الإعدادية حول تقنيات الاستيعاب العميق وتدوين الملاحظات.',
    scriptLines: [
      {
        speaker: 'Dr. Nadia',
        textEn: 'Welcome, preparatory students. Many learners assume that rereading a chapter five times guarantees mastery, yet cognitive research proves active recall is far more effective.',
        textAr: 'أهلاً بكم يا طلاب المرحلة الإعدادية. يظن كثيرون أن إعادة قراءة الفصل خمس مرات تضمن الإتقان، لكن الأبحاث تثبت أن الاسترجاع النشط أكثر فعالية بكثير.',
      },
      {
        speaker: 'Dr. Nadia',
        textEn: 'After closing your textbook, summarize the main argument in your own words, identify any gaps in your reasoning, and revisit only the concepts you struggled to explain.',
        textAr: 'بعد إغلاق كتابك، لخّص الفكرة الرئيسية بأسلوبك الخاص، وحدد أي ثغرات في فهمك، ثم راجع فقط المفاهيم التي واجهت صعوبة في شرحها.',
      },
    ],
    missingWordExercises: [
      {
        id: 'ls6_mw1',
        sentenceBefore: 'Cognitive research proves active',
        sentenceAfter: 'is far more effective than passive rereading.',
        missingWord: 'recall',
        options: ['recall', 'silence', 'copying', 'delay'],
        hintAr: 'مصطلح يعني الاسترجاع النشط للمعلومات.',
      },
    ],
    comprehensionQuestions: [
      {
        id: 'ls6_q1',
        type: 'mcq',
        promptAr: 'ما الخطوة الأولى التي تنصح بها الدكتورة نادية بعد إغلاق الكتاب؟',
        options: [
          'Summarizing the main argument in your own words',
          'Highlighting every line in bright yellow',
          'Memorizing headings without examples',
          'Starting a completely unrelated subject',
        ],
        correctAnswer: 'Summarizing the main argument in your own words',
        explanationAr: 'نصحت بتلخيص الفكرة الرئيسية بكلمات الطالب الخاصة ثم تحديد الثغرات ومراجعتها.',
      },
    ],
  },
];
