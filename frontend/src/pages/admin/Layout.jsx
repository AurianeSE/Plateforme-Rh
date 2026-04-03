import { useState } from "react";
import Dashboard from "./Dashboard";
import Employees from "./Employees";
import Leaves from "./Leaves";
import Reports from "./Reports";

const PRIMARY = "#1d4ed8";

function AdminLayout({ user, onLogout, API }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { key: "dashboard", label: "Tableau de bord", icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )},
    { key: "employees", label: "Employés", icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    )},
    { key: "leaves", label: "Demandes de congé", icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )},
    { key: "reports", label: "Rapports", icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f1f5f9" }}>

      {/* NAVBAR HORIZONTALE HAUT */}
      <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", height: "64px" }}
        className="flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">

        {/* Gauche */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors flex flex-col gap-1">
            <div className="w-5 h-0.5 bg-slate-500"></div>
            <div className="w-5 h-0.5 bg-slate-500"></div>
            <div className="w-5 h-0.5 bg-slate-500"></div>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: PRIMARY }}>RH</div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-800">PlatformeRH</span>
              <span className="text-slate-400 text-sm ml-2">| Administration</span>
            </div>
          </div>
        </div>

        {/* Centre — breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Accueil &gt; {navItems.find(n => n.key === activePage)?.label}</span>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "#7c3aed" }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400">Administrateur</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* SIDEBAR VERTICALE GAUCHE */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] w-60
          z-40 transition-transform duration-200 flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `} style={{ background: "white", borderRight: "1px solid #e2e8f0" }}>

          {/* Profil sidebar */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: "#7c3aed" }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{user.name}</p>
                <p className="text-xs" style={{ color: "#7c3aed" }}>Administrateur</p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="p-3 space-y-1">
            {navItems.map(({ key, label, icon }) => {
              const isActive = activePage === key;
              return (
                <button key={key}
                  onClick={() => { setActivePage(key); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                  style={{
                    background: isActive ? PRIMARY : "transparent",
                    color: isActive ? "white" : "#64748b",
                  }}>
                  {icon}
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Footer sidebar */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="rounded-xl p-3 text-center"
              style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
              <p className="text-xs font-semibold" style={{ color: "#7c3aed" }}>Mode Administrateur</p>
              <p className="text-xs text-slate-400 mt-0.5">Accès complet</p>
            </div>
          </div>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          {activePage === "dashboard" && <Dashboard user={user} API={API} />}
          {activePage === "employees" && <Employees user={user} API={API} />}
          {activePage === "leaves"    && <Leaves user={user} API={API} />}
          {activePage === "reports"   && <Reports user={user} API={API} />}
        </main>

      </div>
    </div>
  );
}

export default AdminLayout;