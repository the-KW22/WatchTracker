import { supabase } from './supabase';
import { TrackedItem } from '../types';

export async function fetchTrackedItems(): Promise<TrackedItem[]> {
  const { data, error } = await supabase
    .from('tracked_items')
    .select('*')
    .order('last_watched_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tracked items:', error);
    return [];
  }

  return data || [];
}

export async function addTrackedItem(item: Omit<TrackedItem, 'id' | 'created_at' | 'updated_at'>): Promise<TrackedItem | null> {
  const { data, error } = await supabase
    .from('tracked_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error adding tracked item:', error);
    return null;
  }

  return data;
}

export async function updateTrackedItem(id: string, updates: Partial<TrackedItem>): Promise<TrackedItem | null> {
  const { data, error } = await supabase
    .from('tracked_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tracked item:', error);
    return null;
  }

  return data;
}

export async function deleteTrackedItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tracked_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tracked item:', error);
    return false;
  }

  return true;
}

export async function getTrackedItemById(id: string): Promise<TrackedItem | null> {
  const { data, error } = await supabase
    .from('tracked_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tracked item:', error);
    return null;
  }

  return data;
}