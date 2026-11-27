import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Highlights } from './components/Highlights';
import { HowItWorks } from './components/HowItWorks';
import { Scoring } from './components/Scoring';
import { Stack } from './components/Stack';
import { Steps } from './components/Steps';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Stack />
        <Features />
        <Steps />
        <HowItWorks />
        <Highlights />
        <Scoring />
      </main>
      <Footer />
    </>
  );
}
