import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { LINKS, NAV } from '../lib/links';
import { cx } from '../lib/hooks';
import { GithubIcon, Logo } from './ui';
import styles from './Header.module.css';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // A sentinel at the top of the page tells us when to give the bar a surface.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Close the mobile menu on Escape and when the viewport grows past the breakpoint.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <header className={styles.header} data-scrolled={scrolled || open}>
        <div className={cx('container', styles.bar)}>
          <a href="#top" className={styles.brand} aria-label="Veritas, back to top">
            <Logo />
          </a>

          <nav className={styles.nav} aria-label="Primary">
            <ul role="list">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <a className={styles.github} href={LINKS.repo} target="_blank" rel="noreferrer">
              <GithubIcon size={16} />
              GitHub
            </a>
            <a className="btn btn--primary btn--sm" href="#quick-start">
              Get started <ArrowRight size={16} aria-hidden="true" />
            </a>
            <button
              ref={toggleRef}
              type="button"
              className={styles.toggle}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>

        <div id={menuId} className={styles.sheet} hidden={!open}>
          <nav className="container" aria-label="Mobile">
            <ul role="list">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={LINKS.repo} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
