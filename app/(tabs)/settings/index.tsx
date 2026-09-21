/**
 * What this does:
 * Full settings screen with profile editing, voice/language/notification
 * preferences, privacy controls (manage face data, clear chat), household
 * management, about section, and sign out.
 */

import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import { clearAllFaceData } from '../../../lib/face-store';
import { setAppLanguage, t } from '../../../lib/i18n';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/authStore';
import {
  useSettingsStore,
  type AppLanguage,
  type VoiceGender,
} from '../../../stores/settingsStore';

/* ── Reusable row components ─────────────────────────── */

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description?: string;
  onPress?: () => void;
  color?: string;
  right?: React.ReactNode;
}

function SettingsRow({
  icon,
  label,
  description,
  onPress,
  color,
  right,
}: SettingsRowProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: (color ?? Colors.primary) + '15' },
        ]}
      >
        <Ionicons name={icon} size={20} color={color ?? Colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      {right ?? (
        onPress ? (
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        ) : null
      )}
    </Pressable>
  );
}

interface ToggleRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  color?: string;
}

function ToggleRow({ icon, label, value, onValueChange, color }: ToggleRowProps) {
  return (
    <SettingsRow
      icon={icon}
      label={label}
      color={color}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: Colors.primary, false: Colors.borderLight }}
          thumbColor="#FFFFFF"
        />
      }
    />
  );
}

/* ── Voice picker chips ──────────────────────────────── */

const VOICE_OPTIONS: { key: VoiceGender; label: string }[] = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'child', label: 'Child' },
];

/* ── Language picker chips ───────────────────────────── */

const LANG_OPTIONS: { key: AppLanguage; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'हिन्दी' },
];

/* ── Main screen ─────────────────────────────────────── */

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signOut = useAuthStore((s) => s.signOut);
  const session = useAuthStore((s) => s.session);

  const {
    voiceGender,
    speechRate,
    language,
    notificationsEnabled,
    reminderSound,
    setVoiceGender,
    setSpeechRate,
    setLanguage: setStoreLang,
    setNotificationsEnabled,
    setReminderSound,
  } = useSettingsStore();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    setPhone(session.user.phone ?? '');
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setDisplayName(data.full_name);
      });
  }, [session]);

  const saveProfile = useCallback(async () => {
    if (!session?.user) return;
    await supabase
      .from('profiles')
      .update({ full_name: displayName })
      .eq('id', session.user.id);
    setEditingProfile(false);
  }, [displayName, session]);

  const handleLanguageChange = (lang: AppLanguage) => {
    setAppLanguage(lang);
  };

  const handleClearChat = () => {
    Alert.alert('Clear Chat History', 'This will delete all your messages. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          if (!session?.user) return;
          await supabase.from('messages').delete().eq('user_id', session.user.id);
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
      },
    ]);
  };

  const handleClearFaceData = () => {
    Alert.alert(
      'Clear Face Data',
      'This will remove all enrolled face data from this device. Helpers will need to re-enroll.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearAllFaceData(),
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(t('settings.signOutConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.signOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Profile ──────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>
      <View style={styles.section}>
        {editingProfile ? (
          <View style={styles.profileEdit}>
            <TextInput
              style={styles.profileInput}
              placeholder="Display name"
              placeholderTextColor={Colors.textTertiary}
              value={displayName}
              onChangeText={setDisplayName}
              autoFocus
            />
            <View style={styles.profileActions}>
              <Pressable onPress={() => setEditingProfile(false)}>
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <SettingsRow
            icon="person"
            label={displayName || 'Set your name'}
            description={phone ? `+${phone}` : undefined}
            onPress={() => setEditingProfile(true)}
          />
        )}
      </View>

      {/* ── Assistant ────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t('settings.assistant')}</Text>
      <View style={styles.section}>
        {/* Voice gender */}
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="mic" size={20} color={Colors.primary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{t('settings.voice')}</Text>
            <View style={styles.chips}>
              {VOICE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.chip,
                    voiceGender === opt.key && styles.chipActive,
                  ]}
                  onPress={() => setVoiceGender(opt.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      voiceGender === opt.key && styles.chipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Speech rate */}
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="speedometer" size={20} color={Colors.primary} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>
              {t('settings.speechRate')} — {speechRate.toFixed(2)}x
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={1.5}
              step={0.05}
              value={speechRate}
              onSlidingComplete={setSpeechRate}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.borderLight}
              thumbTintColor={Colors.primary}
            />
          </View>
        </View>

        {/* Language */}
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: Colors.info + '15' }]}>
            <Ionicons name="language" size={20} color={Colors.info} />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{t('settings.language')}</Text>
            <View style={styles.chips}>
              {LANG_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.chip,
                    language === opt.key && styles.chipActive,
                  ]}
                  onPress={() => handleLanguageChange(opt.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      language === opt.key && styles.chipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ── Notifications ────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
      <View style={styles.section}>
        <ToggleRow
          icon="notifications"
          label={t('settings.reminders')}
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          color={Colors.warning}
        />
        <ToggleRow
          icon="volume-high"
          label={t('settings.sounds')}
          value={reminderSound}
          onValueChange={setReminderSound}
          color={Colors.warning}
        />
      </View>

      {/* ── Household ────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Household</Text>
      <View style={styles.section}>
        <SettingsRow
          icon="people"
          label={t('settings.helpers')}
          description="Manage maids, cooks, drivers"
          onPress={() => router.push('/(tabs)/settings/helpers')}
          color="#8B5CF6"
        />
        <SettingsRow
          icon="calendar-number"
          label={t('settings.attendance')}
          description="View check-in history and reports"
          onPress={() => router.push('/(tabs)/settings/attendance')}
          color={Colors.info}
        />
        <SettingsRow
          icon="camera"
          label="Mark Attendance"
          description="Face or fingerprint check-in"
          onPress={() => router.push('/attendance/checkin')}
          color={Colors.success}
        />
      </View>

      {/* ── Privacy ──────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
      <View style={styles.section}>
        <SettingsRow
          icon="scan"
          label={t('settings.faceData')}
          description="Stored on-device only"
          onPress={handleClearFaceData}
          color={Colors.error}
        />
        <SettingsRow
          icon="chatbubble-ellipses"
          label={t('settings.clearChat')}
          description="Delete all messages"
          onPress={handleClearChat}
          color={Colors.error}
        />
      </View>

      {/* ── About ────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
      <View style={styles.section}>
        <SettingsRow
          icon="information-circle"
          label={t('settings.about')}
          description="Version 1.0.0"
          onPress={() => {}}
        />
        <SettingsRow
          icon="document-text"
          label={t('settings.terms')}
          onPress={() => {}}
        />
      </View>

      {/* ── Sign out ─────────────────────────────────── */}
      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text,
  },
  rowDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: Spacing.xs,
  },
  profileEdit: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  profileInput: {
    ...Typography.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  saveButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  signOutText: {
    ...Typography.button,
    color: Colors.error,
  },
});
