export interface SyncStatus {
  isEnabled: boolean;
  mode: 'local_only' | 'cloud_ready';
  lastSyncedAt: string | null;
  messageAr: string;
}

export interface ISyncService {
  isEnabled(): boolean;
  getStatus(): SyncStatus;
  syncProfile(_profileId: string): Promise<SyncStatus>;
}

/**
 * LocalOnlySyncService is intentionally disabled in the initial GitHub Pages release.
 * Future cloud integration can swap this implementation with a REST/GraphQL/Firebase
 * sync provider without modifying any UI or curriculum modules.
 */
class LocalOnlySyncService implements ISyncService {
  isEnabled(): boolean {
    return false;
  }

  getStatus(): SyncStatus {
    return {
      isEnabled: false,
      mode: 'local_only',
      lastSyncedAt: null,
      messageAr:
        'يُحفظ التقدم محلياً على هذا الجهاز فقط في الإصدار الحالي، مع جاهزية البنية للربط السحابي مستقبلاً.',
    };
  }

  async syncProfile(_profileId: string): Promise<SyncStatus> {
    return this.getStatus();
  }
}

export const SyncService: ISyncService = new LocalOnlySyncService();
