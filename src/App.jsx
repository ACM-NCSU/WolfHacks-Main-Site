import { Analytics } from '@vercel/analytics/react';
import Starfield from './components/Starfield.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import TrustBadge from './components/TrustBadge.jsx';
import Hero from './components/Hero.jsx';
import Register from './components/Register.jsx';
import Faq from './components/Faq.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <Starfield />
      <div className="site-glow" aria-hidden="true" />
      <ThemeToggle />
      <TrustBadge />
      <Hero />
      <Register />
      <Faq />
      <Footer />
      <Analytics />
    </>
  );
}
