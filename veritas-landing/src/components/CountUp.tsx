import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Counts from 0 to `to` once the element enters the viewport. */
export function CountUp({ to, decimals = 0, duration = 1.8 }: { to: number; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setVal });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
  return <span ref={ref}>{val.toFixed(decimals)}</span>;
}
