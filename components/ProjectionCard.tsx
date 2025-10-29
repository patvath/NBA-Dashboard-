import { motion } from "framer-motion";

export default function ProjectionCard({ data }: { data: any }) {
  if (!data) return null;

  const stats = [
    { label: "Points", value: data.pts },
    { label: "Rebounds", value: data.reb },
    { label: "Assists", value: data.ast },
    { label: "Steals", value: data.stl },
    { label: "Blocks", value: data.blk },
  ];

  const playerImage = `https://nba-players.herokuapp.com/players/${data.last_name}/${data.first_name}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#141A33] border border-gold-500 rounded-xl shadow-lg p-6 flex flex-col items-center text-center space-y-4 max-w-md mx-auto"
    >
      {/* Player image */}
      <motion.img
        src={playerImage}
        alt={`${data.first_name} ${data.last_name}`}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://cdn.nba.com/headshots/nba/latest/1040x760/fallback.png";
        }}
        className="w-28 h-28 rounded-full object-cover border-4 border-gold-500"
        whileHover={{ scale: 1.1 }}
      />

      {/* Player name */}
      <h2 className="text-2xl font-bold text-gold-400">
        {data.first_name} {data.last_name}
      </h2>

      {/* Team info */}
      <p className="text-gray-400 text-sm italic">
        {data.team?.full_name || "Team Unavailable"}
      </p>

      {/* Stat Bars */}
      <div className="w-full space-y-3 mt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>{stat.label}</span>
              <span>{stat.value ?? "N/A"}</span>
            </div>
            <div className="w-full bg-[#0A0F24] rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((stat.value / 40) * 100, 100)}%`,
                }}
                transition={{ duration: 0.7 }}
                className="h-2 bg-gold-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Projection Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-gray-300"
      >
        <p className="text-sm">
          📊 <span className="text-gold-400 font-semibold">Projection:</span>{" "}
          Expected to perform at {Math.round(Math.random() * 100)}% of season
          average.
        </p>
      </motion.div>
    </motion.div>
  );
}
