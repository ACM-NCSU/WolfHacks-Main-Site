import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import siteConfig from '../data/siteConfig.js';
import WolfMark from './WolfMark.jsx';
import Countdown from './Countdown.jsx';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function Hero() {
  const { event } = siteConfig;
  const prefersReducedMotion = useReducedMotion();
  const sceneRef = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springConfig = { stiffness: 120, damping: 18, mass: 0.6 };
  const wolfX = useSpring(useTransform(mx, (v) => v * -8), springConfig);
  const wolfY = useSpring(useTransform(my, (v) => v * -6), springConfig);
  const moonX = useSpring(useTransform(mx, (v) => v * 12), springConfig);
  const moonY = useSpring(useTransform(my, (v) => v * 8), springConfig);

  function handleMouseMove(e) {
    if (prefersReducedMotion || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <section className="hero" id="apply">
      <div className="hero__grid">
        <motion.div
          className="hero__badges"
          variants={container}
          initial={prefersReducedMotion ? 'show' : 'hidden'}
          animate="show"
        >
          <motion.img
            variants={item}
            className="hero__acm-badge"
            src={`${import.meta.env.BASE_URL}images/acm-ncsu-logo.png`}
            alt="ACM NCSU Chapter logo"
          />

          <motion.div variants={item} className="hero__logo-placeholder" role="img" aria-label="WolfHacks logo placeholder">
            <span>
              YOUR
              <br />
              WOLFHACKS
              <br />
              LOGO HERE
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__content"
          variants={container}
          initial={prefersReducedMotion ? 'show' : 'hidden'}
          animate="show"
        >
          <motion.p variants={item} className="eyebrow">
            <span className="acm-mention">{event.acm.name.toUpperCase()}</span> PRESENTS
          </motion.p>

          <motion.h1 variants={item} className="hero__wordmark">
            {event.name.toUpperCase()}
          </motion.h1>

          <motion.p variants={item} className="hero__tagline">
            {event.hero.headline}
          </motion.p>

          <motion.p variants={item} className="hero__sub">
            {event.hero.subhead}
          </motion.p>

          <motion.p variants={item} className="hero__meta">
            <span>{event.date}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{event.location}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{event.coordinates}</span>
          </motion.p>

          <motion.div variants={item}>
            <Countdown target={event.countdownTarget} />
          </motion.div>

          <motion.p variants={item} className="hero__register-note">
            {event.hero.registerNote}
          </motion.p>

          <motion.div variants={item} className="hero__actions">
            <motion.a
              className="btn btn--primary"
              href={event.hero.preRegisterUrl}
              whileHover={prefersReducedMotion ? undefined : { y: -2, boxShadow: '0 6px 18px rgba(200, 16, 46, 0.45)' }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              Pre-register
            </motion.a>
          </motion.div>
        </motion.div>

        <div
          className="hero__scene"
          ref={sceneRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          aria-hidden="true"
        >
          <motion.div className="hero__moon" style={{ x: moonX, y: moonY }} />
          <div className="hero__aura" />
          <motion.div className="hero__wolf-wrap" style={{ x: wolfX, y: wolfY }}>
            <WolfMark className="hero__wolf" />
          </motion.div>
          <svg className="hero__horizon" viewBox="0 0 420 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40 C 80 20, 140 55, 220 30 S 380 10, 420 35 L 420 60 L 0 60 Z" fill="#0F1216" />
          </svg>
        </div>
      </div>
    </section>
  );
}
