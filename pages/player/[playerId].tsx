import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { playerId } = req.query;

  try {
    // Fetch player details
    const playerRes = await fetch(`https://www.balldontlie.io/api/v1/players/${playerId}`);
    if (!playerRes.ok) throw new Error(`Failed to fetch player: ${playerRes.status}`);
    const player = await playerRes.json();

    // Fetch season averages for the latest season (use 2024 as current season fallback)
    const currentSeason = new Date().getFullYear() - 1; // ensures valid NBA year alignment
    const statsRes = await fetch(
      `https://www.balldontlie.io/api/v1/season_averages?season=${currentSeason}&player_ids[]=${playerId}`
    );
    const statsData = await statsRes.json();
    const seasonAverages = statsData.data?.[0] || null;

    // Construct final response
    res.status(200).json({
      player,
      seasonAverages,
    });
  } catch (err: any) {
    console.error("Error fetching player data:", err);
    res.status(500).json({ error: "Failed to fetch player data" });
  }
}
