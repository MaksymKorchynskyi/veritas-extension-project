import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Landscape } from './Landscape';
import { BrowserMock } from './BrowserMock';
import styles from './Hero.module.css';

export function Hero() {
  // Start the scene (highlights, popup, score ring) once the page has hydrated.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.copy}`}>
        <p className={styles.badge}>
          <span className={styles.dot} aria-hidden="true" />
          Open source · Hybrid AI with a transparent score
        </p>
        <h1 id="hero-title" className={styles.title}>
          Read the news smarter
          <br className={styles.br} /> and see what it stands on
        </h1>
        <p className={styles.sub}>
          Veritas checks the article you are reading: it extracts the claims, cross-verifies them against open sources and turns the
          evidence into a Trust Score you can audit, right in your browser.
        </p>
        <div className={styles.ctas}>
          <a className="btn btn--primary" href="#quick-start">
            Get the extension <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className="btn" href="#how-it-works">
            How it works
          </a>
        </div>
      </div>

      <div className={styles.stage}>
        <Landscape className={styles.landscape} />
        <div className={`container ${styles.deviceWrap}`}>
          <BrowserMock start={ready} />
        </div>
        <div className={styles.fade} aria-hidden="true" />
      </div>
    </section>
  );
}
