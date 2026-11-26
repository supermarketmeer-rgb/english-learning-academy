import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BADGE_DEFINITIONS } from '../data/curriculumMeta';
import { AnalyticsService } from '../services/AnalyticsService';
import { AssessmentService } from '../services/AssessmentService';
import { getStageLabelAr, StudentProgressService } from '../services/StudentProgressService';
import { UserSettingsService } from '../services/UserSettingsService';
import {
  AssessmentAttempt,
  CEFRLevel,
  GradeBand,
  LessonProgressRecord,
  ModuleId,
  PlacementResult,
  PronunciationLogRecord,
  StudentProfile,
  UserSettings,
  VocabSRSRecord,
} from '../types/academy';

interface AcademyContextValue {
  loading: boolean;
  profiles: StudentProfile[];
  activeProfile: StudentProfile | null;
  lessonProgress: LessonProgressRecord[];
  vocabSrs: VocabSRSRecord[];
  assessments: AssessmentAttempt[];
  placementResult: PlacementResult | null;
  pronunciationLogs: PronunciationLogRecord[];
  settings: UserSettings;
  celebrationMessage: string | null;
  dismissCelebration: () => void;
  toggleTheme: () => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  createAndActivateProfile: (nickname: string, gradeBand: GradeBand) => Promise<StudentProfile>;
  switchProfile: (profileId: string) => Promise<void>;
  changeActiveGradeBand: (gradeBand: GradeBand) => Promise<void>;
  refreshProfileData: () => Promise<void>;
  completeLesson: (
    lessonId: string,
    moduleId: ModuleId,
    level: CEFRLevel,
    score: number
  ) => Promise<void>;
  reviewWord: (wordId: string, topicId: string, quality: 1 | 3 | 5) => Promise<void>;
  savePlacement: (result: PlacementResult) => Promise<void>;
  resetActiveProgress: () => Promise<void>;
  importBackup: (rawJson: string) => Promise<StudentProfile>;
  logPronunciationAttempt: (
    drillId: string,
    level: CEFRLevel,
    accuracy: number,
    transcript: string,
    mode: 'speech_recognition' | 'self_practice'
  ) => Promise<void>;
}

const AcademyContext = createContext<AcademyContextValue | undefined>(undefined);

