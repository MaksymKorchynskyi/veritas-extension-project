import { useEffect, useRef, useState } from 'react';

interface InViewOptions {
  /** Stop observing after the first intersection. */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/** Tracks whether an element is in the viewport (IntersectionObserver). */
export function useInView<T extends Element>({ once = true, rootMargin = '0px 0px -12% 0px', threshold = 0 }: InViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Also count elements the reader has already scrolled past (anchor
        // jumps, reloads mid-page) so nothing above the viewport stays hidden.
        const passed = once && entry.boundingClientRect.top < 0;
        if (entry.isIntersecting || passed) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);

  return [ref, inView] as const;
}

/** Copies text to the clipboard and exposes a short-lived "copied" flag. */
export function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), timeout);
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission).
      setCopied(false);
    }
  };

  return { copied, copy };
}

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
