import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/login`
    , {
        email,
        password,
      });

      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Logo / Titre */}
        <div style={styles.header}>
          <div style={styles.logo}>RH</div>
          <h1 style={styles.title}>Plateforme RH</h1>
          <p style={styles.subtitle}>Connectez-vous à votre espace</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.field}>
            <label style={styles.label}>Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@rh.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

        </form>

        {/* Aide */}
        <p style={styles.hint}>
          Compte test : <strong>alice@rh.com</strong> / <strong>password</strong>
        </p>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  logo: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.4rem",
    fontWeight: "bold",
    margin: "0 auto 1rem",
    lineHeight: "60px",
    textAlign: "center",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "0.25rem",
  },
  subtitle: {
    color: "#718096",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#4a5568",
  },
  input: {
    padding: "0.75rem 1rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    color: "#1a202c",
  },
  error: {
    background: "#fff5f5",
    border: "1px solid #fed7d7",
    color: "#c53030",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
  },
  button: {
    padding: "0.85rem",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    marginTop: "0.5rem",
  },
  hint: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.8rem",
    color: "#a0aec0",
  },
};

export default Login;