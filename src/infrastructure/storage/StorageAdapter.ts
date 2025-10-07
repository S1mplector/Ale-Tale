/**
 * Storage Adapter - Robust cross-browser storage
 * Priority: File System → IndexedDB → localStorage
 * Provides a unified interface regardless of storage backend
 */

import { fileSystemStorage } from './FileSystemStorageService';
import { indexedDBStorage, IndexedDBStorageService } from './IndexedDBStorageService';

export type StorageType = 'filesystem' | 'indexeddb' | 'localstorage';

export interface StorageHealth {
  healthy: boolean;
  type: StorageType;
  issues: string[];
  canUpgrade: boolean;
}

export interface StorageEstimate {
  usage: number;   // bytes used
  quota: number;   // total bytes available (best-effort estimate)
  type: StorageType;
  source: 'navigator' | 'computed' | 'unknown';
}

class StorageAdapter {
  private storageType: StorageType = 'indexeddb';
  private initialized = false;
  private setupRequired = false;
  private migrated = false;

  async initialize(): Promise<{ initialized: boolean; setupRequired: boolean }> {
    // Priority 1: Try File System Access API (if previously configured)
    if ('showDirectoryPicker' in window && this.isSecureContext()) {
      try {
        const fsInitialized = await fileSystemStorage.initialize();
        if (fsInitialized) {
          this.storageType = 'filesystem';
          this.initialized = true;
          this.setupRequired = false;
          console.log('✅ Using File System storage');
          return { initialized: true, setupRequired: false };
        }
      } catch (error) {
        console.log('File System not configured, trying IndexedDB...');
      }
    }

    // Priority 2: Try IndexedDB (cross-browser, reliable)
    if (IndexedDBStorageService.isSupported()) {
      try {
        const idbInitialized = await indexedDBStorage.initialize();
        if (idbInitialized) {
          this.storageType = 'indexeddb';
          this.initialized = true;
          this.setupRequired = false;
          
          // Auto-migrate from localStorage if needed
          await this.autoMigrateFromLocalStorage();
          
          console.log('✅ Using IndexedDB storage');
          return { initialized: true, setupRequired: false };
        }
      } catch (error) {
        console.error('IndexedDB initialization failed:', error);
      }
    }

    // Priority 3: Fall back to localStorage
    console.log('⚠️ Using localStorage (limited capacity)');
    this.storageType = 'localstorage';
    this.initialized = true;
    this.setupRequired = false;
    return { initialized: true, setupRequired: false };
  }

  private isSecureContext(): boolean {
    return window.isSecureContext || window.location.hostname === 'localhost';
  }

