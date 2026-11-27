import { Braces, FileCode2, Puzzle, Search, Sparkles, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal } from './ui';
import styles from './Stack.module.css';

const STACK: Array<{ name: string; role: string; Icon: LucideIcon }> = [
  { name: 'FastAPI', role: 'async backend', Icon: Zap },
  { name: 'Gemini', role: 'LLM agents', Icon: Sparkles },
  { name: 'DuckDuckGo', role: 'cross-verification', Icon: Search },
  { name: 'Pydantic v2', role: 'typed LLM output', Icon: Braces },
  { name: 'Readability.js', role: 'article parsing', Icon: FileCode2 },
  { name: 'Chrome MV3', role: 'extension', Icon: Puzzle },
];

export function Stack() {
  return (
    <section className={styles.stack} aria-labelledby="stack-title">
      <div className="container">
        <Reveal className={styles.head}>
          <p className={styles.kicker}>MIT licensed · every line on GitHub</p>
          <h2 id="stack-title" className={styles.title}>
            Built on open tools you can inspect.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <ul role="list" className={styles.list}>
            {STACK.map(({ name, role, Icon }) => (
              <li key={name}>
                <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                <span>
                  <b>{name}</b>
                  <small>{role}</small>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
