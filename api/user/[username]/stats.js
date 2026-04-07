// api/user/[username]/stats.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  try {
    const url = `https://www.tiktok.com/@${username}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await response.text();
    const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/s);
    if (!match) throw new Error('Profile not found');
    const data = JSON.parse(match[1]);
    const stats = data['__DEFAULT_SCOPE__']['webapp.user-detail'].userInfo.stats;

    res.status(200).json({
      success: true,
      username,
      stats: {
        followerCount: stats.followerCount,
        followingCount: stats.followingCount,
        heartCount: stats.heartCount,
        videoCount: stats.videoCount,
        diggCount: stats.diggCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(err.message === 'Profile not found' ? 404 : 500).json({ error: err.message });
  }
}
