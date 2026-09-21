/**
 * What this does:
 * React Query hooks for attendance logging.
 * - useAttendanceLogs(helperId, month): monthly logs for a helper
 * - useCheckIn(): create a check-in log
 * - useCheckOut(): update a log with check-out time
 * - useAttendanceSummary(helperId, month): computed summary stats
 * - useTodayStatus(helperId): is the helper checked in today?
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { AttendanceLog } from '../types';

const ATTENDANCE_KEY = ['attendance'];

export function useAttendanceLogs(
  helperId: string | undefined,
  yearMonth: string
) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, helperId, yearMonth],
    queryFn: async (): Promise<AttendanceLog[]> => {
      const [year, month] = yearMonth.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const startOfMonth = `${yearMonth}-01T00:00:00`;
      const endOfMonth = `${yearMonth}-${lastDay}T23:59:59`;

      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('helper_id', helperId!)
        .gte('check_in_at', startOfMonth)
        .lte('check_in_at', endOfMonth)
        .order('check_in_at', { ascending: true });
      if (error) throw error;
      return data as AttendanceLog[];
    },
    enabled: !!helperId,
  });
}

export function useTodayStatus(helperId: string | undefined) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'today', helperId],
    queryFn: async (): Promise<AttendanceLog | null> => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('helper_id', helperId!)
        .gte('check_in_at', todayStart.toISOString())
        .order('check_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as AttendanceLog | null;
    },
    enabled: !!helperId,
  });
}

interface CheckInInput {
  helperId: string;
  method: 'face' | 'fingerprint' | 'manual';
  latitude?: number;
  longitude?: number;
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CheckInInput): Promise<AttendanceLog> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('attendance_logs')
        .insert({
          helper_id: input.helperId,
          user_id: user.id,
          method: input.method,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          check_in_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as AttendanceLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string): Promise<void> => {
      const { error } = await supabase
        .from('attendance_logs')
        .update({ check_out_at: new Date().toISOString() })
        .eq('id', logId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  totalHours: number;
  averageHoursPerDay: number;
}

export function useAttendanceSummary(
  helperId: string | undefined,
  yearMonth: string
) {
  const { data: logs } = useAttendanceLogs(helperId, yearMonth);

  const summary: AttendanceSummary | null = logs
    ? (() => {
        const [year, month] = yearMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const totalDays =
          year === today.getFullYear() && month === today.getMonth() + 1
            ? today.getDate()
            : daysInMonth;

        const presentDaysSet = new Set<string>();
        let totalHours = 0;

        for (const log of logs) {
          const day = log.check_in_at.split('T')[0];
          presentDaysSet.add(day);

          if (log.check_out_at) {
            const inTime = new Date(log.check_in_at).getTime();
            const outTime = new Date(log.check_out_at).getTime();
            totalHours += (outTime - inTime) / (1000 * 60 * 60);
          }
        }

        const presentDays = presentDaysSet.size;
        return {
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays,
          totalHours: Math.round(totalHours * 10) / 10,
          averageHoursPerDay:
            presentDays > 0
              ? Math.round((totalHours / presentDays) * 10) / 10
              : 0,
        };
      })()
    : null;

  return summary;
}