  private async autoMigrateFromLocalStorage(): Promise<void> {
    if (this.migrated) return;

    try {
      // Check if localStorage has data (support legacy and new keys)
      const hasLSData =
        localStorage.getItem('aletale_journal_entries') ||
        localStorage.getItem('aletale_bars') ||
        localStorage.getItem('journal-entries') ||
        localStorage.getItem('bars');
      
      if (!hasLSData) {
        this.migrated = true;
        return;
      }

      // Check if IndexedDB already has data
      const idbKeys = await indexedDBStorage.getAllKeys();
      if (idbKeys.length > 0) {
        this.migrated = true;
        return;
      }

      console.log('📦 Migrating data from localStorage to IndexedDB...');

      // Migrate journal entries (prefer new key, fallback to legacy)
      const entriesStr =
        localStorage.getItem('aletale_journal_entries') ??
        localStorage.getItem('journal-entries');
      if (entriesStr) {
        await indexedDBStorage.write('journal_entries', JSON.parse(entriesStr));
      }

      // Migrate bars (prefer new key, fallback to legacy)
      const barsStr =
        localStorage.getItem('aletale_bars') ??
        localStorage.getItem('bars');
      if (barsStr) {
        await indexedDBStorage.write('bars', JSON.parse(barsStr));
      }

      // Mark migration complete
      await indexedDBStorage.write('_migration_complete', {
        from: 'localstorage',
        to: 'indexeddb',
        timestamp: new Date().toISOString(),
      });

      this.migrated = true;
      console.log('✅ Migration complete');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  async setupFileSystem(): Promise<boolean> {
    if (!('showDirectoryPicker' in window)) {
      return false;
    }

    try {
      const success = await fileSystemStorage.selectDirectory();
      if (success) {
        this.storageType = 'filesystem';
        this.initialized = true;
        this.setupRequired = false;
        return true;
      }
    } catch (error) {
      console.error('Failed to setup file system:', error);
    }

    return false;
  }

  needsSetup(): boolean {
    return this.setupRequired;
  }

  async read<T>(key: string): Promise<T | null> {
    if (!this.initialized) {
      const result = await this.initialize();
      if (result.setupRequired) {
        throw new Error('Storage setup required. Please complete the setup process.');
      }
    }

    switch (this.storageType) {
      case 'filesystem':
        return await fileSystemStorage.readFile<T>(`${key}.json`);
      
      case 'indexeddb':
        return await indexedDBStorage.read<T>(key);
      
      case 'localstorage':
      default:
        const data = localStorage.getItem(`aletale_${key}`);
        return data ? JSON.parse(data) : null;
    }
  }

  async write<T>(key: string, data: T): Promise<void> {
    if (!this.initialized) {
      const result = await this.initialize();
      if (result.setupRequired) {
        throw new Error('Storage setup required. Please complete the setup process.');
      }
    }

    switch (this.storageType) {
      case 'filesystem':
        await fileSystemStorage.writeFile(`${key}.json`, data);
        break;
      
      case 'indexeddb':
        await indexedDBStorage.write(key, data);
        break;
      
      case 'localstorage':
      default:
        localStorage.setItem(`aletale_${key}`, JSON.stringify(data));
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    switch (this.storageType) {
      case 'filesystem':
        // File system doesn't support delete in our current implementation
        // Write an empty array instead
        await this.write(key, []);
        break;
      
      case 'indexeddb':
        await indexedDBStorage.delete(key);
        break;
      
      case 'localstorage':
      default:
        localStorage.removeItem(`aletale_${key}`);
    }
  }

  getStorageType(): StorageType {
    return this.storageType;
  }

  isFileSystemSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  isUsingFileSystem(): boolean {
    return this.storageType === 'filesystem';
  }

  isUsingIndexedDB(): boolean {
    return this.storageType === 'indexeddb';
  }

  getDirectoryName(): string | null {
    if (this.storageType === 'filesystem') {
      return fileSystemStorage.getDirectoryName();
    }
    return null;
  }

  getStorageTypeName(): string {
    switch (this.storageType) {
      case 'filesystem':
        return 'File System (JSON Files)';
      case 'indexeddb':
        return 'IndexedDB (Browser Database)';
      case 'localstorage':
        return 'LocalStorage (Limited)';
      default:
        return 'Unknown';
    }
  }

  async changeToFileSystem(): Promise<boolean> {
    if (!this.isFileSystemSupported()) {
      return false;
    }

    try {
      const success = await fileSystemStorage.selectDirectory();
      if (success) {
        const oldType = this.storageType;
        this.storageType = 'filesystem';
        
        // Migrate data from current storage to file system
        await this.migrateToFileSystem(oldType);
        
        return true;
      }
    } catch (error) {
      console.error('Failed to change to file system:', error);
    }

    return false;
  }

  private async migrateToFileSystem(fromType: StorageType): Promise<void> {
    try {
      console.log(`📦 Migrating data from ${fromType} to file system...`);

      let entries: any = null;
      let bars: any = null;

      // Read from current storage
      if (fromType === 'indexeddb') {
        entries = await indexedDBStorage.read('journal_entries');
        bars = await indexedDBStorage.read('bars');
      } else if (fromType === 'localstorage') {
        const entriesStr = localStorage.getItem('aletale_journal_entries');
        const barsStr = localStorage.getItem('aletale_bars');
        entries = entriesStr ? JSON.parse(entriesStr) : null;
        bars = barsStr ? JSON.parse(barsStr) : null;
      }

      // Write to file system
      if (entries) {
        await fileSystemStorage.writeFile('journal_entries.json', entries);
      }
      if (bars) {
        await fileSystemStorage.writeFile('bars.json', bars);
      }

      console.log('✅ Data migrated to file system successfully');
    } catch (error) {
      console.error('Failed to migrate data:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<StorageHealth> {
    const issues: string[] = [];
    let healthy = true;
    let canUpgrade = false;

    // Check current storage health
    switch (this.storageType) {
      case 'filesystem':
        if (!fileSystemStorage.isReady()) {
          issues.push('File system not accessible');
          healthy = false;
        }
        break;

      case 'indexeddb':
        if (!IndexedDBStorageService.isSupported()) {
          issues.push('IndexedDB not supported');
          healthy = false;
        }
        // Can upgrade to file system if supported
        if ('showDirectoryPicker' in window && this.isSecureContext()) {
          canUpgrade = true;
        }
        break;

      case 'localstorage':
        issues.push('Using limited localStorage (consider upgrading)');
        healthy = false;
        // Can upgrade to IndexedDB or file system
        canUpgrade = true;
        break;
    }

    // Check secure context for file system
    if (!this.isSecureContext() && this.storageType !== 'filesystem') {
      issues.push('Not in secure context (https/localhost required for file system)');
    }

    return {
      healthy,
      type: this.storageType,
      issues,
      canUpgrade,
    };
  }

  async exportAllData(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};

    switch (this.storageType) {
      case 'filesystem':
        data.journal_entries = await fileSystemStorage.readFile('journal_entries.json') || [];
        data.bars = await fileSystemStorage.readFile('bars.json') || [];
        break;

      case 'indexeddb':
        data.journal_entries = await indexedDBStorage.read('journal_entries') || [];
        data.bars = await indexedDBStorage.read('bars') || [];
        break;

      case 'localstorage':
        const entriesStr = localStorage.getItem('aletale_journal_entries');
        const barsStr = localStorage.getItem('aletale_bars');
        data.journal_entries = entriesStr ? JSON.parse(entriesStr) : [];
        data.bars = barsStr ? JSON.parse(barsStr) : [];
        break;
    }

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      storageType: this.storageType,
      data,
    };
  }

  async importAllData(importData: any): Promise<void> {
    if (!importData.version || !importData.data) {
      throw new Error('Invalid import file format');
    }

    const { journal_entries, bars } = importData.data;

    if (journal_entries) {
      await this.write('journal_entries', journal_entries);
    }
    if (bars) {
      await this.write('bars', bars);
    }

    console.log('✅ Data imported successfully');
  }

  // ---- Storage usage / quota estimate ----
  async getStorageEstimate(): Promise<StorageEstimate> {
    // Try standardized API first
    try {
      if ('storage' in navigator && 'estimate' in (navigator.storage as any)) {
        const est = await (navigator.storage as any).estimate();
        const usage = typeof est.usage === 'number' ? est.usage : await this.computeUsageFallback();
        const quota = typeof est.quota === 'number' ? est.quota : this.defaultQuota();
        return { usage, quota, type: this.storageType, source: 'navigator' };
      }
    } catch (e) {
      // fall through to computed
    }

    // Fallback: compute usage per backend and assume 50MB quota
    const usage = await this.computeUsageFallback();
    return { usage, quota: this.defaultQuota(), type: this.storageType, source: 'computed' };
  }

  private defaultQuota(): number {
    // Conservative default 50MB
    return 50 * 1024 * 1024;
  }

  private async computeUsageFallback(): Promise<number> {
    switch (this.storageType) {
      case 'filesystem':
        return await this.computeFsUsage();
      case 'indexeddb':
        return await this.computeIdbUsage();
      case 'localstorage':
      default:
        return this.computeLocalStorageUsage();
    }
  }

  private async computeFsUsage(): Promise<number> {
    try {
      // Sum sizes of known JSON files
      const files = ['journal_entries.json', 'bars.json', 'settings.json'];
      let total = 0;
      for (const f of files) {
        const data = await fileSystemStorage.readFile<any>(f);
        if (data !== null && data !== undefined) {
          const json = JSON.stringify(data);
          total += new Blob([json]).size;
        }
      }
      return total;
    } catch {
      return 0;
    }
  }

  private async computeIdbUsage(): Promise<number> {
    try {
      const keys = await indexedDBStorage.getAllKeys();
      let total = 0;
      for (const key of keys) {
        const value = await indexedDBStorage.read<any>(key);
        const json = JSON.stringify(value);
        total += new Blob([json]).size;
      }
      return total;
    } catch {
      return 0;
    }
  }

  private computeLocalStorageUsage(): number {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const v = localStorage.getItem(k) ?? '';
        total += k.length + v.length; // rough char count
      }
      // Convert chars to bytes approx assuming UTF-16 → 2 bytes/char
      return total * 2;
    } catch {
      return 0;
    }
  }
}

export const storageAdapter = new StorageAdapter();
