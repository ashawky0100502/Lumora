import { motion } from 'framer-motion';

/**
 * A section-level reveal-on-scroll. Direction/distance/delay are tunable
 * per call-site, but duration + easing always come from the active theme,
 * so a Velvet page reveals with a slow, heavy drama and a Silk page
 * reveals quickly and lightly — without every section author having to
 * remember that.
 */
export default function Reveal({
  theme,
  children,
  as = 'div',
  y = 26,
  delay = 0,
  className = '',
  style,
  // Re-trigger every time the section crosses in/out of view — scrolling
  // back up should feel just as alive as scrolling down the first time.
  once = false,
  amount = 0.25,
}) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: y * -0.6 }}
      viewport={{ once, amount }}
      transition={{ duration: theme.duration, delay, ease: theme.ease }}
    >
      {children}
    </Comp>
  );
}
