"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ProjectionCard from "../components/ProjectionCard";

export default function Home() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerStats, setPlayerStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch teams
  useEffect(() => {
    axios
      .get("https://api.balldontlie.io/v1/teams")
      .then((res) => {
        const valid = res.data.data.filter((t: any) =>
          [
            "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
            "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
            "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
          ].includes(t.abbreviation)
        );
        setTeams(valid);
      })
      .catch(console.error);
  }, []);

  // Fetch players for a team
  useEffect(() => {
    if (!selectedTeam) return;
    axios
      .get(`https://api.balldontlie.io/v1/players?team_ids[]=${selectedTeam}&per_page=100`)
      .then((res) => {
        const actives = res.data.data.filter(
          (p: any) => p.position && p.team && p.height_feet !== null
        );
        setPlayers(actives);
      })
      .catch(console.error);
  }, [selectedTeam]);

  // Fetch stats for a player
  const handlePlayerSelect = async (id: string) => {
    setSelectedPlayer(id);
    setPlayerStats(null);
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.balldontlie.io/v1/season_averages?player_ids[]=${id}`
      );
      setPlayerStats(res.data.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gold-400 mb-8"
      >
        NBA Player Dashboard
      </motion.h1>

      {/* Team dropdown */}
      <div className="mb-4 w-full max-w-md">
        <label className="block mb-1 text-sm text-gray-300">Select Team</label>
        <select
          className="w-full bg-[#141A33] text-white border border-gold-500 rounded p-3"
          onChange={(e) => setSelectedTeam(e.target.value)}
          value={selectedTeam}
        >
          <option value="">-- Choose a team --</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Player dropdown */}
      {selectedTeam && (
        <div className="mb-8 w-full max-w-md">
          <label className="block mb-1 text-sm text-gray-300">Select Player</label>
          <select
            className="w-full bg-[#141A33] text-white border border-gold-500 rounded p-3"
            onChange={(e) => handlePlayerSelect(e.target.value)}
            value={selectedPlayer}
          >
            <option value="">-- Choose a player --</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Projection card */}
      <div className="w-full flex justify-center">
        {loading ? (
          <p className="text-gray-400">Loading stats...</p>
        ) : playerStats ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <ProjectionCard data={playerStats} />
          </motion.div>
        ) : (
          <p className="text-gray-500">Select a player to view stats.</p>
        )}
      </div>
    </div>
  );
}
