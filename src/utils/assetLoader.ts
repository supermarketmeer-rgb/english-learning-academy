import academyCrestImg from '../assets/images/academy_crest_emblem_1795680222767.jpg';
import academyDeskImg from '../assets/images/academy_hero_desk_1795680222000.jpg';
import animalsWildlifeImg from '../assets/images/topic_animals_wildlife_1795681973134.jpg';
import cityTransportImg from '../assets/images/topic_city_transport_1795681974208.jpg';
import everydayLifeImg from '../assets/images/topic_everyday_life_1795680223502.jpg';
import examsAchievementImg from '../assets/images/topic_exams_achievement_1795681977692.jpg';
import foodDrinksImg from '../assets/images/topic_food_drinks_1795681972970.jpg';
import grammarReadingImg from '../assets/images/topic_grammar_reading_1795681974404.jpg';
import listeningAudioLabImg from '../assets/images/topic_listening_audiolab_1795681975070.jpg';
import schoolClassroomImg from '../assets/images/topic_school_classroom_1795681972503.jpg';
import scienceNatureImg from '../assets/images/topic_science_nature_1795680223229.jpg';
import writingJournalImg from '../assets/images/topic_writing_journal_1795681975126.jpg';
import { CEFRLevel, GrammarLesson, ModuleId } from '../types/academy';

export type EducationalAssetKey =
  | 'crest'
  | 'desk'
  | 'everyday'
  | 'science'
  | 'school'
  | 'food'
  | 'animals'
  | 'city'
  | 'grammar'
  | 'audio'
  | 'writing'
  | 'exams';

export interface EducationalAssetEntry {
  key: EducationalAssetKey;
  url: string;
  legacyPath: string;
  altAr: string;
  altEn: string;
}

export const EDUCATIONAL_ASSETS: Record<EducationalAssetKey, EducationalAssetEntry> = {
  crest: {
    key: 'crest',
    url: academyCrestImg,
    legacyPath: '/src/assets/images/academy_crest_emblem_1795680222767.jpg',
    altAr: 'شعار أكاديمية اللغة الإنجليزية',
    altEn: 'English Learning Academy Crest',
  },
  desk: {
    key: 'desk',
    url: academyDeskImg,
    legacyPath: '/src/assets/images/academy_hero_desk_1795680222000.jpg',
    altAr: 'طاولة الدراسة والأدوات التعليمية',
    altEn: 'Student Study Desk and Textbooks',
  },
  everyday: {
    key: 'everyday',
    url: everydayLifeImg,
    legacyPath: '/src/assets/images/topic_everyday_life_1795680223502.jpg',
    altAr: 'الحياة اليومية والأسرة والمنزل',
    altEn: 'Everyday Family and Home Life',
  },
  science: {
    key: 'science',
    url: scienceNatureImg,
    legacyPath: '/src/assets/images/topic_science_nature_1795680223229.jpg',
    altAr: 'العلوم والطبيعة والبيئة',
    altEn: 'Science, Nature, and Environment',
  },
  school: {
    key: 'school',
    url: schoolClassroomImg,
    legacyPath: '/src/assets/images/topic_school_classroom_1795681972503.jpg',
    altAr: 'الصف الدراسي والمدرسة',
    altEn: 'School Classroom and Learning',
  },
  food: {
    key: 'food',
    url: foodDrinksImg,
    legacyPath: '/src/assets/images/topic_food_drinks_1795681972970.jpg',
    altAr: 'الطعام الصحي والمشروبات',
    altEn: 'Healthy Food and Drinks',
  },
  animals: {
    key: 'animals',
    url: animalsWildlifeImg,
    legacyPath: '/src/assets/images/topic_animals_wildlife_1795681973134.jpg',
    altAr: 'الحيوانات والحياة البرية',
    altEn: 'Animals and Wildlife',
  },
  city: {
    key: 'city',
    url: cityTransportImg,
    legacyPath: '/src/assets/images/topic_city_transport_1795681974208.jpg',
    altAr: 'المدينة والمواصلات والأماكن',
    altEn: 'City Places and Transportation',
  },
  grammar: {
    key: 'grammar',
    url: grammarReadingImg,
    legacyPath: '/src/assets/images/topic_grammar_reading_1795681974404.jpg',
    altAr: 'القواعد اللغوية والقراءة',
    altEn: 'Grammar Rules and Reading Comprehension',
  },
  audio: {
    key: 'audio',
    url: listeningAudioLabImg,
    legacyPath: '/src/assets/images/topic_listening_audiolab_1795681975070.jpg',
    altAr: 'الاستماع والمختبر الصوتي والنطق',
    altEn: 'Listening and Pronunciation Audio Lab',
  },
  writing: {
    key: 'writing',
    url: writingJournalImg,
    legacyPath: '/src/assets/images/topic_writing_journal_1795681975126.jpg',
    altAr: 'الكتابة والتعبير وتدوين الملاحظات',
    altEn: 'Writing and Composition Journal',
  },
  exams: {
    key: 'exams',
    url: examsAchievementImg,
    legacyPath: '/src/assets/images/topic_exams_achievement_1795681977692.jpg',
    altAr: 'الاختبارات التدريبية والإنجاز الأكاديمي',
    altEn: 'Practice Exams and Academic Achievement',
  },
};

