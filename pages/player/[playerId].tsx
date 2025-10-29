import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { playerId } = req.query;

  try {
    // Fetch player details
    const playerRes = await fetch(`https://www.balldontlie.io/api/v1/players/${playerId}`);
    if (!playerRes.ok) {
      throw new Error(`Failed to fetch player info: ${playerRes.status}`);
    }
    const player = await playerRes.json();

    // Determine latest valid NBA season
    const thisYear = new Date().getFullYear();
    const currentSeason = new Date().getMonth() >= 9 ? thisYear : thisYear - 1;

    // Fetch player’s current season averages
    const statsRes = await fetch(
      `https://www.balldontlie.io/api/v1/season_averages?season=${currentSeason}&player_ids[]=${playerId}`
    );
    const statsData = await statsRes.json();

    // Safely handle no results
    const seasonAverages = statsData?.data?.length ? statsData.data[0] : {
      pts: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
    };

    // Return clean data
    return res.status(200).json({
      player,
      seasonAverages,
    });
  } catch (error) {
    console.error("API error fetching player data:", error);
    return res.status(500).json({
      error: "Failed to fetch player data",
      player: null,
      seasonAverages: null,
    });
  }
}
