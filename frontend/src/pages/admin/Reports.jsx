import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../../components/Spinner";

function Reports({ API }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState("");

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3500);
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      return showMsg("❌ Veuillez sélectionner une période");
    }
    if (new Date(endDate) < new Date(startDate)) {
      return showMsg("❌ La date de fin doit être après la date de début");
    }

    setLoading(true);
    setReport(null);

    try {
      const [empRes, leaveRes, attRes] = await Promise.all([
        axios.get(`${API}/api/employees`, { headers }),
        axios.get(`${API}/api/leaves`,    { headers }),
        axios.get(`${API}/api/attendance/history`, { headers }),
      ]);

      const employees  = empRes.data;
      const leaves     = leaveRes.data;
      const attendance = attRes.data;

      const start = new Date(startDate);
      const end   = new Date(endDate);
      end.setHours(23, 59, 59);

      // Filtrer les congés sur la période
      const periodLeaves = leaves.filter(l => {
        const s = new Date(l.startDate);
        const e = new Date(l.endDate);
        return s <= end && e >= start;
      });

      // Filtrer les pointages sur la période
      const periodAtt = attendance.filter(a => {
        const d = new Date(a.date);
        return d >= start && d <= end;
      });

      // Stats par employé
      const employeeStats = employees.map(emp => {
        const empLeaves = periodLeaves.filter(l => l.employeeId === emp.id);
        const empAtt    = periodAtt.filter(a => a.userId === emp.userId);

        const joursPresent  = empAtt.filter(a => a.checkIn).length;
        const heuresTravail = empAtt.reduce((sum, a) => sum + (a.workedMinutes || 0), 0);
        const joursConge    = empLeaves.filter(l => l.status === "approuvé")
          .reduce((sum, l) => sum + l.days, 0);

        return {
          name:        emp.name,
          position:    emp.position,
          department:  emp.department,
          joursPresent,
          heuresTravail: Math.round(heuresTravail / 60 * 10) / 10,
          joursConge,
          demandesConge: empLeaves.length,
        };
      });

      setReport({
        periode:      `${new Date(startDate).toLocaleDateString("fr-FR")} — ${new Date(endDate).toLocaleDateString("fr-FR")}`,
        totalEmployes: employees.length,
        totalConges:   periodLeaves.filter(l => l.status === "approuvé").length,
        totalAttente:  periodLeaves.filter(l => l.status === "en attente").length,
        totalPointages: periodAtt.filter(a => a.checkIn).length,
        employeeStats,
      });

    } catch (err) {
      showMsg("❌ Erreur lors de la génération du rapport");
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Rapports</h1>
          <p className="text-slate-500 text-sm mt-1">Générez un rapport sur une période donnée</p>
        </div>
        {report && (
          <button onClick={printReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white self-start"
            style={{ background: "#1d4ed8" }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimer
          </button>
        )}
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

      {/* Sélection période */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Sélectionner la période
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date de début</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#1d4ed8" }} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date de fin</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#1d4ed8" }} />
          </div>
          <button onClick={generateReport} disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center gap-2"
            style={{ background: "#1d4ed8" }}>
            {loading ? "Génération"(
              <>
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Générer
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Générer
              </>
            )}
          </button>
        </div>
      </div>

      {loading && <Spinner text="Génération du rapport..." />}

      {/* Rapport généré */}
      {report && (
        <div className="space-y-4" id="rapport-print">

          {/* Résumé global */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Rapport de la période</h2>
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                {report.periode}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Employés",      value: report.totalEmployes,  bg: "#eff6ff", color: "#1d4ed8" },
                { label: "Congés validés", value: report.totalConges,   bg: "#f0fdf4", color: "#16a34a" },
                { label: "En attente",    value: report.totalAttente,   bg: "#fffbeb", color: "#d97706" },
                { label: "Pointages",     value: report.totalPointages, bg: "#f5f3ff", color: "#7c3aed" },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center"
                  style={{ background: s.bg }}>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: s.color }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Détail par employé */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Détail par employé</h2>
            </div>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Employé", "Poste", "Jours présent", "Heures travaillées", "Jours de congé"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report.employeeStats.map((emp, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: "#1d4ed8" }}>
                            {emp.name?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{emp.position}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold" style={{ color: "#1d4ed8" }}>
                          {emp.joursPresent}j
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold" style={{ color: "#7c3aed" }}>
                          {emp.heuresTravail}h
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold" style={{ color: "#16a34a" }}>
                          {emp.joursConge}j
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-slate-50">
              {report.employeeStats.map((emp, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "#1d4ed8" }}>
                      {emp.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.position}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { label: "Présent",  value: `${emp.joursPresent}j`,    color: "#1d4ed8", bg: "#eff6ff" },
                      { label: "Travaillé", value: `${emp.heuresTravail}h`,  color: "#7c3aed", bg: "#f5f3ff" },
                      { label: "Congé",    value: `${emp.joursConge}j`,      color: "#16a34a", bg: "#f0fdf4" },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: s.bg }}>
                        <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs" style={{ color: s.color }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Reports;