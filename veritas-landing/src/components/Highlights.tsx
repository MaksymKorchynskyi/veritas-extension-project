import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cx } from '../lib/hooks';
import { Reveal, SectionHead } from './ui';
import styles from './Highlights.module.css';

const SLIDES = [
  {
    figure: 'E(p)',
    stat: '· computed by a formula, not generated',
    title: 'LLMs gather evidence. Formulas decide.',
    text: 'Agents return only counts and labels. Every number you see comes from a deterministic Beta Reputation System model with unit tests, so results are explainable and reproducible.',
    tone: styles.espresso,
  },
  {
    figure: '5×',
    stat: 'claims verified in parallel',
    title: 'An async pipeline that never waits in line.',
    text: 'FastAPI and asyncio.gather run the claim extractor and the domain lookup side by side, then fan out one verification task per claim.',
    tone: styles.olive,
  },
  {
    figure: '{ }',
    stat: 'typed schemas for every agent',
    title: 'Broken model output fails validation, not your score.',
    text: 'Gemini responses are parsed through instructor into Pydantic v2 models, so a malformed answer is rejected before it can reach the scoring code.',
    tone: styles.amber,
  },
  {
    figure: '50',
    stat: 'neutral fallback instead of a guess',
    title: 'When something breaks, Veritas says so.',
    text: 'Retries with backoff, a fallback model and search timeouts. If the metrics agent fails completely, the API returns a neutral 50 / 50 / 50 result rather than an invented one.',
    tone: styles.taupe,
  },
];

export function Highlights() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Keep the index in sync with native scrolling (swipe, trackpad, keyboard).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIndex(Math.round(track.scrollLeft / track.clientWidth));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const go = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  return (
    <section id="engineering" className="section" aria-labelledby="eng-title">
      <div className="container">
        <SectionHead id="eng-title" eyebrow="Engineering highlights" title="Built to be explainable, not just impressive" />

        <Reveal>
          <div className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Engineering highlights">
            <div ref={trackRef} className={styles.track}>
              {SLIDES.map((slide, i) => (
                <article
                  key={slide.title}
                  className={styles.slide}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${SLIDES.length}`}
                  aria-hidden={i !== index}
                  inert={i !== index}
                >
                  <div className={cx(styles.visual, slide.tone)} aria-hidden="true">
                    <span>{slide.figure}</span>
                  </div>
                  <div className={styles.body}>
                    <p className={styles.stat}>
                      <b>{slide.figure}</b> {slide.stat}
                    </p>
                    <h3>{slide.title}</h3>
                    <p className={styles.text}>{slide.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.controls}>
              <p className={styles.counter} aria-live="polite">
                <span className="visually-hidden">Slide </span>
                {index + 1} / {SLIDES.length}
              </p>
              <button type="button" className={styles.arrow} onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous highlight">
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => go(index + 1)}
                disabled={index === SLIDES.length - 1}
                aria-label="Next highlight"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
