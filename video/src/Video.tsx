import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Stars } from './Stars';
import { C, serif, sans } from './theme';

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

/* ===== Aurora animada (glow en movimiento) para las escenas oscuras ===== */
const Aurora: React.FC<{ tint?: string }> = ({ tint = '14,158,100' }) => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, size: number, ph: number, op: number) => {
    const dx = Math.sin(f * 0.012 + ph) * 90;
    const dy = Math.cos(f * 0.015 + ph) * 90;
    const s = size * (1 + 0.1 * Math.sin(f * 0.02 + ph));
    return (
      <div style={{ position: 'absolute', left: x + dx, top: y + dy, width: s, height: s, borderRadius: '50%', background: `radial-gradient(circle, rgba(${tint},${op}) 0%, transparent 68%)`, filter: 'blur(50px)' }} />
    );
  };
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {blob(80, 280, 720, 0, 0.28)}
      {blob(660, 1080, 820, 2.2, 0.2)}
      {blob(260, 1560, 620, 4.1, 0.16)}
    </AbsoluteFill>
  );
};

/* ===== 1 · HOOK ===== */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 200 } });
  const y = interpolate(s, [0, 1], [46, 0]);
  const o = interpolate(f, [0, 15], [0, 1], clamp);
  const blur = interpolate(f, [0, 20], [12, 0], clamp);
  const glow = interpolate(f, [0, 30], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.paper, justifyContent: 'center', alignItems: 'center', padding: 90 }}>
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, rgba(14,158,100,${0.10 * glow}) 0%, transparent 70%)` }} />
      <div style={{ position: 'relative', fontFamily: serif, color: C.ink, fontSize: 104, lineHeight: 1.04, textAlign: 'center', letterSpacing: -3, transform: `translateY(${y}px)`, opacity: o, filter: `blur(${blur}px)` }}>
        ¿Cuántos turnos te <span style={{ fontStyle: 'italic', color: C.signalInk }}>faltaron</span> esta semana?
      </div>
    </AbsoluteFill>
  );
};

/* ===== 2 · PROBLEMA (con golpe/shake) ===== */
const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const loss = Math.round(interpolate(f, [10, 76], [0, 480000], clamp));
  const o = interpolate(f, [0, 14], [0, 1], clamp);
  const impact = interpolate(f, [76, 82], [0, 1], clamp) * interpolate(f, [82, 96], [1, 0], clamp);
  const shake = Math.sin(f * 2.4) * 10 * impact;
  const pop = 1 + 0.06 * impact;
  const glowP = 0.18 + 0.12 * Math.sin(f * 0.18);
  return (
    <AbsoluteFill style={{ background: C.forest, justifyContent: 'center', alignItems: 'center' }}>
      <Stars />
      <Aurora tint="216,115,74" />
      <div style={{ position: 'absolute', width: 1000, height: 700, borderRadius: '50%', background: `radial-gradient(circle, rgba(216,115,74,${glowP}) 0%, transparent 65%)` }} />
      <div style={{ position: 'relative', textAlign: 'center', opacity: o }}>
        <div style={{ fontFamily: sans, color: 'rgba(233,228,214,.72)', fontSize: 30, letterSpacing: 5, textTransform: 'uppercase' }}>Perdés por mes</div>
        <div style={{ fontFamily: serif, color: C.clay, fontSize: 196, lineHeight: 1, letterSpacing: -5, marginTop: 6, transform: `translateX(${shake}px) scale(${pop})` }}>${loss.toLocaleString('es-AR')}</div>
        <div style={{ fontFamily: sans, color: 'rgba(233,228,214,.75)', fontSize: 36, marginTop: 12 }}>en turnos que reservan y no vienen</div>
      </div>
    </AbsoluteFill>
  );
};

/* ===== 3 · EL SISTEMA EN ACCIÓN (Reserva → Guarda → Envía) ===== */
const RAIL_X = 150;
const NODES = [560, 900, 1240];
const CARD_TOP = [455, 795, 1135];
const STEPS = [
  { icon: '📲', title: 'Reserva online 24/7', sub: 'Jueves 15:00 · Martina G.' },
  { icon: '💾', title: 'Se guarda y cobra la seña', sub: 'Turno #13 guardado · Seña ✓ Mercado Pago' },
  { icon: '✅', title: 'Envía la confirmación', sub: '“Confirmado, te espero el jueves 🙌”' },
];
const System: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleO = interpolate(f, [0, 16], [0, 1], clamp);
  const dotY = interpolate(f, [25, 175], [NODES[0], NODES[2]], clamp);
  const activeAt = [22, 90, 158];
  const words = ['Reserva.', ' Guarda.', ' Envía.'];
  return (
    <AbsoluteFill style={{ background: C.forest }}>
      <Stars />
      <Aurora />
      {/* título */}
      <div style={{ position: 'absolute', top: 170, width: '100%', textAlign: 'center', opacity: titleO, fontFamily: serif, fontSize: 78, letterSpacing: -1 }}>
        {words.map((w, i) => (
          <span key={i} style={{ color: f >= activeAt[i] ? C.signal : 'rgba(233,228,214,.55)', transition: 'color .3s' }}>{w}</span>
        ))}
      </div>
      {/* riel */}
      <div style={{ position: 'absolute', left: RAIL_X - 2, top: NODES[0], width: 4, height: NODES[2] - NODES[0], background: 'rgba(233,228,214,.22)' }} />
      {NODES.map((ny, i) => {
        const on = f >= activeAt[i];
        return <div key={'n' + i} style={{ position: 'absolute', left: RAIL_X - 11, top: ny - 11, width: 22, height: 22, borderRadius: '50%', background: on ? C.signal : 'rgba(233,228,214,.3)', boxShadow: on ? '0 0 16px 3px rgba(14,158,100,.6)' : 'none' }} />;
      })}
      {/* punto de energía viajando */}
      <div style={{ position: 'absolute', left: RAIL_X - 9, top: dotY - 9, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 0 24px 8px rgba(14,158,100,.85)' }} />
      {/* tarjetas */}
      {STEPS.map((st, i) => {
        const sp = spring({ frame: f - activeAt[i], fps, config: { damping: 200 } });
        const x = interpolate(sp, [0, 1], [60, 0]);
        const on = f >= activeAt[i];
        return (
          <div key={'c' + i} style={{ position: 'absolute', left: 220, top: CARD_TOP[i], width: 800, transform: `translateX(${x}px)`, opacity: sp }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: C.paper, border: `2px solid ${on ? 'rgba(14,158,100,.55)' : C.line || 'rgba(23,20,14,.12)'}`, borderRadius: 24, padding: '26px 30px', boxShadow: '0 20px 50px rgba(0,0,0,.28)' }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(14,158,100,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flex: 'none' }}>{st.icon}</div>
              <div>
                <div style={{ fontFamily: sans, fontSize: 38, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>{st.title}</div>
                <div style={{ fontFamily: sans, fontSize: 27, color: C.muted, marginTop: 4 }}>{st.sub}</div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ===== 4 · BENEFICIOS ===== */
const Benefit: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = ['Menos no-shows', 'Agenda llena', 'Cobrás por adelantado'];
  return (
    <AbsoluteFill style={{ background: C.forest, justifyContent: 'center', alignItems: 'center' }}>
      <Stars />
      <Aurora />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center' }}>
        {lines.map((l, i) => {
          const s = spring({ frame: f - i * 16, fps, config: { damping: 200 } });
          const y = interpolate(s, [0, 1], [50, 0]);
          const uw = interpolate(f - i * 16, [10, 30], [0, 1], clamp);
          return (
            <div key={i} style={{ transform: `translateY(${y}px)`, opacity: s, textAlign: 'center' }}>
              <div style={{ fontFamily: serif, fontSize: 104, color: C.onForest, lineHeight: 1 }}>{l}</div>
              <div style={{ height: 6, borderRadius: 6, background: C.signal, width: `${uw * 100}%`, margin: '14px auto 0' }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ===== 5 · CTA ===== */
const CTA: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 200 } });
  const pulse = 1 + 0.03 * Math.sin(f * 0.2);
  const shine = interpolate(f % 90, [0, 90], [-260, 620], clamp);
  return (
    <AbsoluteFill style={{ background: C.forest, justifyContent: 'center', alignItems: 'center' }}>
      <Stars />
      <Aurora />
      <div style={{ position: 'relative', textAlign: 'center', transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`, opacity: s }}>
        <div style={{ fontFamily: serif, fontSize: 96, color: C.onForest }}>Santiago Ramírez<span style={{ color: C.signal }}>.</span></div>
        <div style={{ fontFamily: sans, fontSize: 40, color: 'rgba(233,228,214,.8)', marginTop: 18 }}>Sistema de turnos con seña para tu negocio</div>
        <div style={{ position: 'relative', marginTop: 46, display: 'inline-block', overflow: 'hidden', transform: `scale(${pulse})`, background: C.signal, color: '#04120c', fontFamily: sans, fontWeight: 700, fontSize: 46, padding: '28px 56px', borderRadius: 100 }}>
          Demo gratis en 48hs →
          <div style={{ position: 'absolute', top: 0, left: shine, width: 120, height: '100%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.5), transparent)', transform: 'skewX(-18deg)' }} />
        </div>
        <div style={{ fontFamily: sans, fontSize: 34, color: 'rgba(233,228,214,.7)', marginTop: 34 }}>WhatsApp +54 9 3536 561265</div>
      </div>
    </AbsoluteFill>
  );
};

