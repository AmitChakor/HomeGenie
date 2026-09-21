/**
 * What this does:
 * Attendance report screen — pick a helper, view their monthly calendar
 * with presence markers, summary stats, and export to CSV.
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import {
  useAttendanceLogs,
  useAttendanceSummary,
} from '../../../hooks/useAttendance';
import { useHelpers } from '../../../hooks/useHelpers';
import { shareAttendanceCsv } from '../../../lib/export-csv';
import type { Helper } from '../../../types';

function toYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function AttendanceScreen() {
  const { data: helpers, isLoading: loadingHelpers } = useHelpers();
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [currentMonth, setCurrentMonth] = useState(toYearMonth(new Date()));

  const helperId = selectedHelper?.id;
  const { data: logs, isLoading: loadingLogs } = useAttendanceLogs(
    helperId,
    currentMonth
  );
  const summary = useAttendanceSummary(helperId, currentMonth);

  const markedDates = useMemo((): MarkedDates => {
    const marks: MarkedDates = {};
    (logs ?? []).forEach((log) => {
      const day = log.check_in_at.split('T')[0];
      marks[day] = {
        selected: true,
        selectedColor: log.check_out_at ? Colors.success : Colors.warning,
      };
    });
    return marks;
  }, [logs]);

  const handleExport = useCallback(async () => {
    if (!logs || !selectedHelper) return;
    await shareAttendanceCsv(logs, selectedHelper.name, currentMonth);
  }, [logs, selectedHelper, currentMonth]);

  if (loadingHelpers) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Helper Picker */}
      <Text style={styles.sectionLabel}>Select Helper</Text>
      <View style={styles.helperRow}>
        {(helpers ?? []).map((h) => (
          <Pressable
            key={h.id}
            style={[
              styles.helperChip,
              selectedHelper?.id === h.id && styles.helperChipSelected,
            ]}
            onPress={() => setSelectedHelper(h)}
          >
            <Text
              style={[
                styles.helperChipText,
                selectedHelper?.id === h.id && styles.helperChipTextSelected,
              ]}
            >
              {h.name}
            </Text>
          </Pressable>
        ))}
        {(helpers ?? []).length === 0 && (
          <Text style={styles.noHelpers}>No helpers added yet.</Text>
        )}
      </View>

      {selectedHelper && (
        <>
          {/* Calendar */}
          <Calendar
            current={`${currentMonth}-01`}
            onMonthChange={(month) =>
              setCurrentMonth(
                `${month.year}-${String(month.month).padStart(2, '0')}`
              )
            }
            markedDates={markedDates}
            theme={{
              backgroundColor: Colors.background,
              calendarBackground: Colors.background,
              selectedDayTextColor: Colors.textInverse,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.textTertiary,
              arrowColor: Colors.primary,
              monthTextColor: Colors.text,
              textMonthFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
          />

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.success }]}
              />
              <Text style={styles.legendText}>Full day</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.warning }]}
              />
              <Text style={styles.legendText}>No check-out</Text>
            </View>
          </View>

          {/* Summary */}
          {summary && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {selectedHelper.name} — {currentMonth}
              </Text>
              <View style={styles.statRow}>
                <StatBox
                  label="Present"
                  value={summary.presentDays}
                  unit="days"
                  color={Colors.success}
                />
                <StatBox
                  label="Absent"
                  value={summary.absentDays}
                  unit="days"
                  color={Colors.error}
                />
                <StatBox
                  label="Total Hours"
                  value={summary.totalHours}
                  unit="hrs"
                  color={Colors.info}
                />
                <StatBox
                  label="Avg/Day"
                  value={summary.averageHoursPerDay}
                  unit="hrs"
                  color={Colors.primary}
                />
              </View>
            </View>
          )}

          {loadingLogs && (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={{ marginTop: Spacing.md }}
            />
          )}

          {/* Export */}
          <Pressable
            style={styles.exportButton}
            onPress={handleExport}
            disabled={!logs || logs.length === 0}
          >
            <Ionicons name="download-outline" size={18} color={Colors.primary} />
            <Text style={styles.exportText}>Export CSV</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  helperRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  helperChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  helperChipSelected: {
    backgroundColor: '#8B5CF6' + '18',
    borderColor: '#8B5CF6',
  },
  helperChipText: { ...Typography.bodySmall, color: Colors.textSecondary },
  helperChipTextSelected: { color: '#8B5CF6', fontWeight: '600' },
  noHelpers: { ...Typography.body, color: Colors.textTertiary },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...Typography.caption, color: Colors.textSecondary },
  summaryCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  summaryTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statUnit: { ...Typography.caption, color: Colors.textTertiary, marginTop: 1 },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  exportText: { ...Typography.button, color: Colors.primary },
});
