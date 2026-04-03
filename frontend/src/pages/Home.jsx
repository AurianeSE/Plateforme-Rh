function Home({ onLogin }) {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar horizontale */}
      <nav className="h-16 border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RH</span>
          </div>
          <span className="font-semibold text-slate-800 text-lg hidden sm:block">
            PlatformeRH
          </span>
        </div>
        <button
          onClick={onLogin}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Se connecter
        </button>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          Plateforme de contrôle de personnel
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
          Gérez votre personnel<br />
          <span className="text-blue-600">simplement et efficacement</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10">
          Pointage, congés, rapports — tout ce dont vous avez besoin pour gérer
          votre équipe en un seul endroit.
        </p>
        <button
          onClick={onLogin}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base transition-colors"
        >
          Accéder à la plateforme →
        </button>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🕐",
              title: "Pointage précis",
              desc: "Arrivée, pause, reprise et départ — suivez chaque heure travaillée en temps réel."
            },
            {
              icon: "📋",
              title: "Gestion des congés",
              desc: "Demandes, approbations et historique centralisés. Notifications instantanées."
            },
            {
              icon: "📊",
              title: "Rapports détaillés",
              desc: "Générez des rapports sur mesure pour toutes les périodes souhaitées."
            },
          ].map((f) => (
            <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        © 2026 PlatformeRH — Tous droits réservés
      </div>

    </div>
  );
}

export default Home;