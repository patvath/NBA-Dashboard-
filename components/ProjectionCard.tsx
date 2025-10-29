import { motion } from "framer-motion";

export default function ProjectionCard({ data }: { data: any }) {
  if (!data)
    return (
      <div
        style={{
          color: "#F5C518",
          backgroundColor: "#141A33",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "1.1rem",
        }}
      >
        No player data available.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        backgroundColor: "#141A33",
        color: "#F5C518",
        borderRadius: "12px",
        padding: "25px",
        maxWidth: "450px",
        margin: "0 auto",
        boxShadow: "0 0 15px rgba(245, 197, 24, 0.3)",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "15px", textAlign: "center" }}>
        Player Performance Overview
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <StatBar label="Points" value={data.pts} />
        <StatBar label="Rebounds" value={data.reb} />
        <StatBar label="Assists" value={data.ast} />
        <StatBar label="Steals" value={data.stl} />
        <StatBar label="Blocks" value={data.blk} />
      </div>

      <p style={{ marginTop: "15px", textAlign: "center", fontSize: "0.9rem" }}>
        Data Source:{" "}
        <strong>
          {data.source === "recent_10_games" ? "Last 10 Games Avg" : "Season Averages"}
        </strong>
      </p>
    </motion.div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  const maxValue = 40; // For scaling bars visually
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.9rem",
          marginBottom: "3px",
        }}
      >
        <span>{label}</span>
        <span>{value || 0}</span>
      </div>
      <div
        style={{
          height: "8px",
          borderRadius: "4px",
          backgroundColor: "#2A2F4F",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6 }}
          style={{
            height: "100%",
            backgroundColor: "#F5C518",
          }}
        />
      </div>
    </div>
  );
}
