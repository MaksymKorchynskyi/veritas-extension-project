import { ArrowUpRight, Check, Copy, Sparkle } from 'lucide-react';
import { CLONE_COMMAND, LINKS, NAV } from '../lib/links';
import { useCopy } from '../lib/hooks';
import { SAMPLE_SCORES } from '../lib/scoring';
import { Logo, Reveal } from './ui';
import styles from './Footer.module.css';

const COLUMNS = [
  { title: 'Product', links: NAV.map((n) => ({ label: n.label, href: n.href })) },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: LINKS.readme },
      { label: 'README українською', href: LINKS.readmeUk },
      { label: 'API reference', href: LINKS.api },
      { label: 'Benchmarks', href: LINKS.benchmarks },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', href: LINKS.repo },
      { label: 'Issues', href: LINKS.issues },
      { label: 'Contributing', href: LINKS.contributing },
      { label: 'MIT License', href: LINKS.license },
    ],
  },
];

const isExternal = (href: string) => href.startsWith('http');

export function Footer() {
  const { copied, copy } = useCopy();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.about}>
            <Logo />
            <p>A browser extension that checks the claims in the news you read and explains its Trust Score, step by step.</p>
            <label htmlFor="clone-cmd" className={styles.label}>
              Get the source
            </label>
            <div className={styles.clone}>
              <input id="clone-cmd" type="text" readOnly value={CLONE_COMMAND} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={() => copy(CLONE_COMMAND)} aria-label={copied ? 'Copied' : 'Copy clone command'}>
                {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
              </button>
              <span className="visually-hidden" role="status">
                {copied ? 'Clone command copied to clipboard' : ''}
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className={styles.col} aria-label={col.title}>
              <h2>{col.title}</h2>
              <ul role="list">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} {...(isExternal(l.href) ? { target: '_blank', rel: 'noreferrer' } : {})}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.cta}>
          <Reveal className={styles.ctaCopy}>
            <p className={styles.kicker}>Open source · MIT license</p>
            <h2 className={styles.ctaTitle}>
              Read with open eyes.
              <br /> Check the claims,
              <br /> then share the story.
            </h2>
            <div className={styles.ctaButtons}>
              <a className="btn btn--primary btn--serif" href="#quick-start">
                Get started <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a className="btn btn--outline btn--serif" href={LINKS.repo} target="_blank" rel="noreferrer">
                GitHub <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a className="btn btn--outline btn--serif" href={LINKS.readme} target="_blank" rel="noreferrer">
                Docs <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          <Reveal className={styles.collage} delay={120}>
            <div aria-hidden="true">
              <span className={`${styles.vcard} ${styles.v1}`}>
                <small>claim · ¶ 2</small>Confirmed
              </span>
              <span className={`${styles.vcard} ${styles.v2}`}>
                <small>claim · ¶ 4</small>Contradicted
              </span>
              <span className={`${styles.vcard} ${styles.v3}`}>
                <small>claim · ¶ 5</small>Unverified
              </span>
              <span className={`${styles.vcard} ${styles.v4}`}>
                <small>trust score</small>
                {Math.round(SAMPLE_SCORES.trust)}
              </span>
              <Sparkle className={styles.sparkle} size={22} />
            </div>
          </Reveal>
        </div>

        <div className={styles.bottom}>
          <a href={LINKS.limitations} target="_blank" rel="noreferrer">
            Limitations &amp; privacy
          </a>
          <p>
            © <span suppressHydrationWarning>{year}</span> Veritas · Scoring model: Jøsang &amp; Ismail (2002)</p>
        </div>
      </div>

      {/* SVG text stays razor-sharp at any size. The viewBox is cropped to the
          measured ink bounds of the glyphs at 300px, so the wordmark fills the
          container exactly with the font's natural spacing. */}
      <svg className={styles.wordmark} viewBox="23 -218 752 224" aria-hidden="true" focusable="false">
        <text className={styles.wordmarkText} x="0" y="0">
          Veritas<tspan className={styles.wordmarkDot}>.</tspan>
        </text>
      </svg>
    </footer>
  );
}
