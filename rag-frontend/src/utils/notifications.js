// src/utils/notifications.js

export const addNotification = (title, message, explicitUserId = null) => {
  let userId = explicitUserId;

  if (!userId) {
    try {
      // 1. Check if a plain user object is stored
      const userStr = localStorage.getItem('user') || localStorage.getItem('auth_user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userId = userObj?.id || userObj?._id || userObj?.email || userObj?.user?.id;
      }
      
      // 2. If still no userId, decode it directly from the JWT token (sub field)
      if (!userId) {
        const token = localStorage.getItem('token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          userId = payload?.sub || payload?.id;
        }
      }
    } catch (e) {
      console.error("Error resolving user ID for notification:", e);
    }
  }

  const storageKey = userId ? `rag_notifications_${userId}` : 'rag_notifications_guest';
  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const now = Date.now();

  // Deduplication Shield (2 seconds)
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

  const updated = [newNotif, ...existing];
  localStorage.setItem(storageKey, JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent('rag_notification_update', { detail: { storageKey } }));
};