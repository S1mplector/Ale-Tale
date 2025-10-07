/**
 * Sync Service - Bidirectional sync between local storage and cloud
 * Implements offline-first strategy with conflict resolution
 */

import { supabaseService, JournalEntryRow, BarRow } from './SupabaseService';
import { indexedDBStorage } from '@infrastructure/storage/IndexedDBStorageService';
import { JournalEntry } from '@domain/entities/JournalEntry';
import { Bar } from '@domain/entities/Bar';

export interface SyncStatus {
  lastSync: string | null;
  inProgress: boolean;
  error: string | null;
  pendingChanges: number;
}

export interface SyncResult {
  success: boolean;
  pulledEntries: number;
  pulledBars: number;
  pushedEntries: number;
  pushedBars: number;
  conflicts: number;
  error?: string;
}

class SyncService {
  private syncStatus: SyncStatus = {
    lastSync: null,
    inProgress: false,
    error: null,
    pendingChanges: 0,
  };

  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Start automatic sync (every 5 minutes)
   */
  startAutoSync(intervalMs: number = 5 * 60 * 1000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (supabaseService.isAuthenticated()) {
        await this.sync();
      }
    }, intervalMs);

    console.log(`🔄 Auto-sync enabled (every ${intervalMs / 1000}s)`);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🔄 Auto-sync disabled');
    }
  }

  /**
   * Perform bidirectional sync
   */
  async sync(): Promise<SyncResult> {
    if (!supabaseService.isConfigured() || !supabaseService.isAuthenticated()) {
      return {
        success: false,
        pulledEntries: 0,
        pulledBars: 0,
        pushedEntries: 0,
        pushedBars: 0,
        conflicts: 0,
        error: 'Not authenticated',
      };
    }

    if (this.syncStatus.inProgress) {
      console.log('⏭️ Sync already in progress, skipping');
      return {
        success: false,
        pulledEntries: 0,
        pulledBars: 0,
        pushedEntries: 0,
        pushedBars: 0,
        conflicts: 0,
        error: 'Sync in progress',
      };
    }

    this.syncStatus.inProgress = true;
    this.syncStatus.error = null;

    const result: SyncResult = {
      success: false,
      pulledEntries: 0,
      pulledBars: 0,
      pushedEntries: 0,
      pushedBars: 0,
      conflicts: 0,
    };

    try {
      console.log('🔄 Starting sync...');

      // Step 1: Pull changes from cloud
      const lastSync = this.syncStatus.lastSync || new Date(0).toISOString();
      const [remoteEntries, remoteBars] = await Promise.all([
        supabaseService.getUpdatedJournalEntries(lastSync),
        supabaseService.getUpdatedBars(lastSync),
      ]);

      // Step 2: Merge remote changes into local
      result.pulledEntries = await this.mergeJournalEntries(remoteEntries);
      result.pulledBars = await this.mergeBars(remoteBars);

      // Step 3: Push local changes to cloud
      const localEntries = await this.getLocalJournalEntries();
      const localBars = await this.getLocalBars();

      const entriesToPush = localEntries.filter(e => 
        !e.synced_at || new Date(e.updated_at) > new Date(e.synced_at)
      );
      const barsToPush = localBars.filter(b => 
        !b.synced_at || new Date(b.updated_at) > new Date(b.synced_at)
      );

      if (entriesToPush.length > 0) {
        await supabaseService.upsertJournalEntries(entriesToPush);
        result.pushedEntries = entriesToPush.length;
      }

      if (barsToPush.length > 0) {
        await supabaseService.upsertBars(barsToPush);
        result.pushedBars = barsToPush.length;
      }

      // Step 4: Update sync timestamp
      this.syncStatus.lastSync = new Date().toISOString();
      await indexedDBStorage.write('_last_sync', { timestamp: this.syncStatus.lastSync });

      result.success = true;
      console.log('✅ Sync complete:', result);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.syncStatus.error = (error as Error).message;
      result.error = (error as Error).message;
    } finally {
      this.syncStatus.inProgress = false;
    }

    return result;
  }

  /**
   * Merge remote journal entries into local
   */
  private async mergeJournalEntries(remoteEntries: JournalEntryRow[]): Promise<number> {
    if (remoteEntries.length === 0) return 0;

    const localEntries = await this.getLocalJournalEntries();
    const localMap = new Map(localEntries.map(e => [e.id, e]));

    let merged = 0;

    for (const remote of remoteEntries) {
      const local = localMap.get(remote.id);

      if (!local) {
        // New from remote
        localEntries.push(this.mapRowToEntry(remote));
        merged++;
      } else {
        // Conflict resolution: last-write-wins
        const remoteTime = new Date(remote.updated_at).getTime();
        const localTime = new Date(local.updated_at).getTime();

        if (remoteTime > localTime) {
          // Remote is newer, overwrite local
          const index = localEntries.findIndex(e => e.id === remote.id);
          localEntries[index] = this.mapRowToEntry(remote);
          merged++;
        }
      }
    }

    if (merged > 0) {
      await indexedDBStorage.write('journal_entries', localEntries);
    }

    return merged;
  }

  /**
   * Merge remote bars into local
   */
  private async mergeBars(remoteBars: BarRow[]): Promise<number> {
    if (remoteBars.length === 0) return 0;

    const localBars = await this.getLocalBars();
    const localMap = new Map(localBars.map(b => [b.id, b]));

    let merged = 0;

    for (const remote of remoteBars) {
      const local = localMap.get(remote.id);

      if (!local) {
        // New from remote
        localBars.push(this.mapRowToBar(remote));
        merged++;
      } else {
        // Conflict resolution: last-write-wins
        const remoteTime = new Date(remote.updated_at).getTime();
        const localTime = new Date(local.updated_at).getTime();

        if (remoteTime > localTime) {
          // Remote is newer, overwrite local
          const index = localBars.findIndex(b => b.id === remote.id);
          localBars[index] = this.mapRowToBar(remote);
          merged++;
        }
      }
    }

    if (merged > 0) {
      await indexedDBStorage.write('bars', localBars);
    }

    return merged;
  }

  /**
   * Get local journal entries with sync metadata
   */
  private async getLocalJournalEntries(): Promise<JournalEntryRow[]> {
    const entries = await indexedDBStorage.read<JournalEntry[]>('journal_entries');
    if (!entries) return [];

    return entries.map(e => this.mapEntryToRow(e));
  }

  /**
   * Get local bars with sync metadata
   */
  private async getLocalBars(): Promise<BarRow[]> {
    const bars = await indexedDBStorage.read<Bar[]>('bars');
    if (!bars) return [];

    return bars.map(b => this.mapBarToRow(b));
  }

  /**
   * Map JournalEntry to JournalEntryRow
   */
  private mapEntryToRow(entry: any): JournalEntryRow {
    return {
      id: entry.id,
      beer_name: entry.beerName,
      brewery: entry.brewery,
      style: entry.style,
      abv: entry.abv,
      rating: entry.rating,
      notes: entry.notes,
      location: entry.location,
      drank_at: entry.drankAt,
      image_url: entry.imageUrl,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt || entry.createdAt,
      synced_at: entry.syncedAt,
      deleted: entry.deleted || false,
    };
  }

  /**
   * Map Bar to BarRow
   */
  private mapBarToRow(bar: any): BarRow {
    return {
      id: bar.id,
      name: bar.name,
      address: bar.address,
      city: bar.city,
      country: bar.country,
      rating: bar.rating,
      notes: bar.notes,
      visited_at: bar.visitedAt,
      created_at: bar.createdAt,
      updated_at: bar.updatedAt || bar.createdAt,
      synced_at: bar.syncedAt,
      deleted: bar.deleted || false,
    };
  }

  /**
   * Map JournalEntryRow to JournalEntry
   */
  private mapRowToEntry(row: JournalEntryRow): any {
    return {
      id: row.id,
      beerName: row.beer_name,
      brewery: row.brewery,
      style: row.style,
      abv: row.abv,
      rating: row.rating,
      notes: row.notes,
      location: row.location,
      drankAt: row.drank_at,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deleted: row.deleted,
    };
  }

  /**
   * Map BarRow to Bar
   */
  private mapRowToBar(row: BarRow): any {
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      country: row.country,
      rating: row.rating,
      notes: row.notes,
      visitedAt: row.visited_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deleted: row.deleted,
    };
  }

  /**
   * Initialize sync status from storage
   */
  async initialize(): Promise<void> {
    try {
      const lastSync = await indexedDBStorage.read<{ timestamp: string }>('_last_sync');
      if (lastSync) {
        this.syncStatus.lastSync = lastSync.timestamp;
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }
}

export const syncService = new SyncService();