export const AcademyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<StudentProfile | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressRecord[]>([]);
  const [vocabSrs, setVocabSrs] = useState<VocabSRSRecord[]>([]);
  const [assessments, setAssessments] = useState<AssessmentAttempt[]>([]);
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(null);
  const [pronunciationLogs, setPronunciationLogs] = useState<PronunciationLogRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>(() => UserSettingsService.load());
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  useEffect(() => {
    UserSettingsService.applyThemeToDocument(settings.theme);
  }, [settings.theme]);

  const loadProfileDetails = useCallback(async (profile: StudentProfile | null) => {
    if (!profile) {
      setLessonProgress([]);
      setVocabSrs([]);
      setAssessments([]);
      setPlacementResult(null);
      setPronunciationLogs([]);
      return;
    }
    const [progress, srs, attempts, placement, pronLogs] = await Promise.all([
      StudentProgressService.getLessonProgress(profile.id),
      StudentProgressService.getVocabSRS(profile.id),
      AssessmentService.getAttemptsByProfile(profile.id),
      AssessmentService.getPlacementResult(profile.id),
      StudentProgressService.getPronunciationLogs(profile.id),
    ]);
    setLessonProgress(progress);
    setVocabSrs(srs);
    setAssessments(attempts);
    setPlacementResult(placement);
    setPronunciationLogs(pronLogs);
  }, []);

  const refreshProfileData = useCallback(async () => {
    try {
      let list = await StudentProgressService.listProfiles();
      let current = await StudentProgressService.getActiveProfile();
      if (!current && list.length === 0) {
        current = await StudentProgressService.createProfile('طالب الأكاديمية', 'primary', 'Pre-A1');
        list = await StudentProgressService.listProfiles();
      }
      setProfiles(list);
      setActiveProfile(current);
      await loadProfileDetails(current);
    } catch (err) {
      await AnalyticsService.logError('refreshProfileData', err);
    } finally {
      setLoading(false);
    }
  }, [loadProfileDetails]);

  useEffect(() => {
    refreshProfileData();
  }, [refreshProfileData]);

  const toggleTheme = useCallback(() => {
    setSettings((prev) =>
      UserSettingsService.save({ theme: prev.theme === 'dark' ? 'light' : 'dark' })
    );
  }, []);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(UserSettingsService.save(partial));
  }, []);

  const createAndActivateProfile = useCallback(
    async (nickname: string, gradeBand: GradeBand) => {
      const created = await StudentProgressService.createProfile(nickname, gradeBand);
      await refreshProfileData();
      return created;
    },
    [refreshProfileData]
  );

  const switchProfile = useCallback(
    async (profileId: string) => {
      const switched = await StudentProgressService.switchActiveProfile(profileId);
      if (switched) {
        setActiveProfile(switched);
        await loadProfileDetails(switched);
      }
    },
    [loadProfileDetails]
  );

  const changeActiveGradeBand = useCallback(
    async (gradeBand: GradeBand) => {
      if (!activeProfile) return;
      const updated = await StudentProgressService.updateGradeBand(activeProfile.id, gradeBand);
      setActiveProfile(updated);
      setProfiles(await StudentProgressService.listProfiles());
      setCelebrationMessage(`تم اختيار ${getStageLabelAr(gradeBand)} وفتح دروسها فوراً.`);
    },
    [activeProfile]
  );

  const completeLesson = useCallback(
    async (lessonId: string, moduleId: ModuleId, level: CEFRLevel, score: number) => {
      if (!activeProfile) return;
      const result = await StudentProgressService.recordLessonCompletion(
        activeProfile.id,
        lessonId,
        moduleId,
        level,
        score
      );
      setActiveProfile(result.profile);
      await loadProfileDetails(result.profile);
      setProfiles(await StudentProgressService.listProfiles());

      if (result.newlyUnlockedBadges.length > 0) {
        const badgeNames = result.newlyUnlockedBadges
          .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id)?.titleAr || id)
          .join('، ');
        setCelebrationMessage(
          `أحسنت! حصلت على ${result.pointsEarned} نقطة وفتحت شارة جديدة: ${badgeNames}.`
        );
      } else {
        setCelebrationMessage(`تم تسجيل إنجازك بنجاح! كسبت ${result.pointsEarned} نقطة تعليمية.`);
      }
    },
    [activeProfile, loadProfileDetails]
  );

  const reviewWord = useCallback(
    async (wordId: string, topicId: string, quality: 1 | 3 | 5) => {
      if (!activeProfile) return;
      await StudentProgressService.reviewVocabularyWord(
        activeProfile.id,
        wordId,
        topicId,
        quality
      );
      await refreshProfileData();
    },
    [activeProfile, refreshProfileData]
  );

  const savePlacement = useCallback(
    async (result: PlacementResult) => {
      if (!activeProfile) return;
      const updated = await StudentProgressService.applyPlacementResult(activeProfile.id, result);
      setActiveProfile(updated);
      await loadProfileDetails(updated);
      setProfiles(await StudentProgressService.listProfiles());
      setCelebrationMessage(`تم تحديد مستواك (${result.assignedLevel}) وتحديث مسارك التعليمي.`);
    },
    [activeProfile, loadProfileDetails]
  );

  const resetActiveProgress = useCallback(async () => {
    if (!activeProfile) return;
    const reset = await StudentProgressService.resetProfileProgress(activeProfile.id);
    setActiveProfile(reset);
    await loadProfileDetails(reset);
    setProfiles(await StudentProgressService.listProfiles());
  }, [activeProfile, loadProfileDetails]);

  const importBackup = useCallback(
    async (rawJson: string) => {
      const imported = await StudentProgressService.importProfileBackup(rawJson);
      await refreshProfileData();
      setCelebrationMessage(`تمت استعادة ملف "${imported.nickname}" بنجاح.`);
      return imported;
    },
    [refreshProfileData]
  );

  const logPronunciationAttempt = useCallback(
    async (
      drillId: string,
      level: CEFRLevel,
      accuracy: number,
      transcript: string,
      mode: 'speech_recognition' | 'self_practice'
    ) => {
      if (!activeProfile) return;
      await StudentProgressService.recordPronunciationAttempt(
        activeProfile.id,
        drillId,
        level,
        accuracy,
        transcript,
        mode
      );
      await refreshProfileData();
    },
    [activeProfile, refreshProfileData]
  );

  return (
    <AcademyContext.Provider
      value={{
        loading,
        profiles,
        activeProfile,
        lessonProgress,
        vocabSrs,
        assessments,
        placementResult,
        pronunciationLogs,
        settings,
        celebrationMessage,
        dismissCelebration: () => setCelebrationMessage(null),
        toggleTheme,
        updateSettings,
        createAndActivateProfile,
        switchProfile,
        changeActiveGradeBand,
        refreshProfileData,
        completeLesson,
        reviewWord,
        savePlacement,
        resetActiveProgress,
        importBackup,
        logPronunciationAttempt,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export function useAcademy(): AcademyContextValue {
  const ctx = useContext(AcademyContext);
  if (!ctx) throw new Error('useAcademy must be used inside AcademyProvider');
  return ctx;
}
