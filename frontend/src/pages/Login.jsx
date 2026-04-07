import { useState } from "react";
import axios from "axios";

function Login({ onLogin, onBack, API }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">RH</span>
          </div>
          <span className="text-white font-semibold text-xl">PlatformeRH</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Bienvenue sur<br />
            <span className="text-blue-400">votre espace de travail.</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Connectez-vous pour accéder à votre tableau de bord personnalisé.
          </p>
        </div>
        <p className="text-slate-500 text-sm">© 2026 PlatformeRH</p>
      </div>

      {/* Panneau droit */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          {/* Retour accueil */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm mb-8 transition-colors"
          >
            ← Retour à l'accueil
          </button>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Connexion</h2>
          <p className="text-slate-500 mb-8">Entrez vos identifiants pour continuer</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.com"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  {showPass ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 mb-2"></p>
            <p className="text-sm text-slate-600">
              
            </p>
            <p className="text-sm text-slate-600">
              
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;