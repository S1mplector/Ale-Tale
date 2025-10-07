/**
 * File System Storage Service
 * Manages reading and writing JSON files to a user-selected directory
 * Uses the File System Access API and IndexedDB to persist directory handle
 */

const DB_NAME = 'aletale_fs_db';
const DB_VERSION = 1;
const STORE_NAME = 'directory_handle';
const HANDLE_KEY = 'root_directory';

export class FileSystemStorageService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private db: IDBDatabase | null = null;

  /**
   * Initialize the service and restore directory handle from IndexedDB
   */
  async initialize(): Promise<boolean> {
    await this.openDatabase();
    const handle = await this.getStoredDirectoryHandle();
    
    if (handle) {
      // Verify we still have permission
      const permission = await this.verifyPermission(handle);
      if (permission) {
        this.directoryHandle = handle;
        return true;
      }
    }
    
    return false;
  }

  /**
   * Open IndexedDB to store directory handle
   */
  private async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  /**
   * Prompt user to select a directory
   */
  async selectDirectory(): Promise<boolean> {
    try {
      // Check if File System Access API is supported
      if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API is not supported in this browser');
      }

      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });

      this.directoryHandle = handle;
      await this.storeDirectoryHandle(handle);
      
      // Initialize directory structure
      await this.initializeDirectoryStructure();
      
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled
        return false;
      }
      console.error('Error selecting directory:', error);
      throw error;
    }
  }

  /**
   * Initialize directory structure with default files
   */
  private async initializeDirectoryStructure(): Promise<void> {
    if (!this.directoryHandle) return;

    // Create data files if they don't exist
    await this.writeFile('journal_entries.json', []);
    await this.writeFile('bars.json', []);
    await this.writeFile('settings.json', {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Store directory handle in IndexedDB
   */
  private async storeDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(handle, HANDLE_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Retrieve directory handle from IndexedDB
   */
  private async getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(HANDLE_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Verify we have permission to access the directory
   */
  private async verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
    const options = { mode: 'readwrite' as any };
    
    try {
      // Check if we already have permission
      if (await (handle as any).queryPermission(options) === 'granted') {
        return true;
      }
      
      // Request permission
      if (await (handle as any).requestPermission(options) === 'granted') {
        return true;
      }
    } catch (error) {
      // If permission methods don't exist, assume we have permission
      return true;
    }
    
    return false;
  }

  /**
   * Read a JSON file from the directory
   */
  async readFile<T>(filename: string): Promise<T | null> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected');
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch (error) {
      if ((error as Error).name === 'NotFoundError') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Write a JSON file to the directory
   */
  async writeFile<T>(filename: string, data: T): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected');
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (error) {
      console.error(`Error writing file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    if (!this.directoryHandle) return false;

    try {
      await this.directoryHandle.getFileHandle(filename);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the name of the selected directory
   */
  getDirectoryName(): string | null {
    return this.directoryHandle?.name || null;
  }

  /**
   * Clear the stored directory handle and reset
   */
  async reset(): Promise<void> {
    this.directoryHandle = null;
    
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(HANDLE_KEY);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  }

  /**
   * Check if the service is ready to use
   */
  isReady(): boolean {
    return this.directoryHandle !== null;
  }
}

// Singleton instance
export const fileSystemStorage = new FileSystemStorageService();
