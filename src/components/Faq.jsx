import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import siteConfig from '../data/siteConfig.js';

function FaqItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="faq__item"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px', amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
    >
      <button className="faq__summary" onClick={() => setIsOpen((v) => !v)} aria-expanded={isOpen}>
        {question}
        <motion.span
          className="faq__toggle"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq__answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Faq() {
  const { faq } = siteConfig.event;

  return (
    <section className="section faq" id="faq">
      <div className="container">
        <p className="eyebrow">{faq.eyebrow}</p>
        <h2 className="section__heading">{faq.heading}</h2>

        <div className="faq__list">
          {faq.items.map((item, index) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
