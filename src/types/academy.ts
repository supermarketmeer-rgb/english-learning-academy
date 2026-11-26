export type CEFRLevel = 'Pre-A1' | 'A1' | 'A2' | 'A2+' | 'B1' | 'B2';

export type ModuleId =
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'exams'
  | 'audio_lab';

export type GradeBand = 'primary' | 'middle' | 'preparatory';

export type SkillDomain =
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'sentence_construction'
  | 'writing'
  | 'speaking';

export interface StudentProfile {
  id: string;
  nickname: string;
  gradeBand: GradeBand;
  avatarColor: string;
  currentLevel: CEFRLevel;
  recommendedStartLevel: CEFRLevel;
  placementCompleted: boolean;
  points: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  weeklyGoalLessons: number;
  unlockedBadges: string[];
  dailyActivity: Record<string, number>; // YYYY-MM-DD -> minutes/units
  createdAt: string;
}

export interface LessonProgressRecord {
  id: string; // `${profileId}::${lessonId}`
  profileId: string;
  lessonId: string;
  moduleId: ModuleId;
  level: CEFRLevel;
  completed: boolean;
  score: number; // 0-100
  attempts: number;
  lastPracticedAt: string;
}

export interface VocabSRSRecord {
  id: string; // `${profileId}::${wordId}`
  profileId: string;
  wordId: string;
  topicId: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string; // ISO date
  lastReviewedAt: string;
  masteryLevel: 'new' | 'learning' | 'mastered';
}

export interface PlacementResult {
  id: string; // `${profileId}::placement`
  profileId: string;
  takenAt: string;
  overallScore: number;
  assignedLevel: CEFRLevel;
  skillScores: Record<SkillDomain, number>;
  strengths: SkillDomain[];
  weaknesses: SkillDomain[];
  recommendedModules: ModuleId[];
  summaryAr: string;
}

export interface AssessmentAttempt {
  id: string;
  profileId: string;
  assessmentId: string;
  moduleId: ModuleId;
  level: CEFRLevel;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  activeProfileId: string | null;
  speechRate: number;
  preferredVoiceAccent: 'en-GB' | 'en-US';
  arabicSupportMode: 'gradual' | 'full';
}

export interface AnalyticsEvent {
  id: string;
  eventType:
    | 'lesson_started'
    | 'lesson_completed'
    | 'exercise_answered'
    | 'placement_completed'
    | 'app_error';
  moduleId?: ModuleId;
  lessonId?: string;
  level?: CEFRLevel;
  score?: number;
  errorMessage?: string;
  timestamp: string;
}

export interface BackupPayload {
  schemaVersion: number;
  exportedAt: string;
  appIdentifier: 'ENGLISH_LEARNING_ACADEMY';
  profile: StudentProfile;
  lessonProgress: LessonProgressRecord[];
  vocabSrs: VocabSRSRecord[];
  assessments: AssessmentAttempt[];
  placementResult: PlacementResult | null;
  pronunciationLogs?: PronunciationLogRecord[];
}

/* ---------- Curriculum Content Interfaces ---------- */

export interface VocabWord {
  id: string;
  word: string;
  arabic: string;
  pronunciation: string;
  partOfSpeech: string;
  exampleEn: string;
  exampleAr: string;
  visualEmoji: string; // Clean visual fallback icon key / symbol used internally in structured card
  level: CEFRLevel;
}

export interface VocabTopic {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionAr: string;
  level: CEFRLevel;
  illustrationPath?: string;
  accentColor: string;
  words: VocabWord[];
}

export interface GrammarExample {
  en: string;
  ar: string;
  highlight?: string;
}

export interface GrammarMistake {
  wrong: string;
  correct: string;
  explanationAr: string;
}

export interface InteractiveQuestion {
  id: string;
  type: 'mcq' | 'fill_blank' | 'reorder' | 'true_false';
  promptAr: string;
  promptEn?: string;
  options?: string[];
  correctAnswer: string;
  wordsToOrder?: string[];
  explanationAr: string;
}

