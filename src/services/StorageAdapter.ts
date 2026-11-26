export type StoreName =
  | 'profiles'
  | 'progress'
  | 'vocab_srs'
  | 'assessments'
  | 'placements'
  | 'pronunciation_logs'
  | 'analytics_log';

export interface IStorageAdapter {
  get<T>(store: StoreName, key: string): Promise<T | null>;
  set<T extends { id: string }>(store: StoreName, value: T): Promise<void>;
  delete(store: StoreName, key: string): Promise<void>;
  getAll<T>(store: StoreName): Promise<T[]>;
  clear(store: StoreName): Promise<void>;
}

const DB_NAME = 'english_learning_academy_db';
const DB_VERSION = 2;
const STORES: StoreName[] = [
  'profiles',
  'progress',
  'vocab_srs',
  'assessments',
  'placements',
  'pronunciation_logs',
  'analytics_log',
];

/**
 * IndexedDBStorageAdapter implements persistent local device storage.
 * Can be replaced or decorated with a CloudDatabaseAdapter in future cloud migration
 * without changing any learning UI modules.
 */
class IndexedDBStorageAdapter implements IStorageAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback = new Map<string, string>();

  private isIndexedDBAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
    } catch {
      return false;
    }
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!this.isIndexedDBAvailable()) {
        reject(new Error('IndexedDB is unavailable'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        for (const storeName of STORES) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    });

    return this.dbPromise;
  }

  private fallbackKey(store: StoreName): string {
    return `ela_fallback_${store}`;
  }

  private readFallbackStore<T>(store: StoreName): T[] {
    try {
      const raw =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(this.fallbackKey(store))
          : this.memoryFallback.get(this.fallbackKey(store)) || null;
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  private writeFallbackStore<T>(store: StoreName, items: T[]): void {
    const serialized = JSON.stringify(items);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.fallbackKey(store), serialized);
      } else {
        this.memoryFallback.set(this.fallbackKey(store), serialized);
      }
    } catch {
      this.memoryFallback.set(this.fallbackKey(store), serialized);
    }
  }

  async get<T>(store: StoreName, key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return await new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const items = this.readFallbackStore<T & { id: string }>(store);
      return items.find((item) => item.id === key) ?? null;
    }
  }

  async set<T extends { id: string }>(store: StoreName, value: T): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(value);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const items = this.readFallbackStore<T>(store).filter((i) => i.id !== value.id);
      items.push(value);
      this.writeFallbackStore(store, items);
    }
  }

  async delete(store: StoreName, key: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const items = this.readFallbackStore<{ id: string }>(store).filter((i) => i.id !== key);
      this.writeFallbackStore(store, items);
    }
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    try {
      const db = await this.getDB();
      return await new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve((req.result as T[]) ?? []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.readFallbackStore<T>(store);
    }
  }

  async clear(store: StoreName): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.writeFallbackStore(store, []);
    }
  }
}

export const storageAdapter: IStorageAdapter = new IndexedDBStorageAdapter();
