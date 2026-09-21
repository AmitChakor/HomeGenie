/**
 * What this does:
 * Deep link helpers for calling, WhatsApp messaging, and SMS.
 * All links use standard URI schemes that work on both iOS and Android.
 */

import { Alert, Linking } from 'react-native';

function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}

export async function openDialer(phone: string): Promise<void> {
  const url = `tel:${cleanPhone(phone)}`;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Cannot make calls', 'Phone dialer is not available on this device.');
  }
}

export async function openWhatsApp(
  phone: string,
  message?: string
): Promise<void> {
  const cleaned = cleanPhone(phone).replace(/^\+/, '');
  const encoded = message ? encodeURIComponent(message) : '';
  const url = `https://wa.me/${cleaned}${encoded ? `?text=${encoded}` : ''}`;

  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert(
      'WhatsApp not found',
      'WhatsApp is not installed on this device.'
    );
  }
}

export async function openSms(
  phone: string,
  message?: string
): Promise<void> {
  const cleaned = cleanPhone(phone);
  const separator = '?';
  const body = message ? `${separator}body=${encodeURIComponent(message)}` : '';
  const url = `sms:${cleaned}${body}`;

  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Cannot send SMS', 'SMS is not available on this device.');
  }
}
