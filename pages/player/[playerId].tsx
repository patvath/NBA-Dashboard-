"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import ProjectionCard from "../../components/ProjectionCard";

export default function PlayerPage() {
  const router = useRouter();
  const { playerId } = router.query;
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayerStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch player details
        const playerResponse = await axios.get(
          `https://api.balldontlie.io/v1/players/${playerId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_BALLDONTLIE_KEY}`,
            },
          }
        );

        // Fetch season averages
        const seasonResponse = await axios.get(
          `https://api.balldontlie.io/v1/season_averages?player_ids[]=${playerId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_BALLDONTLIE_KEY}`,
            },
          }
        );

        setPlayerData({
          player: playerResponse.data,
          season: seasonResponse.data.data[0],
        });
      } catch (err: any) {
        console.error("Error fetching player stats:", err);
        setError("Failed to fetch player data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, [playerId]);

  if (!playerId) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        <p>Select a player to view their stats.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        <p>Loading player stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        <p>No data available for this player.</p>
      </div>
    );
  }

  const { player, season } = playerData;

  return (
    <div className="min-h-screen bg-[#0A0F24] text-white p-8">
      <h1 className="text-3xl font-bold text-gold-400 mb-4">
        {player.first_name} {player.last_name}
      </h1>
      <p className="text-gray-400 mb-6">
        Team: {player.team.full_name} | Position: {player.position || "N/A"}
      </p>

      {season ? (
        <ProjectionCard data={season} />
      ) : (
        <p className="text-gray-500">No season data available.</p>
      )}
    </div>
  );
}
