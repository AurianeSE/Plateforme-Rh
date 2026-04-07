import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";

function Attendance({ user, API }) {
  const [attendance, setAttendance] = useState(null);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [todayRes, histRes] = await Promise.all([
        axios.get(`${API}/api/attendance/today`,   { headers }),
        axios.get(`${API}/api/attendance/history`, { headers }),
      ]);
      setAttendance(todayRes.data);
      setHistory(histRes.data);
    } catch (err) {
      showMsg("❌ Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  const pointer = async (action) => {
    try {
      await axios.post(`${API}/api/attendance/${action}`, {}, { headers });
      showMsg("✅ Pointage enregistré avec succès");
      fetchData();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  const formatHour = (dt) => dt
    ? new Date(dt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const formatDate = (dt) => new Date(dt).toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "short"
  });

  const formatWorked = (minutes) => {
    if (!minutes) return "--";
    return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
  };

  const formatTime = (d) => d.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  // Boutons de pointage
  const buttons = [
    {
      action:   "break-start",
      label:    "Début de pause",
      done:     !!attendance?.breakStart,
      disabled: !attendance?.checkIn || !!attendance?.breakStart || !!attendance?.checkOut,
      bg:       "#d97706",
      icon: (
        <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="10" y1="15" x2="10" y2="9"/>
          <line x1="14" y1="15" x2="14" y2="9"/>
        </svg>
      ),
    },
    {
      action:   "break-end",
      label:    "Fin de pause",
      done:     !!attendance?.breakEnd,
      disabled: !attendance?.breakStart || !!attendance?.breakEnd || !!attendance?.checkOut,
      bg:       "#7c3aed",
      icon: (
        <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="10 8 16 12 10 16 10 8"/>
        </svg>
      ),
    },
    {
      action:   "checkout",
      label:    "Pointer départ",
      done:     !!attendance?.checkOut,
      disabled: !attendance?.checkIn || !!attendance?.checkOut,
      bg:       "#dc2626",
      icon: (
        <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <Spinner text="Chargement..." />
    );
  }

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Présence</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-center self-start shadow-sm">
          <p className="text-xl font-bold tabular-nums" style={{ color: "#1d4ed8" }}>
            {formatTime(currentTime)}
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium border"
          style={{
            background: message.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
            borderColor: message.startsWith("✅") ? "#bbf7d0" : "#fecaca",
            color: message.startsWith("✅") ? "#16a34a" : "#dc2626",
          }}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Pointage du jour */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Pointage d'aujourd'hui
          </h2>

          {/* Info arrivée automatique */}
          {attendance?.checkIn && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <p className="text-xs font-medium" style={{ color: "#16a34a" }}>
                Arrivée enregistrée automatiquement à {formatHour(attendance.checkIn)} lors de votre connexion
              </p>
            </div>
          )}

          {/* Boutons pointage */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {buttons.map(btn => (
              <button key={btn.action}
                onClick={() => !btn.disabled && pointer(btn.action)}
                disabled={btn.disabled}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                style={{
                  background:   btn.done ? btn.bg : btn.disabled ? "#f8fafc" : "#fff",
                  borderColor:  btn.done ? btn.bg : btn.disabled ? "#e2e8f0" : btn.bg,
                  cursor:       btn.disabled ? "not-allowed" : "pointer",
                  opacity:      btn.disabled && !btn.done ? 0.5 : 1,
                }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: btn.done || !btn.disabled ? btn.bg : "#e2e8f0" }}>
                  {btn.icon}
                </div>
                <span className="text-xs font-semibold text-center leading-tight"
                  style={{ color: btn.done ? "white" : btn.disabled ? "#94a3b8" : btn.bg }}>
                  {btn.done ? "✓ " : ""}{btn.label}
                </span>
              </button>
            ))}
          </div>

          {/* Récap heures */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            {[
              { label: "Arrivée",      value: formatHour(attendance?.checkIn),    color: "#16a34a" },
              { label: "Début pause",  value: formatHour(attendance?.breakStart), color: "#d97706" },
              { label: "Fin pause",    value: formatHour(attendance?.breakEnd),   color: "#7c3aed" },
              { label: "Départ",       value: formatHour(attendance?.checkOut),   color: "#dc2626" },
            ].map(item => (
              <div key={item.label}
                className="flex justify-between items-center py-2 px-3 rounded-lg"
                style={{ background: "#f8fafc" }}>
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-sm font-bold tabular-nums"
                  style={{ color: item.value === "--:--" ? "#94a3b8" : item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Heures travaillées */}
          {attendance?.workedMinutes ? (
            <div className="mt-4 p-4 rounded-xl text-center"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <p className="text-xs text-slate-500 mb-1">Temps de travail effectif</p>
              <p className="text-3xl font-bold" style={{ color: "#1d4ed8" }}>
                {formatWorked(attendance.workedMinutes)}
              </p>
            </div>
          ) : attendance?.checkIn && !attendance?.checkOut ? (
            <div className="mt-4 p-3 rounded-xl text-center"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p className="text-xs" style={{ color: "#16a34a" }}>En cours de travail...</p>
            </div>
          ) : null}
        </div>

        {/* Historique */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Historique (30 derniers jours)
          </h2>

          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Aucun historique disponible
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {history.map((h, i) => (
                <div key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="text-center flex-shrink-0 w-14">
                    <p className="text-xs font-bold text-slate-800 capitalize">
                      {formatDate(h.date)}
                    </p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-1">
                    <span className="text-xs text-slate-500">
                      ↓ {formatHour(h.checkIn)}
                    </span>
                    <span className="text-xs text-slate-500">
                      ↑ {formatHour(h.checkOut)}
                    </span>
                  </div>
                  {h.workedMinutes && (
                    <span className="text-xs font-bold flex-shrink-0"
                      style={{ color: "#1d4ed8" }}>
                      {formatWorked(h.workedMinutes)}
                    </span>
                  )}
                  {h.checkIn && !h.checkOut && (
                    <span className="text-xs font-semibold flex-shrink-0"
                      style={{ color: "#16a34a" }}>
                      En cours
                    </span>
                  )}
                  {!h.checkIn && (
                    <span className="text-xs font-semibold flex-shrink-0"
                      style={{ color: "#dc2626" }}>
                      Absent
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

export default Attendance;