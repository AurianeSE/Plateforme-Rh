import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Leaves from "./pages/Leaves";

function App() {
  const [token, setToken]   = useState(localStorage.getItem("token"));
  const [page, setPage]     = useState("dashboard");
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!token) return;
    axios.get("http://localhost:3001/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => setUserRole(res.data.role))
      .catch(() => handleLogout());
  }, [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserRole(null);
  };

  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>

      {/* NAVBAR */}
      <nav style={navStyles.navbar}>
        <div style={navStyles.navLogo}>
          <div style={navStyles.logo}>RH</div>
          <span style={navStyles.navTitle}>Plateforme RH</span>
        </div>
        <div style={navStyles.navLinks}>
          {[
            { key: "dashboard", label: "🏠 Dashboard" },
            { key: "employees", label: "👥 Employés" },
            { key: "leaves",    label: "🏖️ Congés" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              style={{ ...navStyles.navLink, ...(page === key ? navStyles.active : {}) }}
            >
              {label}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} style={navStyles.logoutBtn}>
          Déconnexion
        </button>
      </nav>

      {/* PAGES */}
      {page === "dashboard" && <Dashboard onLogout={handleLogout} />}
      {page === "employees" && <Employees />}
      {page === "leaves"    && <Leaves userRole={userRole} />}
    </div>
  );
}

const navStyles = {
  navbar:   { background: "white", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 100 },
  navLogo:  { display: "flex", alignItems: "center", gap: "0.75rem" },
  logo:     { width: "36px", height: "36px", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "8px", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem" },
  navTitle: { fontWeight: "700", color: "#1a202c", fontSize: "1.1rem" },
  navLinks: { display: "flex", gap: "0.5rem" },
  navLink:  { padding: "0.5rem 1rem", background: "none", border: "none", borderRadius: "8px", cursor: "pointer", color: "#718096", fontWeight: "500", fontSize: "0.9rem" },
  active:   { background: "#ebf4ff", color: "#3182ce" },
  logoutBtn:{ padding: "0.4rem 1rem", background: "white", border: "1.5px solid #e2e8f0", borderRadius: "8px", color: "#4a5568", cursor: "pointer", fontSize: "0.85rem" },
};

export default App;