import { motion, useScroll, useTransform, useInView, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { EASE } from '../lib/motion';

const TEXT = 'Headlines shout, sources hide, and the numbers never quite add up. We read fast and trust our emotions. Veritas reads along with you, and shows why an article can, or cannot, be believed.';

function Word({ children, range, progress }: { children: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return <motion.span className="w" style={{ opacity }}>{children}</motion.span>;
}

function Mark({ kind, on, delay, children }: { kind: 'risk' | 'warn'; on: boolean; delay: number; children: React.ReactNode }) {
  return <span className={`mark mark-bg ${kind} ${on ? 'on' : ''}`} style={{ transitionDelay: `${delay}s` }}>{children}</span>;
}

export function Problem() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });
  const words = TEXT.split(' ');
  const cardRef = useRef<HTMLDivElement>(null);
  const on = useInView(cardRef, { once: true, margin: '-12% 0px' });
  const pop = (d: number) => ({ initial: { opacity: 0, scale: 0.6, y: 10 }, animate: on ? { opacity: 1, scale: 1, y: 0 } : {}, transition: { delay: d, type: 'spring' as const, stiffness: 320, damping: 22 } });

  return (
    <section className="problem" id="problem">
      <div className="container problem-grid">
        <div>
          <div className="eyebrow">The problem</div>
          <p className="reveal-words" ref={ref}>
            {words.map((w, i) => {
              const start = (i / words.length) * 0.92;
              return <Word key={i} progress={scrollYProgress} range={[start, Math.min(1, start + 0.1)]}>{w}</Word>;
            })}
          </p>
        </div>

        <motion.div
          ref={cardRef} className="glass news-card"
          initial={{ opacity: 0, y: 50, rotate: 2 }} whileInView={{ opacity: 1, y: 0, rotate: -1.2 }}
          viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.9, ease: EASE }}
        >
          <div className="src"><span className="fav" /> news-portal.example · illustration</div>
          <h3>
            <Mark kind="warn" on={on} delay={0.2}>Sensation:</Mark> the “secret” price they are hiding from you <Mark kind="risk" on={on} delay={0.5}>shocked the experts</Mark>
          </h3>
          <p>
            Our newsroom found out that <Mark kind="warn" on={on} delay={0.8}>“everyone knows”</Mark> the authorities are staying silent. Details below, but hurry and share before it gets deleted.
          </p>
          <div className="news-flags">
            <motion.span className="flag warn" {...pop(0.4)}>Clickbait</motion.span>
            <motion.span className="flag risk" {...pop(0.6)}>Emotional language</motion.span>
            <motion.span className="flag warn" {...pop(0.8)}>Anonymous source</motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
