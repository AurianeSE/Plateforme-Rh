import { useState, useEffect } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api`;
;

const leaveTypes = [
  "Congé annuel",
  "Congé maladie",
  "Congé maternité/paternité",
  "Congé exceptionnel",
  "Congé sans solde"
];

const emptyForm = { type: "", startDate: "", endDate: "", reason: "" };

function Leaves({ userRole }) {
  const [leaves, setLeaves]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [message, setMessage]     = useState("");
  const [filter, setFilter]       = useState("tous");

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API}/leaves`, { headers });
      setLeaves(res.data);
    } catch {
      showMsg("❌ Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  // Soumettre une demande
  const handleSubmit = async () => {
    try {
      await axios.post(`${API}/leaves`, form, { headers });
      showMsg("✅ Demande envoyée avec succès !");
      setShowModal(false);
      setForm(emptyForm);
      fetchLeaves();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  // Approuver / Rejeter
  const handleStatus = async (id, status) => {
    try {
      await axios.put(`${API}/leaves/${id}/status`, { status }, { headers });
      showMsg(`✅ Demande ${status} !`);
      fetchLeaves();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm("Annuler cette demande ?")) return;
    try {
      await axios.delete(`${API}/leaves/${id}`, { headers });
      showMsg("✅ Demande annulée");
      fetchLeaves();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  // Filtrer
  const filtered = leaves.filter((l) =>
    filter === "tous" ? true : l.status === filter
  );

  // Badge de statut
  const StatusBadge = ({ status }) => {
    const config = {
      "en attente": { bg: "#fffbeb", color: "#b45309", label: "⏳ En attente" },
      "approuvé":   { bg: "#f0fff4", color: "#276749", label: "✅ Approuvé" },
      "rejeté":     { bg: "#fff5f5", color: "#c53030", label: "❌ Rejeté" },
    };
    const c = config[status] || config["en attente"];
    return (
      <span style={{
        padding: "0.25rem 0.75rem", borderRadius: "999px",
        fontSize: "0.8rem", fontWeight: "600",
        background: c.bg, color: c.color
      }}>
        {c.label}
      </span>
    );
  };

  // Compter par statut
  const counts = {
    tous:         leaves.length,
    "en attente": leaves.filter((l) => l.status === "en attente").length,
    "approuvé":   leaves.filter((l) => l.status === "approuvé").length,
    "rejeté":     leaves.filter((l) => l.status === "rejeté").length,
  };

  return (
    <div style={styles.container}>

      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏖️ Gestion des congés</h1>
          <p style={styles.subtitle}>{leaves.length} demande(s) au total</p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.addBtn}>
          + Nouvelle demande
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          ...styles.toast,
          background: message.startsWith("✅") ? "#f0fff4" : "#fff5f5",
          borderColor: message.startsWith("✅") ? "#9ae6b4" : "#fed7d7",
          color: message.startsWith("✅") ? "#276749" : "#c53030",
        }}>
          {message}
        </div>
      )}

      {/* Filtres */}
      <div style={styles.filters}>
        {[
          { key: "tous",        label: `Toutes (${counts.tous})` },
          { key: "en attente",  label: `⏳ En attente (${counts["en attente"]})` },
          { key: "approuvé",    label: `✅ Approuvées (${counts["approuvé"]})` },
          { key: "rejeté",      label: `❌ Rejetées (${counts["rejeté"]})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              ...styles.filterBtn,
              background: filter === key ? "#667eea" : "white",
              color: filter === key ? "white" : "#4a5568",
              borderColor: filter === key ? "#667eea" : "#e2e8f0",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste des demandes */}
      {loading ? (
        <p style={{ color: "#718096", textAlign: "center", padding: "2rem" }}>Chargement...</p>
      ) : (
        <div style={styles.list}>
          {filtered.length === 0 && (
            <div style={styles.empty}>Aucune demande trouvée</div>
          )}
          {filtered.map((leave) => (
            <div key={leave.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={styles.leaveType}>{leave.type}</span>
                    <StatusBadge status={leave.status} />
                  </div>
                  {userRole === "admin" && (
                    <p style={styles.employeeName}>👤 {leave.employeeName}</p>
                  )}
                  <p style={styles.dates}>
                    📅 Du <strong>{leave.startDate}</strong> au <strong>{leave.endDate}</strong>
                    <span style={styles.daysBadge}>{leave.days} jour(s)</span>
                  </p>
                  {leave.reason && (
                    <p style={styles.reason}>💬 {leave.reason}</p>
                  )}
                </div>
                <div style={styles.cardActions}>
                  {/* Actions admin */}
                  {userRole === "admin" && leave.status === "en attente" && (
                    <>
                      <button
                        onClick={() => handleStatus(leave.id, "approuvé")}
                        style={styles.approveBtn}
                      >
                        ✅ Approuver
                      </button>
                      <button
                        onClick={() => handleStatus(leave.id, "rejeté")}
                        style={styles.rejectBtn}
                      >
                        ❌ Rejeter
                      </button>
                    </>
                  )}
                  {/* Annuler sa propre demande */}
                  {leave.status === "en attente" && (
                    <button
                      onClick={() => handleDelete(leave.id)}
                      style={styles.cancelBtn}
                    >
                      🗑️ Annuler
                    </button>
                  )}
                </div>
              </div>
              <p style={styles.createdAt}>Demande créée le {leave.createdAt}</p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL nouvelle demande */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>📝 Nouvelle demande de congé</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.field}>
                <label style={styles.label}>Type de congé *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Sélectionner...</option>
                  {leaveTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.field}>
                  <label style={styles.label}>Date de début *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date de fin *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              {form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate) && (
                <div style={styles.dayPreview}>
                  📅 Durée : <strong>
                    {Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1} jour(s)
                  </strong>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>Motif (optionnel)</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Expliquez brièvement la raison de votre demande..."
                  rows={3}
                  style={{ ...styles.input, resize: "vertical" }}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtnModal}>
                Annuler
              </button>
              <button onClick={handleSubmit} style={styles.submitBtn}>
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container:    { padding: "2rem", maxWidth: "900px", margin: "0 auto" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title:        { fontSize: "1.6rem", fontWeight: "700", color: "#1a202c" },
  subtitle:     { color: "#718096", marginTop: "0.25rem" },
  addBtn:       { padding: "0.65rem 1.25rem", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  toast:        { padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid", marginBottom: "1rem", fontWeight: "500" },
  filters:      { display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  filterBtn:    { padding: "0.5rem 1rem", border: "1.5px solid", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "0.85rem" },
  list:         { display: "flex", flexDirection: "column", gap: "1rem" },
  empty:        { textAlign: "center", padding: "3rem", color: "#718096", background: "white", borderRadius: "12px" },
  card:         { background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  cardTop:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" },
  leaveType:    { fontWeight: "700", color: "#1a202c", fontSize: "1rem" },
  employeeName: { color: "#667eea", fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.4rem" },
  dates:        { color: "#4a5568", fontSize: "0.9rem", marginBottom: "0.4rem" },
  daysBadge:    { marginLeft: "0.75rem", background: "#ebf4ff", color: "#3182ce", padding: "0.1rem 0.5rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600" },
  reason:       { color: "#718096", fontSize: "0.85rem" },
  cardActions:  { display: "flex", gap: "0.5rem", flexShrink: 0 },
  approveBtn:   { padding: "0.4rem 0.85rem", background: "#f0fff4", color: "#276749", border: "1px solid #9ae6b4", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" },
  rejectBtn:    { padding: "0.4rem 0.85rem", background: "#fff5f5", color: "#c53030", border: "1px solid #fed7d7", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" },
  cancelBtn:    { padding: "0.4rem 0.85rem", background: "#f7fafc", color: "#718096", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" },
  createdAt:    { color: "#a0aec0", fontSize: "0.78rem", marginTop: "1rem" },
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:        { background: "white", borderRadius: "16px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid #f0f4f8" },
  modalTitle:   { fontSize: "1.1rem", fontWeight: "700", color: "#1a202c" },
  closeBtn:     { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#718096" },
  modalBody:    { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  modalFooter:  { padding: "1.25rem 1.5rem", borderTop: "1px solid #f0f4f8", display: "flex", justifyContent: "flex-end", gap: "0.75rem" },
  field:        { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label:        { fontSize: "0.85rem", fontWeight: "600", color: "#4a5568" },
  input:        { padding: "0.7rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none" },
  dayPreview:   { background: "#ebf4ff", color: "#3182ce", padding: "0.6rem 1rem", borderRadius: "8px", fontSize: "0.9rem" },
  cancelBtnModal: { padding: "0.65rem 1.25rem", background: "white", border: "1.5px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#4a5568" },
  submitBtn:    { padding: "0.65rem 1.25rem", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};

export default Leaves;