import {
  AssessmentAttempt,
  CEFRLevel,
  ModuleId,
  PlacementQuestion,
  PlacementResult,
  SkillDomain,
} from '../types/academy';
import { AnalyticsService } from './AnalyticsService';
import { storageAdapter } from './StorageAdapter';

const SKILL_LABELS_AR: Record<SkillDomain, string> = {
  vocabulary: 'المفردات',
  grammar: 'القواعد',
  reading: 'الفهم القرائي',
  listening: 'الاستماع',
  sentence_construction: 'بناء الجملة',
  writing: 'الكتابة والترقيم',
  speaking: 'المحادثة والنطق',
};

const SKILL_TO_MODULE: Record<SkillDomain, ModuleId> = {
  vocabulary: 'vocabulary',
  grammar: 'grammar',
  reading: 'reading',
  listening: 'listening',
  sentence_construction: 'grammar',
  writing: 'writing',
  speaking: 'speaking',
};

export const AssessmentService = {
  getSkillLabelAr(skill: SkillDomain): string {
    return SKILL_LABELS_AR[skill];
  },

  normalizeAnswer(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[.!?،,]+$/g, '')
      .replace(/\s+/g, ' ');
  },

  evaluatePlacementTest(
    profileId: string,
    questions: PlacementQuestion[],
    answers: Record<string, string>,
    includeOptionalSpeaking: boolean
  ): PlacementResult {
    const activeQuestions = includeOptionalSpeaking
      ? questions
      : questions.filter((q) => q.type !== 'speaking_optional');

    const skillEarned: Record<SkillDomain, number> = {
      vocabulary: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
      sentence_construction: 0,
      writing: 0,
      speaking: 0,
    };
    const skillMax: Record<SkillDomain, number> = {
      vocabulary: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
      sentence_construction: 0,
      writing: 0,
      speaking: 0,
    };

    let totalWeight = 0;
    let earnedWeight = 0;

    for (const q of activeQuestions) {
      totalWeight += q.weight;
      skillMax[q.skill] += q.weight;

      const userAns = answers[q.id] || '';
      const isCorrect =
        q.type === 'speaking_optional'
          ? userAns === 'SELF_CONFIRMED' ||
            this.normalizeAnswer(userAns).includes('learning english')
          : this.normalizeAnswer(userAns) === this.normalizeAnswer(q.correctAnswer);

      if (isCorrect) {
        earnedWeight += q.weight;
        skillEarned[q.skill] += q.weight;
      }
    }

    const overallScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    let assignedLevel: CEFRLevel = 'Pre-A1';
    if (overallScore >= 92) assignedLevel = 'B2';
    else if (overallScore >= 78) assignedLevel = 'B1';
    else if (overallScore >= 64) assignedLevel = 'A2+';
    else if (overallScore >= 48) assignedLevel = 'A2';
    else if (overallScore >= 28) assignedLevel = 'A1';
    else assignedLevel = 'Pre-A1';

    const skillScores: Record<SkillDomain, number> = {
      vocabulary: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
      sentence_construction: 0,
      writing: 0,
      speaking: includeOptionalSpeaking ? 0 : 70,
    };

    const evaluatedDomains: SkillDomain[] = [
      'vocabulary',
      'grammar',
      'reading',
      'listening',
      'sentence_construction',
      'writing',
    ];
    if (includeOptionalSpeaking) evaluatedDomains.push('speaking');

    for (const domain of evaluatedDomains) {
      skillScores[domain] =
        skillMax[domain] > 0
          ? Math.round((skillEarned[domain] / skillMax[domain]) * 100)
          : 0;
    }

    const strengths = evaluatedDomains.filter((d) => skillScores[d] >= 65);
    const weaknesses = evaluatedDomains.filter((d) => skillScores[d] < 65);

    const recommendedModulesSet = new Set<ModuleId>();
    for (const w of weaknesses) {
      recommendedModulesSet.add(SKILL_TO_MODULE[w]);
    }
    if (recommendedModulesSet.size === 0) {
      recommendedModulesSet.add('reading');
      recommendedModulesSet.add('writing');
      recommendedModulesSet.add('exams');
    }

    const strengthsText =
      strengths.length > 0
        ? strengths.map((s) => SKILL_LABELS_AR[s]).join('، ')
        : 'المثابرة والاستعداد للتأسيس';
    const weaknessesText =
      weaknesses.length > 0
        ? weaknesses.map((w) => SKILL_LABELS_AR[w]).join('، ')
        : 'لا توجد فجوات حرجة؛ يمكنك التقدم مباشرة في المستوى الموصى به';

    const summaryAr = `بناءً على أدائك الفعلي في مهارات اللغة (${overallScore}%)، مستواك المبدئي الموصى به هو ${assignedLevel}. نقاط القوة الحالية: ${strengthsText}. المهارات التي يُنصح بالتركيز عليها: ${weaknessesText}.`;

    return {
      id: `${profileId}::placement`,
      profileId,
      takenAt: new Date().toISOString(),
      overallScore,
      assignedLevel,
      skillScores,
      strengths,
      weaknesses,
      recommendedModules: Array.from(recommendedModulesSet),
      summaryAr,
    };
  },

  async savePlacementResult(result: PlacementResult): Promise<void> {
    await storageAdapter.set('placements', result);
    await AnalyticsService.logPlacementCompleted(result.assignedLevel, result.overallScore);
  },

  async getPlacementResult(profileId: string): Promise<PlacementResult | null> {
    return storageAdapter.get<PlacementResult>('placements', `${profileId}::placement`);
  },

  async recordAssessmentAttempt(
    attempt: Omit<AssessmentAttempt, 'id' | 'completedAt'>
  ): Promise<AssessmentAttempt> {
    const record: AssessmentAttempt = {
      ...attempt,
      id: `asm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      completedAt: new Date().toISOString(),
    };
    await storageAdapter.set('assessments', record);
    return record;
  },

  async getAttemptsByProfile(profileId: string): Promise<AssessmentAttempt[]> {
    const all = await storageAdapter.getAll<AssessmentAttempt>('assessments');
    return all
      .filter((a) => a.profileId === profileId)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  },
};
