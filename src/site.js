// Storage is shared by origin, including / and /dev/. Keep preview work separate.
export function siteSettings(href, base = './') {
  const root = new URL(base, href);
  const development = root.pathname.endsWith('/dev/');
  return {
    root,
    development,
    storageKey: development ? `cell-lab:development:${root.pathname}` : 'cell-lab',
    cachePrefix: `science-labs:${root.pathname}:`,
  };
}
export const site = typeof location === 'undefined' ? null : siteSettings(location.href, import.meta.env.BASE_URL);
