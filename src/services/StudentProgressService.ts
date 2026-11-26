import { BADGE_DEFINITIONS } from '../data/curriculumMeta';
import {
  BackupPayload,
  CEFRLevel,
  GradeBand,
  LessonProgressRecord,
  ModuleId,
  PlacementResult,
  PronunciationLogRecord,
  StudentProfile,
  VocabSRSRecord,
} from '../types/academy';
import { AnalyticsService } from './AnalyticsService';
import { AssessmentService } from './AssessmentService';
import { LessonContentService, UnifiedLessonDescriptor } from './LessonContentService';
import { storageAdapter } from './StorageAdapter';
import { UserSettingsService } from './UserSettingsService';

const AVATAR_COLORS = ['#0F766E', '#0369A1', '#B45309', '#4338CA', '#047857'];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const CEFR_SEQUENCE: CEFRLevel[] = ['Pre-A1', 'A1', 'A2', 'A2+', 'B1', 'B2'];

export function getStageDefaultLevel(gradeBand: GradeBand): CEFRLevel {
  if (gradeBand === 'preparatory') return 'B2';
  if (gradeBand === 'middle') return 'A2+';
  return 'Pre-A1';
}

export function getStageLabelAr(gradeBand: GradeBand): string {
  if (gradeBand === 'preparatory') return 'المرحلة الإعدادية';
  if (gradeBand === 'middle') return 'المرحلة المتوسطة';
  return 'المرحلة الابتدائية';
}

export interface LearningPathNode {
  lesson: UnifiedLessonDescriptor;
  status: 'completed' | 'available' | 'recommended' | 'needs_review' | 'locked';
  score?: number;
}

