import { motion } from 'framer-motion';
import { mergeSceneConfig } from './config';

export default function SceneContainer({
  scene = {},
  theme = {},
  animations = {},
  children,
  className = '',
  style = {},
}) {
  const config = mergeSceneConfig(scene, theme, animations);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    minHeight: config.scene.height || '100vh',
    overflow: 'hidden',
    background: config.theme.background?.color || '#05070b',
    color: config.theme.text?.primary || '#f8f4eb',
    fontFamily: config.theme.typography?.fontFamily || 'Inter, system-ui, sans-serif',
    ...style,
  };

  return (
    <motion.section
      className={`lumora-scene ${className}`.trim()}
      style={containerStyle}
      initial={config.animations.scene?.initial || { opacity: 0, y: 24 }}
      animate={config.animations.scene?.animate || { opacity: 1, y: 0 }}
      transition={config.animations.scene?.transition || { duration: 0.8, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}
