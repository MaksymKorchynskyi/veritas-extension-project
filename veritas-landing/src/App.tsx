import './index.css';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Problem } from './components/Problem';
import { Demo } from './components/Demo';
import { Pipeline } from './components/Pipeline';
import { Features } from './components/Features';
import { Calculator } from './components/Calculator';
import { QuickStart, Final } from './components/Finale';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Problem />
        <Demo />
        <Pipeline />
        <Features />
        <Calculator />

        <QuickStart />
        <Final />
      </main>
    </>
  );
}
