import { motion } from 'framer-motion';

export default function CurtainLayer({
  side = 'left',
  image,
  color = 'rgba(5, 8, 15, 0.95)',
  width = '26%',
  className = '',
  style = {},
  motionProps = {},
}) {
  const curtainStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    [side === 'left' ? 'left' : 'right']: 0,
    width,
    zIndex: 4,
    background: image ? `url(${image}) center/cover no-repeat` : color,
    transform: side === 'left' ? 'translateX(-4%)' : 'translateX(4%)',
    ...style,
  };

  return (
    <motion.div className={`lumora-curtain-layer ${className}`.trim()} style={curtainStyle} {...motionProps} />
  );
}
