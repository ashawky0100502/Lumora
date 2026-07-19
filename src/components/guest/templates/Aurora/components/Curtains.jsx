import { motion } from 'framer-motion';

export default function Curtains({ leftImage, rightImage }) {
  return (
    <>
      <motion.div
        className="aurora-curtain aurora-curtain--left"
        initial={{ x: '-8%', opacity: 0.8 }}
        animate={{ x: [-2, 0, -2], rotate: [-0.08, 0.02, -0.08], opacity: 1 }}
        transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        <img src={leftImage} alt="" loading="lazy" decoding="async" />
      </motion.div>
      <motion.div
        className="aurora-curtain aurora-curtain--right"
        initial={{ x: '8%', opacity: 0.8 }}
        animate={{ x: [2, 0, 2], rotate: [0.08, -0.02, 0.08], opacity: 1 }}
        transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        <img src={rightImage} alt="" loading="lazy" decoding="async" />
      </motion.div>
    </>
  );
}
