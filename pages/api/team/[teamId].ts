import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = req.query;
  const API_BASE = process.env.BALLDONTLIE_API || "https://api.balldontlie.io/v1";
  const API_KEY = process.env.BALLDONTLIE_KEY;

  try {
    const api = axios.create({
      baseURL: API_BASE,
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    });

    const playersRes = await api.get("/players", { params: { team_ids: [teamId], per_page: 100 } });
    res.status(200).json(playersRes.data.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
