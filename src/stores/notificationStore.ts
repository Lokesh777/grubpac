import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const existing = get().notifications;
        if (existing.find((n) => n.id === notification.id)) return;
        const updated = [notification, ...existing].slice(0, 50);
        const unreadCount = updated.filter((n) => !n.read).length;
        set({ notifications: updated, unreadCount });
      },
      markAsRead: (id) => {
        const updated = get().notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        const unreadCount = updated.filter((n) => !n.read).length;
        set({ notifications: updated, unreadCount });
      },
      markAllAsRead: () => {
        const updated = get().notifications.map((n) => ({ ...n, read: true }));
        set({ notifications: updated, unreadCount: 0 });
      },
    }),
    { name: 'sprintdesk-notifications' }
  )
);
