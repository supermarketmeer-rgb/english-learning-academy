import { ReadingLesson } from '../types/academy';

export const READING_LESSONS: ReadingLesson[] = [
  {
    id: 'rd_my_morning_routine',
    level: 'Pre-A1',
    genre: 'story',
    genreAr: 'قصة قصيرة',
    titleEn: 'A Busy Morning at Home',
    titleAr: 'صباح نشيط في المنزل',
    introAr: 'اقرأ هذه القصة البسيطة عن صباح الطالب كريم، واستمع للنطق عند الحاجة.',
    paragraphsEn: [
      'Karim wakes up at six thirty. He washes his face and puts on his clean school uniform.',
      'In the kitchen, his mother prepares warm bread, cheese, and fresh apples. Karim drinks a glass of water and eats his breakfast.',
      'At seven fifteen, Karim picks up his blue backpack and walks to the school bus with his sister Salma.',
    ],
    arabicSupportSummary:
      'يستيقظ كريم الساعة 6:30، يرتدي زيه المدرسي، يتناول فطوراً صحياً مع والدته، ثم يذهب إلى الحافلة المدرسية مع أخته سلمى.',
    vocabularySupport: [
      { word: 'uniform', arabic: 'زي مدرسي', pronunciation: 'يونِفورم' },
      { word: 'prepares', arabic: 'تُحضّر / تعدّ', pronunciation: 'پرِپيرز' },
      { word: 'backpack', arabic: 'حقيبة ظهر', pronunciation: 'باك پاك' },
    ],
    trueFalseQuestions: [
      {
        id: 'rd1_tf1',
        type: 'true_false',
        promptAr: 'يستيقظ كريم في الساعة السادسة والنصف.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanationAr: 'ورد في السطر الأول: wakes up at six thirty.',
      },
      {
        id: 'rd1_tf2',
        type: 'true_false',
        promptAr: 'يتناول كريم فطوره في غرفة النوم.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanationAr: 'ورد في النص أنه في المطبخ (In the kitchen).',
      },
    ],
    mcqQuestions: [
      {
        id: 'rd1_mcq1',
        type: 'mcq',
        promptAr: 'ما لون حقيبة كريم المدرسية؟',
        options: ['Blue', 'Green', 'Red', 'Black'],
        correctAnswer: 'Blue',
        explanationAr: 'picks up his blue backpack.',
      },
    ],
    shortAnswerPrompts: [
      {
        id: 'rd1_sa1',
        questionEn: 'Who walks to the school bus with Karim?',
        questionAr: 'من يمشي مع كريم إلى الحافلة المدرسية؟',
        sampleAnswerEn: 'His sister Salma walks to the school bus with him.',
        keywords: ['salma', 'sister'],
      },
    ],
  },
  {
    id: 'rd_school_library_dialogue',
    level: 'A1',
    genre: 'dialogue',
    genreAr: 'حوار يومي',
    titleEn: 'At the School Library',
    titleAr: 'في مكتبة المدرسة',
    introAr: 'حوار بين طالبة وأمينة المكتبة حول استعارة كتاب علوم.',
    paragraphsEn: [
      'Lina: Good morning, Miss Huda. Do you have any books about sea animals?',
      'Miss Huda: Good morning, Lina! Yes, we have three new books on the second shelf near the window.',
      'Lina: Wonderful! May I borrow this book about dolphins for one week?',
      'Miss Huda: Of course. Please write your name and class on the library card and return it next Monday.',
    ],
    arabicSupportSummary:
      'تطلب لينا من أمينة المكتبة كتاباً عن الحيوانات البحرية، فتدلها على الرف الثاني وتستعير كتاباً عن الدلافين لمدة أسبوع.',
    vocabularySupport: [
      { word: 'borrow', arabic: 'يستعير', pronunciation: 'بورو' },
      { word: 'shelf', arabic: 'رف', pronunciation: 'شِلف' },
      { word: 'return', arabic: 'يُرجع', pronunciation: 'رِتيرن' },
    ],
    trueFalseQuestions: [
      {
        id: 'rd2_tf1',
        type: 'true_false',
        promptAr: 'تبحث لينا عن كتب حول الحيوانات البحرية.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanationAr: 'سألت لينا عن books about sea animals.',
      },
    ],
    mcqQuestions: [
      {
        id: 'rd2_mcq1',
        type: 'mcq',
        promptAr: 'أين توجد الكتب الجديدة؟',
        options: [
          'On the second shelf near the window',
          'In the school garden',
          'Under the main table',
          'In the computer lab',
        ],
        correctAnswer: 'On the second shelf near the window',
        explanationAr: 'ذكرت المعلمة: on the second shelf near the window.',
      },
    ],
    shortAnswerPrompts: [
      {
        id: 'rd2_sa1',
        questionEn: 'When should Lina return the book?',
        questionAr: 'متى يجب على لينا إعادة الكتاب؟',
        sampleAnswerEn: 'She should return it next Monday.',
        keywords: ['monday', 'next', 'week'],
      },
    ],
  },
  {
    id: 'rd_healthy_habits_situation',
    level: 'A2',
    genre: 'situation',
    genreAr: 'موقف حياتي',
    titleEn: 'Planning a Weekend Picnic',
    titleAr: 'التخطيط لنزهة نهاية الأسبوع',
    introAr: 'اقرأ كيف تخطط أسرة متعاونة لنزهة صديقة للبيئة في الحديقة الوطنية.',
    paragraphsEn: [
      'Last Thursday evening, Tariq and his family planned a weekend picnic at Green Valley Park. They wanted the trip to be both fun and environmentally friendly.',
      'Instead of buying plastic bottles, they filled reusable water flasks. They also packed fresh sandwiches, oranges, and a large cloth blanket.',
      'Before leaving the park on Saturday afternoon, everyone helped collect every piece of litter and placed paper items into the recycling bin.',
    ],
    arabicSupportSummary:
      'خططت عائلة طارق لنزهة صديقة للبيئة باستخدام قوارير قابلة لإعادة الاستخدام وجمع المخلفات في حاوية إعادة التدوير.',
    vocabularySupport: [
      { word: 'reusable', arabic: 'قابل لإعادة الاستخدام', pronunciation: 'ريوزَبُل' },
      { word: 'environmentally friendly', arabic: 'صديق للبيئة', pronunciation: 'إنفايرَنمِنتَلي فرِندلي' },
      { word: 'litter', arabic: 'مخلفات / نفايات', pronunciation: 'لِتَر' },
    ],
    trueFalseQuestions: [
      {
        id: 'rd3_tf1',
        type: 'true_false',
        promptAr: 'اشترت العائلة الكثير من الزجاجات البلاستيكية ذات الاستخدام الواحد.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanationAr: 'النص يقول: Instead of buying plastic bottles, they filled reusable water flasks.',
      },
    ],
    mcqQuestions: [
      {
        id: 'rd3_mcq1',
        type: 'mcq',
        promptAr: 'ماذا فعلت العائلة قبل مغادرة الحديقة؟',
        options: [
          'They collected litter and recycled paper items.',
          'They left their blankets on the grass.',
          'They planted ten apple trees.',
          'They bought sandwiches from a café.',
        ],
        correctAnswer: 'They collected litter and recycled paper items.',
        explanationAr: 'تعاون الجميع في جمع المخلفات ووضع الورق في سلة التدوير.',
      },
    ],
    shortAnswerPrompts: [
      {
        id: 'rd3_sa1',
        questionEn: 'Why did the family bring reusable water flasks?',
        questionAr: 'لماذا أحضرت العائلة قوارير ماء قابلة لإعادة الاستخدام؟',
        sampleAnswerEn: 'Because they wanted their picnic to be environmentally friendly.',
        keywords: ['environmentally', 'friendly', 'plastic', 'clean'],
      },
    ],
  },
  {
    id: 'rd_water_cycle_educational',
    level: 'A2+',
    genre: 'educational',
    genreAr: 'نص تعليمي',
    titleEn: 'How the Water Cycle Works',
    titleAr: 'كيف تعمل دورة المياه في الطبيعة',
    introAr: 'نص علمي مبسط يشرح رحلة الماء بين البحار والسماء واليابسة.',
    paragraphsEn: [
      'Water on Earth is constantly moving in a natural cycle powered by the sun. First, heat from sunlight warms rivers, lakes, and oceans, turning liquid water into invisible vapor through evaporation.',
      'As warm vapor rises into the cooler sky, it cools down and forms tiny water droplets around dust particles. This stage is called condensation, and it creates the clouds we see above us.',
      'When clouds grow heavy with water droplets, gravity pulls the water back to Earth as rain or snow. This water flows into streams and underground aquifers, continuing the cycle again.',
    ],
    arabicSupportSummary:
      'تشرح الفقرة المراحل الثلاث الأساسية لدورة الماء: التبخر بفعل الشمس، والتكاثف لتكوين السحب، والهطول وعودة المياه إلى الأنهار والتربة.',
    vocabularySupport: [
      { word: 'evaporation', arabic: 'التبخر', pronunciation: 'إيفاپورَيشَن' },
      { word: 'condensation', arabic: 'التكاثف', pronunciation: 'كوندِنسَيشَن' },
      { word: 'droplets', arabic: 'قطرات صغيرة', pronunciation: 'دروپلِتس' },
    ],
    trueFalseQuestions: [
      {
        id: 'rd4_tf1',
        type: 'true_false',
        promptAr: 'تعتمد دورة المياه على حرارة الشمس لتبخر المياه.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanationAr: 'النص يذكر أن الشمس تُسخّن المسطحات المائية فتحدث عملية التبخر.',
      },
    ],
    mcqQuestions: [
      {
        id: 'rd4_mcq1',
        type: 'mcq',
        promptAr: 'ما المرحلة التي تتكون فيها السحب عند برودة البخار؟',
        options: ['Condensation', 'Evaporation', 'Gravity', 'Irrigation'],
        correctAnswer: 'Condensation',
        explanationAr: 'التكاثف (Condensation) هو تحول البخار إلى قطرات مكونة للسحب.',
      },
    ],
    shortAnswerPrompts: [
      {
        id: 'rd4_sa1',
        questionEn: 'What pulls heavy water droplets back to Earth from clouds?',
        questionAr: 'ما القوة التي تسحب قطرات الماء الثقيلة نحو الأرض؟',
        sampleAnswerEn: 'Gravity pulls the water droplets back to Earth as rain or snow.',
        keywords: ['gravity'],
      },
    ],
  },
  {
    id: 'rd_digital_citizenship_article',
    level: 'B1',
    genre: 'article',
    genreAr: 'مقال تعليمي',
    titleEn: 'Being a Wise Digital Learner',
    titleAr: 'كيف تكون متعلماً رقمياً واعياً',
    introAr: 'مقال مخصص لطلاب المرحلة المتوسطة حول القراءة النقدية والأمان الرقمي.',
    paragraphsEn: [
      'Today, students have access to thousands of educational websites, interactive dictionaries, and science videos within seconds. While digital tools make research faster, learners still need critical thinking to evaluate what they read.',
      'A wise digital learner checks who wrote an article, when it was updated, and whether the claims are supported by reliable evidence. Comparing information across two trusted sources is one of the best habits a middle-school student can develop.',
      'Equally important is balancing screen time with offline study. Writing notes by hand, discussing ideas with classmates, and reading printed books help deepen memory and protect your eyes.',
    ],
    arabicSupportSummary:
      'يركز المقال على مهارات التحقق من مصادر المعلومات الرقمية وموازنة وقت الشاشة مع الدراسة الورقية والنقاش الصفي.',
    vocabularySupport: [
      { word: 'critical thinking', arabic: 'التفكير النقدي', pronunciation: 'كرِتِكَل ثِنكِنغ' },
      { word: 'reliable evidence', arabic: 'أدلة موثوقة', pronunciation: 'رِلايَبُل إِفِدَنس' },
      { word: 'balance', arabic: 'يوازن / توازن', pronunciation: 'بالَنس' },
    ],
    trueFalseQuestions: [
      {
        id: 'rd5_tf1',
        type: 'true_false',
        promptAr: 'ينصح المقال بالاعتماد على أول موقع يظهر دون مقارنة المصادر.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanationAr: 'المقال ينصح بمقارنة المعلومات بين مصدرين موثوقين على الأقل.',
      },
    ],
    mcqQuestions: [
      {
        id: 'rd5_mcq1',
        type: 'mcq',
        promptAr: 'ما الفائدة المذكورة للمذاكرة خارج الشاشة (مثل الكتابة باليد)؟',
        options: [
          'It deepens memory and protects your eyes.',
          'It deletes old browser history.',
          'It replaces the need for teachers.',
          'It makes internet speed faster.',
        ],
        correctAnswer: 'It deepens memory and protects your eyes.',
        explanationAr: 'الفقرة الأخيرة تذكر أن الكتابة باليد والقراءة الورقية تقوي الذاكرة وتحمي العينين.',
      },
    ],
    shortAnswerPrompts: [
      {
        id: 'rd5_sa1',
        questionEn: 'Name two things a wise digital learner checks before trusting an online article.',
        questionAr: 'اذكر أمرين يتحقق منهما المتعلم الواعي قبل الوثوق بمقال على الإنترنت.',
        sampleAnswerEn: 'They check who wrote the article, when it was updated, and whether it has reliable evidence.',
        keywords: ['wrote', 'author', 'updated', 'evidence', 'sources'],
      },
    ],
  },
  {
    id: 'rd_b2_solar_innovation',
    level: 'B2',
    genre: 'article',
    genreAr: 'مقال المرحلة الإعدادية B2',
    titleEn: 'Community Microgrids and Clean Energy',
    titleAr: 'الشبكات الشمسية المحلية والطاقة النظيفة',
    introAr: 'نص متقدم لطلاب المرحلة الإعدادية يستعرض حلول الطاقة المستدامة.',
    paragraphsEn: [
      'In sunny regions, schools and neighborhoods are increasingly turning to solar microgrids—small, localized electricity networks that generate and store clean power directly where it is used.',
      'Unlike distant power plants that lose energy during long-distance transmission, microgrids reduce waste and keep essential facilities like classrooms and clinics running even when main power lines experience disruptions.',
    ],
    arabicSupportSummary:
      'يتناول النص كيف تساعد الشبكات الشمسية المحلية المدارس والأحياء على تقليل فاقد الطاقة وضمان استمرار الكهرباء النظيفة.',
    vocabularySupport: [
      { word: 'transmission', arabic: 'نقل الطاقة', pronunciation: 'ترانزمِشَن' },
      { word: 'disruptions', arabic: 'انقطاعات', pronunciation: 'دِسرَپشَنز' },
    ],
    trueFalseQuestions: [
      {
        id: 'rd6_tf1',
        type: 'true_false',
        promptAr: 'تعمل الشبكات الشمسية المحلية على تقليل الفاقد الناتج عن نقل الكهرباء لمسافات طويلة.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanationAr: 'يوضح النص أن الشبكات المحلية تقلل الهدر الناتج عن النقل لمسافات بعيدة.',
      },
    ],
    mcqQuestions: [
      {
        id: 'rd6_mcq1',
        type: 'mcq',
        promptAr: 'Why are microgrids helpful for schools and clinics?',
        options: [
          'They keep essential services running during main grid disruptions.',
          'They only work during winter nights.',
          'They require burning fossil fuels.',
          'They increase energy transmission losses.',
        ],
        correctAnswer: 'They keep essential services running during main grid disruptions.',
        explanationAr: 'تحافظ على تشغيل المرافق الأساسية حتى عند انقطاع الشبكة الرئيسية.',
      },
    ],
    shortAnswerPrompts: [
      {
        id: 'rd6_sa1',
        questionEn: 'In one sentence, explain what a solar microgrid is.',
        questionAr: 'اشرح بجملة واحدة المقصود بالشبكة الشمسية المحلية.',
        sampleAnswerEn: 'A solar microgrid is a small local network that generates and stores clean electricity near where it is used.',
        keywords: ['local', 'network', 'solar', 'clean', 'power', 'electricity'],
      },
    ],
  },
  {
    id: 'rd_b2_critical_media',
    level: 'B2',
    genre: 'article',
    genreAr: 'مقال المرحلة الإعدادية B2',
    titleEn: 'Evaluating Scientific Claims in Everyday Media',
    titleAr: 'التحقق من الادعاءات العلمية في الإعلام',
    introAr: 'مقال أكاديمي لطلاب المرحلة الإعدادية حول مهارات التحليل النقدي والتمييز بين الحقائق العلمية والعناوين المبالغ فيها.',
    paragraphsEn: [
      'Every day, headlines announce exciting scientific findings in medicine, technology, and environmental studies. However, preparatory-school learners who examine articles critically know that an eye-catching title rarely tells the full story.',
      'To evaluate a scientific claim fairly, researchers ask three essential questions: Was the study tested on a sufficiently large sample? Have independent scientists reviewed the methodology? And do the measurements clearly support the conclusion rather than merely suggesting a coincidence?',
      'By checking primary data and distinguishing correlation from causation, young scholars develop the analytical discipline required for university-level reading and thoughtful civic participation.',
    ],
    arabicSupportSummary:
      'يشرح المقال أهمية التمييز بين الارتباط الإحصائي والسببية الفعلية، وفحص حجم العينة ومراجعة النظراء قبل قبول أي خبر علمي.',
    vocabularySupport: [
      { word: 'methodology', arabic: 'منهجية البحث', pronunciation: 'مِثودولوجي' },
      { word: 'correlation', arabic: 'ارتباط إحصائي', pronunciation: 'كورِلَيشَن' },
      { word: 'causation', arabic: 'علاقة سببية', pronunciation: 'كوزَيشَن' },
    ],
    trueFalseQuestions: [
      {
        id: 'rd7_tf1',
        type: 'true_false',
        promptAr: 'يرى الكاتب أن العناوين الجذابة في الأخبار العلمية دائماً تشرح جميع تفاصيل الدراسة بدقة.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanationAr: 'يذكر النص أن العناوين الجذابة نادراً ما تروي القصة الكاملة (rarely tells the full story).',
      },
    ],
    mcqQuestions: [
      {
        id: 'rd7_mcq1',
        type: 'mcq',
        promptAr: 'Which of the following is recommended when evaluating a scientific study?',
        options: [
          'Checking whether independent scientists reviewed the methodology and sample size.',
          'Sharing the headline immediately without reading the article.',
          'Ignoring measurements and focusing only on dramatic words.',
          'Assuming every coincidence proves direct causation.',
        ],
        correctAnswer: 'Checking whether independent scientists reviewed the methodology and sample size.',
        explanationAr: 'الفقرة الثانية تؤكد على فحص حجم العينة ومراجعة العلماء المستقلين للمنهجية.',
      },
    ],
    shortAnswerPrompts: [
      {
        id: 'rd7_sa1',
        questionEn: 'Why should preparatory learners distinguish correlation from causation?',
        questionAr: 'لماذا يجب على طلاب المرحلة الإعدادية التمييز بين الارتباط الإحصائي والسببية؟',
        sampleAnswerEn: 'Because two events happening together might be a coincidence rather than proof that one caused the other.',
        keywords: ['coincidence', 'cause', 'evidence', 'analytical', 'accurate'],
      },
    ],
  },
];