/* ===== AUDIO ===== */
const AUDIO = false; // poné TRUE cuando agregues los mp3 en video/public/audio/
const A = (name: string) => staticFile('audio/' + name);
const Sfx: React.FC<{ name: string; from: number; vol?: number; dur?: number }> = ({ name, from, vol = 0.5, dur = 20 }) => (
  <Sequence from={from} durationInFrames={dur}><Audio src={A(name)} volume={vol} /></Sequence>
);
const AudioLayer: React.FC = () => {
  if (!AUDIO) return null;
  return (
    <>
      <Audio src={A('vo.mp3')} />
      <Audio src={A('music.mp3')} loop volume={(f) => interpolate(f, [0, 20, 615, 660], [0, 0.16, 0.16, 0], clamp)} />
      {[75, 180, 420, 540].map((fr, i) => (<Sfx key={'w' + i} name="whoosh.mp3" from={fr - 4} vol={0.5} dur={24} />))}
      {/* pops del sistema: reserva / guarda / envía */}
      <Sfx name="pop.mp3" from={202} vol={0.5} dur={16} />
      <Sfx name="pop.mp3" from={270} vol={0.55} dur={16} />
      <Sfx name="pop.mp3" from={338} vol={0.55} dur={16} />
      {/* riser al CTA */}
      <Sfx name="riser.mp3" from={526} vol={0.5} dur={44} />
    </>
  );
};

export const Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <AudioLayer />
      <Sequence from={0} durationInFrames={75}><Hook /></Sequence>
      <Sequence from={75} durationInFrames={105}><Problem /></Sequence>
      <Sequence from={180} durationInFrames={240}><System /></Sequence>
      <Sequence from={420} durationInFrames={120}><Benefit /></Sequence>
      <Sequence from={540} durationInFrames={120}><CTA /></Sequence>
    </AbsoluteFill>
  );
};
