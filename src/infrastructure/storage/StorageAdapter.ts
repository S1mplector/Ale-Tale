/**
 * Storage Adapter - Automatically uses File System or LocalStorage
 * Provides a unified interface regardless of storage backend
 */

import { fileSystemStorage } from './FileSystemStorageService';

export type StorageType = 'filesystem' | 'localstorage';

class StorageAdapter {
  private storageType: StorageType = 'localstorage';
  private initialized = false;
  private setupRequired = false;

  async initialize(): Promise<{ initialized: boolean; setupRequired: boolean }> {
    // Check if File System Access API is supported
    if ('showDirectoryPicker' in window) {
      try {
        const fsInitialized = await fileSystemStorage.initialize();
        if (fsInitialized) {
          this.storageType = 'filesystem';
          this.initialized = true;
          this.setupRequired = false;
          return { initialized: true, setupRequired: false };
        } else {
          // File System API available but not configured yet
          this.setupRequired = true;
          return { initialized: false, setupRequired: true };
        }
      } catch (error) {
        console.error('File system initialization failed:', error);
        // If there's an error, require setup
        this.setupRequired = true;
        return { initialized: false, setupRequired: true };
      }
    }

    // File System API not supported - fall back to localStorage
    console.log('File System Access API not supported, using localStorage');
    this.storageType = 'localstorage';
    this.initialized = true;
    this.setupRequired = false;
    return { initialized: true, setupRequired: false };
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

    if (this.storageType === 'filesystem') {
      return await fileSystemStorage.readFile<T>(`${key}.json`);
    } else {
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

    if (this.storageType === 'filesystem') {
      await fileSystemStorage.writeFile(`${key}.json`, data);
    } else {
      localStorage.setItem(`aletale_${key}`, JSON.stringify(data));
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.storageType === 'filesystem') {
      // File system doesn't support delete in our current implementation
      // We'll just write an empty array
      await this.write(key, []);
    } else {
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

  getDirectoryName(): string | null {
    if (this.storageType === 'filesystem') {
      return fileSystemStorage.getDirectoryName();
    }
    return null;
  }

  async changeToFileSystem(): Promise<boolean> {
    if (!this.isFileSystemSupported()) {
      return false;
    }

    try {
      const success = await fileSystemStorage.selectDirectory();
      if (success) {
        this.storageType = 'filesystem';
        
        // Migrate data from localStorage to file system
        await this.migrateToFileSystem();
        
        return true;
      }
    } catch (error) {
      console.error('Failed to change to file system:', error);
    }

    return false;
  }

  private async migrateToFileSystem(): Promise<void> {
    try {
      // Migrate journal entries
      const entries = localStorage.getItem('aletale_journal_entries');
      if (entries) {
        await fileSystemStorage.writeFile('journal_entries.json', JSON.parse(entries));
      }

      // Migrate bars
      const bars = localStorage.getItem('aletale_bars');
      if (bars) {
        await fileSystemStorage.writeFile('bars.json', JSON.parse(bars));
      }

      console.log('Data migrated to file system successfully');
    } catch (error) {
      console.error('Failed to migrate data:', error);
    }
  }
}

export const storageAdapter = new StorageAdapter();
