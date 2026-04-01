function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "1.5rem",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      borderLeft: `4px solid ${color}`,
      display: "flex",
      alignItems: "center",
      gap: "1rem"
    }}>
      <div style={{
        width: "52px",
        height: "52px",
        borderRadius: "12px",
        background: color + "20",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem"
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: "#718096", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
          {label}
        </p>
        <p style={{ color: "#1a202c", fontSize: "1.6rem", fontWeight: "700" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default StatCard;