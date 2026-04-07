import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";

function Leaves({ API }) {
  const [leaves, setLeaves]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter]   = useState("tous");

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API}/api/leaves`, { headers });
      setLeaves(res.data);
    } catch {
      showMsg("❌ Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/leaves/${id}/status`, { status }, { headers });
      showMsg(`✅ Demande ${status} avec succès`);
      fetchLeaves();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  const counts = {
    tous:        leaves.length,
    "en attente": leaves.filter(l => l.status === "en attente").length,
    "approuvé":   leaves.filter(l => l.status === "approuvé").length,
    "rejeté":     leaves.filter(l => l.status === "rejeté").length,
  };

  const filtered = filter === "tous" ? leaves : leaves.filter(l => l.status === filter);

  const statusStyle = (status) => {
    if (status === "approuvé")   return { bg: "#f0fdf4", color: "#16a34a", label: "Approuvé" };
    if (status === "rejeté")     return { bg: "#fef2f2", color: "#dc2626", label: "Rejeté" };
    return { bg: "#fffbeb", color: "#d97706", label: "En attente" };
  };

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          Demandes de congé
        </h1>
        <p className="text-slate-500 text-sm mt-1">{leaves.length} demande(s) au total</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "tous",        label: "Total",       value: counts.tous,          bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
          { key: "en attente",  label: "En attente",  value: counts["en attente"], bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
          { key: "approuvé",    label: "Approuvées",  value: counts["approuvé"],   bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
          { key: "rejeté",      label: "Rejetées",    value: counts["rejeté"],     bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
        ].map(s => (
          <div key={s.key} className="rounded-xl p-3 sm:p-4 text-center border cursor-pointer transition-all"
            style={{
              background: s.bg, borderColor: s.border,
              outline: filter === s.key ? `2px solid ${s.color}` : "none"
            }}
            onClick={() => setFilter(s.key)}>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Liste des demandes */}
      {loading ? (
        <Spinner text="Chargement des demandes..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 py-16 text-center text-slate-400 text-sm">
          Aucune demande trouvée
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(leave => {
            const s = statusStyle(leave.status);
            return (
              <div key={leave.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5">

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Avatar employé */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: "#1d4ed8" }}>
                        {leave.employeeName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{leave.employeeName}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>

                    <div className="ml-10 space-y-1">
                      <p className="text-sm font-medium text-slate-700">{leave.type}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Du <strong>{leave.startDate}</strong> au <strong>{leave.endDate}</strong>
                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                          {leave.days} jour(s)
                        </span>
                      </p>
                      {leave.reason && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                          </svg>
                          {leave.reason}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        Demande du {new Date(leave.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {/* Actions — seulement si en attente */}
                  {leave.status === "en attente" && (
                    <div className="flex sm:flex-col gap-2 ml-10 sm:ml-0">
                      <button onClick={() => handleStatus(leave.id, "approuvé")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Approuver
                      </button>
                      <button onClick={() => handleStatus(leave.id, "rejeté")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Rejeter
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Leaves;