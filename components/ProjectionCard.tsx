import { motion } from "framer-motion";
import StatBar from "./StatBar";

export default function ProjectionCard({ data }: any) {
  const { player, projections, confidence } = data;
  const headshot = `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-[#101b3a] rounded-xl p-4 shadow-md border border-[#f0c14b]/40"
    >
      <img
        src={headshot}
        alt={player.first_name}
        className="rounded-md mb-3 w-full h-40 object-cover"
      />
      <h2 className="font-semibold text-lg mb-2">
        {player.first_name} {player.last_name}
      </h2>
      <p className="text-sm text-gray-300 mb-3">
        {player.team.full_name}
      </p>

      <StatBar label="PTS" value={projections.pts} max={40} />
      <StatBar label="REB" value={projections.reb} max={20} />
      <StatBar label="AST" value={projections.ast} max={15} />
      <StatBar label="3PT" value={projections.threes} max={8} />

      <div className="mt-3 text-sm">
        Confidence:
        <span className="text-[#f0c14b] font-bold"> {confidence}/10</span>
      </div>
    </motion.div>
  );
}
