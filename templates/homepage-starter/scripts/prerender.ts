// 빌드 뒤 실행: vite 가 만든 dist/index.html 을 틀로, 같은 앱을 Node(dom-parser)에서 띄워 페이지별 HTML 을 굽는다.
// → 검색엔진이 자바스크립트 없이도 내용을 읽는다. sitemap.xml / robots.txt 도 같이 만든다.
import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { DomParser } from '@dooboostore/dom-parser';
import { defineSwcAppAll } from '@dooboostore/simple-web-component';
import { factories, ROUTES } from '../src/app';

const DIST = path.resolve('dist');
const SITE_URL = (process.env.SITE_URL ?? 'https://example.com').replace(/\/$/, '');
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
// 없는 주소는 GitHub Pages 가 404.html 을 준다 → 앱이 떠서 404 페이지를 그린다
fs.writeFileSync(path.join(DIST, '404.html'), template);

const GLOBALS = ['Event', 'CustomEvent', 'Node', 'NodeFilter', 'Element', 'HTMLElement', 'HTMLMetaElement', 'Document', 'DocumentFragment', 'FormData'];

async function render(route: string): Promise<string> {
  const parser = new DomParser(template, { href: SITE_URL + route });
  const w = parser.window as any;
  const g = globalThis as any;
  g.window = w;
  g.document = w.document;
  for (const k of GLOBALS) if (w[k]) g[k] = w[k];
  g.PopStateEvent = w.Event;
  g.requestAnimationFrame = w.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16);

  await defineSwcAppAll(w);
  const app = w.document.querySelector('#app');
  await new Promise<void>(resolve => {
    const timer = setTimeout(resolve, 5000);
    let n = 0;
    const done = () => { if (++n === 2) { clearTimeout(timer); resolve(); } };
    app.connect({ window: w, container: Symbol('site'), path: route, routeType: 'path', onStartedLazyDefineComponent: factories,
      onChildrenConnectedDone: done, onChildrenRouteChanged: done });
  });
  const html = '<!DOCTYPE html>\n' + w.document.documentElement.outerHTML;
  parser.destroy();
  return html;
}

for (const route of ROUTES) {
  const file = path.join(DIST, route === '/' ? 'index.html' : `${route.slice(1)}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, await render(route));
  console.log(`prerendered ${route} → ${path.relative(DIST, file)}`);
}
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(r => `  <url><loc>${SITE_URL}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('sitemap.xml, robots.txt written');
process.exit(0);
