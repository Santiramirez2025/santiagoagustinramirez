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

const mobileMenuVariants = {
  closed: {
    opacity: 0, y: -12, scale: 0.97,
    pointerEvents: "none" as const,
    transition: { duration: 0.22, ease: "easeIn" },
  },
  open: {
    opacity: 1, y: 0, scale: 1,
    pointerEvents: "auto" as const,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
};

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 22 22" fill="none">
      <motion.line x1="3" y1="7" x2="19" y2="7" stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} strokeLinecap="round"
        animate={open ? { x1: 4, y1: 4, x2: 18, y2: 18 } : { x1: 3, y1: 7, x2: 19, y2: 7 }} transition={{ duration: 0.25 }} />
      <motion.line x1="3" y1="11" x2="19" y2="11" stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} strokeLinecap="round"
        animate={{ opacity: open ? 0 : 1 }} transition={{ duration: 0.15 }} />
      <motion.line x1="3" y1="15" x2="19" y2="15" stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} strokeLinecap="round"
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
        className="fixed top-0 left-0 right-0 z-[100]"
        animate={{
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          backgroundColor: scrolled ? "rgba(5,5,7,0.82)" : "rgba(5,5,7,0)",
          borderBottomColor: scrolled ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0)",
        }}
        transition={{ duration: 0.3 }}
        style={{ borderBottom: "1px solid" }}
      >
        {/* Top accent line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.5) 50%, transparent 90%)" }}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[64px] flex items-center justify-between">
          {/* Logo */}
          <SARLogo size={32} animate withName />

          {/* Desktop nav - HIDDEN on mobile */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="relative text-[12px] font-medium uppercase tracking-[0.05em] no-underline transition-colors duration-200"
                style={{
                  color: link.accent ? "rgba(251,191,36,0.8)" : "rgba(255,255,255,0.5)",
                }}
                whileHover={{ color: link.accent ? "#fde68a" : "#ffffff" }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              >
                {t(link.labelKey)}
              </motion.a>
            ))}

            <div className="w-px h-4 bg-white/10 flex-shrink-0" />
            <LanguageSwitcher />

            <CtaButton href={WA_LINKS.call} className="!py-2 !px-4 !text-[11px] !rounded-[10px]">
              {t("cta")}
            </CtaButton>
          </div>

          {/* Mobile: Language + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <motion.button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              className="flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer"
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
              }}
              whileTap={{ scale: 0.92 }}
            >
              <HamburgerIcon open={mobileOpen} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobile}
            className="fixed inset-0 z-[98] bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            ref={mobileRef}
            role="dialog"
            aria-modal="true"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-[62px] left-3 right-3 z-[99] rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10,10,18,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(124,58,237,0.18)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)" }} />

            <div className="p-5">
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl no-underline transition-colors"
                    style={{
                      color: link.accent ? "#fbbf24" : "rgba(255,255,255,0.85)",
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    <span>{t(link.labelKey)}</span>
                    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="opacity-30">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.a>
                ))}
              </nav>

              <div className="h-px bg-accent/15 my-4" />

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <CtaButton
                  href={WA_LINKS.call}
                  onClick={closeMobile}
                  className="!w-full !justify-center !py-3.5 !text-[14px]"
                >
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