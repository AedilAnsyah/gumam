/**
 * Modul Pengelolaan Reminder & Notifikasi Lokal PWA
 */

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

  const title = 'Waktunya Mencatat Harimu ✍️';
  const options: NotificationOptions = {
    body: 'Bicarakan harimu di Gumam secara alami & pertahankan streak jurnalmu!',
    icon: '/masked-icon.svg',
    badge: '/masked-icon.svg',
    tag: 'gumam-reminder-test',
    data: { url: '/' }
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
    const settingsStr = localStorage.getItem('gumam_settings');
    if (!settingsStr) return;

    const settings = JSON.parse(settingsStr);
    const reminderTime = settings.reminderTime || '20:00';
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
    if (timeUntilNotification > 0 && timeUntilNotification < 86400000) {
      setTimeout(async () => {
        if (isNotificationGranted()) {
          const title = 'Waktunya Mencatat Harimu ✍️';
          const options: NotificationOptions = {
            body: 'Saatnya merekam cerita harimu dan menjaga streak jurnal tetap berjalan!',
            icon: '/masked-icon.svg',
            tag: 'gumam-daily-reminder',
            data: { url: '/' }
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
