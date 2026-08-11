import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// PRNG determinístico (mulberry32) para que las estrellas sean idénticas en cada frame/proceso.
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260811);
const STARS = Array.from({ length: 90 }, () => ({
  x: rnd() * 1080,
  y: rnd() * 1920,
  r: rnd() * 1.8 + 0.6,
  ph: rnd() * Math.PI * 2,
  tw: rnd() * 0.09 + 0.03,
  tint: rnd() > 0.82 ? '205,214,255' : rnd() > 0.6 ? '255,233,200' : '233,228,214',
}));

export const Stars: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {STARS.map((s, i) => {
        const a = 0.32 + 0.42 * Math.sin(f * s.tw + s.ph);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: '50%',
              background: `rgba(${s.tint},${Math.max(0, a).toFixed(3)})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
