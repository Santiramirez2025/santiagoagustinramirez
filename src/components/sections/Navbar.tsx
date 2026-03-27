"use client";

import { useTranslations } from "next-intl";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { WA_LINKS } from "@/lib/constants";
import { CtaButton } from "@/components/ui/CtaButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { SARLogo } from "@/components/ui/SARLogo";

interface NavLink {
  href: string;
  labelKey: string;
  accent?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "#proceso",   labelKey: "process"  },
  { href: "#proyectos", labelKey: "projects" },
  { href: "#coaching",  labelKey: "coaching", accent: true },
];

const navbarVariants = {
  top: {
    backdropFilter: "blur(0px)",
    backgroundColor: "rgba(10,10,20,0)",
    borderBottomColor: "rgba(255,255,255,0)",
  },
  scrolled: {
    backdropFilter: "blur(20px)",
    backgroundColor: "rgba(10,10,20,0.75)",
    borderBottomColor: "rgba(124,58,237,0.15)",
  },
};

const linkVariants = {
  initial: { opacity: 0, y: -6 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.07, duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  }),
};

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    pointerEvents: "none" as const,
    transition: { duration: 0.22, ease: "easeIn" },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    pointerEvents: "auto" as const,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
};

const overlayVariants = {
  closed: { opacity: 0, pointerEvents: "none" as const },
  open:   { opacity: 1, pointerEvents: "auto" as const },
};

function NavLinkItem({ href, label, accent, index, onClick }: {
  href: string; label: string; accent?: boolean; index: number; onClick?: () => void;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = () => setActive(window.location.hash === href);
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [href]);

  return (
    <motion.a
      href={href}
      custom={index}
      variants={linkVariants}
      initial="initial"
      animate="animate"
      onClick={onClick}
      className="relative group"
      style={{
        fontSize: 13, fontWeight: 500, letterSpacing: "0.04em",
        textDecoration: "none",
        color: accent
          ? active ? "#fbbf24" : "rgba(251,191,36,0.75)"
          : active ? "#ffffff" : "rgba(255,255,255,0.55)",
        textTransform: "uppercase",
        transition: "color 0.2s",
        padding: "4px 0",
      }}
      whileHover={{ color: accent ? "#fde68a" : "#ffffff" }}
    >
      {label}
      <motion.span
        style={{
          position: "absolute", bottom: -2, left: 0, right: 0, height: 1,
          background: accent
            ? "linear-gradient(90deg,#f59e0b,#fde68a)"
            : "linear-gradient(90deg,#7c3aed,#a78bfa)",
          borderRadius: 2, transformOrigin: "left",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: active ? 1 : 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      />
    </motion.a>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <motion.line x1="3" y1="7" x2="19" y2="7" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} strokeLinecap="round"
        animate={open ? { x1: 4, y1: 4, x2: 18, y2: 18 } : { x1: 3, y1: 7, x2: 19, y2: 7 }} transition={{ duration: 0.25 }} />
      <motion.line x1="3" y1="11" x2="19" y2="11" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} strokeLinecap="round"
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }} transition={{ duration: 0.2 }} style={{ originX: "50%", originY: "50%" }} />
      <motion.line x1="3" y1="15" x2="19" y2="15" stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} strokeLinecap="round"
        animate={open ? { x1: 4, y1: 18, x2: 18, y2: 4 } : { x1: 3, y1: 15, x2: 19, y2: 15 }} transition={{ duration: 0.25 }} />
    </svg>
  );
}

export function Navbar() {
  const t = useTranslations("nav");
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", useCallback((v: number) => { setScrolled(v > 40); }, []));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        variants={navbarVariants}
        animate={scrolled ? "scrolled" : "top"}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, borderBottom: "1px solid", willChange: "backdrop-filter, background-color" }}
      >
        <motion.div
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.6) 40%, rgba(167,139,250,0.8) 60%, transparent 100%)" }}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <SARLogo size={36} animate withName />

          <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden md:flex">
            {NAV_LINKS.map((link, i) => (
              <NavLinkItem key={link.href} href={link.href} label={t(link.labelKey)} accent={link.accent} index={i} />
            ))}
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
            <LanguageSwitcher />
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.4 }}>
              <CtaButton href={WA_LINKS.call} className="!py-2.5 !px-5 !text-[12px]" style={{ letterSpacing: "0.06em" }}>
                {t("cta")}
              </CtaButton>
            </motion.div>
          </div>

          <motion.button
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8, padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 0 }}
            whileTap={{ scale: 0.93 }}
          >
            <HamburgerIcon open={mobileOpen} />
          </motion.button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="overlay" variants={overlayVariants} initial="closed" animate="open" exit="closed" transition={{ duration: 0.25 }}
            onClick={closeMobile}
            style={{ position: "fixed", inset: 0, zIndex: 98, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="mobile-menu" ref={mobileRef} role="dialog" aria-modal="true" aria-label="Navigation menu"
            variants={mobileMenuVariants} initial="closed" animate="open" exit="closed"
            style={{
              position: "fixed", top: 72, left: 12, right: 12, zIndex: 99, borderRadius: 16,
              background: "rgba(10,10,20,0.92)", backdropFilter: "blur(24px)",
              border: "1px solid rgba(124,58,237,0.2)", overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08) inset",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.7), transparent)" }} />
            <div style={{ padding: "20px 24px 24px" }}>
              <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {NAV_LINKS.map((link, i) => (
                  <motion.a key={link.href} href={link.href} onClick={closeMobile}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 16px", borderRadius: 10, textDecoration: "none",
                      color: link.accent ? "#fbbf24" : "rgba(255,255,255,0.8)",
                      fontSize: 15, fontWeight: 500, letterSpacing: "0.02em", transition: "background 0.2s, color 0.2s",
                    }}
                    whileHover={{ backgroundColor: link.accent ? "rgba(251,191,36,0.08)" : "rgba(124,58,237,0.12)", color: link.accent ? "#fde68a" : "#ffffff" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{t(link.labelKey)}</span>
                    <motion.svg width={14} height={14} viewBox="0 0 14 14" fill="none"
                      initial={{ x: 0, opacity: 0.4 }} whileHover={{ x: 3, opacity: 1 }} transition={{ duration: 0.2 }}>
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                    </motion.svg>
                  </motion.a>
                ))}
              </nav>

              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.25, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                style={{ height: 1, background: "rgba(124,58,237,0.2)", margin: "16px 0", transformOrigin: "left" }} />

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.35 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <LanguageSwitcher />
                <CtaButton href={WA_LINKS.call} className="!flex-1 !py-3 !px-5 !text-[13px] !justify-center" onClick={closeMobile}>
                  {t("cta")}
                </CtaButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}