import { useState, useEffect } from "react";
import axios from "axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmployeeLayout from "./pages/employee/Layout";
import AdminLayout from "./pages/admin/Layout";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const [page, setPage]     = useState("home");
  const [token, setToken]   = useState(localStorage.getItem("token"));
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    axios.get(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      setUser(res.data);
    }).catch(() => {
      handleLogout();
    }).finally(() => setLoading(false));
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setPage("home");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Chargement...</div>
      </div>
    );
  }

  if (token && user) {
    if (user.role === "admin") {
      return <AdminLayout user={user} onLogout={handleLogout} API={API} />;
    }
    return <EmployeeLayout user={user} onLogout={handleLogout} API={API} />;
  }

  if (page === "login") {
    return <Login onLogin={handleLogin} onBack={() => setPage("home")} API={API} />;
  }

  return <Home onLogin={() => setPage("login")} />;
}

export default App;