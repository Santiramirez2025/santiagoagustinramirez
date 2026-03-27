"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   SAR Logo — Santiago Agustín Ramírez
   Uso en Navbar:
     import { SARLogo } from "@/components/ui/SARLogo";
     <SARLogo size={36} animate />
   Props:
     size      — tamaño en px del hexágono (default 36)
     animate   — activa animación de ensamblado al montar (default false)
     withName  — muestra el nombre a la derecha (default false)
     className — clases extra al wrapper
───────────────────────────────────────────── */

interface SARLogoProps {
  size?: number;
  animate?: boolean;
  withName?: boolean;
  className?: string;
}

// ── Variantes Framer Motion ──────────────────

const hexVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 18, duration: 0.8 },
  },
  hover: {
    rotate: 30,
    scale: 1.06,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
};

const textVariants = {
  hidden: { opacity: 0, scale: 0.4, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.35, type: "spring", stiffness: 260, damping: 20 },
  },
};

const nameVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.55, duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};

const particleCount = 8;

// ── Componente Spark (partícula decorativa) ──

function Spark({
  angle,
  radius,
  size,
  delay,
}: {
  angle: number;
  radius: number;
  size: number;
  delay: number;
}) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return (
    <motion.div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(167,139,250,0.9)",
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        pointerEvents: "none",
      }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x: [0, x * 0.6, x],
        y: [0, y * 0.6, y],
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
      }}
      transition={{
        delay,
        duration: 0.7,
        ease: "easeOut",
      }}
    />
  );
}

// ── Componente Principal ─────────────────────

export function SARLogo({
  size = 36,
  animate = false,
  withName = false,
  className = "",
}: SARLogoProps) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [sparked, setSparked] = useState(false);
  const controls = useAnimation();
  const sparksKey = useRef(0);

  // Puntos del hexágono escalados al tamaño
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.46;
  const ri = s * 0.39;

  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");

  const innerHexPoints = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + ri * Math.cos(a)},${cy + ri * Math.sin(a)}`;
  }).join(" ");

  const dotPositions = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  // Radio del arco giratorio
  const arcR = s * 0.44;
  const arcCirc = 2 * Math.PI * arcR;
  const dashLen = arcCirc * 0.12;
  const gapLen = arcCirc - dashLen;

  useEffect(() => {
    if (animate) {
      setTimeout(() => {
        setMounted(true);
        controls.start("visible");
        // Activar sparks al completar
        setTimeout(() => {
          setSparked(true);
          sparksKey.current++;
        }, 800);
      }, 200);
    } else {
      setMounted(true);
      controls.start("visible");
    }
  }, [animate, controls]);

  const handleHoverStart = () => {
    setHovered(true);
    controls.start("hover");
  };

  const handleHoverEnd = () => {
    setHovered(false);
    controls.start("visible");
  };

  const handleClick = () => {
    setSparked(false);
    sparksKey.current++;
    requestAnimationFrame(() => setSparked(true));
  };

  return (
    <motion.div
      className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={handleClick}
      style={{ position: "relative" }}
      aria-label="Santiago Ramírez Logo"
    >
      {/* ── Sparks al ensamblar / click ── */}
      {sparked && (
        <div
          key={sparksKey.current}
          style={{
            position: "absolute",
            width: size,
            height: size,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {Array.from({ length: particleCount }, (_, i) => (
            <Spark
              key={i}
              angle={(Math.PI * 2 * i) / particleCount}
              radius={size * 0.72}
              size={Math.random() * 2 + 1.5}
              delay={i * 0.04}
            />
          ))}
        </div>
      )}

      {/* ── Hexágono SVG ── */}
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Halo de hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="halo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.15 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {/* SVG del logo */}
        <motion.svg
          viewBox={`0 0 ${s} ${s}`}
          width={s}
          height={s}
          variants={animate ? hexVariants : undefined}
          initial={animate ? "hidden" : "visible"}
          animate={controls}
          style={{ display: "block", position: "relative", zIndex: 2 }}
        >
          <defs>
            <linearGradient
              id="sar-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient
              id="sar-inner-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08" />
            </linearGradient>
            <filter id="sar-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={s * 0.04} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Hexágono principal */}
          <polygon
            points={hexPoints}
            fill="url(#sar-grad)"
            stroke="rgba(167,139,250,0.55)"
            strokeWidth={s * 0.012}
            filter="url(#sar-glow)"
          />

          {/* Hexágono interior */}
          <polygon
            points={innerHexPoints}
            fill="url(#sar-inner-grad)"
            stroke="rgba(167,139,250,0.18)"
            strokeWidth={s * 0.008}
          />

          {/* Arco giratorio exterior */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={arcR}
            fill="none"
            stroke="rgba(167,139,250,0.55)"
            strokeWidth={s * 0.022}
            strokeDasharray={`${dashLen} ${gapLen}`}
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "linear",
            }}
            style={{ originX: "50%", originY: "50%" }}
          />

          {/* Arco secundario (sentido contrario, más lento) */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={arcR * 0.88}
            fill="none"
            stroke="rgba(167,139,250,0.22)"
            strokeWidth={s * 0.012}
            strokeDasharray={`${dashLen * 0.5} ${gapLen * 1.05}`}
            strokeLinecap="round"
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "linear",
            }}
            style={{ originX: "50%", originY: "50%" }}
          />

          {/* Puntos de vértice */}
          {dotPositions.map((d, i) => (
            <motion.circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={s * 0.025}
              fill="#a78bfa"
              animate={{
                r: [s * 0.022, s * 0.032, s * 0.022],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: i * 0.33,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Letras SAR */}
          <motion.text
            x={cx}
            y={cy + s * 0.065}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            fontSize={s * 0.31}
            fontWeight="700"
            fontFamily="'Segoe UI', system-ui, sans-serif"
            letterSpacing={s * -0.018}
            variants={animate ? textVariants : undefined}
            initial={animate ? "hidden" : "visible"}
            animate={controls}
            style={{ userSelect: "none" }}
          >
            S
            <tspan fill="#c4b5fd">A</tspan>R
          </motion.text>
        </motion.svg>
      </div>

      {/* ── Nombre completo (opcional) ── */}
      <AnimatePresence>
        {withName && (
          <motion.span
            variants={animate ? nameVariants : undefined}
            initial={animate ? "hidden" : "visible"}
            animate="visible"
            exit="hidden"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Santiago Ramírez
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   EJEMPLOS DE USO
   ─────────────────────────────────────────────

   1. En Navbar (reemplazá el div "SR" actual):
   ─────────────────────────────────────────────
   import { SARLogo } from "@/components/ui/SARLogo";

   // Dentro de <Navbar>:
   <div className="flex items-center gap-2.5">
     <SARLogo size={36} animate withName />
   </div>

   2. Hero / página principal (más grande):
   ─────────────────────────────────────────────
   <SARLogo size={80} animate />

   3. Favicon / marca pequeña (sin nombre):
   ─────────────────────────────────────────────
   <SARLogo size={28} />

   4. Solo ícono, sin animación de entrada:
   ─────────────────────────────────────────────
   <SARLogo size={36} animate={false} />

───────────────────────────────────────────── */