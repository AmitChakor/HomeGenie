/**
 * What this does:
 * Shared TypeScript types used across the HomeGenie app.
 * Database types will be auto-generated from Supabase later;
 * these are the app-level types we control.
 */

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  name: string;
  category: VendorCategory;
  phone: string;
  whatsapp: string | null;
  address: string | null;
  notes: string | null;
  rating: number | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type VendorCategory =
  | 'medical'
  | 'maid'
  | 'grocery'
  | 'electrician'
  | 'plumber'
  | 'driver'
  | 'other';

export interface Message {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface GroceryList {
  id: string;
  user_id: string;
  name: string;
  store_vendor_id: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface GroceryItem {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  notes: string | null;
  is_checked: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  vendor_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  reminder_minutes: number | null;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Helper {
  id: string;
  user_id: string;
  name: string;
  role: string;
  phone: string | null;
  face_embedding_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  helper_id: string;
  user_id: string;
  check_in_at: string;
  check_out_at: string | null;
  method: 'face' | 'fingerprint' | 'manual';
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}
