// 배포 전 클릭 스모크 테스트 — 빌드된 dist 를 GitHub Pages 처럼 서빙하고 실제 Chromium 으로 돌아다닌다.
// 페이지 에러나 console.error 가 하나라도 나면 실패 (exit 1).
//   pnpm run build && pnpm run load-html && pnpm run smoke
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const DIST = path.resolve(process.cwd(), 'dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.map': 'application/json' };

// GitHub Pages 규칙: /a/b → a/b(파일) → a/b.html → a/b/index.html → 404.html(404)
const resolveFile = (urlPath) => {
  const p = path.join(DIST, decodeURIComponent(urlPath));
  for (const c of [p, p + '.html', path.join(p, 'index.html')]) if (existsSync(c) && statSync(c).isFile()) return [c, 200];
  return [path.join(DIST, '404.html'), 404];
};
const server = createServer((req, res) => {
  const [file, status] = resolveFile(new URL(req.url, 'http://x').pathname);
  res.writeHead(status, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise(r => server.listen(0, r));
const origin = `http://localhost:${server.address().port}`;

const routes = [...readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map(m => m[1] || '/');

const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const page = await browser.newPage();
page.setDefaultTimeout(8000);
const failures = [];
let where = '';
page.on('pageerror', e => failures.push(`${where} — page error: ${e.message}`));
page.on('console', m => {
  // 서드파티 리소스(폰트·CDN) 로드 실패는 우리 코드 문제가 아니라 제외
  if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) failures.push(`${where} — console.error: ${m.text().slice(0, 200)}`);
});
const step = async (label, fn) => { where = label; try { await fn(); } catch (e) { failures.push(`${label} — ${e.message.split('\n')[0]}`); } };

// 1) 사이트맵의 모든 페이지 직접 진입
for (const r of routes) await step(`visit ${r}`, async () => { await page.goto(origin + r); await page.waitForTimeout(1500); });

// 2) 예제 사이를 오가기 (재방문 때 DI 가 깨지던 회귀 포함)
const example = id => page.locator(`app-swc-package-example-router-page .nav-item[data-id="${id}"]`).click();
await step('examples: commerce → stock → commerce → accommodation', async () => {
  await page.goto(origin + '/package/simple-web-component/examples'); await page.waitForTimeout(2500);
  for (const id of ['commerce-example', 'stock-example', 'commerce-example', 'accommodation-example']) { await example(id); await page.waitForTimeout(2000); }
  await page.goBack(); await page.waitForTimeout(1500);
});

// 3) 랜딩 데모 몇 개 눌러보기 + 언어 전환 + 헤더 이동
await step('landing demos', async () => {
  await page.goto(origin + '/'); await page.waitForTimeout(2000);
  await page.click('#click-btn');
  // 누수 테스트: 1,000개 붙였다 뗀 뒤 듣는 리스너·도는 타이머가 0 이어야 한다
  await page.click('#leak-btn');
  await page.waitForFunction(() => !document.querySelector('app-home-page').shadowRoot.querySelector('#leak-btn').disabled, null, { timeout: 20000 });
  const [mounted, answered, listening, ticking] = await page.locator('app-home-page .leak-stats .lv').allInnerTexts();
  if (mounted !== '1,000' || answered !== '1,000' || listening !== '0' || ticking !== '0') throw new Error(`leak test: ${mounted}/${answered}/${listening}/${ticking}`);
  await page.click('.pick[data-name="lemon"]');
  await page.fill('.echo-in', 'smoke');
  await page.click('#chip-add');
  await page.click('#buy-btn');                       // filter 가 막는 길
  await page.check('.agree-box'); await page.click('#buy-btn'); await page.waitForTimeout(1200); // 끝까지 가는 길
  await page.locator('app-header #lang-btn').click(); await page.locator('app-header .lang-opt[data-lang="ko"]').click();
  for (const p of ['/components', '/ssr', '/ecosystem']) { await page.locator(`app-header .links span[data-path="${p}"]`).click(); await page.waitForTimeout(1500); }
});

// 4) 페이지별 "눌러서 증명" 장치
await step('page proofs', async () => {
  await page.goto(origin + '/ssr'); await page.waitForTimeout(1500);
  await page.click('#src-btn'); await page.waitForTimeout(1000);
  const shadows = (await page.locator('app-server-page .proof-out .pv').allInnerTexts())[1];
  if (!(Number(shadows) > 0)) throw new Error(`view-source: no shadow roots in the served HTML (${shadows})`); // SSG 산출물에 DSD 가 있어야
  await page.goto(origin + '/components'); await page.waitForTimeout(1500);
  await page.fill('.deco-search', 'keydown window'); await page.waitForTimeout(200);
  // npm 레지스트리는 외부 네트워크라 결과는 검사하지 않고 에러만 본다
  await page.goto(origin + '/ecosystem'); await page.waitForTimeout(1500);
  await page.click('#npm-btn'); await page.waitForTimeout(3000);
});

await browser.close();
server.close();

if (failures.length) {
  console.error(`✖ smoke: ${failures.length} problem(s)\n  ` + failures.join('\n  '));
  process.exit(1);
}
console.log(`✔ smoke: ${routes.length} pages + examples + demos, no errors`);
