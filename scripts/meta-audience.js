// scripts/meta-audience.js
// Crea un PÚBLICO GUARDADO enfocado: mujeres 25-55, Argentina, dueñas/interesadas en la
// industria de la belleza (estética, spa, cosmetología, salón) + comportamiento de dueñas de negocio.
// No gasta nada: solo crea el público para que lo ELIJAS en el conjunto de anuncios.
// Lo corrés VOS con TU token (nunca pasa por Claude).
//
// USO (evita cortar el token largo: copialo al portapapeles y usá pbpaste):
//   cd ~/Desktop/santiagoagustinramirez
//   export META_ADS_TOKEN="$(pbpaste)"
//   META_AD_ACCOUNT_ID="act_1680539049972275" node scripts/meta-audience.js

const V = 'v21.0';
const TOKEN = process.env.META_ADS_TOKEN;
let ACCT = process.env.META_AD_ACCOUNT_ID || '';
const NAME = process.env.META_AUDIENCE_NAME || 'Mujeres · dueñas belleza/estética AR 25-55';

if (!TOKEN || !ACCT) { console.error('Falta META_ADS_TOKEN y/o META_AD_ACCOUNT_ID.'); process.exit(1); }
if (!/^act_/.test(ACCT)) ACCT = 'act_' + ACCT.replace(/[^0-9]/g, '');
const enc = encodeURIComponent;

async function gget(path) { return (await fetch(`https://graph.facebook.com/${V}/${path}${path.includes('?') ? '&' : '?'}access_token=${enc(TOKEN)}`)).json(); }
async function search(type, q, extra = '') {
  const j = await gget(`search?type=${type}${extra}&q=${enc(q)}&limit=1&locale=es_LA`);
  if (j.error) throw new Error(j.error.message);
  return (j.data && j.data[0]) || null;
}

(async () => {
  console.log('Cuenta:', ACCT, '\n');

  // 1) Intereses de la industria de la belleza (busca los IDs reales por nombre)
  const wantInterests = ['Belleza', 'Spa', 'Cosmetología', 'Salón de belleza', 'Estética'];
  const interests = [];
  for (const q of wantInterests) {
    try { const r = await search('adinterest', q); if (r && !interests.find((x) => x.id === r.id)) { interests.push({ id: r.id, name: r.name }); console.log('• interés:', r.name); } }
    catch (e) { console.log('⚠ interés', q, '→', e.message); }
  }
  if (!interests.length) throw new Error('No se encontraron intereses de belleza.');

  const flexible = [{ interests }];

  // 2) Comportamiento "dueña de negocio" (opcional; si no existe en AR, seguimos solo con intereses)
  let biz = null;
  for (const q of ['Propietarios de pequeñas empresas', 'Administradores de página de Facebook', 'Emprendedores']) {
    try { biz = await search('adTargetingCategory', q, '&class=behaviors'); if (biz) { console.log('• comportamiento:', biz.name); break; } } catch (e) {}
  }
  if (biz) flexible.push({ behaviors: [{ id: biz.id, name: biz.name }] });
  else console.log('• (sin comportamiento de dueña disponible → queda solo por intereses, más amplio)');

  // 3) Targeting: mujeres (genders:[2]), 25-55, Argentina
  const targeting = { geo_locations: { countries: ['AR'] }, genders: [2], age_min: 25, age_max: 55, flexible_spec: flexible };

  // 4) Crear (idempotente por nombre)
  const list = await gget(`${ACCT}/saved_audiences?fields=name&limit=200`);
  const exist = (list.data || []).find((x) => x.name === NAME);
  if (exist) { console.log('\n• Público guardado ya existía:', exist.id); }
  else {
    const body = new URLSearchParams();
    body.append('name', NAME);
    body.append('description', 'Prospecting frío para web + sistema de turnos (nicho belleza/estética).');
    body.append('targeting', JSON.stringify(targeting));
    body.append('access_token', TOKEN);
    const j = await (await fetch(`https://graph.facebook.com/${V}/${ACCT}/saved_audiences`, { method: 'POST', body })).json();
    if (j.error) throw new Error(j.error.error_user_msg || j.error.message || 'error');
    console.log('\n✓ Público guardado creado:', j.id);
  }

  console.log('\n✅ LISTO. En el conjunto de anuncios → sección Público → "Usar público guardado" → elegí:');
  console.log('   «' + NAME + '»');
})().catch((e) => { console.error('\n✗ Error:', e.message); process.exit(1); });