export interface GrammarLesson {
  id: string;
  level: CEFRLevel;
  tier: 'beginner' | 'elementary' | 'intermediate' | 'expansion';
  order: number;
  titleEn: string;
  titleAr: string;
  illustrationPath?: string;
  summaryAr: string;
  explanationAr: string[];
  englishRuleTip?: string;
  formula?: string;
  examples: GrammarExample[];
  commonMistakes: GrammarMistake[];
  exercises: InteractiveQuestion[];
  finalQuiz: InteractiveQuestion[];
}

export interface ReadingVocabNote {
  word: string;
  arabic: string;
  pronunciation: string;
}

export interface ReadingLesson {
  id: string;
  level: CEFRLevel;
  genre: 'story' | 'dialogue' | 'situation' | 'educational' | 'article';
  genreAr: string;
  titleEn: string;
  titleAr: string;
  introAr: string;
  illustrationPath?: string;
  paragraphsEn: string[];
  arabicSupportSummary: string;
  vocabularySupport: ReadingVocabNote[];
  trueFalseQuestions: InteractiveQuestion[];
  mcqQuestions: InteractiveQuestion[];
  shortAnswerPrompts: {
    id: string;
    questionEn: string;
    questionAr: string;
    sampleAnswerEn: string;
    keywords: string[];
  }[];
}

export interface ListeningLesson {
  id: string;
  level: CEFRLevel;
  categoryAr: string;
  titleEn: string;
  titleAr: string;
  instructionsAr: string;
  illustrationPath?: string;
  scriptLines: {
    speaker: string;
    textEn: string;
    textAr: string;
  }[];
  missingWordExercises: {
    id: string;
    sentenceBefore: string;
    sentenceAfter: string;
    missingWord: string;
    options: string[];
    hintAr: string;
  }[];
  comprehensionQuestions: InteractiveQuestion[];
}

export interface SpeakingActivity {
  id: string;
  level: CEFRLevel;
  activityType: 'repeat_word' | 'repeat_sentence' | 'qa' | 'introduce' | 'describe_picture' | 'roleplay';
  activityTypeAr: string;
  titleEn: string;
  titleAr: string;
  instructionsAr: string;
  illustrationPath?: string;
  prompts: {
    id: string;
    promptAr: string;
    targetEn: string;
    phoneticTip?: string;
    sampleResponseEn?: string;
    checklistAr: string[];
  }[];
}

export interface WritingLesson {
  id: string;
  level: CEFRLevel;
  writingStageAr: string;
  titleEn: string;
  titleAr: string;
  instructionsAr: string;
  illustrationPath?: string;
  modelTitleEn: string;
  modelTextEn: string;
  modelNotesAr: string[];
  sentenceBuilderStarter?: {
    promptAr: string;
    tokens: string[];
    expectedEn: string;
  };
  promptEn: string;
  promptAr: string;
  minWords: number;
  checklistAr: string[];
}

export interface ExamPack {
  id: string;
  cambridgeRef: string;
  level: CEFRLevel;
  titleEn: string;
  titleAr: string;
  targetGroupAr: string;
  durationMinutes: number;
  illustrationPath?: string;
  questions: (InteractiveQuestion & {
    section: 'vocabulary' | 'grammar' | 'reading' | 'listening';
    listeningScript?: string;
    readingPassage?: string;
  })[];
}

export interface PlacementQuestion {
  id: string;
  skill: SkillDomain;
  level: CEFRLevel;
  type: 'mcq' | 'listening_mcq' | 'reorder' | 'writing_check' | 'speaking_optional';
  promptAr: string;
  passageEn?: string;
  audioScriptEn?: string;
  options?: string[];
  wordsToOrder?: string[];
  correctAnswer: string;
  weight: number;
}

export interface PronunciationDrill {
  id: string;
  category: 'consonant_contrast' | 'vowel_length' | 'word_stress' | 'fluency_sentence';
  categoryAr: string;
  level: CEFRLevel;
  titleAr: string;
  focusSound: string;
  arabicTip: string;
  targetEn: string;
  contrastWordEn?: string;
  ipa: string;
  arabicApprox: string;
  illustrationPath?: string;
}

export interface PronunciationLogRecord {
  id: string; // `${profileId}::${drillId}`
  profileId: string;
  drillId: string;
  level: CEFRLevel;
  bestAccuracy: number; // 0-100
  lastAccuracy: number; // 0-100
  attempts: number;
  lastTranscript: string;
  mode: 'speech_recognition' | 'self_practice';
  updatedAt: string;
}
