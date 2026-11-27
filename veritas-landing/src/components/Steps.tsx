import type { ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { CLONE_COMMAND } from '../lib/links';
import { useCopy } from '../lib/hooks';
import { SAMPLE_SCORES } from '../lib/scoring';
import { Reveal, ScoreRing, SectionHead } from './ui';
import styles from './Steps.module.css';

const SETUP = `${CLONE_COMMAND}
cd veritas-extension-project/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key" > .env
uvicorn app.main:app --reload --port 8000`;

function TerminalTile() {
  return (
    <div className={`${styles.tile} ${styles.terminal}`} aria-hidden="true">
      <div className={styles.dots}>
        <i />
        <i />
        <i />
      </div>
      <pre>
        <span className={styles.prompt}>$</span> uvicorn app.main:app --reload{'\n'}
        <span className={styles.dim}>INFO: Uvicorn running on</span>
        {'\n'}
        <span className={styles.dim}> http://127.0.0.1:8000</span>
        {'\n'}
        <span className={styles.ok}>INFO: Application startup complete.</span>
        {'\n\n'}
        <span className={styles.prompt}>$</span> curl :8000/health{'\n'}
        {'{ '}
        <span className={styles.key}>"status"</span>: <span className={styles.ok}>"ok"</span>
        {' }'}
      </pre>
    </div>
  );
}

function ExtensionsTile() {
  return (
    <div className={`${styles.tile} ${styles.extensions}`} aria-hidden="true">
      <div className={styles.extBar}>
        <span>chrome://extensions</span>
        <span className={styles.toggleRow}>
          Developer mode <i className={styles.switch} />
        </span>
      </div>
      <span className={styles.loadBtn}>Load unpacked</span>
      <div className={styles.extCard}>
        <span className={styles.extIcon}>V</span>
        <span>
          <b>VERITAS</b>
          <small>News Credibility Analyzer · 0.3.0</small>
        </span>
        <i className={styles.switch} />
      </div>
    </div>
  );
}

function ArticleTile() {
  return (
    <div className={`${styles.tile} ${styles.article}`} aria-hidden="true">
      <p className={styles.artTitle}>Riverton raises transit fares</p>
      <p className={styles.artText}>
        The council <mark className={styles.warn}>quietly approved a shocking decision</mark> on fares.{' '}
        <mark className={styles.okMark}>A ride rises from $2.75 to $3.50</mark> in January, while{' '}
        <mark className={styles.risk}>ridership fell 40%</mark>…
      </p>
      <div className={styles.miniScore}>
        <ScoreRing value={SAMPLE_SCORES.trust} size={64} stroke={5} label="Trust Score" />
      </div>
    </div>
  );
}

const STEPS: Array<{ title: string; text: ReactNode; tile: ReactNode }> = [
  {
    title: 'Start the backend',
    text: (
      <>
        Clone the repo, add a Gemini API key to <code>backend/.env</code> and run the FastAPI server. <code>/health</code> should answer{' '}
        <code>"ok"</code>.
      </>
    ),
    tile: <TerminalTile />,
  },
  {
    title: 'Load the extension',
    text: (
      <>
        Open <code>chrome://extensions</code>, turn on Developer mode, click <em>Load unpacked</em> and pick the <code>extension/</code>{' '}
        folder.
      </>
    ),
    tile: <ExtensionsTile />,
  },
  {
    title: 'Analyze an article',
    text: <>Open any news story, click the Veritas icon and press analyze. Your Trust Score and highlights arrive in seconds.</>,
    tile: <ArticleTile />,
  },
];

export function Steps() {
  const { copied, copy } = useCopy();

  return (
    <section id="quick-start" className="section" aria-labelledby="steps-title">
      <div className="container">
        <SectionHead
          id="steps-title"
          eyebrow="Quick start"
          title="Get started in minutes"
          lead="Python 3.11+, a Chromium-based browser and a free Gemini API key are all you need."
        />

        <ol role="list" className={styles.steps}>
          {STEPS.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <Reveal delay={i * 110}>
                <span className={styles.num} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={styles.title}>
                  <span className="visually-hidden">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className={styles.text}>{step.text}</p>
                {step.tile}
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className={styles.copyRow}>
          <code className={styles.cmd}>{CLONE_COMMAND}</code>
          <button type="button" className="btn btn--sm" onClick={() => copy(SETUP)}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy setup commands'}
          </button>
          <span className="visually-hidden" role="status">
            {copied ? 'Setup commands copied to clipboard' : ''}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
