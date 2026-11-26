import { AnalyticsEvent, CEFRLevel, ModuleId } from '../types/academy';
import { storageAdapter } from './StorageAdapter';

/**
 * Optional provider interface for a future privacy-conscious analytics service.
 * In the initial GitHub Pages release, no external data or student PII is transmitted.
 */
export interface IAnalyticsProvider {
  track(event: AnalyticsEvent): Promise<void>;
}

const MAX_LOCAL_DIAGNOSTIC_LOGS = 200;

class LocalDeveloperAnalyticsService {
  private externalProvider: IAnalyticsProvider | null = null;

  registerProvider(provider: IAnalyticsProvider): void {
    this.externalProvider = provider;
  }

  private createId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private async record(event: AnalyticsEvent): Promise<void> {
    try {
      // Strictly anonymous diagnostics: no student nicknames, emails, or personal records.
      await storageAdapter.set('analytics_log', event);
      const all = await storageAdapter.getAll<AnalyticsEvent>('analytics_log');
      if (all.length > MAX_LOCAL_DIAGNOSTIC_LOGS) {
        const sorted = all.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        const toDelete = sorted.slice(0, all.length - MAX_LOCAL_DIAGNOSTIC_LOGS);
        for (const oldEvt of toDelete) {
          await storageAdapter.delete('analytics_log', oldEvt.id);
        }
      }
      if (this.externalProvider) {
        await this.externalProvider.track(event);
      }
    } catch {
      // Diagnostics must never disrupt learning flow
    }
  }

  async logLessonStarted(moduleId: ModuleId, lessonId: string, level: CEFRLevel): Promise<void> {
    await this.record({
      id: this.createId(),
      eventType: 'lesson_started',
      moduleId,
      lessonId,
      level,
      timestamp: new Date().toISOString(),
    });
  }

  async logLessonCompleted(
    moduleId: ModuleId,
    lessonId: string,
    level: CEFRLevel,
    score: number
  ): Promise<void> {
    await this.record({
      id: this.createId(),
      eventType: 'lesson_completed',
      moduleId,
      lessonId,
      level,
      score,
      timestamp: new Date().toISOString(),
    });
  }

  async logPlacementCompleted(level: CEFRLevel, score: number): Promise<void> {
    await this.record({
      id: this.createId(),
      eventType: 'placement_completed',
      level,
      score,
      timestamp: new Date().toISOString(),
    });
  }

  async logError(context: string, err: unknown): Promise<void> {
    const message = err instanceof Error ? err.message : String(err);
    await this.record({
      id: this.createId(),
      eventType: 'app_error',
      errorMessage: `${context}: ${message}`.slice(0, 240),
      timestamp: new Date().toISOString(),
    });
  }

  async getLocalDiagnostics(): Promise<AnalyticsEvent[]> {
    return storageAdapter.getAll<AnalyticsEvent>('analytics_log');
  }
}

export const AnalyticsService = new LocalDeveloperAnalyticsService();
