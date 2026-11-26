import { AUDIO_LAB_DRILLS } from '../data/audioLabData';
import { EXAM_PACKS } from '../data/examsData';
import { GRAMMAR_LESSONS } from '../data/grammarData';
import { LISTENING_LESSONS } from '../data/listeningData';
import { PLACEMENT_QUESTIONS } from '../data/placementTest';
import { READING_LESSONS } from '../data/readingData';
import { SPEAKING_ACTIVITIES } from '../data/speakingData';
import { VOCABULARY_TOPICS } from '../data/vocabularyData';
import { WRITING_LESSONS } from '../data/writingData';
import {
  CEFRLevel,
  ExamPack,
  GrammarLesson,
  ListeningLesson,
  ModuleId,
  PlacementQuestion,
  PronunciationDrill,
  ReadingLesson,
  SpeakingActivity,
  VocabTopic,
  VocabWord,
  WritingLesson,
} from '../types/academy';
import {
  getAudioLabDrillImage,
  getExamPackImage,
  getGrammarLessonImage,
  getListeningLessonImage,
  getReadingLessonImage,
  getSpeakingActivityImage,
  getVocabularyTopicImage,
  getWritingLessonImage,
} from '../utils/assetLoader';

export interface UnifiedLessonDescriptor {
  id: string;
  moduleId: ModuleId;
  level: CEFRLevel;
  titleAr: string;
  titleEn: string;
  route: string;
  orderIndex: number;
  illustrationPath: string;
}

const LEVEL_ORDER: Record<CEFRLevel, number> = {
  'Pre-A1': 1,
  A1: 2,
  A2: 3,
  'A2+': 4,
  B1: 5,
  B2: 6,
};

function enrichTopic(topic: VocabTopic): VocabTopic {
  return {
    ...topic,
    illustrationPath: getVocabularyTopicImage(topic.id, topic.illustrationPath),
  };
}

function enrichGrammar(lesson: GrammarLesson): GrammarLesson {
  return {
    ...lesson,
    illustrationPath: getGrammarLessonImage(lesson.tier, lesson.order, lesson.illustrationPath),
  };
}

function enrichReading(lesson: ReadingLesson): ReadingLesson {
  return {
    ...lesson,
    illustrationPath: getReadingLessonImage(lesson.id, lesson.illustrationPath),
  };
}

function enrichListening(lesson: ListeningLesson): ListeningLesson {
  return {
    ...lesson,
    illustrationPath: getListeningLessonImage(lesson.id, lesson.illustrationPath),
  };
}

function enrichSpeaking(act: SpeakingActivity): SpeakingActivity {
  return {
    ...act,
    illustrationPath: getSpeakingActivityImage(act.id, act.illustrationPath),
  };
}

function enrichWriting(lesson: WritingLesson): WritingLesson {
  return {
    ...lesson,
    illustrationPath: getWritingLessonImage(lesson.id, lesson.illustrationPath),
  };
}

function enrichExam(pack: ExamPack): ExamPack {
  return {
    ...pack,
    illustrationPath: getExamPackImage(pack.id, pack.illustrationPath),
  };
}

function enrichDrill(drill: PronunciationDrill): PronunciationDrill {
  return {
    ...drill,
    illustrationPath: getAudioLabDrillImage(drill.id, drill.illustrationPath),
  };
}

/**
 * LessonContentService decouples all educational content from UI components.
 * In future cloud versions, this service can fetch remote lesson packs with local caching.
 */
