import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  label: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeading({
  label,
  title,
  subtitle,
  center = false,
}: SectionHeadingProps) {
  return (
    <Reveal>
      <div className={center ? "text-center max-w-2xl mx-auto" : ""}>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-400">
          {label}
        </span>
        <h2 className="text-heading font-extrabold text-white mt-2.5">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[15px] text-muted mt-2.5 leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}
