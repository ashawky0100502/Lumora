export function debugAuroraRender(sectionName, details = {}) {
  if (typeof window !== 'undefined') {
    console.info(`[Aurora render] ${sectionName}`, details);
  }
}
