/**
 * Modul Pengelolaan Reminder & Notifikasi Lokal PWA
 */

import {
  NOTIFICATION_ICON,
  NOTIFICATION_TAG_TEST,
  NOTIFICATION_TAG_DAILY,
  NOTIFICATION_TITLE,
  NOTIFICATION_BODY_TEST,
  NOTIFICATION_BODY_DAILY,
  LS_KEY_SETTINGS,
  DEFAULT_REMINDER_TIME,
  MS_PER_DAY,
  ROUTES,
} from './constants';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    alert('Browser ini tidak mendukung Web Notification API.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export function isNotificationGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Memicu notifikasi uji coba langsung
 */
export async function sendTestNotification() {
  const granted = await requestNotificationPermission();
  if (!granted) {
    alert('Izin notifikasi belum diberikan. Aktifkan izin notifikasi di setelan browser.');
    return;
  }

  const title = NOTIFICATION_TITLE;
  const options: NotificationOptions = {
    body: NOTIFICATION_BODY_TEST,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    tag: NOTIFICATION_TAG_TEST,
    data: { url: ROUTES.HOME }
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
}

/**
 * Menjadwalkan pengingat notifikasi lokal berdasarkan jam reminderTime ("HH:mm")
 */
export async function scheduleLocalReminder() {
  if (!isNotificationGranted()) return;

  try {
    const settingsStr = localStorage.getItem(LS_KEY_SETTINGS);
    if (!settingsStr) return;

    const settings = JSON.parse(settingsStr);
    const reminderTime = settings.reminderTime || DEFAULT_REMINDER_TIME;
    const [targetHour, targetMinute] = reminderTime.split(':').map(Number);

    const now = new Date();
    const nextNotify = new Date();
    nextNotify.setHours(targetHour, targetMinute, 0, 0);

    // Jika jam pengingat hari ini sudah lewat, jadwalkan untuk besok
    if (now > nextNotify) {
      nextNotify.setDate(nextNotify.getDate() + 1);
    }

    const timeUntilNotification = nextNotify.getTime() - now.getTime();

    // Set setTimeout lokal untuk sesi aktif (fallback browser)
    if (timeUntilNotification > 0 && timeUntilNotification < MS_PER_DAY) {
      setTimeout(async () => {
        if (isNotificationGranted()) {
          const title = NOTIFICATION_TITLE;
          const options: NotificationOptions = {
            body: NOTIFICATION_BODY_DAILY,
            icon: NOTIFICATION_ICON,
            tag: NOTIFICATION_TAG_DAILY,
            data: { url: ROUTES.HOME }
          };

          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification(title, options);
          } else {
            new Notification(title, options);
          }
        }
      }, timeUntilNotification);
    }
  } catch (err) {
    console.warn('Error scheduling local reminder:', err);
  }
}
