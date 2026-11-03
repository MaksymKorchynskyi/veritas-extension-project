import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

/** Tween a number toward `target` whenever it changes (for live-updating readouts). */
export function useTween(target: number, duration = 0.7) {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const c = animate(from.current, target, { duration, ease: 'easeOut', onUpdate: (v) => { from.current = v; setVal(v); } });
    return () => c.stop();
  }, [target, duration]);
  return val;
}

/** Sets --mx/--my so a CSS radial gradient can follow the cursor. */
export function spotlight(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}
