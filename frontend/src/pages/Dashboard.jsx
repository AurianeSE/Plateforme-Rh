import { useState, useEffect } from "react";
import axios from "axios";
import StatCard from "../components/StatCard";

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  // Mise à jour de l'heure chaque seconde
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Récupère le profil de l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/me`
      , {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (err) {
        onLogout(); // token expiré → retour login
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleCheckIn = () => {
    setCheckedIn(true);
    setCheckInTime(new Date());
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    setCheckInTime(null);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (date) =>
    date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const getWorkedTime = () => {
    if (!checkInTime) return "00:00:00";
    const diff = Math.floor((currentTime - checkInTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#718096" }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          <div style={styles.logo}>RH</div>
          <span style={styles.navTitle}>Plateforme RH</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={styles.userName}>{user?.name}</p>
              <p style={styles.userRole}>{user?.role === "admin" ? "Administrateur" : "Employé"}</p>
            </div>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>
            Déconnexion
          </button>
        </div>
      </nav>

      {/* CONTENU */}
      <main style={styles.main}>

        {/* En-tête */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              Bonjour, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p style={styles.pageDate}>{formatDate(currentTime)}</p>
          </div>
          <div style={styles.clock}>
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Cartes de stats */}
        <div style={styles.statsGrid}>
          <StatCard icon="👥" label="Employés total" value="24"    color="#667eea" />
          <StatCard icon="✅" label="Présents aujourd'hui" value="18" color="#48bb78" />
          <StatCard icon="🏖️" label="En congé" value="3"           color="#ed8936" />
          <StatCard icon="❌" label="Absents" value="3"             color="#fc8181" />
        </div>

        {/* Pointage rapide */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Mon pointage</h2>
          <div style={styles.pointageCard}>
            <div style={styles.pointageInfo}>
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%",
                background: checkedIn ? "#48bb78" : "#fc8181",
                marginRight: "0.5rem"
              }}/>
              <span style={{ color: "#4a5568", fontWeight: "600" }}>
                {checkedIn ? `En service depuis ${formatTime(checkInTime)}` : "Non pointé"}
              </span>
            </div>
            {checkedIn && (
              <p style={{ color: "#718096", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Temps travaillé : <strong>{getWorkedTime()}</strong>
              </p>
            )}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
              <button
                onClick={handleCheckIn}
                disabled={checkedIn}
                style={{
                  ...styles.pointageBtn,
                  background: checkedIn ? "#e2e8f0" : "#48bb78",
                  color: checkedIn ? "#a0aec0" : "white",
                  cursor: checkedIn ? "not-allowed" : "pointer"
                }}
              >
                ✅ Pointer arrivée
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!checkedIn}
                style={{
                  ...styles.pointageBtn,
                  background: !checkedIn ? "#e2e8f0" : "#fc8181",
                  color: !checkedIn ? "#a0aec0" : "white",
                  cursor: !checkedIn ? "not-allowed" : "pointer"
                }}
              >
                🚪 Pointer départ
              </button>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Activité récente</h2>
          <div style={styles.activityCard}>
            {[
              { icon: "✅", text: "Alice Dupont a pointé son arrivée", time: "08:32" },
              { icon: "🏖️", text: "Bob Martin — congé approuvé", time: "Hier" },
              { icon: "👤", text: "Nouveau compte : Sara Kone", time: "Lundi" },
              { icon: "❌", text: "Marc Lebrun — absence signalée", time: "Lundi" },
            ].map((item, i) => (
              <div key={i} style={styles.activityItem}>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <span style={{ flex: 1, color: "#4a5568", fontSize: "0.9rem" }}>{item.text}</span>
                <span style={{ color: "#a0aec0", fontSize: "0.8rem" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f0f4f8" },
  navbar: {
    background: "white",
    padding: "0 2rem",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  navLogo: { display: "flex", alignItems: "center", gap: "0.75rem" },
  logo: {
    width: "36px", height: "36px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    borderRadius: "8px", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "0.85rem"
  },
  navTitle: { fontWeight: "700", color: "#1a202c", fontSize: "1.1rem" },
  navRight: { display: "flex", alignItems: "center", gap: "1.5rem" },
  userBadge: { display: "flex", alignItems: "center", gap: "0.75rem" },
  avatar: {
    width: "38px", height: "38px", borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: "700"
  },
  userName: { fontWeight: "600", color: "#1a202c", fontSize: "0.9rem" },
  userRole: { color: "#718096", fontSize: "0.75rem" },
  logoutBtn: {
    padding: "0.4rem 1rem", background: "#fff",
    border: "1.5px solid #e2e8f0", borderRadius: "8px",
    color: "#4a5568", cursor: "pointer", fontSize: "0.85rem"
  },
  main: { padding: "2rem", maxWidth: "1100px", margin: "0 auto" },
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "2rem"
  },
  pageTitle: { fontSize: "1.6rem", fontWeight: "700", color: "#1a202c" },
  pageDate: { color: "#718096", marginTop: "0.25rem", textTransform: "capitalize" },
  clock: {
    fontSize: "1.8rem", fontWeight: "700",
    color: "#667eea", fontVariantNumeric: "tabular-nums"
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.25rem", marginBottom: "2rem"
  },
  section: { marginBottom: "2rem" },
  sectionTitle: { fontSize: "1.1rem", fontWeight: "700", color: "#1a202c", marginBottom: "1rem" },
  pointageCard: {
    background: "white", borderRadius: "12px",
    padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
  },
  pointageInfo: { display: "flex", alignItems: "center" },
  pointageBtn: {
    padding: "0.65rem 1.25rem", border: "none",
    borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem"
  },
  activityCard: {
    background: "white", borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden"
  },
  activityItem: {
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "1rem 1.5rem", borderBottom: "1px solid #f0f4f8"
  },
};

export default Dashboard;