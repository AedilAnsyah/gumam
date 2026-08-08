import { JournalEntry } from '../types';
import { APP_FULL_NAME, APP_VERSION, LS_KEY_SETTINGS, EXPORT_FILE_PREFIX } from './constants';

export function exportJournalDataAsJSON(entries: JournalEntry[]) {
  const settingsStr = localStorage.getItem(LS_KEY_SETTINGS);
  const settings = settingsStr ? JSON.parse(settingsStr) : {};

  const exportPayload = {
    app: APP_FULL_NAME,
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    entriesCount: entries.length,
    entries,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${EXPORT_FILE_PREFIX}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importJournalDataFromJSON(file: File): Promise<JournalEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.entries && Array.isArray(parsed.entries)) {
          resolve(parsed.entries as JournalEntry[]);
        } else {
          reject(new Error('Format file JSON tidak valid.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
