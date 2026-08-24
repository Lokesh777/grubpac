import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { pollNotifications } from '@/api/notifications';
import { useToast } from '@/hooks/useToast';
import { getRelativeTime } from '@/utils/date';

const PAGE_SIZE = 10;

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useNotificationStore();
  const toast = useToast();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastSeenIds = useRef<Set<number>>(new Set());

  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleNotifications = notifications.slice(startIndex, startIndex + PAGE_SIZE);

  const doPoll = useCallback(async () => {
    try {
      const posts = await pollNotifications();
      const newIds = posts.map((p) => p.id);
      const trulyNew = newIds.filter((id) => !lastSeenIds.current.has(id));
      if (trulyNew.length > 0 && lastSeenIds.current.size > 0) {
        trulyNew.forEach((id) => {
          const post = posts.find((p) => p.id === id);
          if (post) {
            addNotification({
              id: post.id,
              title: post.title,
              body: post.body,
              read: false,
              createdAt: new Date().toISOString(),
            });
            toast.info(`New: ${post.title}`);
          }
        });
      }
      newIds.forEach((id) => lastSeenIds.current.add(id));
    } catch {
      // Silently ignore polling errors
    }
  }, [addNotification, toast]);

  useEffect(() => {
    doPoll();
    pollingRef.current = setInterval(doPoll, 30000);

    const handleVisibility = () => {
      if (document.hidden) {
        if (pollingRef.current) clearInterval(pollingRef.current);
      } else {
        doPoll();
        pollingRef.current = setInterval(doPoll, 30000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [doPoll]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [notifications.length]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-500"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications yet
              </p>
            ) : (
              visibleNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !n.read ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && (
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{n.body}</p>
                      <p className="mt-1 text-[10px] text-gray-400">{getRelativeTime(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 dark:border-gray-700">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
