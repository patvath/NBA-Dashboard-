import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { playerId } = req.query;
  const API_BASE = process.env.BALLDONTLIE_API || "https://api.balldontlie.io/v1";
  const API_KEY = process.env.BALLDONTLIE_KEY;

  try {
    const api = axios.create({
      baseURL: API_BASE,
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    });

    const statsRes = await api.get(`/players/${playerId}`);
    const seasonStats = await api.get(`/season_averages`, { params: { player_ids: [playerId] } });

    res.status(200).json({
      player: statsRes.data,
      seasonAverages: seasonStats.data.data[0] || {},
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
