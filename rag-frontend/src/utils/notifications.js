// src/utils/notifications.js

export const addNotification = (title, message) => {
  const existing = JSON.parse(localStorage.getItem('rag_notifications') || '[]');
  const now = Date.now();

  // Deduplication Shield: Ignore if identical notification arrived in the last 2 seconds
  if (existing.length > 0) {
    const lastNotif = existing[0];
    if (
      lastNotif.title === title && 
      lastNotif.message === message && 
      (now - lastNotif.timestamp) < 2000
    ) {
      return;
    }
  }

  const newNotif = {
    id: `${now}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    message,
    read: false,
    timestamp: now
  };

  existing.unshift(newNotif);
  
  // Save to LocalStorage
  localStorage.setItem('rag_notifications', JSON.stringify(existing));
  
  // Trigger custom event so Navbar updates instantly without page refresh
  window.dispatchEvent(new Event('rag_notification_update'));
};