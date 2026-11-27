import type { CSSProperties, ReactNode } from 'react';
import { cx, useInView } from '../lib/hooks';
import { scoreTone } from '../lib/scoring';
import styles from './ui.module.css';

/* ------------------------------------------------------------------ */

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms, for staggering siblings. */
  delay?: number;
}

/** Fades and lifts its children in once they scroll into view. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cx('reveal', className)} data-inview={inView} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface SectionHeadProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'center' | 'start';
}

export function SectionHead({ id, eyebrow, title, lead, align = 'center' }: SectionHeadProps) {
  return (
    <Reveal className={cx('section-head', align === 'start' && 'section-head--start')}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="heading">
        {title}
      </h2>
      {lead && <p className="lead">{lead}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */

/** Veritas mark: a "V" drawn as a check, with an amber point of evidence. */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="11" fill="#3E2723" />
      <rect x="1.25" y="1.25" width="37.5" height="37.5" rx="9.75" fill="none" stroke="#C58940" strokeOpacity=".55" strokeWidth="1.5" />
      <path d="M11.5 13.5 19 28l9.5-17" fill="none" stroke="#EFE9E1" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28.5" cy="11" r="2.6" fill="#C58940" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx(styles.logo, className)}>
      <LogoMark />
      <span className={styles.logoWord}>Veritas</span>
    </span>
  );
}

export function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

interface ScoreRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  /** When false the ring is drawn empty; flipping it to true animates the fill. */
  active?: boolean;
  className?: string;
  /** Use light text, for dark surfaces. */
  inverse?: boolean;
}

export function ScoreRing({ value, size = 140, stroke = 8, label = 'Trust Score', active = true, className, inverse }: ScoreRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = active ? c * (1 - value / 100) : c;
  const tone = scoreTone(value);
  const shown = Number.isInteger(value) ? value : Math.round(value);

  return (
    <div
      className={cx(styles.ring, `tone-${tone}`, inverse && styles.ringInverse, className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${shown} out of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className={styles.ringTrack} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className={styles.ringFill}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className={styles.ringValue} aria-hidden="true">
        <b style={{ fontSize: size * 0.3 }}>{shown}</b>
        {size >= 96 && <small>{label}</small>}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface MeterProps {
  label: string;
  value: number;
  active?: boolean;
}

/** One criterion row: name, value and a tone-coloured bar. */
export function Meter({ label, value, active = true }: MeterProps) {
  const tone = scoreTone(value);
  return (
    <div className={cx(styles.meter, `tone-${tone}`)}>
      <span>{label}</span>
      <b>{Math.round(value)}</b>
      <i aria-hidden="true">
        <i style={{ transform: `scaleX(${active ? value / 100 : 0})` }} />
      </i>
    </div>
  );
}

export type Verdict = 'confirmed' | 'contradicted' | 'unverified';

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <span className={cx(styles.verdict, styles[verdict])}>{verdict}</span>;
}
