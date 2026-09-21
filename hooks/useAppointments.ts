/**
 * What this does:
 * React Query hooks for appointment CRUD.
 * - useAppointments(month): all appointments for a given month
 * - useAppointmentsForDay(date): appointments for a specific day
 * - useUpcomingAppointments(): next 7 days
 * - useCreateAppointment(): create + schedule notification
 * - useUpdateAppointment(): update + reschedule notification
 * - useDeleteAppointment(): delete + cancel notification
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { cancelReminder, scheduleReminder } from '../lib/notifications';
import type { Appointment } from '../types';

const APPTS_KEY = ['appointments'];

export function useAppointments(yearMonth: string) {
  return useQuery({
    queryKey: [...APPTS_KEY, 'month', yearMonth],
    queryFn: async (): Promise<Appointment[]> => {
      const startOfMonth = `${yearMonth}-01T00:00:00`;
      const [year, month] = yearMonth.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const endOfMonth = `${yearMonth}-${lastDay}T23:59:59`;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startOfMonth)
        .lte('start_time', endOfMonth)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data as Appointment[];
    },
  });
}

export function useAppointmentsForDay(dateStr: string) {
  return useQuery({
    queryKey: [...APPTS_KEY, 'day', dateStr],
    queryFn: async (): Promise<Appointment[]> => {
      const dayStart = `${dateStr}T00:00:00`;
      const dayEnd = `${dateStr}T23:59:59`;

      const { data, error } = await supabase
        .from('appointments')
        .select('*, vendors(name, phone)')
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row,
        vendor_name: row.vendors?.name ?? null,
        vendor_phone: row.vendors?.phone ?? null,
        vendors: undefined,
      })) as (Appointment & { vendor_name: string | null; vendor_phone: string | null })[];
    },
    enabled: !!dateStr,
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: [...APPTS_KEY, 'upcoming'],
    queryFn: async (): Promise<Appointment[]> => {
      const now = new Date().toISOString();
      const weekLater = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('*, vendors(name)')
        .eq('status', 'upcoming')
        .gte('start_time', now)
        .lte('start_time', weekLater)
        .order('start_time', { ascending: true })
        .limit(10);
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row,
        vendor_name: row.vendors?.name ?? null,
        vendors: undefined,
      })) as (Appointment & { vendor_name: string | null })[];
    },
  });
}

type AppointmentInput = Omit<Appointment, 'id' | 'user_id' | 'created_at'>;

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AppointmentInput): Promise<Appointment> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;

      const appointment = data as Appointment;
      await scheduleReminder(appointment);
      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPTS_KEY });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<AppointmentInput> & { id: string }): Promise<Appointment> => {
      const { data, error } = await supabase
        .from('appointments')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      const appointment = data as Appointment;
      await cancelReminder(id);
      if (appointment.status === 'upcoming') {
        await scheduleReminder(appointment);
      }
      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPTS_KEY });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await cancelReminder(id);
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPTS_KEY });
    },
  });
}
