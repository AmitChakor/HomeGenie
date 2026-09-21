/**
 * What this does:
 * Schedule screen with a month calendar showing dots on days with
 * appointments, and an agenda list below for the selected day.
 * FAB to create a new appointment.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import {
  useAppointments,
  useAppointmentsForDay,
} from '../../../hooks/useAppointments';
import type { Appointment } from '../../../types';

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function toYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: Colors.primary,
  completed: Colors.success,
  cancelled: Colors.textTertiary,
};

export default function ScheduleScreen() {
  const router = useRouter();
  const today = toDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(toYearMonth(new Date()));

  const { data: monthAppointments, isLoading: loadingMonth } =
    useAppointments(currentMonth);

  const { data: dayAppointments, isLoading: loadingDay } =
    useAppointmentsForDay(selectedDate);

  const markedDates = useMemo((): MarkedDates => {
    const marks: MarkedDates = {};

    (monthAppointments ?? []).forEach((appt) => {
      const day = appt.start_time.split('T')[0];
      if (!marks[day]) {
        marks[day] = { dots: [] };
      }
      const dots = (marks[day] as any).dots ?? [];
      if (dots.length < 3) {
        dots.push({
          key: appt.id,
          color: STATUS_COLORS[appt.status] ?? Colors.primary,
        });
      }
      (marks[day] as any).dots = dots;
    });

    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: Colors.primary,
    };

    return marks;
  }, [monthAppointments, selectedDate]);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  const handleMonthChange = useCallback((month: DateData) => {
    setCurrentMonth(`${month.year}-${String(month.month).padStart(2, '0')}`);
  }, []);

  const renderAppointment = useCallback(
    ({ item }: { item: Appointment & { vendor_name?: string | null } }) => (
      <Pressable
        style={styles.apptCard}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/schedule/[id]',
            params: { id: item.id },
          })
        }
      >
        <View
          style={[
            styles.timeLine,
            { backgroundColor: STATUS_COLORS[item.status] ?? Colors.primary },
          ]}
        />
        <View style={styles.apptContent}>
          <Text style={styles.apptTime}>{formatTime(item.start_time)}</Text>
          <Text style={styles.apptTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {(item as any).vendor_name && (
            <Text style={styles.apptVendor}>{(item as any).vendor_name}</Text>
          )}
          {item.location && (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={Colors.textTertiary}
              />
              <Text style={styles.apptLocation} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={Colors.textTertiary}
        />
      </Pressable>
    ),
    [router]
  );

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markingType="multi-dot"
        markedDates={markedDates}
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.background,
          textSectionTitleColor: Colors.textSecondary,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.textInverse,
          todayTextColor: Colors.primary,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.textTertiary,
          arrowColor: Colors.primary,
          monthTextColor: Colors.text,
          textMonthFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />

      {/* Day Header */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        {loadingDay && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
      </View>

      {/* Agenda */}
      <FlatList
        data={dayAppointments ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        contentContainerStyle={styles.agendaList}
        ListEmptyComponent={
          <View style={styles.emptyDay}>
            <Text style={styles.emptyText}>
              {loadingDay ? '' : 'No appointments on this day.'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/schedule/new',
            params: { date: selectedDate },
          })
        }
        accessibilityRole="button"
        accessibilityLabel="Add appointment"
      >
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dayTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  agendaList: {
    paddingBottom: 100,
  },
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  timeLine: {
    width: 3,
    height: '100%',
    minHeight: 40,
    borderRadius: 2,
  },
  apptContent: {
    flex: 1,
  },
  apptTime: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  apptTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  apptVendor: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  apptLocation: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  emptyDay: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
