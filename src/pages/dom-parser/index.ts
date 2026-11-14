import { Router } from '@dooboostore/core-web';
import { attribute, elementDefine, innerHtml, matchedElement, onConnectedBefore, onConnectedBodyShadow, onInitialize, eventClickDelegate } from '@dooboostore/simple-web-component';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { DOM_PARSER_META, SITE_URL, GITHUB_URL } from '@/data/packages';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('bash', bash);
const hl = (lang: string, code: string) => hljs.highlight(code.trim(), { language: lang }).value;
const t = (en: string, ko: string) => `<span lang="en">${en}</span><span lang="ko">${ko}</span>`;

const BENCH_URL = `${GITHUB_URL}/blob/main/@dooboostore/dom-parser/bench/RESULTS.md`;
const NPM_URL = 'https://www.npmjs.com/package/@dooboostore/dom-parser';

// 예제는 @dooboostore/dom-parser 1.0.30 으로 실제로 돌려 본 코드 (출력 주석 포함)
const QUICK_PARSE = `
import { parseHTML } from '@dooboostore/dom-parser';

const window = parseHTML('<ul><li class="item">a</li><li class="item">b</li></ul>');
const { document } = window;

document.querySelectorAll('li.item').length;   // 2
document.querySelector('ul').innerHTML = '<li>c</li>';`;

const QUICK_COMPONENT = `
// a real custom element, rendered on the server
window.customElements.define('hello-card', class extends window.HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open', serializable: true });
    root.innerHTML = \`<p>Hello, \${this.getAttribute('name')}!</p>\`;
  }
});

document.body.innerHTML = '<hello-card name="World"></hello-card>';
document.body.getHTML({ serializableShadowRoots: true });
// <hello-card name="World"><template shadowrootmode="open" shadowrootserializable="">
//   <p>Hello, World!</p></template></hello-card>`;

// 수치: packages/@dooboostore/dom-parser/bench/RESULTS.md (2026-11-11, dom-parser 1.0.29, Node 24). 다시 재면 같이 갱신할 것.
// 지는 칸도 그대로 싣는다 — 굵게 = 그 줄 1등.
const LIBS = ['dom-parser', 'jsdom', 'happy-dom', 'linkedom', 'cheerio'];
type BenchRow = { label: [string, string]; values: number[]; lower?: boolean; unit?: string };
const THROUGHPUT: BenchRow[] = [
  { label: ['Parse a 1 KB page', '1 KB 페이지 파싱'], values: [11143, 376, 988, 9835, 21762] },
  { label: ['Parse a 147 KB page', '147 KB 페이지 파싱'], values: [60.9, 13.4, 16.0, 67.6, 191] },
  { label: ['Parse a 3 MB page', '3 MB 페이지 파싱'], values: [2.62, 0.63, 0.67, 1.53, 2.03] },
  { label: ['<code>querySelectorAll(\'section\')</code>', '<code>querySelectorAll(\'section\')</code>'], values: [2196, 1398, 1075, 3179, 1377] },
  { label: ['<code>querySelectorAll(\'.item\')</code>', '<code>querySelectorAll(\'.item\')</code>'], values: [2007, 1067, 264, 993, 937] },
  { label: ['<code>section.s3 &gt; ul li.item</code>', '<code>section.s3 &gt; ul li.item</code>'], values: [989, 513, 917, 1390, 1114] },
  { label: ['<code>#sec-120 .cell</code>', '<code>#sec-120 .cell</code>'], values: [1835, 865, 878, 1258, 1158] },
  { label: ['<code>a[href^="/p/1"]</code>', '<code>a[href^="/p/1"]</code>'], values: [2059, 260, 1190, 3110, 1468] },
  { label: ['<code>tr &gt; td:nth-child(2)</code>', '<code>tr &gt; td:nth-child(2)</code>'], values: [1230, 219, 1008, 2298, 1360] },
  { label: ['Create + append 2,000 nodes', '노드 2,000개 생성 + 추가'], values: [639, 45.3, 29.8, 181, 208] },
  { label: ['<code>innerHTML</code> set (1,000 <code>&lt;li&gt;</code>)', '<code>innerHTML</code> 대입 (<code>&lt;li&gt;</code> 1,000개)'], values: [743, 66.5, 181, 10.7, 1707] },
  { label: ['Serialize <code>outerHTML</code> (147 KB)', '<code>outerHTML</code> 직렬화 (147 KB)'], values: [305, 512, 464, 428, 940] },
];
const FOOTPRINT: BenchRow[] = [
  { label: ['Import + first parse', 'import + 첫 파싱'], values: [48.2, 227, 127, 43.3, 78.0], lower: true, unit: 'ms' },
  { label: ['Memory per parsed ~100 KB document', '~100 KB 문서 하나당 메모리'], values: [5026, 21947, 48979, 6963, 5719], lower: true, unit: 'KB' },
  { label: ['Install size (package only)', '설치 크기 (패키지만)'], values: [6.3, 3.2, 8.7, 0.9, 1.0], lower: true, unit: 'MB' },
];
const STATS: Array<[string, string, string]> = [
  ['14x', 'faster DOM mutation than jsdom', 'jsdom보다 빠른 DOM 변경'],
  ['¼', 'the memory of jsdom per document', '문서 하나당 jsdom 대비 메모리'],
  ['48 ms', 'import + first parse (jsdom: 227 ms)', 'import + 첫 파싱 (jsdom: 227 ms)'],
  ['0', 'third-party dependencies', '서드파티 의존성'],
];

