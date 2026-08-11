// api/instagram.js — seguidores + últimas publicaciones (Instagram Graph API).
// Sin token configurado, devuelve números de respaldo (editables abajo).
let cache = { at: 0, data: null };

const FALLBACK = { followers: 9188, posts: 375, handle: 'santiagoramirezmindel', media: [], live: false };

module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  const token = process.env.IG_ACCESS_TOKEN;
  const uid = process.env.IG_USER_ID;

  if (!token || !uid) {
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.status(200).json(FALLBACK);
    return;
  }

  const now = Date.now();
  if (cache.data && now - cache.at < 1800000) { res.status(200).json(cache.data); return; }

  try {
    const url = `https://graph.facebook.com/v21.0/${uid}?fields=username,followers_count,media_count,media.limit(6){media_type,media_url,thumbnail_url,permalink}&access_token=${encodeURIComponent(token)}`;
    const j = await fetch(url).then((r) => r.json());
    if (j.error) throw new Error(j.error.message || 'ig_error');
    const data = {
      followers: j.followers_count != null ? j.followers_count : FALLBACK.followers,
      posts: j.media_count != null ? j.media_count : FALLBACK.posts,
      handle: j.username || FALLBACK.handle,
      media: ((j.media && j.media.data) || []).map((m) => ({
        id: m.id,
        img: m.media_type === 'VIDEO' ? (m.thumbnail_url || m.media_url) : m.media_url,
        permalink: m.permalink
      })),
      live: true
    };
    cache = { at: now, data };
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.status(200).json(data);
  } catch (e) {
    console.error('[instagram] error', e && e.message);
    res.status(200).json(FALLBACK);
  }
};