const LEGACY_PATH_TO_URL = new Map<string, string>(
  Object.values(EDUCATIONAL_ASSETS).map((entry) => [entry.legacyPath, entry.url])
);

export const VOCAB_ASSET_KEYS: Record<string, EducationalAssetKey> = {
  family_people: 'everyday',
  school_education: 'school',
  home_furniture: 'everyday',
  food_drinks: 'food',
  animals: 'animals',
  colors_shapes: 'writing',
  numbers_time: 'exams',
  body_health: 'food',
  clothes: 'everyday',
  places_transportation: 'city',
  nature_environment: 'science',
  daily_activities: 'desk',
  travel_communication: 'city',
  technology: 'audio',
  emotions_personality: 'grammar',
  science_society: 'science',
  academic_research: 'grammar',
  career_innovation: 'exams',
};

export const GRAMMAR_TIER_ASSET_KEYS: Record<GrammarLesson['tier'], EducationalAssetKey[]> = {
  beginner: ['school', 'grammar', 'desk'],
  elementary: ['grammar', 'everyday', 'writing'],
  intermediate: ['desk', 'grammar', 'science'],
  expansion: ['exams', 'science'],
};

export const READING_ASSET_KEYS: Record<string, EducationalAssetKey> = {
  rd_my_morning_routine: 'everyday',
  rd_school_library_dialogue: 'school',
  rd_healthy_habits_situation: 'food',
  rd_water_cycle_educational: 'science',
  rd_digital_citizenship_article: 'audio',
  rd_b2_solar_innovation: 'science',
  rd_b2_critical_media: 'grammar',
};

export const LISTENING_ASSET_KEYS: Record<string, EducationalAssetKey> = {
  ls_classroom_words: 'school',
  ls_at_the_bookshop: 'grammar',
  ls_weather_forecast: 'animals',
  ls_school_science_club: 'science',
  ls_museum_audio_guide: 'audio',
  ls_b2_university_lecture: 'desk',
};

export const SPEAKING_ASSET_KEYS: Record<string, EducationalAssetKey> = {
  sp_repeat_words: 'audio',
  sp_introduce_yourself: 'everyday',
  sp_repeat_sentences: 'school',
  sp_describe_picture: 'everyday',
  sp_roleplay_directions: 'city',
  sp_qa_opinion: 'science',
  sp_b2_academic_debate: 'exams',
};

export const WRITING_ASSET_KEYS: Record<string, EducationalAssetKey> = {
  wr_letters_words: 'school',
  wr_completing_building: 'desk',
  wr_describing_picture: 'everyday',
  wr_email_message: 'writing',
  wr_short_story: 'grammar',
  wr_short_essay: 'science',
  wr_b2_argumentative_essay: 'writing',
};

export const EXAM_ASSET_KEYS: Record<string, EducationalAssetKey> = {
  exam_pre_a1_starters: 'school',
  exam_a1_movers: 'everyday',
  exam_a2_flyers: 'city',
  exam_a2_key: 'grammar',
  exam_b1_preliminary: 'exams',
  exam_b2_preparatory: 'exams',
};

