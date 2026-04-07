import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";

function Dashboard({ user, API }) {
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance]       = useState(null);
  const [currentTime, setCurrentTime]     = useState(new Date());
  const [loading, setLoading]             = useState(true);

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [notifRes, attRes] = await Promise.all([
        axios.get(`${API}/api/notifications`, { headers }),
        axios.get(`${API}/api/attendance/today`, { headers }),
      ]);
      setNotifications(notifRes.data);
      setAttendance(attRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`, {}, { headers });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/api/notifications/read-all`, {}, { headers });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d) => d.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const formatTime = (d) => d.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  const formatHour = (dt) => dt ? new Date(dt).toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit"
  }) : "--:--";

  const getStatus = () => {
    if (!attendance?.checkIn) return { label: "Non pointé",   color: "#dc2626", bg: "#fef2f2" };
    if (!attendance?.checkOut) {
      if (attendance?.breakStart && !attendance?.breakEnd)
        return { label: "En pause", color: "#d97706", bg: "#fffbeb" };
      return { label: "En service", color: "#16a34a", bg: "#f0fdf4" };
    }
    return { label: "Journée terminée", color: "#1d4ed8", bg: "#eff6ff" };
  };

  const unread = notifications.filter(n => !n.read).length;
  const status = getStatus();

  const activities = [
    attendance?.checkIn    && { label: "Arrivée pointée",     time: formatHour(attendance.checkIn),    color: "#16a34a" },
    attendance?.breakStart && { label: "Début de pause",      time: formatHour(attendance.breakStart), color: "#d97706" },
    attendance?.breakEnd   && { label: "Fin de pause",        time: formatHour(attendance.breakEnd),   color: "#7c3aed" },
    attendance?.checkOut   && { label: "Départ pointé",       time: formatHour(attendance.checkOut),   color: "#1d4ed8" },
  ].filter(Boolean).reverse();

  if (loading) {
    return (
      <Spinner text="Chargement..." />
    );
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Tableau de bord de {user.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1 capitalize">{formatDate(currentTime)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-center self-start shadow-sm">
          <p className="text-2xl font-bold tabular-nums" style={{ color: "#1d4ed8" }}>
            {formatTime(currentTime)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Heure actuelle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Statut du jour */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Statut du jour
          </h2>

          <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
            style={{ background: status.bg }}>
            <div className="w-3 h-3 rounded-full" style={{ background: status.color }} />
            <span className="text-sm font-semibold" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>

          <div className="space-y-2">
            {[
              { label: "Arrivée",     value: formatHour(attendance?.checkIn) },
              { label: "Début pause", value: formatHour(attendance?.breakStart) },
              { label: "Fin pause",   value: formatHour(attendance?.breakEnd) },
              { label: "Départ",      value: formatHour(attendance?.checkOut) },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-semibold text-slate-700 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>

          {attendance?.workedMinutes && (
            <div className="mt-4 p-3 rounded-xl text-center"
              style={{ background: "#eff6ff" }}>
              <p className="text-xs text-slate-500 mb-1">Temps travaillé</p>
              <p className="text-lg font-bold" style={{ color: "#1d4ed8" }}>
                {Math.floor(attendance.workedMinutes / 60)}h{String(attendance.workedMinutes % 60).padStart(2, "0")}
              </p>
            </div>
          )}
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Activités du jour
          </h2>

          {activities.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Aucune activité aujourd'hui
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "#f8fafc" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: a.color }} />
                  <span className="text-sm text-slate-600 flex-1">{a.label}</span>
                  <span className="text-xs font-semibold tabular-nums"
                    style={{ color: a.color }}>{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              Notifications
              {unread > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold"
                  style={{ background: "#dc2626" }}>{unread}</span>
              )}
            </h2>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="text-xs font-medium hover:underline"
                style={{ color: "#1d4ed8" }}>
                Tout lire
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Aucune notification
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 6).map(n => (
                <div key={n.id}
                  className="p-3 rounded-xl border transition-all cursor-pointer"
                  style={{
                    background: n.read ? "#f8fafc" : "#eff6ff",
                    borderColor: n.read ? "#f1f5f9" : "#bfdbfe",
                  }}
                  onClick={() => !n.read && markRead(n.id)}>
                  <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  {!n.read && (
                    <span className="text-xs font-semibold" style={{ color: "#1d4ed8" }}>
                      • Non lu
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;