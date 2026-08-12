// scripts/meta-campaign.js
// PRIMERA campaña — deja EN BORRADOR (PAUSADO, sin gastar):
//   1 campaña OUTCOME_SALES (optimiza Purchase = la seña) + 1 ad set Advantage+ amplio (prospecting).
// Retargeting + Lookalike se suman más adelante, cuando el pixel junte datos.
// Idempotente: si lo corrés de nuevo, reusa lo que ya existe (no duplica).
// Lo corrés VOS con TU token (nunca pasa por Claude). Despues agregás el anuncio y publicás.
//
// USO:  META_ADS_TOKEN="EAAB..." META_AD_ACCOUNT_ID="act_1680539049972275" node scripts/meta-campaign.js

const V = 'v21.0';
const TOKEN = process.env.META_ADS_TOKEN;
let ACCT = process.env.META_AD_ACCOUNT_ID || '';
const PIXEL = process.env.META_PIXEL_ID || '1419051696174763';
const COUNTRY = process.env.META_COUNTRY || 'AR';
const DAILY_BUDGET = process.env.META_DAILY_BUDGET || '700000'; // unidad menor (ARS: x100). PLACEHOLDER → ajustar en la UI.
const CAMP_NAME = 'Turnos con seña — Conversión (borrador)';
const ADSET_NAME = 'Advantage+ amplio (Purchase)';

if (!TOKEN || !ACCT) { console.error('Falta META_ADS_TOKEN y/o META_AD_ACCOUNT_ID.'); process.exit(1); }
if (!/^act_/.test(ACCT)) ACCT = 'act_' + ACCT.replace(/[^0-9]/g, '');

const enc = encodeURIComponent;
async function post(path, params) {
  const body = new URLSearchParams();
  for (const k in params) { const v = params[k]; body.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v)); }
  body.append('access_token', TOKEN);
  const j = await (await fetch(`https://graph.facebook.com/${V}/${path}`, { method: 'POST', body })).json();
  if (j.error) throw new Error(j.error.error_user_msg || j.error.message || 'error');
  return j;
}
async function findByName(edge, name) {
  const j = await (await fetch(`https://graph.facebook.com/${V}/${ACCT}/${edge}?fields=name&limit=500&access_token=${enc(TOKEN)}`)).json();
  const f = (j.data || []).find((x) => x.name === name);
  return f ? f.id : null;
}

(async () => {
  console.log('Cuenta:', ACCT, '· Pixel:', PIXEL, '\n');

  // 1) Campaña (reusar si existe; fijar puja "mayor volumen")
  let campId = await findByName('campaigns', CAMP_NAME);
  if (campId) {
    await post(`${campId}`, { bid_strategy: 'LOWEST_COST_WITHOUT_CAP' });
    console.log('• Campaña ya existía (actualizada):', campId);
  } else {
    const c = await post(`${ACCT}/campaigns`, {
      name: CAMP_NAME, objective: 'OUTCOME_SALES', status: 'PAUSED', special_ad_categories: [],
      daily_budget: DAILY_BUDGET, bid_strategy: 'LOWEST_COST_WITHOUT_CAP'
    });
    campId = c.id;
    console.log('✓ Campaña creada (PAUSADA):', campId);
  }

  // 2) Ad set — Advantage+ amplio (prospecting)
  if (await findByName('adsets', ADSET_NAME)) {
    console.log('• Ad set ya existía:', ADSET_NAME);
  } else {
    const a = await post(`${ACCT}/adsets`, {
      name: ADSET_NAME, campaign_id: campId, status: 'PAUSED',
      billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
      promoted_object: { pixel_id: PIXEL, custom_event_type: 'PURCHASE' },
      targeting: { geo_locations: { countries: [COUNTRY] }, targeting_automation: { advantage_audience: 1 } }
    });
    console.log('✓ Ad set creado (PAUSADO):', ADSET_NAME, a.id);
  }

  console.log('\n✅ LISTO. Campaña + ad set EN BORRADOR y PAUSADOS.');
  console.log('   Próximo paso: revisás el PRESUPUESTO, agregás el ANUNCIO (tu Reel) y le das Publicar.');
  console.log('   (Retargeting + Lookalike los sumamos en 2-3 semanas, cuando haya datos.)');
})().catch((e) => { console.error('\n✗ Error:', e.message); process.exit(1); });
