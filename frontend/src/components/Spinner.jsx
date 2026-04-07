import { useEffect, useState } from "react";
import "./Spinner.css";

function Spinner({ text = "Chargement..." }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      angle: `${(i / 30) * 360}deg`,
      dist: `${Math.random() * 30 + 55}px`,
      size: Math.random() * 8 + 4,
      dur: `${Math.random() * 1.5 + 0.8}s`,
      delay: `${Math.random() * 1.5}s`,
      op: Math.random() * 0.6 + 0.4,
      color: ["#a855f7","#c026d3","#e879f9","#7c3aed","#db2777","#f0abfc"][Math.floor(Math.random() * 6)],
    })));
  }, []);

  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        {particles.map(p => (
          <div key={p.id} className="spinner-particle" style={{
            width: `${p.size}px`,
            height: `${p.size * 1.8}px`,
            marginTop: `-${p.size / 2}px`,
            marginLeft: `-${p.size / 2}px`,
            background: p.color,
            filter: `blur(${p.size * 0.3}px)`,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            "--angle": p.angle,
            "--dist": p.dist,
            "--dur": p.dur,
            "--delay": p.delay,
            "--op": p.op,
          }} />
        ))}
        <div className="spinner-ring-outer" />
        <div className="spinner-ring-inner" />
        <div className="spinner-logo">
          <span className="spinner-logo-text">RH</span>
          <span className="spinner-logo-sub">Plateforme</span>
        </div>
      </div>
      <div className="spinner-text">
        <p className="spinner-label">{text}</p>
        <div className="spinner-dots">
          <div className="spinner-dot" />
          <div className="spinner-dot" />
          <div className="spinner-dot" />
        </div>
      </div>
    </div>
  );
}

export default Spinner;