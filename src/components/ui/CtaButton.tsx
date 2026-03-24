"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  external?: boolean;
}

export function CtaButton({
  href,
  children,
  variant = "primary",
  className,
  external = true,
}: CtaButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-[14px] font-bold text-[15px] no-underline transition-shadow duration-200",
        isPrimary
          ? "px-8 py-4 bg-gradient-to-br from-accent to-accent-dark text-white border border-accent/30 glow-accent"
          : "px-6 py-3.5 bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-sm",
        className
      )}
    >
      {children}
    </motion.a>
  );
}
