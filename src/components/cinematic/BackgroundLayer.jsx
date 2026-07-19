import { motion } from 'framer-motion';

export default function BackgroundLayer({
  image,
  color = '#06070a',
  gradient,
  children,
  className = '',
  style = {},
  motionProps = {},
}) {
  const backgroundStyle = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    background: gradient || color,
    backgroundImage: image ? `url(${image})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    ...style,
  };

  return (
    <motion.div className={`lumora-background-layer ${className}`.trim()} style={backgroundStyle} {...motionProps}>
      {children}
    </motion.div>
  );
}
