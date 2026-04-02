// SSG: 빌드된 dist/index.html 을 템플릿으로, 같은 앱을 Node(dom-parser)에서 부팅해 페이지별 HTML 을 굽는다.
// shadow root 는 Declarative Shadow DOM 으로 직렬화되고, 각 페이지의 인라인 메타 스택(@innerHtml/@attribute)이 <head> 를 채운다.
import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { defineSwcAppAll, SwcAppInterface } from '@dooboostore/simple-web-component';
import { DomParser } from '@dooboostore/dom-parser';
import { serviceFactories } from '@/services';
import { pageFactories } from '@/pages';
import { componentFactories } from '@/components';
import defineShowcaseAppBody from '@/ShowcaseAppBody';
import { ALL_PACKAGES, SITE_URL } from '@/data/packages';

const DIST = path.resolve(process.cwd(), 'dist');

// ponytail: examples 하위(/package/simple-web-component/examples...)는 굽지 않는다.
// package/simple-web-component.html 과 같은 이름의 디렉터리가 생기면 GitHub Pages 가 디렉터리로 리다이렉트할 수 있어서. 404.html 폴백으로 동작.
const ROUTES = ['/', '/start', '/components', '/ssr', '/ecosystem', ...ALL_PACKAGES.map(p => `/package/${p.id}`)];

const GLOBALS = ['Event', 'CustomEvent', 'Node', 'NodeFilter', 'Element', 'HTMLElement', 'HTMLMetaElement', 'Document', 'DocumentFragment', 'FormData', 'HTMLCanvasElement'];

async function renderPage(route: string, template: string): Promise<string> {
  const parser = new DomParser(template, { href: `${SITE_URL}${route}` });
  const w = parser.window as any;
  (globalThis as any).window = w;
  (globalThis as any).document = w.document;
  for (const k of GLOBALS) if (w[k]) (globalThis as any)[k] = w[k];
  (globalThis as any).PopStateEvent = w.Event;
  (globalThis as any).requestAnimationFrame = w.requestAnimationFrame = (cb: FrameRequestCallback) => {
    const t = setTimeout(() => cb(Date.now()), 16);
    t.unref?.();
    return t as any;
  };

  const container = Symbol('container');
  serviceFactories.forEach(s => s(container));
  await defineSwcAppAll(w);
  await defineShowcaseAppBody(w);

  const app = w.document.querySelector('#app') as SwcAppInterface;
  await new Promise<void>(resolve => {
    const timer = setTimeout(() => { console.warn(`[load-html] connect timeout ${route}`); resolve(); }, 5000);
    let done = 0;
    const tick = () => { if (++done === 2) { clearTimeout(timer); resolve(); } };
    app.connect({
      path: route,
      routeType: 'path',
      container,
      window: w,
      onStartedLazyDefineComponent: [...pageFactories, ...componentFactories],
      onChildrenConnectedDone: tick,
      onChildrenRouteChanged: tick,
    } as any);
  });

  // README 같은 비동기 fallback(.loading-container)이 실제 내용으로 바뀔 때까지 기다린다
  for (let i = 0; i < 100 && w.document.querySelector('.loading-container'); i++) await new Promise(r => setTimeout(r, 100));
  if (w.document.querySelector('.loading-container')) console.warn(`[load-html] still loading ${route}`);

  const html = '<!DOCTYPE html>\n' + w.document.documentElement.outerHTML;
  parser.destroy();
  return html;
}

const outFile = (route: string) => path.join(DIST, route === '/' ? 'index.html' : `${route.slice(1)}.html`);

async function main() {
  const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');
  for (const route of ROUTES) {
    const html = await renderPage(route, template);
    const file = outFile(route);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html, 'utf-8');
    console.log(`[load-html] ${route} -> ${path.relative(DIST, file)} (${html.length} bytes)`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map(r => `  <url><loc>${SITE_URL}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log('[load-html] sitemap.xml, robots.txt written');
  process.exit(0);
}

main().catch(e => {
  console.error('[load-html] error:', e);
  process.exit(1);
});