// README "Browser parity" + 1.0.30 — 전부 Chromium 에서 잰 결과를 기대값으로 둔 테스트가 있는 항목만 (dom-parser/test/src/dom/*.test.ts)
const PARITY: Array<[string, string, string]> = [
  ['Custom elements', '<code>customElements.define()</code>, customized built-ins (<code>is=""</code>), upgrade of already-parsed elements', '<code>customElements.define()</code>, 확장 내장 요소(<code>is=""</code>), 이미 파싱된 요소의 업그레이드'],
  ['Declarative Shadow DOM', '<code>getHTML()</code> / <code>setHTMLUnsafe()</code> round-trip shadow roots — what SSR ships', '<code>getHTML()</code> / <code>setHTMLUnsafe()</code>로 섀도우 루트 왕복 — SSR이 보내는 그것'],
  ['Selectors', '<code>:has()</code>, <code>:is()</code> / <code>:where()</code> / <code>:not()</code>, <code>:nth-child(an+b of S)</code>, <code>:scope</code>, every attribute operator incl. the empty-value rules; malformed selectors throw <code>SyntaxError</code>', '<code>:has()</code>, <code>:is()</code> / <code>:where()</code> / <code>:not()</code>, <code>:nth-child(an+b of S)</code>, <code>:scope</code>, 빈 값 규칙까지 모든 속성 연산자; 잘못된 선택자는 <code>SyntaxError</code>'],
  ['MutationObserver', 'Real records: childList, attributes, characterData, subtree, transient observers', '진짜 레코드: childList, attributes, characterData, subtree, transient observer'],
  ['Forms', '<code>form.elements</code> with spec form-owner association, input value sanitization and constraint validation', '스펙대로의 form-owner 연결을 갖춘 <code>form.elements</code>, input 값 정리와 제약 검증'],
  ['Serialization', 'SVG / MathML case kept, attribute escaping, <code>null</code> clears <code>innerHTML</code> like browsers', 'SVG / MathML 대소문자 유지, 속성 이스케이프, <code>null</code>이면 브라우저처럼 <code>innerHTML</code> 비움'],
];

const USES: Array<{ icon: string; title: [string, string]; text: [string, string]; path?: string }> = [
  { icon: 'fa-bolt', title: ['Server-side rendering', '서버 사이드 렌더링'], text: ['Boot the same Web Components on the server and ship Declarative Shadow DOM. This is what powers our SSR.', '같은 웹 컴포넌트를 서버에서 부팅하고 Declarative Shadow DOM으로 보냅니다. 우리 SSR이 이걸로 돕니다.'], path: '/ssr' },
  { icon: 'fa-file-code', title: ['Pre-rendering', '사전 렌더링'], text: ['Render every route to static HTML at build time — the homepage starter does exactly this.', '빌드할 때 라우트마다 정적 HTML로 — 홈페이지 스타터가 정확히 이렇게 합니다.'], path: '/start' },
  { icon: 'fa-magnifying-glass', title: ['Scraping & extraction', '스크래핑 · 추출'], text: ['Standard <code>querySelectorAll</code> over fetched HTML, without a browser.', '받아 온 HTML에 표준 <code>querySelectorAll</code>, 브라우저 없이.'] },
  { icon: 'fa-envelope', title: ['Email & HTML templates', '이메일 · HTML 템플릿'], text: ['Build and rewrite HTML with the DOM API instead of string concatenation.', '문자열 이어 붙이기 대신 DOM API로 HTML을 만들고 고칩니다.'] },
  { icon: 'fa-vial', title: ['Tests', '테스트'], text: ['A fast, small DOM for unit tests that don\'t need a real browser.', '진짜 브라우저까지는 필요 없는 단위 테스트용, 빠르고 작은 DOM.'] },
];

