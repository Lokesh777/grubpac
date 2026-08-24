import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  initializeFromPoll: (ids: number[]) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      setNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        set({ notifications, unreadCount });
      },
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
      initializeFromPoll: (ids) => {
        const existing = get().notifications;
        const newNotifications: Notification[] = ids
          .filter((id) => !existing.find((n) => n.id === id))
          .map((id) => ({
            id,
            title: 'New notification',
            body: `Notification ${id} from server`,
            read: false,
            createdAt: new Date().toISOString(),
          }));
        if (newNotifications.length > 0) {
          const updated = [...newNotifications, ...existing].slice(0, 50);
          const unreadCount = updated.filter((n) => !n.read).length;
          set({ notifications: updated, unreadCount });
        }
      },
    }),
    { name: 'sprintdesk-notifications' }
  )
);
