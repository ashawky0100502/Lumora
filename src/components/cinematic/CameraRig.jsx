import { motion } from 'framer-motion';

export default function CameraRig({
  children,
  offset = { x: 0, y: 0, scale: 1 },
  className = '',
  style = {},
  motionProps = {},
}) {
  const cameraStyle = {
    position: 'absolute',
    inset: 0,
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.scale})`,
    transformOrigin: 'center center',
    ...style,
  };

  return (
    <motion.div className={`lumora-camera-rig ${className}`.trim()} style={cameraStyle} {...motionProps}>
      {children}
    </motion.div>
  );
}
