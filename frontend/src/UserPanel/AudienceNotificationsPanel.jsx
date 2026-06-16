import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Mail, CalendarDays, MapPin, CheckCircle, Clock, Trash2, Eye } from "lucide-react";
import { API_BASE_URL } from "../config/api.js";

export default function AudienceNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // all, unread

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/notifications/my-notifications?unreadOnly=${filter === "unread"}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/notifications/my-unread-count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/notifications/mark-read/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm("Delete this notification?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "reminder": return <Clock size={16} className="text-amber-500" />;
      case "announcement": return <Bell size={16} className="text-orange-500" />;
      default: return <Mail size={16} className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full mb-4">
            <Bell size={16} />
            <span className="text-sm font-semibold tracking-wide">NOTIFICATIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Your Notifications
          </h1>
          <p className="text-slate-500">
            Updates and announcements from event organizers
          </p>
          {unreadCount > 0 && (
            <div className="inline-block mt-3 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "unread"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Bell size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No notifications</h3>
            <p className="text-slate-500">When organizers send updates, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`bg-white rounded-xl border transition-all ${
                  !notif.isRead
                    ? "border-orange-200 shadow-md bg-orange-50/20"
                    : "border-slate-100 hover:shadow-md"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(notif.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-semibold uppercase bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                              {notif.type}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(notif.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-slate-800 mb-1">
                            {notif.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {notif.message}
                          </p>
                          <div className="text-xs text-slate-400 flex items-center gap-3">
                            <span>🎪 {notif.eventTitle}</span>
                            <span>👤 {notif.organizerName}</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-1">
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Mark as read"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif._id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}