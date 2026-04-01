import { useState, useEffect } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api`;
;

const emptyForm = {
  name: "", email: "", phone: "",
  department: "", position: "", role: "employee", hireDate: ""
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [search, setSearch]       = useState("");
  const [message, setMessage]     = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Charger les employés
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { headers });
      setEmployees(res.data);
    } catch {
      showMessage("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // Ouvrir le formulaire (ajout ou édition)
  const openModal = (employee = null) => {
    setEditTarget(employee);
    setForm(employee ? { ...employee } : emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm);
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    try {
      if (editTarget) {
        await axios.put(`${API}/employees/${editTarget.id}`, form, { headers });
        showMessage("✅ Employé modifié avec succès");
      } else {
        await axios.post(`${API}/employees`, form, { headers });
        showMessage("✅ Employé ajouté avec succès");
      }
      fetchEmployees();
      closeModal();
    } catch (err) {
      showMessage("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  // Supprimer un employé
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return;
    try {
      await axios.delete(`${API}/employees/${id}`, { headers });
      showMessage("✅ Employé supprimé");
      fetchEmployees();
    } catch {
      showMessage("❌ Erreur lors de la suppression");
    }
  };

  // Filtrer par recherche
  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  const departments = ["Ressources Humaines", "Informatique", "Comptabilité", "Commercial", "Direction"];

  return (
    <div style={styles.container}>

      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 Gestion des employés</h1>
          <p style={styles.subtitle}>{employees.length} employés au total</p>
        </div>
        <button onClick={() => openModal()} style={styles.addBtn}>
          + Ajouter un employé
        </button>
      </div>

      {/* Message de feedback */}
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

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="🔍 Rechercher par nom, département ou poste..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* Tableau */}
      {loading ? (
        <p style={{ color: "#718096", textAlign: "center", padding: "2rem" }}>Chargement...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Employé</th>
                <th style={styles.th}>Département</th>
                <th style={styles.th}>Poste</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        ...styles.avatar,
                        background: emp.role === "admin"
                          ? "linear-gradient(135deg, #667eea, #764ba2)"
                          : "linear-gradient(135deg, #48bb78, #38a169)"
                      }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: "600", color: "#1a202c" }}>{emp.name}</p>
                        <p style={{ fontSize: "0.8rem", color: "#718096" }}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{emp.department}</td>
                  <td style={styles.td}>{emp.position}</td>
                  <td style={styles.td}>{emp.phone || "—"}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      background: emp.status === "actif" ? "#f0fff4" : "#fff5f5",
                      color: emp.status === "actif" ? "#276749" : "#c53030",
                    }}>
                      {emp.status === "actif" ? "✅ Actif" : "❌ Inactif"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => openModal(emp)} style={styles.editBtn}>
                        ✏️ Modifier
                      </button>
                      <button onClick={() => handleDelete(emp.id, emp.name)} style={styles.deleteBtn}>
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#718096" }}>
                    Aucun employé trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editTarget ? "✏️ Modifier l'employé" : "➕ Ajouter un employé"}
              </h2>
              <button onClick={closeModal} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {[
                { label: "Nom complet *", key: "name", type: "text", placeholder: "Alice Dupont" },
                { label: "Email *", key: "email", type: "email", placeholder: "alice@rh.com" },
                { label: "Téléphone", key: "phone", type: "text", placeholder: "+229 97 00 00 00" },
                { label: "Poste *", key: "position", type: "text", placeholder: "Développeur" },
                { label: "Date d'embauche", key: "hireDate", type: "date", placeholder: "" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={styles.field}>
                  <label style={styles.label}>{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={styles.input}
                  />
                </div>
              ))}

              <div style={styles.field}>
                <label style={styles.label}>Département *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Sélectionner...</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={styles.input}
                >
                  <option value="employee">Employé</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {editTarget && (
                <div style={styles.field}>
                  <label style={styles.label}>Statut</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={styles.input}
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}>Annuler</button>
              <button onClick={handleSubmit} style={styles.submitBtn}>
                {editTarget ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: "1100px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { fontSize: "1.6rem", fontWeight: "700", color: "#1a202c" },
  subtitle: { color: "#718096", marginTop: "0.25rem" },
  addBtn: {
    padding: "0.65rem 1.25rem", background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white", border: "none", borderRadius: "8px",
    fontWeight: "600", cursor: "pointer", fontSize: "0.95rem"
  },
  toast: {
    padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid",
    marginBottom: "1rem", fontWeight: "500"
  },
  search: {
    width: "100%", padding: "0.75rem 1rem",
    border: "1.5px solid #e2e8f0", borderRadius: "8px",
    fontSize: "0.95rem", marginBottom: "1.5rem", outline: "none"
  },
  tableWrapper: { background: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f7fafc" },
  th: { padding: "1rem 1.25rem", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.05em" },
  tr: { borderBottom: "1px solid #f0f4f8" },
  td: { padding: "1rem 1.25rem", fontSize: "0.9rem", color: "#4a5568" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", flexShrink: 0 },
  editBtn: { padding: "0.35rem 0.75rem", background: "#ebf4ff", color: "#3182ce", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" },
  deleteBtn: { padding: "0.35rem 0.75rem", background: "#fff5f5", color: "#c53030", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "white", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", borderBottom: "1px solid #f0f4f8" },
  modalTitle: { fontSize: "1.1rem", fontWeight: "700", color: "#1a202c" },
  closeBtn: { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#718096" },
  modalBody: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  modalFooter: { padding: "1.25rem 1.5rem", borderTop: "1px solid #f0f4f8", display: "flex", justifyContent: "flex-end", gap: "0.75rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#4a5568" },
  input: { padding: "0.7rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none" },
  cancelBtn: { padding: "0.65rem 1.25rem", background: "white", border: "1.5px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#4a5568" },
  submitBtn: { padding: "0.65rem 1.25rem", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};

export default Employees;