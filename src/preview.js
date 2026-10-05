import {site} from './site.js';
if (site.development) {
  const banner = document.createElement('aside');
  banner.setAttribute('aria-label', 'Development preview');
  banner.style.cssText = 'padding:10px 24px;background:#fff0c7;color:#594512;font:600 14px/1.5 system-ui;text-align:center';
  banner.append('Development preview — for testing. Saved work is separate from the live site. ');
  const link = document.createElement('a');
  link.href = new URL('../', site.root).href;
  link.textContent = 'Open live site';
  link.style.color = 'inherit';
  banner.append(link);
  document.body.insertBefore(banner, document.body.firstChild);
  const meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex';
  document.head.append(meta);
}