export const StudentProgressService = {
  async listProfiles(): Promise<StudentProfile[]> {
    const profiles = await storageAdapter.getAll<StudentProfile>('profiles');
    return profiles.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async getActiveProfile(): Promise<StudentProfile | null> {
    const settings = UserSettingsService.load();
    const profiles = await this.listProfiles();
    if (profiles.length === 0) return null;

    if (settings.activeProfileId) {
      const matched = profiles.find((p) => p.id === settings.activeProfileId);
      if (matched) return matched;
    }

    UserSettingsService.save({ activeProfileId: profiles[0].id });
    return profiles[0];
  },

  async createProfile(
    nickname: string,
    gradeBand: GradeBand,
    initialLevel?: CEFRLevel
  ): Promise<StudentProfile> {
    const cleanName = nickname.trim().slice(0, 32) || 'متعلم جديد';
    const profiles = await this.listProfiles();
    const color = AVATAR_COLORS[profiles.length % AVATAR_COLORS.length];
    const today = todayKey();
    const startLevel = initialLevel ?? getStageDefaultLevel(gradeBand);

    const profile: StudentProfile = {
      id: `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      nickname: cleanName,
      gradeBand,
      avatarColor: color,
      currentLevel: startLevel,
      recommendedStartLevel: startLevel,
      placementCompleted: false,
      points: 0,
      streakDays: 1,
      lastActiveDate: today,
      weeklyGoalLessons: 5,
      unlockedBadges: [],
      dailyActivity: { [today]: 1 },
      createdAt: new Date().toISOString(),
    };

    await storageAdapter.set('profiles', profile);
    UserSettingsService.save({ activeProfileId: profile.id });
    return profile;
  },

  async updateProfile(profile: StudentProfile): Promise<StudentProfile> {
    await storageAdapter.set('profiles', profile);
    return profile;
  },

  async updateGradeBand(profileId: string, gradeBand: GradeBand): Promise<StudentProfile> {
    const profile = await storageAdapter.get<StudentProfile>('profiles', profileId);
    if (!profile) throw new Error('Profile not found');

    const stageDefaultLevel = getStageDefaultLevel(gradeBand);
    const updated: StudentProfile = {
      ...profile,
      gradeBand,
      currentLevel: stageDefaultLevel,
      recommendedStartLevel: profile.placementCompleted
        ? profile.recommendedStartLevel
        : stageDefaultLevel,
    };

    await storageAdapter.set('profiles', updated);
    return updated;
  },

  async switchActiveProfile(profileId: string): Promise<StudentProfile | null> {
    const profile = await storageAdapter.get<StudentProfile>('profiles', profileId);
    if (!profile) return null;
    UserSettingsService.save({ activeProfileId: profile.id });
    return profile;
  },

  async getLessonProgress(profileId: string): Promise<LessonProgressRecord[]> {
    const all = await storageAdapter.getAll<LessonProgressRecord>('progress');
    return all.filter((r) => r.profileId === profileId);
  },

  async getVocabSRS(profileId: string): Promise<VocabSRSRecord[]> {
    const all = await storageAdapter.getAll<VocabSRSRecord>('vocab_srs');
    return all.filter((r) => r.profileId === profileId);
  },

  async recordLessonCompletion(
    profileId: string,
    lessonId: string,
    moduleId: ModuleId,
    level: CEFRLevel,
    score: number
  ): Promise<{ profile: StudentProfile; newlyUnlockedBadges: string[]; pointsEarned: number }> {
    const profile = await storageAdapter.get<StudentProfile>('profiles', profileId);
    if (!profile) throw new Error('Profile not found');

    const recordId = `${profileId}::${lessonId}`;
    const existing = await storageAdapter.get<LessonProgressRecord>('progress', recordId);

    const safeScore = Math.max(0, Math.min(100, Math.round(score)));
    const record: LessonProgressRecord = {
      id: recordId,
      profileId,
      lessonId,
      moduleId,
      level,
      completed: safeScore >= 50 || (existing?.completed ?? false),
      score: Math.max(safeScore, existing?.score ?? 0),
      attempts: (existing?.attempts ?? 0) + 1,
      lastPracticedAt: new Date().toISOString(),
    };

    await storageAdapter.set('progress', record);

    const pointsEarned = existing?.completed ? 15 : 40 + Math.round(safeScore / 5);
    const today = todayKey();
    const yest = yesterdayKey();

    let nextStreak = profile.streakDays;
    if (profile.lastActiveDate === yest) {
      nextStreak += 1;
    } else if (profile.lastActiveDate !== today) {
      nextStreak = 1;
    }

    const updatedDaily = { ...profile.dailyActivity };
    updatedDaily[today] = (updatedDaily[today] || 0) + 1;

    const updatedProfile: StudentProfile = {
      ...profile,
      points: profile.points + pointsEarned,
      streakDays: nextStreak,
      lastActiveDate: today,
      dailyActivity: updatedDaily,
    };

    const allProgress = await this.getLessonProgress(profileId);

    // Auto-advance CEFR level when student completes at least 3 lessons (or all) of their current tier
    const currentIdx = CEFR_SEQUENCE.indexOf(updatedProfile.currentLevel);
    if (currentIdx >= 0 && currentIdx < CEFR_SEQUENCE.length - 1) {
      const lessonsInCurrentLevel = LessonContentService.getAllUnifiedLessons().filter(
        (l) => l.level === updatedProfile.currentLevel
      ).length;
      const completedInCurrentLevel = allProgress.filter(
        (p) => p.completed && p.level === updatedProfile.currentLevel
      ).length;
      const advancementThreshold = Math.min(3, Math.max(1, lessonsInCurrentLevel));
      if (completedInCurrentLevel >= advancementThreshold) {
        updatedProfile.currentLevel = CEFR_SEQUENCE[currentIdx + 1];
      }
    }

    const allSRS = await this.getVocabSRS(profileId);
    const newlyUnlockedBadges = this.evaluateNewBadges(updatedProfile, allProgress, allSRS);
    if (newlyUnlockedBadges.length > 0) {
      updatedProfile.unlockedBadges = Array.from(
        new Set([...updatedProfile.unlockedBadges, ...newlyUnlockedBadges])
      );
    }

    await storageAdapter.set('profiles', updatedProfile);
    await AnalyticsService.logLessonCompleted(moduleId, lessonId, level, safeScore);

    return { profile: updatedProfile, newlyUnlockedBadges, pointsEarned };
  },

  async applyPlacementResult(
    profileId: string,
    result: PlacementResult
  ): Promise<StudentProfile> {
    const profile = await storageAdapter.get<StudentProfile>('profiles', profileId);
    if (!profile) throw new Error('Profile not found');

    await AssessmentService.savePlacementResult(result);

    const updated: StudentProfile = {
      ...profile,
      currentLevel: result.assignedLevel,
      recommendedStartLevel: result.assignedLevel,
      placementCompleted: true,
      points: profile.points + 50,
    };

    const allProgress = await this.getLessonProgress(profileId);
    const allSRS = await this.getVocabSRS(profileId);
    const newBadges = this.evaluateNewBadges(updated, allProgress, allSRS);
    updated.unlockedBadges = Array.from(new Set([...updated.unlockedBadges, ...newBadges]));

    await storageAdapter.set('profiles', updated);
    return updated;
  },

  /**
   * SM-2 inspired spaced repetition scheduler for Vocabulary Builder
   * quality: 1 (hard / repeat soon), 3 (good), 5 (mastered)
   */
  async reviewVocabularyWord(
    profileId: string,
    wordId: string,
    topicId: string,
    quality: 1 | 3 | 5
  ): Promise<VocabSRSRecord> {
    const id = `${profileId}::${wordId}`;
    const existing = await storageAdapter.get<VocabSRSRecord>('vocab_srs', id);

    let repetitions = existing?.repetitions ?? 0;
    let intervalDays = existing?.intervalDays ?? 0;
    let easeFactor = existing?.easeFactor ?? 2.5;

    if (quality < 3) {
      repetitions = 0;
      intervalDays = 1;
    } else {
      if (repetitions === 0) intervalDays = 1;
      else if (repetitions === 1) intervalDays = 3;
      else intervalDays = Math.round(intervalDays * easeFactor);
      repetitions += 1;
    }

    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const masteryLevel: VocabSRSRecord['masteryLevel'] =
      repetitions >= 3 ? 'mastered' : repetitions >= 1 ? 'learning' : 'new';

    const record: VocabSRSRecord = {
      id,
      profileId,
      wordId,
      topicId,
      repetitions,
      intervalDays,
      easeFactor,
      nextReviewAt: nextDate.toISOString(),
      lastReviewedAt: new Date().toISOString(),
      masteryLevel,
    };

    await storageAdapter.set('vocab_srs', record);

    const profile = await storageAdapter.get<StudentProfile>('profiles', profileId);
    if (profile) {
      const today = todayKey();
      const updatedDaily = { ...profile.dailyActivity };
      updatedDaily[today] = (updatedDaily[today] || 0) + 1;

      const updated: StudentProfile = {
        ...profile,
        points: profile.points + (quality === 5 ? 10 : 5),
        dailyActivity: updatedDaily,
        lastActiveDate: today,
      };
      const allProgress = await this.getLessonProgress(profileId);
      const allSRS = await this.getVocabSRS(profileId);
      const newBadges = this.evaluateNewBadges(updated, allProgress, allSRS);
      updated.unlockedBadges = Array.from(new Set([...updated.unlockedBadges, ...newBadges]));
      await storageAdapter.set('profiles', updated);
    }

    return record;
  },

  async getPronunciationLogs(profileId: string): Promise<PronunciationLogRecord[]> {
    const all = await storageAdapter.getAll<PronunciationLogRecord>('pronunciation_logs');
    return all
      .filter((r) => r.profileId === profileId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async recordPronunciationAttempt(
    profileId: string,
    drillId: string,
    level: CEFRLevel,
    accuracy: number,
    transcript: string,
    mode: 'speech_recognition' | 'self_practice'
  ): Promise<PronunciationLogRecord> {
    const id = `${profileId}::${drillId}`;
    const existing = await storageAdapter.get<PronunciationLogRecord>('pronunciation_logs', id);
    const safeAccuracy = Math.max(0, Math.min(100, Math.round(accuracy)));

    const record: PronunciationLogRecord = {
      id,
      profileId,
      drillId,
      level,
      bestAccuracy: Math.max(safeAccuracy, existing?.bestAccuracy ?? 0),
      lastAccuracy: safeAccuracy,
      attempts: (existing?.attempts ?? 0) + 1,
      lastTranscript: transcript,
      mode,
      updatedAt: new Date().toISOString(),
    };

    await storageAdapter.set('pronunciation_logs', record);

    if (safeAccuracy >= 65) {
      await this.recordLessonCompletion(profileId, drillId, 'audio_lab', level, safeAccuracy);
    }

    return record;
  },

  evaluateNewBadges(
    profile: StudentProfile,
    progress: LessonProgressRecord[],
    srs: VocabSRSRecord[]
  ): string[] {
    const completedCount = progress.filter((p) => p.completed).length;
    const learnedWordsCount = srs.filter((s) => s.repetitions >= 1).length;
    const newlyUnlocked: string[] = [];

    for (const badge of BADGE_DEFINITIONS) {
      if (profile.unlockedBadges.includes(badge.id)) continue;
      let met = false;
      if (badge.targetType === 'lessons') met = completedCount >= badge.threshold;
      if (badge.targetType === 'points') met = profile.points >= badge.threshold;
      if (badge.targetType === 'streak') met = profile.streakDays >= badge.threshold;
      if (badge.targetType === 'placement') met = profile.placementCompleted;
      if (badge.targetType === 'vocab') met = learnedWordsCount >= badge.threshold;
      if (met) newlyUnlocked.push(badge.id);
    }

    return newlyUnlocked;
  },

  /**
   * Builds an adaptive Learning Path.
   * Immediately unlocks all lessons belonging to the student's chosen school stage
   * (Primary: Pre-A1..A1+, Middle: Pre-A1..B1, Preparatory: Pre-A1..B2),
   * allows reviewing earlier lessons, recommends revision if score < 70%,
   * and advances automatically as lessons are completed.
   */
  async buildLearningPath(profile: StudentProfile): Promise<LearningPathNode[]> {
    const allLessons = LessonContentService.getAllUnifiedLessons();
    const progressList = await this.getLessonProgress(profile.id);
    const placement = await AssessmentService.getPlacementResult(profile.id);
    const progressMap = new Map(progressList.map((p) => [p.lessonId, p]));

    const currentOrder = LessonContentService.getLevelOrder(profile.currentLevel);
    const stageMinOrder = LessonContentService.getLevelOrder(
      getStageDefaultLevel(profile.gradeBand)
    );
    const effectiveOrder = Math.max(currentOrder, stageMinOrder);
    const recommendedModules = new Set(placement?.recommendedModules || []);

    let foundNextRecommendation = false;

    return allLessons.map((lesson) => {
      const prog = progressMap.get(lesson.id);
      const lessonOrder = LessonContentService.getLevelOrder(lesson.level);

      if (prog?.completed) {
        if (prog.score < 70) {
          return { lesson, status: 'needs_review', score: prog.score };
        }
        return { lesson, status: 'completed', score: prog.score };
      }

      // Preparatory stage unlocks all levels including B2 immediately;
      // Middle stage unlocks Pre-A1 through B1 immediately; Primary opens progressively from Pre-A1.
      if (
        lesson.level === 'B2' &&
        effectiveOrder < 5 &&
        profile.gradeBand !== 'preparatory'
      ) {
        return { lesson, status: 'locked' };
      }

      if (lessonOrder > effectiveOrder + 1) {
        return { lesson, status: 'locked' };
      }

      if (
        !foundNextRecommendation &&
        lessonOrder >= effectiveOrder &&
        (recommendedModules.size === 0 || recommendedModules.has(lesson.moduleId))
      ) {
        foundNextRecommendation = true;
        return { lesson, status: 'recommended', score: prog?.score };
      }

      return { lesson, status: 'available', score: prog?.score };
    });
  },

  async resetProfileProgress(profileId: string): Promise<StudentProfile> {
    const profile = await storageAdapter.get<StudentProfile>('profiles', profileId);
    if (!profile) throw new Error('Profile not found');

    const progress = await this.getLessonProgress(profileId);
    for (const p of progress) await storageAdapter.delete('progress', p.id);

    const srs = await this.getVocabSRS(profileId);
    for (const s of srs) await storageAdapter.delete('vocab_srs', s.id);

    const assessments = await AssessmentService.getAttemptsByProfile(profileId);
    for (const a of assessments) await storageAdapter.delete('assessments', a.id);

    const pronLogs = await this.getPronunciationLogs(profileId);
    for (const pl of pronLogs) await storageAdapter.delete('pronunciation_logs', pl.id);

    await storageAdapter.delete('placements', `${profileId}::placement`);

    const today = todayKey();
    const defaultStageLevel = getStageDefaultLevel(profile.gradeBand);
    const resetProfile: StudentProfile = {
      ...profile,
      currentLevel: defaultStageLevel,
      recommendedStartLevel: defaultStageLevel,
      placementCompleted: false,
      points: 0,
      streakDays: 1,
      lastActiveDate: today,
      unlockedBadges: [],
      dailyActivity: { [today]: 0 },
    };

    await storageAdapter.set('profiles', resetProfile);
    return resetProfile;
  },

  async exportProfileBackup(profileId: string): Promise<BackupPayload> {
    const profile = await storageAdapter.get<StudentProfile>('profiles', profileId);
    if (!profile) throw new Error('Profile not found');

    const lessonProgress = await this.getLessonProgress(profileId);
    const vocabSrs = await this.getVocabSRS(profileId);
    const assessments = await AssessmentService.getAttemptsByProfile(profileId);
    const placementResult = await AssessmentService.getPlacementResult(profileId);
    const pronunciationLogs = await this.getPronunciationLogs(profileId);

    return {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appIdentifier: 'ENGLISH_LEARNING_ACADEMY',
      profile,
      lessonProgress,
      vocabSrs,
      assessments,
      placementResult,
      pronunciationLogs,
    };
  },

  async importProfileBackup(rawJson: string): Promise<StudentProfile> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error('ملف النسخة الاحتياطية غير صالح (تنسيق JSON غير صحيح).');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('بنية ملف النسخة الاحتياطية غير صالحة.');
    }

    const payload = parsed as Partial<BackupPayload>;
    if (
      payload.appIdentifier !== 'ENGLISH_LEARNING_ACADEMY' ||
      payload.schemaVersion !== 1 ||
      !payload.profile ||
      typeof payload.profile.nickname !== 'string' ||
      !Array.isArray(payload.lessonProgress) ||
      !Array.isArray(payload.vocabSrs) ||
      !Array.isArray(payload.assessments)
    ) {
      throw new Error('هذا الملف لا يطابق نسخة احتياطية صالحة لأكاديمية اللغة الإنجليزية.');
    }

    const validLevels: CEFRLevel[] = ['Pre-A1', 'A1', 'A2', 'A2+', 'B1', 'B2'];
    const importedLevel = validLevels.includes(payload.profile.currentLevel)
      ? payload.profile.currentLevel
      : 'Pre-A1';

    const validBands: GradeBand[] = ['primary', 'middle', 'preparatory'];
    const importedBand = validBands.includes(payload.profile.gradeBand)
      ? payload.profile.gradeBand
      : 'primary';

    const newProfileId = `prof_imp_${Date.now()}`;
    const importedProfile: StudentProfile = {
      ...payload.profile,
      id: newProfileId,
      nickname: payload.profile.nickname.trim().slice(0, 32) || 'طالب مستعاد',
      gradeBand: importedBand,
      currentLevel: importedLevel,
      points: Number.isFinite(payload.profile.points) ? Math.max(0, payload.profile.points) : 0,
      streakDays: Number.isFinite(payload.profile.streakDays)
        ? Math.max(1, payload.profile.streakDays)
        : 1,
      unlockedBadges: Array.isArray(payload.profile.unlockedBadges)
        ? payload.profile.unlockedBadges.filter((b): b is string => typeof b === 'string')
        : [],
      dailyActivity:
        payload.profile.dailyActivity && typeof payload.profile.dailyActivity === 'object'
          ? payload.profile.dailyActivity
          : {},
    };

    await storageAdapter.set('profiles', importedProfile);

    for (const item of payload.lessonProgress) {
      if (item && typeof item.lessonId === 'string') {
        await storageAdapter.set('progress', {
          ...item,
          id: `${newProfileId}::${item.lessonId}`,
          profileId: newProfileId,
        });
      }
    }

    for (const srs of payload.vocabSrs) {
      if (srs && typeof srs.wordId === 'string') {
        await storageAdapter.set('vocab_srs', {
          ...srs,
          id: `${newProfileId}::${srs.wordId}`,
          profileId: newProfileId,
        });
      }
    }

    for (const asm of payload.assessments) {
      if (asm && typeof asm.assessmentId === 'string') {
        await storageAdapter.set('assessments', {
          ...asm,
          id: `asm_imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          profileId: newProfileId,
        });
      }
    }

    if (payload.placementResult && typeof payload.placementResult.assignedLevel === 'string') {
      await storageAdapter.set('placements', {
        ...payload.placementResult,
        id: `${newProfileId}::placement`,
        profileId: newProfileId,
      });
    }

    if (Array.isArray(payload.pronunciationLogs)) {
      for (const pl of payload.pronunciationLogs) {
        if (pl && typeof pl.drillId === 'string') {
          await storageAdapter.set('pronunciation_logs', {
            ...pl,
            id: `${newProfileId}::${pl.drillId}`,
            profileId: newProfileId,
          });
        }
      }
    }

    UserSettingsService.save({ activeProfileId: newProfileId });
    return importedProfile;
  },
};
