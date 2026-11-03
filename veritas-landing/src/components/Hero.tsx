import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { useEffect } from 'react';
import { Download } from 'lucide-react';
import { CountUp } from './CountUp';
import { GithubIcon } from './GithubIcon';
import { EASE } from '../lib/motion';
import { REPO } from '../lib/links';

const LETTERS = 'Veritas'.split('');
const rise = (delay: number) => ({ initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.7, ease: EASE } });

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 24 });
  const sy = useSpring(my, { stiffness: 90, damping: 24 });
  const o1x = useTransform(sx, (v) => v * -36);
  const o1y = useTransform(sy, (v) => v * -36);
  const o2x = useTransform(sx, (v) => v * 48);
  const o2y = useTransform(sy, (v) => v * 48);

  const { scrollYProgress } = useScroll();
  const lift = useTransform(scrollYProgress, [0, 0.14], [0, -70]);
  const fade = useTransform(scrollYProgress, [0, 0.11], [1, 0]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [mx, my]);

  return (
    <header className="hero" id="top">
      <motion.div className="orb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} style={{ x: o1x, y: o1y, top: '4%', left: '-4%', width: 560, height: 560, background: 'radial-gradient(circle, rgba(197,137,64,0.3) 0%, rgba(197,137,64,0) 68%)' }} />
      <motion.div className="orb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.2 }} style={{ x: o2x, y: o2y, bottom: '-6%', right: '-6%', width: 640, height: 640, background: 'radial-gradient(circle, rgba(51,105,30,0.2) 0%, rgba(51,105,30,0) 68%)' }} />

      <div className="container hero-inner">
        <motion.div style={{ y: lift, opacity: fade }}>
          <motion.div className="eyebrow hero-eyebrow" {...rise(0.05)}>
            <span className="pulse-dot" /> News credibility analyzer
          </motion.div>

          <h1 className="wordmark" aria-label="Veritas">
            {LETTERS.map((ch, i) => (
              <motion.span
                key={i}
                className="ch"
                aria-hidden
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.9, ease: EASE }}
              >
                {ch}
              </motion.span>
            ))}
          </h1>

          <motion.p className="hero-tagline" {...rise(0.5)}>
            Read the news as if a skeptical editor were sitting next to you.
          </motion.p>
          <motion.p className="hero-sub" {...rise(0.6)}>
            Veritas cross-checks the claims in an article against open sources and shows a transparent Trust Score, with the inputs behind every number.
          </motion.p>

          <motion.div className="hero-cta" {...rise(0.7)}>
            <a href="#quickstart" className="btn btn-primary"><Download size={18} /> Get the extension</a>
            <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-ghost"><GithubIcon /> View on GitHub</a>
          </motion.div>

          <motion.dl className="hero-facts" {...rise(0.85)}>
            <div><dt><CountUp to={54} /></dt><dd>outlets rated</dd></div>
            <div><dt><CountUp to={5} /></dt><dd>claims checked</dd></div>
            <div><dt><CountUp to={3} /></dt><dd>scoring criteria</dd></div>
            <div><dt>5–15 s</dt><dd>per analysis</dd></div>
          </motion.dl>
        </motion.div>
      </div>
    </header>
  );
}