export const AUDIO_LAB_ASSET_KEYS: Record<string, EducationalAssetKey> = {
  lab_p_b: 'audio',
  lab_v_f: 'city',
  lab_th_sounds: 'everyday',
  lab_ch_sh: 'school',
  lab_short_long_i: 'animals',
  lab_word_stress: 'school',
  lab_fluency_a2plus: 'science',
  lab_fluency_b1: 'grammar',
  lab_b2_academic_stress: 'exams',
  lab_b2_linking_reduction: 'audio',
};

export const MODULE_ASSET_KEYS: Record<ModuleId, EducationalAssetKey> = {
  vocabulary: 'everyday',
  grammar: 'grammar',
  reading: 'school',
  listening: 'audio',
  speaking: 'city',
  writing: 'writing',
  exams: 'exams',
  audio_lab: 'audio',
};

export const CEFR_ASSET_KEYS: Record<CEFRLevel, EducationalAssetKey> = {
  'Pre-A1': 'everyday',
  A1: 'school',
  A2: 'city',
  'A2+': 'grammar',
  B1: 'science',
  B2: 'exams',
};

export function getEducationalAsset(key: EducationalAssetKey): string {
  return EDUCATIONAL_ASSETS[key].url;
}

export function resolveEducationalImage(
  keyOrPath?: string,
  fallbackKey: EducationalAssetKey = 'desk'
): string {
  if (!keyOrPath) {
    return EDUCATIONAL_ASSETS[fallbackKey].url;
  }

  if (keyOrPath in EDUCATIONAL_ASSETS) {
    return EDUCATIONAL_ASSETS[keyOrPath as EducationalAssetKey].url;
  }

  const mappedLegacy = LEGACY_PATH_TO_URL.get(keyOrPath);
  if (mappedLegacy) {
    return mappedLegacy;
  }

  if (
    keyOrPath.startsWith('http://') ||
    keyOrPath.startsWith('https://') ||
    keyOrPath.startsWith('data:') ||
    keyOrPath.startsWith('blob:')
  ) {
    return keyOrPath;
  }

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  if (normalizedBase !== '/' && keyOrPath.startsWith(normalizedBase)) {
    return keyOrPath;
  }
  const cleanPath = keyOrPath.startsWith('/') ? keyOrPath.slice(1) : keyOrPath;
  return `${normalizedBase}${cleanPath}`;
}

export function getVocabularyTopicImage(topicId: string, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'everyday');
  const key = VOCAB_ASSET_KEYS[topicId] ?? 'everyday';
  return getEducationalAsset(key);
}

export function getGrammarLessonImage(
  tier: GrammarLesson['tier'],
  order: number,
  customPath?: string
): string {
  if (customPath) return resolveEducationalImage(customPath, 'grammar');
  const pool = GRAMMAR_TIER_ASSET_KEYS[tier] ?? ['grammar'];
  const key = pool[Math.max(0, order - 1) % pool.length] ?? 'grammar';
  return getEducationalAsset(key);
}

export function getReadingLessonImage(lessonId: string, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'grammar');
  const key = READING_ASSET_KEYS[lessonId] ?? 'grammar';
  return getEducationalAsset(key);
}

export function getListeningLessonImage(lessonId: string, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'audio');
  const key = LISTENING_ASSET_KEYS[lessonId] ?? 'audio';
  return getEducationalAsset(key);
}

export function getSpeakingActivityImage(activityId: string, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'city');
  const key = SPEAKING_ASSET_KEYS[activityId] ?? 'city';
  return getEducationalAsset(key);
}

export function getWritingLessonImage(lessonId: string, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'writing');
  const key = WRITING_ASSET_KEYS[lessonId] ?? 'writing';
  return getEducationalAsset(key);
}

export function getExamPackImage(packId: string, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'exams');
  const key = EXAM_ASSET_KEYS[packId] ?? 'exams';
  return getEducationalAsset(key);
}

export function getAudioLabDrillImage(drillId: string, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'audio');
  const key = AUDIO_LAB_ASSET_KEYS[drillId] ?? 'audio';
  return getEducationalAsset(key);
}

export function getModuleImage(moduleId: ModuleId, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'desk');
  const key = MODULE_ASSET_KEYS[moduleId] ?? 'desk';
  return getEducationalAsset(key);
}

export function getCEFRLevelImage(level: CEFRLevel, customPath?: string): string {
  if (customPath) return resolveEducationalImage(customPath, 'desk');
  const key = CEFR_ASSET_KEYS[level] ?? 'desk';
  return getEducationalAsset(key);
}
