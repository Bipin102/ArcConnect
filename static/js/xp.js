// Fetch a wallet's current level/XP/volume (zeros if it has no activity yet).
export async function fetchActivity(address) {
  const response = await fetch(`/api/activity/${address}/`);
  if (!response.ok) throw new Error(`Failed to load wallet activity (${response.status}).`);
  return response.json();
}

// Record a completed payment against a wallet's cumulative volume/XP.
export async function recordActivity({ address, amount, txHash, kind }) {
  const response = await fetch("/api/activity/record/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, amount, txHash, kind }),
  });
  if (!response.ok) throw new Error(`Failed to record wallet activity (${response.status}).`);
  return response.json();
}
