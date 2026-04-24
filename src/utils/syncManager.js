import API from './api';
import { haptic } from './haptics';

export const startSyncService = () => {
  window.addEventListener('online', async () => {
    const queue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
    if (queue.length === 0) return;

    console.log(`📡 Reconnected: Syncing ${queue.length} transactions...`);
    haptic.success();

    for (const item of queue) {
      try {
        // Attempt to post the queued data
        await API[item.method](item.url, item.data);
      } catch (err) {
        console.error("Sync failed for item:", item.id);
      }
    }

    // Clear the queue and notify user
    localStorage.removeItem('offline-queue');
    haptic.medium();
    console.log("✅ Sync Pipeline Clear.");
  });
};