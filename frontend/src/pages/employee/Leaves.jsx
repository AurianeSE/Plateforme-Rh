import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";

const LEAVE_TYPES = [
  "Congé annuel",
  "Congé maladie",
  "Congé maternité/paternité",
  "Congé exceptionnel",
  "Congé sans solde",
];

const emptyForm = { type: "", startDate: "", endDate: "", reason: "" };

function Leaves({ user, API }) {
  const [leaves, setLeaves]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [message, setMessage]     = useState("");
  const [filter, setFilter]       = useState("tous");

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

  const handleSubmit = async () => {
    if (!form.type || !form.startDate || !form.endDate) {
      return showMsg("❌ Veuillez remplir tous les champs obligatoires");
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return showMsg("❌ La date de fin doit être après la date de début");
    }
    try {
      await axios.post(`${API}/api/leaves`, form, { headers });
      showMsg("✅ Demande envoyée avec succès");
      setShowModal(false);
      setForm(emptyForm);
      fetchLeaves();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Annuler cette demande ?")) return;
    try {
      await axios.delete(`${API}/api/leaves/${id}`, { headers });
      showMsg("✅ Demande annulée");
      fetchLeaves();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const diff = new Date(form.endDate) - new Date(form.startDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const counts = {
    tous:        leaves.length,
    "en attente": leaves.filter(l => l.status === "en attente").length,
    "approuvé":   leaves.filter(l => l.status === "approuvé").length,
    "rejeté":     leaves.filter(l => l.status === "rejeté").length,
  };

  const filtered = filter === "tous" ? leaves : leaves.filter(l => l.status === filter);

  const statusStyle = (status) => {
    if (status === "approuvé") return { bg: "#f0fdf4", color: "#16a34a", label: "Approuvé" };
    if (status === "rejeté")   return { bg: "#fef2f2", color: "#dc2626", label: "Rejeté" };
    return { bg: "#fffbeb", color: "#d97706", label: "En attente" };
  };

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Demandes de congé</h1>
          <p className="text-slate-500 text-sm mt-1">{leaves.length} demande(s) au total</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white self-start"
          style={{ background: "#1d4ed8" }}>
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouvelle demande
        </button>
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

      {/* Filtres cliquables */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "tous",        label: "Total",      value: counts.tous,          bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
          { key: "en attente",  label: "En attente", value: counts["en attente"], bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
          { key: "approuvé",    label: "Approuvées", value: counts["approuvé"],   bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
          { key: "rejeté",      label: "Rejetées",   value: counts["rejeté"],     bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
        ].map(s => (
          <div key={s.key}
            className="rounded-xl p-3 sm:p-4 text-center border cursor-pointer transition-all"
            style={{
              background: s.bg, borderColor: s.border,
              outline: filter === s.key ? `2px solid ${s.color}` : "none",
            }}
            onClick={() => setFilter(s.key)}>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <Spinner text="Chargement..." />
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
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-800">{leave.type}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Du <strong>{leave.startDate}</strong> au <strong>{leave.endDate}</strong>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                          {leave.days} jour(s)
                        </span>
                      </p>
                      {leave.reason && (
                        <p className="text-xs text-slate-400">{leave.reason}</p>
                      )}
                      <p className="text-xs text-slate-400">
                        Demandé le {new Date(leave.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {leave.status === "en attente" && (
                    <button onClick={() => handleDelete(leave.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold self-start transition-colors"
                      style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL nouvelle demande */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg">Nouvelle demande de congé</h2>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Type de congé *
                </label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none bg-white">
                  <option value="">Sélectionner...</option>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Date début *
                  </label>
                  <input type="date" value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Date fin *
                  </label>
                  <input type="date" value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none" />
                </div>
              </div>

              {calcDays() > 0 && (
                <div className="p-3 rounded-xl text-center"
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <p className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
                    Durée : {calcDays()} jour(s)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Motif (optionnel)
                </label>
                <textarea value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Précisez le motif de votre demande..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none resize-none" />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "#1d4ed8" }}>
                Envoyer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Leaves; 