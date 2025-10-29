import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  // Example placeholder data
  const sample = Array.from({ length: 10 }).map((_, i) => ({
    player: {
      id: 200 + i,
      first_name: "Player",
      last_name: `#${i + 1}`,
      team: { full_name: "Team Example" },
    },
    projections: { pts: 25 - i, reb: 8, ast: 6, threes: 2 },
    confidence: 10 - i,
  }));
  res.status(200).json(sample);
}
