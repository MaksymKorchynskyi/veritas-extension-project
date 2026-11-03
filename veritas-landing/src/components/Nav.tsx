import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

export function Nav() {
  const { scrollYProgress, scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setShow(v > 420));
  return (
    <>
      <motion.div className="progress-bar" style={{ scaleX: scrollYProgress }} />
      <AnimatePresence>
        {show && (
          <motion.nav
            className="float-nav"
            initial={{ y: -80, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: -80, opacity: 0, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            aria-label="Main navigation"
          >
            <a href="#top" className="brand">Veritas</a>
            <a className="link" href="#demo">Demo</a>
            <a className="link" href="#pipeline">How it works</a>
            <a className="link" href="#features">Features</a>
            <a className="link" href="#model">Scoring</a>
            <a className="cta" href="#quickstart">Get started</a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
