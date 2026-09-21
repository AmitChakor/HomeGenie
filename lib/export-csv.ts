/**
 * What this does:
 * Generates a CSV string from attendance logs and triggers
 * a share dialog via expo-sharing.
 */

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { AttendanceLog } from '../types';

export function attendanceToCsv(
  logs: AttendanceLog[],
  helperName: string
): string {
  const header = 'Date,Check In,Check Out,Hours,Method\n';
  const rows = logs.map((log) => {
    const date = log.check_in_at.split('T')[0];
    const checkIn = new Date(log.check_in_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const checkOut = log.check_out_at
      ? new Date(log.check_out_at).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : 'N/A';
    const hours = log.check_out_at
      ? (
          (new Date(log.check_out_at).getTime() -
            new Date(log.check_in_at).getTime()) /
          (1000 * 60 * 60)
        ).toFixed(1)
      : 'N/A';
    return `${date},${checkIn},${checkOut},${hours},${log.method}`;
  });

  return header + rows.join('\n');
}

export async function shareAttendanceCsv(
  logs: AttendanceLog[],
  helperName: string,
  yearMonth: string
): Promise<void> {
  const csv = attendanceToCsv(logs, helperName);
  const fileName = `${helperName.replace(/\s/g, '_')}_attendance_${yearMonth}.csv`;
  const file = new File(Paths.cache, fileName);
  await file.write(csv);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: `${helperName} Attendance — ${yearMonth}`,
    });
  }
}
