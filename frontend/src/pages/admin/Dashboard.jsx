import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";

function Dashboard({ user, API }) {
  const [stats, setStats]           = useState({ employees: 0, leaves: 0, present: 0, absent: 0 });
  const [activities, setActivities] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading]       = useState(true);

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [empRes, leaveRes, attRes] = await Promise.all([
        axios.get(`${API}/api/employees`, { headers }),
        axios.get(`${API}/api/leaves`,    { headers }),
        axios.get(`${API}/api/attendance/all-today`, { headers }),
      ]);

      const employees  = empRes.data;
      const leaves     = leaveRes.data;
      const attendance = attRes.data;

      const today      = new Date().toISOString().split("T")[0];
      const onLeave    = leaves.filter(l =>
        l.status === "approuvé" &&
        l.startDate <= today &&
        l.endDate   >= today
      ).length;

      const present = attendance.filter(a => a.checkIn).length;
      const absent  = employees.length - present - onLeave;

      setStats({
        employees: employees.length,
        leaves:    leaves.filter(l => l.status === "en attente").length,
        present,
        absent:    Math.max(0, absent),
        onLeave,
      });

      // Activités récentes depuis les congés
      const recent = leaves
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(l => ({
          text: `${l.employeeName} — demande de congé ${l.status}`,
          time: new Date(l.createdAt).toLocaleDateString("fr-FR"),
          type: l.status,
        }));
      setActivities(recent);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const formatTime = (d) => d.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  const statCards = [
    {
      label: "Nombre d'employés",
      value: stats.employees,
      icon: (
        <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      bg: "#1d4ed8",
      light: "#eff6ff",
      textColor: "#1d4ed8",
    },
    {
      label: "Demandes en attente",
      value: stats.leaves,
      icon: (
        <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      bg: "#f59e0b",
      light: "#fffbeb",
      textColor: "#d97706",
    },
    {
      label: "Présents aujourd'hui",
      value: stats.present,
      icon: (
        <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      bg: "#16a34a",
      light: "#f0fdf4",
      textColor: "#16a34a",
    },
    {
      label: "Absents aujourd'hui",
      value: stats.absent,
      icon: (
        <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
      bg: "#dc2626",
      light: "#fef2f2",
      textColor: "#dc2626",
    },
    {
      label: "En congé",
      value: stats.onLeave,
      icon: (
        <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      bg: "#7c3aed",
      light: "#f5f3ff",
      textColor: "#7c3aed",
    },
  ];

  const activityColor = (type) => {
    if (type === "approuvé") return { bg: "#f0fdf4", color: "#16a34a", label: "Approuvé" };
    if (type === "rejeté")   return { bg: "#fef2f2", color: "#dc2626", label: "Rejeté" };
    return { bg: "#fffbeb", color: "#d97706", label: "En attente" };
  };

  if (loading) {
  return (
    <Spinner text="Chargement du tableau de bord..." />
  );
}

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Tableau de bord de l'Administrateur
          </h1>
          <p className="text-slate-500 text-sm mt-1 capitalize">{formatDate(currentTime)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-center self-start sm:self-auto shadow-sm">
          <p className="text-2xl font-bold tabular-nums" style={{ color: "#1d4ed8" }}>
            {formatTime(currentTime)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Heure actuelle</p>
        </div>
      </div>

      {/* Cartes stats — 2 colonnes mobile, 5 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <div key={s.label}
            className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}>
                {s.icon}
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Activités récentes
          </h2>
          <span className="text-xs text-slate-400">{activities.length} activité(s)</span>
        </div>

        {activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Aucune activité récente
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activities.map((a, i) => {
              const c = activityColor(a.type);
              return (
                <div key={i}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: c.color }} />
                  <p className="flex-1 text-sm text-slate-600 leading-tight">{a.text}</p>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{ background: c.bg, color: c.color }}>
                    {c.label}
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0 hidden sm:block">
                    {a.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;