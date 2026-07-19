export function mergeSceneConfig(scene = {}, theme = {}, animations = {}) {
  return {
    scene: {
      height: scene.height || '100vh',
      width: scene.width || '100%',
      ...scene,
    },
    theme: {
      background: {
        color: '#05070b',
        ...theme.background,
      },
      text: {
        primary: '#f8f4eb',
        secondary: '#ded0aa',
        ...theme.text,
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        ...theme.typography,
      },
      ...theme,
    },
    animations: {
      scene: {},
      layers: {},
      ...animations,
    },
  };
}

export const sceneConfigTemplate = {
  scene: {
    height: '100vh',
    width: '100%',
  },
  theme: {
    background: { color: '#05070b' },
    text: { primary: '#f8f4eb', secondary: '#ded0aa' },
    typography: { fontFamily: 'Inter, system-ui, sans-serif' },
  },
  animations: {
    scene: {},
    layers: {},
  },
};

export const themeConfigTemplate = {
  background: { color: '#05070b' },
  text: { primary: '#f8f4eb', secondary: '#ded0aa' },
  typography: { fontFamily: 'Inter, system-ui, sans-serif' },
};

export const animationConfigTemplate = {
  scene: {},
  layers: {},
};
