import { Analytics } from '@vercel/analytics/react';
import Starfield from './components/Starfield.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import TrustBadge from './components/TrustBadge.jsx';
import Hero from './components/Hero.jsx';
import Register from './components/Register.jsx';
import Sponsors from './components/Sponsors.jsx';
import Faq from './components/Faq.jsx';
import Location from './components/Location';
import Footer from './components/Footer.jsx';

export default function App() {
  const pathname = window.location.pathname.replace(/\/$/, '');

  // Registration is closed: /apply and /thank-you are redirected home in
  // vercel.json; this covers local dev and any host without those redirects.
  if (pathname === '/apply' || pathname === '/thank-you') {
    window.location.replace('/');
    return null;
  }

  return (
    <>
      <Starfield />
      <div className="site-glow" aria-hidden="true" />
      <ThemeToggle />
      <TrustBadge />
      <Hero />
      <Register />
      <Sponsors />
      <Faq />
      <Location />
      <Footer />
      <Analytics />
    </>
  );
}
