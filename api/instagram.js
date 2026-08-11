// api/instagram.js — seguidores + últimas publicaciones para la sección "En Instagram".
// Fuente preferida: Behold (BEHOLD_FEED_URL) — imágenes estables + seguidores en vivo, sin tokens.
// Alternativa: Instagram/Facebook Graph API (IG_ACCESS_TOKEN). Sin nada → números de respaldo.
let cache = { at: 0, data: null };
const TTL = 3 * 60 * 60 * 1000; // 3h (mantiene bajísimo el consumo del plan free de Behold)

const FALLBACK = { followers: 9188, posts: 375, handle: 'santiagoramirezmindel', media: [], live: false };

function pick(p) {
  const s = p.sizes || {};
  const img = (s.medium && s.medium.mediaUrl) || (s.large && s.large.mediaUrl) || (s.small && s.small.mediaUrl) || p.thumbnailUrl || p.mediaUrl;
  return { id: p.id, img: img, permalink: p.permalink, type: p.mediaType, isReel: !!p.isReel };
}

async function fromBehold(url) {
  const j = await fetch(url).then((r) => r.json());
  return {
    handle: j.username || FALLBACK.handle,
    followers: j.followersCount != null ? j.followersCount : FALLBACK.followers,
    posts: null, // Behold no expone el total de publicaciones → usamos respaldo
    media: (j.posts || []).slice(0, 6).map(pick)
  };
}

async function fromGraph(token, uid) {
  const enc = encodeURIComponent;
  const mapM = (arr) => (arr || []).map((m) => ({ id: m.id, img: m.media_type === 'VIDEO' ? (m.thumbnail_url || m.media_url) : m.media_url, permalink: m.permalink, type: m.media_type }));
  if (uid) {
    const url = `https://graph.facebook.com/v21.0/${uid}?fields=username,followers_count,media_count,media.limit(6){media_type,media_url,thumbnail_url,permalink}&access_token=${enc(token)}`;
    const j = await fetch(url).then((r) => r.json());
    if (j.error) throw new Error(j.error.message || 'fb_error');
    return { handle: j.username, followers: j.followers_count, posts: j.media_count, media: mapM(j.media && j.media.data) };
  }
  const base = 'https://graph.instagram.com';
  const p = await fetch(`${base}/me?fields=username,followers_count,media_count&access_token=${enc(token)}`).then((r) => r.json());
  if (p.error) throw new Error(p.error.message || 'ig_error');
  const m = await fetch(`${base}/me/media?fields=media_type,media_url,thumbnail_url,permalink&limit=6&access_token=${enc(token)}`).then((r) => r.json());
  return { handle: p.username, followers: p.followers_count, posts: p.media_count, media: mapM(m.data) };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  const behold = process.env.BEHOLD_FEED_URL;
  const token = process.env.IG_ACCESS_TOKEN;
  const uid = process.env.IG_USER_ID;

  if (!behold && !token) { res.setHeader('Cache-Control', 'public, max-age=600'); res.status(200).json(FALLBACK); return; }

  const now = Date.now();
  if (cache.data && now - cache.at < TTL) { res.status(200).json(cache.data); return; }

  try {
    const r = behold ? await fromBehold(behold) : await fromGraph(token, uid);
    const data = {
      followers: r.followers != null ? r.followers : FALLBACK.followers,
      posts: r.posts != null ? r.posts : FALLBACK.posts,
      handle: r.handle || FALLBACK.handle,
      media: r.media || [],
      live: true
    };
    cache = { at: now, data };
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json(data);
  } catch (e) {
    console.error('[instagram] error', e && e.message);
    res.status(200).json(FALLBACK);
  }
};
