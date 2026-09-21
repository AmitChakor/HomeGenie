/**
 * What this does:
 * Formats a grocery list into a clean readable message and opens
 * WhatsApp or SMS to share it with a store vendor.
 */

import type { GroceryItem } from '../types';
import { openSms, openWhatsApp } from './links';

export function formatGroceryListForWhatsApp(
  items: GroceryItem[],
  storeName?: string
): string {
  const uncheckedItems = items.filter((item) => !item.is_checked);

  const header = storeName
    ? `Hi, I'd like to order the following from ${storeName}:`
    : `Hi, I'd like to order the following items:`;

  const lines = uncheckedItems.map((item, i) => {
    const qty = item.quantity !== 1 ? `${item.quantity}` : '';
    const unit = item.unit ? ` ${item.unit}` : '';
    const notes = item.notes ? ` (${item.notes})` : '';
    return `${i + 1}. ${item.name}${qty ? ' — ' + qty + unit : ''}${notes}`;
  });

  const footer = 'Please confirm availability and delivery time. Thank you!';

  return [header, '', ...lines, '', footer].join('\n');
}

export async function shareGroceryViaWhatsApp(
  items: GroceryItem[],
  phone: string,
  storeName?: string
): Promise<void> {
  const message = formatGroceryListForWhatsApp(items, storeName);
  await openWhatsApp(phone, message);
}

export async function shareGroceryViaSms(
  items: GroceryItem[],
  phone: string,
  storeName?: string
): Promise<void> {
  const message = formatGroceryListForWhatsApp(items, storeName);
  await openSms(phone, message);
}
