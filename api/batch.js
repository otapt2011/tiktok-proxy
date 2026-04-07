// api/batch.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { usernames } = req.body;
  if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: 'Provide an array of usernames' });
  }

  const results = [];
  for (const username of usernames) {
    try {
      const url = `https://www.tiktok.com/@${username}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await response.text();
      const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/s);
      if (!match) throw new Error('Profile not found');
      const data = JSON.parse(match[1]);
      const userDetail = data['__DEFAULT_SCOPE__']['webapp.user-detail'];
      results.push({ username, success: true, data: userDetail });
    } catch (err) {
      results.push({ username, success: false, error: err.message });
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  res.status(200).json({ success: true, results, timestamp: new Date().toISOString() });
}
