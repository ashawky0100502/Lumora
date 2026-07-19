export function resolveGuestTemplate(data = {}) {
  const candidate = [
    data?.template,
    data?.templateConfig?.template,
    data?.builder?.template,
    data?.builder?.templateConfig?.template,
    data?.templateId,
    data?.data?.template,
    data?.data?.templateConfig?.template,
  ].find((value) => typeof value === 'string' && value.trim());

  return candidate || 'shared';
}
