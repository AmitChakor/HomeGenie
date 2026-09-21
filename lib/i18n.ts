/**
 * What this does:
 * Configures i18n-js with English and Hindi translations.
 * Reads/writes language preference from the settings store.
 * Exports a typed `t()` function and `setAppLanguage()` helper.
 */

import { I18n } from 'i18n-js';
import en from '../constants/translations/en';
import hi from '../constants/translations/hi';
import { useSettingsStore, type AppLanguage } from '../stores/settingsStore';

const i18n = new I18n({ en, hi });

i18n.defaultLocale = 'en';
i18n.locale = useSettingsStore.getState().language;
i18n.enableFallback = true;

export function setAppLanguage(lang: AppLanguage): void {
  i18n.locale = lang;
  useSettingsStore.getState().setLanguage(lang);
}

export function t(scope: string, options?: Record<string, unknown>): string {
  return i18n.t(scope, options);
}

export default i18n;
