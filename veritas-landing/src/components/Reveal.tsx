import { motion, useMotionValue, useSpring, type Variants } from 'framer-motion';
import { useRef } from 'react';

import { EASE } from '../lib/motion';

/** Line-by-line masked heading reveal: each line slides up out of a clip. */
export function MaskLines({ lines, className, delay = 0, as: Tag = 'h2' }: { lines: React.ReactNode[]; className?: string; delay?: number; as?: 'h2' | 'h3' | 'p' }) {
  const M = motion[Tag];
  return (
    <M className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-6% 0px' }} transition={{ staggerChildren: 0.07, delayChildren: delay }}>
      {lines.map((l, i) => (
        <span className="mask-line" key={i}>
          <motion.span variants={lineV}>{l}</motion.span>
        </span>
      ))}
    </M>
  );
}
const lineV: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.75, ease: EASE } },
};

/** Soft fade-up with blur, for paragraphs and blocks. */
export function FadeUp({ children, delay = 0, y = 22, className, style }: { children: React.ReactNode; delay?: number; y?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div className={className} style={style} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-6% 0px' }} transition={{ duration: 0.7, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

/** Wrapper that pulls its child toward the cursor. */
export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 22, mass: 0.3 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 22, mass: 0.3 });
  return (
    <motion.div
      ref={ref} className="magnetic" style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}