const FROM_JSDOM: Array<[string, string]> = [
  ['new JSDOM(html).window', 'parseHTML(html)'],
  ['new JSDOM(html, { url })', 'new DomParser(html, { href: url })'],
  ['dom.window.document', 'parser.document'],
  ['dom.window.close()', 'parser.destroy()'],
];

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: n < 10 ? 2 : n < 100 ? 1 : 0 });
const benchRows = (rows: BenchRow[]) =>
  rows
    .map(r => {
      const best = r.lower ? Math.min(...r.values) : Math.max(...r.values);
      return `<tr><td class="row">${t(r.label[0], r.label[1])}</td>${r.values
        .map((v, i) => `<td class="${i === 0 ? 'dp ' : ''}${v === best ? 'best' : ''}">${fmt(v)}${r.unit ? ` <small>${r.unit}</small>` : ''}</td>`)
        .join('')}</tr>`;
    })
    .join('');

export default (w: Window) => {
  const tagName = 'app-dom-parser-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class DomParserPage extends w.HTMLElement {
    private router?: Router;

    @onInitialize
    onInit(router: Router) {
      this.router = router;
    }

    @onConnectedBefore
    @innerHtml((c, helper) => helper.$w.document.querySelector('title'), { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:title"]'), 'content', { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:url"]'), 'content', { valueKey: 'url' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:title"]'), 'content', { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('link[rel="canonical"]'), 'href', { valueKey: 'url' })
    setPageMeta() {
      return { title: DOM_PARSER_META.title, description: DOM_PARSER_META.description, url: SITE_URL + DOM_PARSER_META.path };
    }

    @onConnectedBodyShadow
    render() {
      return `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
      <style>
        ${GlobalStyle}
        :host { display: block; background: #080808; min-height: 100vh; color: #A0A0A0; font-family: 'Pretendard', sans-serif; overflow-x: hidden; }
        * { box-sizing: border-box; }
        b { color: #FFF; font-weight: 700; }
        code { background: rgba(255, 56, 92, 0.1); color: #FF6B86; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
        .hero { padding: 64px 40px 10px; max-width: 1000px; margin: 0 auto; }
        .kicker { font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #FF385C; margin-bottom: 14px; }
        .hero h1 { font-size: 44px; font-weight: 850; letter-spacing: -1.6px; margin: 0 0 16px; color: #FFF; line-height: 1.1; }
        .hero p { font-size: 17px; color: #888; margin: 0 0 24px; line-height: 1.65; max-width: 760px; }
        .wrap { max-width: 1000px; margin: 0 auto; padding: 10px 40px 60px; }
        .actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .install { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #FFF; background: #0D1117; border: 1px solid #262626; border-radius: 12px; padding: 12px 16px; }
        .install span { color: #FF385C; }
        .btn { padding: 12px 18px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; border: 1px solid #2A2A2A; background: #141414; color: #DDD;
          display: inline-flex; align-items: center; gap: 8px; transition: 0.15s; text-decoration: none; }
        .btn:hover { border-color: #FF385C; color: #FFF; }
        .btn.primary { background: #FF385C; border-color: #FF385C; color: #FFF; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 36px 0 0; }
        .stat { padding: 20px; border-radius: 16px; background: #0E0E0E; border: 1px solid #1F1F1F; }
        .stat .v { font-size: 30px; font-weight: 850; color: #FFF; letter-spacing: -1px; }
        .stat .l { font-size: 13px; color: #888; line-height: 1.5; margin-top: 6px; }
        .section-title { margin: 64px 0 22px; }
        .section-title h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: #FF385C; margin: 0 0 10px; }
        .section-title p { color: #FFF; font-size: 30px; font-weight: 850; letter-spacing: -1px; margin: 0; line-height: 1.2; }
        .files { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .files > * { min-width: 0; }
        .file { border: 1px solid #262626; border-radius: 14px; background: #0D1117; overflow: hidden; }
        .file-head { padding: 9px 14px; background: #121212; border-bottom: 1px solid #222; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #FFF; font-weight: 700; }
        pre { margin: 0; padding: 16px 18px; overflow-x: auto; }
        pre code { background: transparent; color: #C9D1D9; padding: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; line-height: 1.65; }
        .table { overflow-x: auto; border: 1px solid #1F1F1F; border-radius: 16px; margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; min-width: 680px; }
        th, td { padding: 12px 14px; text-align: right; border-bottom: 1px solid #1A1A1A; font-size: 14px; white-space: nowrap; }
        th { color: #FF385C; font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; background: #0E0E0E; }
        th:first-child, td.row { text-align: left; }
        td.row { color: #DDD; font-weight: 600; white-space: normal; }
        td { color: #888; font-variant-numeric: tabular-nums; }
        td small { color: #555; }
        td.best { color: #FFF; font-weight: 800; }
        th.dp, td.dp { background: rgba(255, 56, 92, 0.06); }
        .note { margin: 8px 0 0; font-size: 13px; color: #666; line-height: 1.7; }
        .note a, .lead a { color: #FF6B86; }
        .lead { color: #999; font-size: 15px; line-height: 1.7; margin: -8px 0 18px; }
        .parity { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .parity > div, .use { padding: 20px 22px; border-radius: 16px; background: #0E0E0E; border: 1px solid #1F1F1F; }
        .parity h3, .use h3 { margin: 0 0 8px; color: #FFF; font-size: 16px; font-weight: 800; }
        .parity p, .use p { margin: 0; color: #999; font-size: 14px; line-height: 1.65; }
        .uses { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .use i { color: #FF385C; font-size: 18px; margin-bottom: 12px; display: block; }
        .use[data-path] { cursor: pointer; transition: 0.15s; }
        .use[data-path]:hover { border-color: #FF385C; }
        .use .go { margin-top: 12px; color: #FF385C; font-weight: 800; font-size: 12px; }
        .map td { text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #C9D1D9; white-space: normal; }
        .map th { text-align: left; }
        @media (max-width: 900px) {
          .stats { grid-template-columns: repeat(2, 1fr); }
          .uses { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .hero { padding: 40px 22px 0; }
          .hero h1 { font-size: 32px; letter-spacing: -1px; }
          .wrap { padding: 10px 22px 40px; }
          .files, .parity, .uses { grid-template-columns: 1fr; }
          .section-title p { font-size: 24px; }
          pre code { font-size: 12px; }
          .install { width: 100%; overflow-x: auto; white-space: nowrap; }
        }
      </style>

      <div class="hero">
        <div class="kicker">@dooboostore/dom-parser</div>
        <h1>${t('A DOM for Node — real Web Components included.', 'Node에서 쓰는 DOM — 진짜 웹 컴포넌트까지.')}</h1>
        <p>${t('Parse, query, mutate and serialize HTML on the server with the standard DOM API: custom elements, Declarative Shadow DOM, MutationObserver. Expected behavior is measured in real Chromium, not copied from other emulators. Zero third-party dependencies.',
          '서버에서 표준 DOM API로 HTML을 파싱하고, 찾고, 바꾸고, 직렬화합니다. 커스텀 엘리먼트, Declarative Shadow DOM, MutationObserver까지. 기대 동작은 다른 에뮬레이터가 아니라 진짜 Chromium에서 측정합니다. 서드파티 의존성 0.')}</p>
        <div class="actions">
          <div class="install"><span>$</span> npm i @dooboostore/dom-parser</div>
          <span class="btn primary" data-path="/package/dom-parser"><i class="fa-solid fa-book"></i> ${t('Docs (README)', '문서 (README)')}</span>
          <a class="btn" href="${NPM_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-npm"></i> npm</a>
        </div>
      </div>

      <div class="wrap">
        <div class="stats">
          ${STATS.map(([v, en, ko]) => `<div class="stat"><div class="v">${v}</div><div class="l">${t(en, ko)}</div></div>`).join('')}
        </div>

        <div class="section-title">
          <h2>${t('30 seconds', '30초')}</h2>
          <p>${t('The DOM API you already know.', '이미 아는 그 DOM API.')}</p>
        </div>
        <div class="files">
          <div class="file"><div class="file-head">parse.ts</div><pre><code class="hljs language-typescript">${hl('typescript', QUICK_PARSE)}</code></pre></div>
          <div class="file"><div class="file-head">component.ts</div><pre><code class="hljs language-typescript">${hl('typescript', QUICK_COMPONENT)}</code></pre></div>
        </div>

        <div class="section-title">
          <h2>${t('Benchmarks', '벤치마크')}</h2>
          <p>${t('Including where we lose.', '지는 칸까지 그대로.')}</p>
        </div>
        <p class="lead">${t('Operations per second, higher is better — <b>bold</b> is the best of the row. Strong at mutation, large pages, memory and cold start; cheerio parses small pages faster and linkedom wins several queries.',
          '초당 횟수, 높을수록 좋음 — <b>굵게</b>가 그 줄 1등. DOM 변경·큰 페이지·메모리·첫 실행이 강하고, 작은 페이지 파싱은 cheerio가, 몇몇 쿼리는 linkedom이 빠릅니다.')}</p>
        <div class="table">
          <table>
            <thead><tr><th></th>${LIBS.map((l, i) => `<th class="${i === 0 ? 'dp' : ''}">${l}</th>`).join('')}</tr></thead>
            <tbody>${benchRows(THROUGHPUT)}</tbody>
          </table>
        </div>
        <div class="table">
          <table>
            <thead><tr><th>${t('Lower is better', '낮을수록 좋음')}</th>${LIBS.map((l, i) => `<th class="${i === 0 ? 'dp' : ''}">${l}</th>`).join('')}</tr></thead>
            <tbody>${benchRows(FOOTPRINT)}</tbody>
          </table>
        </div>
        <p class="note">${t(`Node 24, dom-parser 1.0.29 vs jsdom 27.4, happy-dom 20.14, linkedom 0.18.12, cheerio 1.2 — same script, same machine, 2026-11-11. cheerio is a jQuery-style API rather than a DOM; jsdom also covers scripting-adjacent behavior. Fixtures, method and caveats: <a href="${BENCH_URL}" target="_blank" rel="noopener">bench/RESULTS.md</a>.`,
          `Node 24, dom-parser 1.0.29 vs jsdom 27.4, happy-dom 20.14, linkedom 0.18.12, cheerio 1.2 — 같은 스크립트, 같은 머신, 2026-11-11. cheerio는 DOM이 아니라 jQuery식 API이고, jsdom은 스크립트 쪽 동작까지 다룹니다. 픽스처·방법·주의점: <a href="${BENCH_URL}" target="_blank" rel="noopener">bench/RESULTS.md</a>.`)}</p>

        <div class="section-title">
          <h2>${t('Browser parity', '브라우저와 같게')}</h2>
          <p>${t('Pinned against real Chromium.', '진짜 Chromium에 맞춰 고정.')}</p>
        </div>
        <p class="lead">${t('Each item is a passing test whose expected results were measured in real Chromium — not an aspiration.', '항목마다 진짜 Chromium에서 측정한 결과를 기대값으로 삼는 테스트가 통과합니다 — 목표가 아니라 사실.')}</p>
        <div class="parity">
          ${PARITY.map(([title, en, ko]) => `<div><h3>${title}</h3><p>${t(en, ko)}</p></div>`).join('')}
        </div>

        <div class="section-title">
          <h2>${t('Where it fits', '쓰는 곳')}</h2>
          <p>${t('Anywhere you need a DOM without a browser.', '브라우저 없이 DOM이 필요한 곳 어디든.')}</p>
        </div>
        <div class="uses">
          ${USES.map(u => `<div class="use"${u.path ? ` data-path="${u.path}"` : ''}><i class="fa-solid ${u.icon}"></i><h3>${t(u.title[0], u.title[1])}</h3><p>${t(u.text[0], u.text[1])}</p>${u.path ? `<div class="go">${t('See how →', '자세히 →')}</div>` : ''}</div>`).join('')}
        </div>

        <div class="section-title">
          <h2>${t('Coming from jsdom', 'jsdom에서 옮겨 오기')}</h2>
          <p>${t('Mostly a rename.', '대부분은 이름만 바꾸면 돼요.')}</p>
        </div>
        <div class="table map">
          <table>
            <thead><tr><th>jsdom</th><th>@dooboostore/dom-parser</th></tr></thead>
            <tbody>${FROM_JSDOM.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        <p class="note">${t('<code>&lt;script&gt;</code> in parsed HTML is not executed (jsdom\'s default too), and there is no layout engine — sizes and positions aren\'t computed. Everything else is the standard DOM API, so most code moves over unchanged.',
          '파싱한 HTML의 <code>&lt;script&gt;</code>는 실행하지 않고(jsdom 기본값도 같음), 레이아웃 엔진이 없어 크기·위치는 계산하지 않습니다. 나머지는 표준 DOM API라 대부분의 코드는 그대로 옮겨집니다.')}</p>
      </div>
      `;
    }

    @eventClickDelegate('[data-path]')
    onNavigate(@matchedElement el: HTMLElement) {
      const path = el.dataset.path;
      if (path) this.router?.go(path);
    }
  }
  return tagName;
};
