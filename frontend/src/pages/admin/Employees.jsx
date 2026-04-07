import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";

const DEPARTMENTS = [
  "Ressources Humaines", "Informatique", "Comptabilité",
  "Commercial", "Direction", "Marketing", "Logistique"
];

const emptyForm = {
  name: "", email: "", phone: "",
  department: "", position: "", role: "employee", hireDate: ""
};

function Employees({ API }) {
  const [employees, setEmployees]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [search, setSearch]         = useState("");
  const [filterPost, setFilterPost] = useState("");
  const [message, setMessage]       = useState("");

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [empRes, attRes, leaveRes] = await Promise.all([
        axios.get(`${API}/api/employees`, { headers }),
        axios.get(`${API}/api/attendance/all-today`, { headers }),
        axios.get(`${API}/api/leaves`, { headers }),
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
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

  // Statut de présence de l'employé
  const getPresence = (emp) => {
    const today = new Date().toISOString().split("T")[0];

    // En congé approuvé aujourd'hui ?
    const onLeave = leaves.find(l =>
      l.employeeId === emp.id &&
      l.status === "approuvé" &&
      l.startDate <= today &&
      l.endDate >= today
    );
    if (onLeave) return { label: "En congé", bg: "#f5f3ff", color: "#7c3aed" };

    // Pointage aujourd'hui ?
    const att = attendance.find(a => a.userId === emp.userId);
    if (att?.checkIn) return { label: "Présent", bg: "#f0fdf4", color: "#16a34a" };

    return { label: "Absent", bg: "#fef2f2", color: "#dc2626" };
  };

  // Stats
  const present  = employees.filter(e => getPresence(e).label === "Présent").length;
  const absent   = employees.filter(e => getPresence(e).label === "Absent").length;
  const onLeave  = employees.filter(e => getPresence(e).label === "En congé").length;

  // Postes uniques pour le filtre
  const postes = [...new Set(employees.map(e => e.position))].filter(Boolean);

  // Filtrage
  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchPost = filterPost ? e.position === filterPost : true;
    return matchSearch && matchPost;
  });

  const openModal = (emp = null) => {
    setEditTarget(emp);
    setForm(emp ? {
      name: emp.name, email: emp.email, phone: emp.phone || "",
      department: emp.department, position: emp.position,
      role: emp.role, hireDate: emp.hireDate || ""
    } : emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.department || !form.position) {
      return showMsg("❌ Veuillez remplir tous les champs obligatoires");
    }
    try {
      if (editTarget) {
        await axios.put(`${API}/api/employees/${editTarget.id}`, form, { headers });
        showMsg("✅ Employé modifié avec succès");
      } else {
        await axios.post(`${API}/api/employees`, form, { headers });
        showMsg("✅ Employé ajouté avec succès");
      }
      fetchAll();
      closeModal();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.message || "Erreur"));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return;
    try {
      await axios.delete(`${API}/api/employees/${id}`, { headers });
      showMsg("✅ Employé supprimé");
      fetchAll();
    } catch {
      showMsg("❌ Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          Gestion des employés
        </h1>
        <button onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors self-start sm:self-auto"
          style={{ background: "#1d4ed8" }}>
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Ajouter un employé
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Présents",  value: present,  bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
          { label: "Absents",   value: absent,   bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
          { label: "En congé",  value: onLeave,  bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 sm:p-4 text-center border"
            style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recherche et filtre */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Rechercher un employé..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 text-slate-800"
              style={{ "--tw-ring-color": "#1d4ed8" }} />
          </div>
          <select value={filterPost} onChange={e => setFilterPost(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 bg-white">
            <option value="">Tous les postes</option>
            {postes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Tableau desktop */}
      {loading ? (
        <Spinner text="Chargement des employés..." />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Nom", "Prénom", "Poste", "Email", "Présence", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(emp => {
                  const presence = getPresence(emp);
                  const nameParts = emp.name.split(" ");
                  const prenom = nameParts[0] || "";
                  const nom    = nameParts.slice(1).join(" ") || "";
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "#1d4ed8" }}>
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{nom || emp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{prenom}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{emp.position}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">{emp.email}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: presence.bg, color: presence.color }}>
                          {presence.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openModal(emp)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Modifier" style={{ color: "#1d4ed8" }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(emp.id, emp.name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Supprimer" style={{ color: "#dc2626" }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/>
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 text-sm">
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile — cartes */}
          <div className="md:hidden space-y-3">
            {filtered.map(emp => {
              const presence = getPresence(emp);
              return (
                <div key={emp.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: "#1d4ed8" }}>
                      {emp.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{emp.name}</p>
                      <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: presence.bg, color: presence.color }}>
                      {presence.label}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1 mb-3">
                    <p>💼 {emp.position}</p>
                    <p>🏢 {emp.department}</p>
                    {emp.phone && <p>📞 {emp.phone}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(emp)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-center transition-colors"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                      ✏️ Modifier
                    </button>
                    <button onClick={() => handleDelete(emp.id, emp.name)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-center transition-colors"
                      style={{ background: "#fef2f2", color: "#dc2626" }}>
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-xl border border-slate-100">
                Aucun employé trouvé
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Header modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg">
                {editTarget ? "Modifier l'employé" : "Ajouter un employé"}
              </h2>
              <button onClick={closeModal}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body modal */}
            <div className="px-6 py-4 space-y-4">
              {[
                { label: "Nom complet *", key: "name", type: "text", placeholder: "Alice Dupont" },
                { label: "Email *", key: "email", type: "email", placeholder: "alice@rh.com" },
                  { label: !editTarget ? "Mot de passe *" : "Nouveau mot de passe (optionnel)", key: "password", type: "password", placeholder: "••••••••" },
                { label: "Téléphone", key: "phone", type: "text", placeholder: "+229 97 00 00 00" },
                { label: "Poste *", key: "position", type: "text", placeholder: "Développeur" },
                { label: "Date d'embauche", key: "hireDate", type: "date", placeholder: "" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <input type={type} value={form[key]} placeholder={placeholder}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": "#1d4ed8" }} />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Département *</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none bg-white">
                  <option value="">Sélectionner...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rôle</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none bg-white">
                  <option value="employee">Employé</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {editTarget && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Statut</label>
                  <select value={form.status || "actif"} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none bg-white">
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: "#1d4ed8" }}>
                {editTarget ? "Enregistrer" : "Ajouter"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Employees;