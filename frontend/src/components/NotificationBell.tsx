"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/services/notifications.service";
import styles from "./NotificationBell.module.css";

const TYPE_ICONS: Record<string, string> = {
  booking_request: "🚗",
  booking_approved: "✅",
  booking_rejected: "❌",
  booking_completed: "🏁",
  new_review: "⭐",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = () =>
      getUnreadCount()
        .then(setUnread)
        .catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleOpen() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleItemClick(notif: Notification) {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n)
      );
      setUnread((c) => Math.max(0, c - 1));
    }

    // Navigate to the relevant page based on notification type
    const routes: Record<string, string> = {
      booking_request:   "/dealer/bookings",
      booking_approved:  "/customer/dashboard?section=rentals",
      booking_rejected:  "/customer/dashboard?section=rentals",
      booking_completed: "/customer/dashboard?section=rentals",
      new_review:        "/dealer/dashboard",
    };
    const route = routes[notif.type];
    if (route) {
      setOpen(false);
      router.push(route);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        className={styles.bell}
        onClick={handleOpen}
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        🔔
        {unread > 0 && (
          <span className={styles.badge}>{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Notifications</span>
            {unread > 0 && (
              <button className={styles.markAllBtn} onClick={handleMarkAll}>
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.empty}>Loading…</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <span>🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`${styles.item} ${!notif.is_read ? styles.itemUnread : ""}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <span className={styles.itemIcon}>
                    {TYPE_ICONS[notif.type] ?? "🔔"}
                  </span>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTitle}>{notif.title}</div>
                    <div className={styles.itemMessage}>{notif.message}</div>
                    <div className={styles.itemTime}>{timeAgo(notif.created_at)}</div>
                  </div>
                  {!notif.is_read && <span className={styles.dot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
