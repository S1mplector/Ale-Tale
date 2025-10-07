/**
 * Supabase Service - Cloud database and authentication
 * Provides real-time sync, auth, and multi-device support
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

export interface CloudConfig {
  url: string;
  anonKey: string;
}

export interface SyncableEntity {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  synced_at?: string;
  deleted?: boolean;
}

export interface JournalEntryRow extends SyncableEntity {
  beer_name: string;
  brewery?: string;
  style?: string;
  abv?: number;
  rating?: number;
  notes?: string;
  location?: string;
  drank_at: string;
  image_url?: string;
}

export interface BarRow extends SyncableEntity {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  rating?: number;
  notes?: string;
  visited_at: string;
}

export class SupabaseService {
  private client: SupabaseClient | null = null;
  private currentUser: User | null = null;
  private session: Session | null = null;

  /**
   * Initialize Supabase client
   */
  initialize(config: CloudConfig): void {
    if (!config.url || !config.anonKey) {
      throw new Error('Supabase URL and Anon Key are required');
    }

    this.client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    // Listen for auth changes
    this.client.auth.onAuthStateChange((_event: string, session: Session | null) => {
      this.session = session;
      this.currentUser = session?.user ?? null;
      console.log('Auth state changed:', _event, this.currentUser?.email);
    });

    // Restore session
    this.client.auth.getSession().then(({ data }) => {
      this.session = data.session;
      this.currentUser = data.session?.user ?? null;
    });
  }

  /**
   * Check if Supabase is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.session;
  }

  // ============ Authentication ============

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (!this.client) throw new Error('Supabase not initialized');

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, error: new Error(error.message) };
    }

    return { user: data.user, error: null };
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    if (!this.client) throw new Error('Supabase not initialized');

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: new Error(error.message) };
    }

    this.session = data.session;
    this.currentUser = data.user;
    return { user: data.user, error: null };
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.client) throw new Error('Supabase not initialized');

    await this.client.auth.signOut();
    this.session = null;
    this.currentUser = null;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    if (!this.client) throw new Error('Supabase not initialized');

    const { error } = await this.client.auth.resetPasswordForEmail(email);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  }

  // ============ Journal Entries ============

  /**
   * Fetch all journal entries for current user
   */
  async fetchJournalEntries(): Promise<JournalEntryRow[]> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await this.client
      .from('journal_entries')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch journal entries:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Create journal entry
   */
  async createJournalEntry(entry: Omit<JournalEntryRow, 'user_id' | 'synced_at'>): Promise<JournalEntryRow> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await this.client
      .from('journal_entries')
      .insert({
        ...entry,
        user_id: this.currentUser.id,
        synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create journal entry:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update journal entry
   */
  async updateJournalEntry(id: string, updates: Partial<JournalEntryRow>): Promise<JournalEntryRow> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await this.client
      .from('journal_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', this.currentUser.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update journal entry:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Delete journal entry (soft delete)
   */
  async deleteJournalEntry(id: string): Promise<void> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { error } = await this.client
      .from('journal_entries')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', this.currentUser.id);

    if (error) {
      console.error('Failed to delete journal entry:', error);
      throw new Error(error.message);
    }
  }

  // ============ Bars ============

  /**
   * Fetch all bars for current user
   */
  async fetchBars(): Promise<BarRow[]> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await this.client
      .from('bars')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch bars:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Create bar
   */
  async createBar(bar: Omit<BarRow, 'user_id' | 'synced_at'>): Promise<BarRow> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await this.client
      .from('bars')
      .insert({
        ...bar,
        user_id: this.currentUser.id,
        synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create bar:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Update bar
   */
  async updateBar(id: string, updates: Partial<BarRow>): Promise<BarRow> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await this.client
      .from('bars')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', this.currentUser.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update bar:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Delete bar (soft delete)
   */
  async deleteBar(id: string): Promise<void> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { error } = await this.client
      .from('bars')
      .update({
        deleted: true,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', this.currentUser.id);

    if (error) {
      console.error('Failed to delete bar:', error);
      throw new Error(error.message);
    }
  }

  // ============ Sync Helpers ============

  /**
   * Get entities updated after a timestamp
   */
  async getUpdatedJournalEntries(since: string): Promise<JournalEntryRow[]> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await this.client
      .from('journal_entries')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .gt('updated_at', since)
      .order('updated_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Get bars updated after a timestamp
   */
  async getUpdatedBars(since: string): Promise<BarRow[]> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await this.client
      .from('bars')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .gt('updated_at', since)
      .order('updated_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Batch upsert journal entries
   */
  async upsertJournalEntries(entries: JournalEntryRow[]): Promise<void> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { error } = await this.client
      .from('journal_entries')
      .upsert(entries.map(e => ({
        ...e,
        user_id: this.currentUser!.id,
        synced_at: new Date().toISOString(),
      })));

    if (error) {
      console.error('Failed to upsert journal entries:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Batch upsert bars
   */
  async upsertBars(bars: BarRow[]): Promise<void> {
    if (!this.client || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    const { error } = await this.client
      .from('bars')
      .upsert(bars.map(b => ({
        ...b,
        user_id: this.currentUser!.id,
        synced_at: new Date().toISOString(),
      })));

    if (error) {
      console.error('Failed to upsert bars:', error);
      throw new Error(error.message);
    }
  }
}

// Singleton instance
export const supabaseService = new SupabaseService();
