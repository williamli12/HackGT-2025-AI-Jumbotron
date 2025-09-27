const BASE = 'http://localhost:1339';

export async function getTeams() {
  const res = await fetch(`${BASE}/v1/leagues/NFL/teams`);
  if (!res.ok) throw new Error(`Teams fetch failed: ${res.status}`);
  return res.json();
}