export const LessonContentService = {
  getLevelOrder(level: CEFRLevel): number {
    return LEVEL_ORDER[level];
  },

  getVocabTopics(): VocabTopic[] {
    return VOCABULARY_TOPICS.map(enrichTopic);
  },

  getVocabTopicById(topicId: string): VocabTopic | undefined {
    const found = VOCABULARY_TOPICS.find((t) => t.id === topicId);
    return found ? enrichTopic(found) : undefined;
  },

  getAllVocabWords(): (VocabWord & { topicId: string; topicTitleAr: string })[] {
    return VOCABULARY_TOPICS.flatMap((topic) =>
      topic.words.map((w) => ({
        ...w,
        topicId: topic.id,
        topicTitleAr: topic.titleAr,
      }))
    );
  },

  getGrammarLessons(tier?: GrammarLesson['tier']): GrammarLesson[] {
    const list = tier ? GRAMMAR_LESSONS.filter((g) => g.tier === tier) : GRAMMAR_LESSONS;
    return list.map(enrichGrammar);
  },

  getGrammarLessonById(id: string): GrammarLesson | undefined {
    const found = GRAMMAR_LESSONS.find((g) => g.id === id);
    return found ? enrichGrammar(found) : undefined;
  },

  getReadingLessons(level?: CEFRLevel): ReadingLesson[] {
    const list = level ? READING_LESSONS.filter((r) => r.level === level) : READING_LESSONS;
    return list.map(enrichReading);
  },

  getReadingLessonById(id: string): ReadingLesson | undefined {
    const found = READING_LESSONS.find((r) => r.id === id);
    return found ? enrichReading(found) : undefined;
  },

  getListeningLessons(level?: CEFRLevel): ListeningLesson[] {
    const list = level ? LISTENING_LESSONS.filter((l) => l.level === level) : LISTENING_LESSONS;
    return list.map(enrichListening);
  },

  getListeningLessonById(id: string): ListeningLesson | undefined {
    const found = LISTENING_LESSONS.find((l) => l.id === id);
    return found ? enrichListening(found) : undefined;
  },

  getSpeakingActivities(level?: CEFRLevel): SpeakingActivity[] {
    const list = level ? SPEAKING_ACTIVITIES.filter((s) => s.level === level) : SPEAKING_ACTIVITIES;
    return list.map(enrichSpeaking);
  },

  getSpeakingActivityById(id: string): SpeakingActivity | undefined {
    const found = SPEAKING_ACTIVITIES.find((s) => s.id === id);
    return found ? enrichSpeaking(found) : undefined;
  },

  getWritingLessons(level?: CEFRLevel): WritingLesson[] {
    const list = level ? WRITING_LESSONS.filter((w) => w.level === level) : WRITING_LESSONS;
    return list.map(enrichWriting);
  },

  getWritingLessonById(id: string): WritingLesson | undefined {
    const found = WRITING_LESSONS.find((w) => w.id === id);
    return found ? enrichWriting(found) : undefined;
  },

  getExamPacks(): ExamPack[] {
    return EXAM_PACKS.map(enrichExam);
  },

  getExamPackById(id: string): ExamPack | undefined {
    const found = EXAM_PACKS.find((e) => e.id === id);
    return found ? enrichExam(found) : undefined;
  },

  getPlacementQuestions(): PlacementQuestion[] {
    return PLACEMENT_QUESTIONS;
  },

  getAudioLabDrills(): PronunciationDrill[] {
    return AUDIO_LAB_DRILLS.map(enrichDrill);
  },

  getAudioLabDrillById(id: string): PronunciationDrill | undefined {
    const found = AUDIO_LAB_DRILLS.find((d) => d.id === id);
    return found ? enrichDrill(found) : undefined;
  },

  getAllUnifiedLessons(): UnifiedLessonDescriptor[] {
    const list: UnifiedLessonDescriptor[] = [];
    let idx = 1;

    for (const rawTopic of VOCABULARY_TOPICS) {
      const topic = enrichTopic(rawTopic);
      list.push({
        id: `vocab_${topic.id}`,
        moduleId: 'vocabulary',
        level: topic.level,
        titleAr: `مفردات: ${topic.titleAr}`,
        titleEn: topic.titleEn,
        route: `/modules/vocabulary?topic=${topic.id}`,
        orderIndex: idx++,
        illustrationPath: topic.illustrationPath!,
      });
    }

    for (const rawGr of GRAMMAR_LESSONS) {
      const gr = enrichGrammar(rawGr);
      list.push({
        id: gr.id,
        moduleId: 'grammar',
        level: gr.level,
        titleAr: `قواعد: ${gr.titleAr}`,
        titleEn: gr.titleEn,
        route: `/modules/grammar?lesson=${gr.id}`,
        orderIndex: idx++,
        illustrationPath: gr.illustrationPath!,
      });
    }

    for (const rawRd of READING_LESSONS) {
      const rd = enrichReading(rawRd);
      list.push({
        id: rd.id,
        moduleId: 'reading',
        level: rd.level,
        titleAr: `قراءة: ${rd.titleAr}`,
        titleEn: rd.titleEn,
        route: `/modules/reading?lesson=${rd.id}`,
        orderIndex: idx++,
        illustrationPath: rd.illustrationPath!,
      });
    }

    for (const rawLs of LISTENING_LESSONS) {
      const ls = enrichListening(rawLs);
      list.push({
        id: ls.id,
        moduleId: 'listening',
        level: ls.level,
        titleAr: `استماع: ${ls.titleAr}`,
        titleEn: ls.titleEn,
        route: `/modules/listening?lesson=${ls.id}`,
        orderIndex: idx++,
        illustrationPath: ls.illustrationPath!,
      });
    }

    for (const rawSp of SPEAKING_ACTIVITIES) {
      const sp = enrichSpeaking(rawSp);
      list.push({
        id: sp.id,
        moduleId: 'speaking',
        level: sp.level,
        titleAr: `محادثة: ${sp.titleAr}`,
        titleEn: sp.titleEn,
        route: `/modules/speaking?lesson=${sp.id}`,
        orderIndex: idx++,
        illustrationPath: sp.illustrationPath!,
      });
    }

    for (const rawWr of WRITING_LESSONS) {
      const wr = enrichWriting(rawWr);
      list.push({
        id: wr.id,
        moduleId: 'writing',
        level: wr.level,
        titleAr: `كتابة: ${wr.titleAr}`,
        titleEn: wr.titleEn,
        route: `/modules/writing?lesson=${wr.id}`,
        orderIndex: idx++,
        illustrationPath: wr.illustrationPath!,
      });
    }

    for (const rawEx of EXAM_PACKS) {
      const ex = enrichExam(rawEx);
      list.push({
        id: ex.id,
        moduleId: 'exams',
        level: ex.level,
        titleAr: `اختبار: ${ex.titleAr}`,
        titleEn: ex.titleEn,
        route: `/modules/exams?pack=${ex.id}`,
        orderIndex: idx++,
        illustrationPath: ex.illustrationPath!,
      });
    }

    for (const rawDrill of AUDIO_LAB_DRILLS) {
      const drill = enrichDrill(rawDrill);
      list.push({
        id: drill.id,
        moduleId: 'audio_lab',
        level: drill.level,
        titleAr: `مختبر النطق: ${drill.titleAr}`,
        titleEn: drill.targetEn,
        route: `/audio-lab?drill=${drill.id}`,
        orderIndex: idx++,
        illustrationPath: drill.illustrationPath!,
      });
    }

    return list.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
  },
};
