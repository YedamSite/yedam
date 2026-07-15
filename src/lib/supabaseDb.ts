import { createClient } from '@supabase/supabase-js';
import { getTranslatedRecord, mergeTranslations } from './db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const TABLE_MAP: Record<string, string> = {
  categories: 'cheotnun_categories',
  brands: 'cheotnun_brands',
  products: 'cheotnun_products',
  blog_posts: 'cheotnun_blog_posts',
  site_content: 'cheotnun_site_content',
  cms_blocks: 'cheotnun_cms_blocks',
  routines: 'cheotnun_routines',
  system_settings: 'cheotnun_system_settings',
  newsletter_subscribers: 'cheotnun_newsletter_subscribers',
  users: 'cheotnun_users',
  orders: 'cheotnun_orders',
  order_tracking: 'cheotnun_order_tracking',
  communication_logs: 'cheotnun_communication_logs',
};

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (client) return client;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

function getTableName(key: string): string | null {
  return TABLE_MAP[key] || null;
}

async function checkConnection(): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    const tb = c.from('cheotnun_categories') as any;
    const { error } = await tb.select('id').limit(1);
    return !error || error?.code === 'PGRST116';
  } catch { return false; }
}

let connected: boolean | null = null;

export const supabaseDb = {
  async init(): Promise<boolean> {
    connected = await checkConnection();
    return connected;
  },

  isConnected(): boolean {
    return connected === true;
  },

  async get<T = any>(table: string): Promise<T[]> {
    const c = getClient();
    const tableName = getTableName(table);
    if (!c || !tableName) return [];

    try {
      const tb = c.from(tableName) as any;
      const { data, error } = await tb.select('*');
      if (error) { console.error(`supabaseDb.get(${table}):`, error); return []; }
      return (data || []) as T[];
    } catch (e) { console.error(`supabaseDb.get(${table}):`, e); return []; }
  },

  async getById<T = any>(table: string, id: string): Promise<T | null> {
    const c = getClient();
    const tableName = getTableName(table);
    if (!c || !tableName) return null;

    try {
      const tb = c.from(tableName) as any;
      const { data, error } = await tb.select('*').eq('id', id).single();
      if (error) return null;
      return data as T;
    } catch { return null; }
  },

  async upsert<T extends { id: string }>(table: string, records: T[]): Promise<boolean> {
    const c = getClient();
    const tableName = getTableName(table);
    if (!c || !tableName || !Array.isArray(records) || records.length === 0) return false;

    try {
      const tb = c.from(tableName) as any;
      const { error } = await tb.upsert(records, { onConflict: 'id', ignoreDuplicates: false });
      if (error) { console.error(`supabaseDb.upsert(${table}):`, error); return false; }
      return true;
    } catch (e) { console.error(`supabaseDb.upsert(${table}):`, e); return false; }
  },

  async save<T = any>(table: string, records: T[]): Promise<boolean> {
    const c = getClient();
    const tableName = getTableName(table);
    if (!c || !tableName || !Array.isArray(records)) return false;

    try {
      const tb = c.from(tableName) as any;
      const { error: delError } = await tb.delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delError) { console.error(`supabaseDb.save(${table}) delete:`, delError); return false; }

      if (records.length === 0) return true;

      const { error: insError } = await tb.insert(records);
      if (insError) { console.error(`supabaseDb.save(${table}) insert:`, insError); return false; }
      return true;
    } catch (e) { console.error(`supabaseDb.save(${table}):`, e); return false; }
  },

  async update<T = any>(table: string, id: string, data: Partial<T>): Promise<boolean> {
    const c = getClient();
    const tableName = getTableName(table);
    if (!c || !tableName) return false;

    try {
      const tb = c.from(tableName) as any;
      const { error } = await tb.update(data).eq('id', id);
      if (error) { console.error(`supabaseDb.update(${table}, ${id}):`, error); return false; }
      return true;
    } catch (e) { console.error(`supabaseDb.update(${table}):`, e); return false; }
  },

  async insert<T = any>(table: string, record: T): Promise<T | null> {
    const c = getClient();
    const tableName = getTableName(table);
    if (!c || !tableName) return null;

    try {
      const tb = c.from(tableName) as any;
      const { data, error } = await tb.insert(record).select().single();
      if (error) { console.error(`supabaseDb.insert(${table}):`, error); return null; }
      return data as T;
    } catch (e) { console.error(`supabaseDb.insert(${table}):`, e); return null; }
  },

  async delete(table: string, id: string): Promise<boolean> {
    const c = getClient();
    const tableName = getTableName(table);
    if (!c || !tableName) return false;

    try {
      const tb = c.from(tableName) as any;
      const { error } = await tb.delete().eq('id', id);
      if (error) { console.error(`supabaseDb.delete(${table}, ${id}):`, error); return false; }
      return true;
    } catch (e) { console.error(`supabaseDb.delete(${table}):`, e); return false; }
  },

  async getSettings(key: string): Promise<any> {
    const c = getClient();
    if (!c) return null;
    try {
      const tb = c.from('cheotnun_system_settings') as any;
      const { data, error } = await tb.select('value').eq('key', key).single();
      if (error) return null;
      return data?.value || null;
    } catch { return null; }
  },

  async saveSettings(key: string, value: any): Promise<boolean> {
    const c = getClient();
    if (!c) return false;
    try {
      const tb = c.from('cheotnun_system_settings') as any;
      const { error } = await tb.upsert({ key, value }, { onConflict: 'key' });
      if (error) { console.error(`supabaseDb.saveSettings(${key}):`, error); return false; }
      return true;
    } catch (e) { console.error(`supabaseDb.saveSettings(${key}):`, e); return false; }
  },

  getTranslatedRecord,
  mergeTranslations,
};
