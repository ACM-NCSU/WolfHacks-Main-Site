import { motion, useReducedMotion } from 'framer-motion';
import siteConfig from '../data/siteConfig.js';

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

export default function Sponsors() {
  const { event } = siteConfig;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="section sponsors" id="sponsors">
      <div className="container">
        <motion.div
          variants={container}
          initial={prefersReducedMotion ? 'show' : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '0px 0px -10% 0px', amount: 0.3 }}
        >
          <motion.p variants={item} className="eyebrow">
            SPONSORS
          </motion.p>

          <motion.h2 variants={item} className="section__heading">
            Our Sponsors
          </motion.h2>

          <motion.p variants={item} className="section__lede">
            We're grateful our sponsors for supporting {event.name}. If you are interested in sponsoring {event.name}, please reach out to acmchapter-org@ncsu.edu.
          </motion.p>

          <motion.div variants={item} className="sponsors__grid">
            {event.sponsors.map((sponsor) => (
              <motion.a
                key={sponsor.name}
                className="sponsor"
                href={sponsor.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${sponsor.name} website`}
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : { y: -4, scale: 1.02 }
                }
                whileTap={
                  prefersReducedMotion
                    ? undefined
                    : { scale: 0.98 }
                }
                transition={{ duration: 0.15 }}
              >
                <img
                  className="sponsor__logo"
                  src={`${import.meta.env.BASE_URL}${sponsor.logoUrl}`}
                  alt={sponsor.name}
                />
                <span className="sponsor__name">{sponsor.name}</span>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}