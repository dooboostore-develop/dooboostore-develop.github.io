import { Router } from '@dooboostore/core-web';
import { attribute, elementDefine, event, innerHtml, matchedElement, onConnectedAfter, onConnectedBefore, onConnectedBodyShadow, onInitialize } from '@dooboostore/simple-web-component';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { ECOSYSTEM_META, PACKAGE_CATEGORIES, SITE_URL } from '@/data/packages';
import { runMermaid } from '@/utils/markdown';

const t = (en: string, ko: string) => `<span lang="en">${en}</span><span lang="ko">${ko}</span>`;

// "우리 숫자 믿지 말고 npm에 물어보세요" — 버튼을 누르면 npm 레지스트리에서 지금 바로 가져온다 (CORS 허용됨)
const ALL_IDS = PACKAGE_CATEGORIES.flatMap(c => c.packages.map(p => p.id));
type NpmRow = { id: string; version?: string; third: string[] };
const npmTable = (rows: NpmRow[] | null) => {
  if (!rows) return `<div class="npm-empty">${t('Press the button — your browser asks registry.npmjs.org directly.', '버튼을 누르면 브라우저가 registry.npmjs.org에 직접 물어봅니다.')}</div>`;
  const published = rows.filter(r => r.version);
  const zero = published.filter(r => !r.third.length);
  return `<div class="npm-sum"><b>${published.length}</b> ${t('published', '배포됨')} · <b>${zero.length} / ${published.length}</b> ${t('with zero third-party runtime deps', '서드파티 런타임 의존성 0')}</div>
    <div class="npm-rows">${rows.map(r => `<div class="npm-row ${r.version ? (r.third.length ? '' : 'zero') : 'nope'}">
      <span class="npm-name" title="@dooboostore/${r.id}">${r.id}</span>
      <span class="npm-ver">${r.version ? `v${r.version}` : t('not on npm yet', '아직 npm에 없음')}</span>
      <span class="npm-deps">${!r.version ? '' : r.third.length ? r.third.map(d => `<code>${d}</code>`).join('') : `<b>0</b> ${t('third-party deps', '서드파티 의존성')}`}</span>
    </div>`).join('')}</div>`;
};

// 수치는 2026-10-03 각 패키지 package.json / src 기준. 패키지가 바뀌면 같이 갱신할 것.
const FACTS = [
  { value: '14', label: { en: 'packages, one philosophy', ko: '패키지, 하나의 철학' } },
  { value: '11/14', label: { en: 'with zero third-party runtime dependencies', ko: '서드파티 런타임 의존성 0인 패키지' } },
  { value: '1', label: { en: 'DI (dependency injection) container — browser and server', ko: 'DI(의존성 주입) 컨테이너 — 브라우저와 서버' } },
  { value: '85k', label: { en: 'lines of TypeScript, no framework underneath', ko: '줄의 TypeScript, 밑에 프레임워크 없음' } },
];

// "뭘 만들고 싶나" → 어떤 패키지. 첫 번째가 시작점, 나머지는 같이 딸려오는 것.
const PATHS: Array<{ need: [string, string]; how: [string, string]; pkgs: string[] }> = [
  { need: ['A UI from standard Web Components', '표준 Web Components로 UI'],
    how: ['Decorator-stack elements, a message bus and a router on one DI container.', '데코레이터 스택 엘리먼트, 메시지 버스, 라우터 — DI 컨테이너 하나 위에서.'],
    pkgs: ['simple-web-component', 'core-web', 'simple-boot'] },
  { need: ['A full-stack app with zero re-render SSR', '다시 안 그리는 SSR 풀스택 앱'],
    how: ['The same components render on the server in dom-parser; the browser only wires behavior.', '같은 컴포넌트를 서버의 dom-parser에서 렌더, 브라우저는 행위만 붙임.'],
    pkgs: ['simple-boot-http-server-ssr', 'simple-web-component', 'simple-boot-http-server', 'dom-parser'] },
  { need: ['A Node API with DI and symbol RPC', 'DI와 Symbol RPC를 갖춘 Node API'],
    how: ['The server is the DI container; one interface is called over HTTP or in-process.', '서버 자체가 DI 컨테이너. 인터페이스 하나를 HTTP로도 프로세스 안에서도 호출.'],
    pkgs: ['simple-boot-http-server', 'simple-boot', 'core-node'] },
  { need: ['Real DOM on the server, without a browser', '브라우저 없이 서버에서 진짜 DOM'],
    how: ['Window, Document, custom elements and Declarative Shadow DOM — no third-party dependencies.', 'Window, Document, 커스텀 엘리먼트, Declarative Shadow DOM — 서드파티 의존성 없음.'],
    pkgs: ['dom-parser'] },
  { need: ['Just a standard library', '그냥 표준 라이브러리'],
    how: ['Observables, a fetch pipeline, validators, expressions, AOP — zero dependencies.', 'Observable, fetch 파이프라인, 검증기, 표현식, AOP — 의존성 0.'],
    pkgs: ['core'] },
  { need: ['Charts and controls, ready-made', '바로 쓰는 차트와 컨트롤'],
    how: ['Cartesian, 3D, radar, bubble and stock charts, built with simple-web-component.', '카테시안, 3D, 레이더, 버블, 주식 차트 — simple-web-component로 만든 것.'],
    pkgs: ['simple-web-component-library', 'algorithm'] },
];

// 패키지 계층도: 각 package.json 의 @dooboostore 의존성에서 transitive reduction 만 남긴 간선 (2026-10-03 기준).
// 화살표는 "아래 패키지가 위 패키지 위에 지어짐" 방향. 패키지 의존성이 바뀌면 여기도 갱신할 것.
const STACK_EDGES: Array<[string, string]> = [
  ['core', 'core-web'], ['core', 'core-node'], ['core', 'simple-boot'], ['core', 'dom-parser'], ['core', 'algorithm'],
  ['core-web', 'dom-render'], ['core-web', 'simple-web-component'], ['core-web', 'lib-web'],
  ['core-node', 'simple-boot-http-server'], ['core-node', 'lib-node'],
  ['simple-boot', 'simple-web-component'], ['simple-boot', 'simple-boot-http-server'], ['simple-boot', 'simple-boot-front'],
  ['dom-render', 'simple-boot-front'], ['dom-render', 'simple-boot-http-server'],
  ['simple-web-component', 'simple-boot-http-server-ssr'], ['simple-web-component', 'simple-web-component-library'],
  ['algorithm', 'simple-web-component-library'],
  ['simple-boot-http-server', 'simple-boot-http-server-ssr'], ['simple-boot-front', 'simple-boot-http-server-ssr'],
  ['dom-parser', 'simple-boot-http-server-ssr'],
];
// 노드 색 = 아래 카드와 같은 카테고리
const CATEGORY_CLASS = ['fw', 'render', 'found', 'lib'];
const nodeId = (id: string) => id.replace(/-/g, '_');
const STACK_GRAPH = [
  'graph TD',
  ...PACKAGE_CATEGORIES.flatMap((cat, i) => cat.packages.map(p => `  ${nodeId(p.id)}["${p.id}"]:::${CATEGORY_CLASS[i] ?? 'lib'}`)),
  ...STACK_EDGES.map(([from, to]) => `  ${nodeId(from)} --> ${nodeId(to)}`),
  '  classDef fw fill:#2A0F16,stroke:#FF385C,color:#FFF',
  '  classDef render fill:#1A1A1A,stroke:#FF6B86,color:#FFF',
  '  classDef found fill:#141414,stroke:#555,color:#DDD',
  '  classDef lib fill:#101010,stroke:#333,color:#AAA',
].join('\n');

export default (w: Window) => {
  const tagName = 'app-ecosystem-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class EcosystemPage extends w.HTMLElement {
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
      return {
        title: ECOSYSTEM_META.title,
        description: ECOSYSTEM_META.description,
        url: SITE_URL + ECOSYSTEM_META.path,
      };
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

        .hero { padding: 56px 40px 30px; max-width: 1200px; margin: 0 auto; }
        .hero h1 { font-size: 40px; font-weight: 850; letter-spacing: -1.5px; margin: 0 0 14px; color: #FFF; line-height: 1.1; }
        .hero p { font-size: 16px; color: #777; margin: 0; line-height: 1.6; }
        .btn { padding: 16px 28px; border-radius: 14px; font-weight: 800; font-size: 15px; cursor: pointer; border: 1px solid #2A2A2A;
          background: #141414; color: #DDD; display: inline-flex; align-items: center; gap: 10px; transition: 0.2s; }
        .btn:hover { transform: translateY(-2px); border-color: #444; color: #FFF; }
        .btn.primary { background: #FF385C; border-color: #FF385C; color: #FFF; box-shadow: 0 10px 30px rgba(255, 56, 92, 0.25); }
        .btn.primary:hover { background: #E31C5F; }

        .facts { max-width: 1100px; margin: 0 auto 40px; padding: 0 40px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .fact { border: 1px solid #1A1A1A; background: #0E0E0E; border-radius: 18px; padding: 26px 22px; text-align: center; }
        .fact .v { font-size: 44px; font-weight: 850; color: #FFF; letter-spacing: -2px; line-height: 1; }
        .fact .l { margin-top: 10px; font-size: 13px; color: #666; line-height: 1.45; }

        .section { max-width: 1200px; margin: 0 auto; padding: 60px 40px; }
        .section-title { text-align: center; margin-bottom: 70px; }
        .section-title h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: #FF385C; margin: 0 0 14px; }
        .section-title p { color: #FFF; font-size: 40px; font-weight: 850; letter-spacing: -1.5px; margin: 0; line-height: 1.15; }

        .feature { display: grid; grid-template-columns: 1fr 1.15fr; gap: 56px; align-items: center; padding: 56px 0; border-top: 1px solid #151515; }
        .feature > * { min-width: 0; }
        .feature:nth-child(even) .copy { order: 2; }
        .kicker { font-size: 12px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FF385C; margin-bottom: 16px; }
        .feature h3 { font-size: 34px; font-weight: 850; letter-spacing: -1.2px; color: #FFF; margin: 0 0 22px; line-height: 1.15; }
        .feature .text { font-size: 16.5px; line-height: 1.75; color: #888; }
        pre { margin: 0; background: #0D1117; border: 1px solid #22272E; border-radius: 18px; padding: 26px 28px; overflow-x: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }
        pre code { background: transparent; color: #C9D1D9; padding: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13.5px; line-height: 1.7; }

        .dogfood { max-width: 1100px; margin: 20px auto 40px; padding: 34px 40px; border-radius: 22px; text-align: center;
          background: radial-gradient(120% 140% at 50% 0%, rgba(255, 56, 92, 0.14), rgba(255, 56, 92, 0) 60%), #0E0E0E; border: 1px solid #1F1F1F; }
        .dogfood h4 { color: #FFF; font-size: 22px; font-weight: 850; margin: 0 0 10px; letter-spacing: -0.5px; }
        .dogfood p { margin: 0; color: #888; line-height: 1.6; }

        .cat-header { margin: 70px 0 28px; border-top: 1px solid #1A1A1A; padding-top: 40px; }
        .cat-header h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #FF385C; margin: 0 0 8px; }
        .cat-header p { color: #FFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
        .npm { max-width: 1100px; margin: 0 auto 10px; padding: 26px 30px; border-radius: 22px; background: #0E0E0E; border: 1px solid #1F1F1F; }
        .npm-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
        .npm-head .kicker { margin-bottom: 6px; }
        .npm h3 { margin: 0; font-size: 26px; font-weight: 850; color: #FFF; letter-spacing: -0.6px; }
        .npm .btn { padding: 12px 18px; font-size: 14px; }
        .npm-scope { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #666; font-weight: 600; }
        .npm-empty { color: #666; font-size: 14px; padding: 6px 0; }
        /* [lang] 래퍼가 block 이라 한 줄로 두려면 flex */
        .npm-sum { margin-bottom: 12px; color: #999; font-size: 14px; display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
        .npm-sum b { color: #FFF; font-size: 18px; }
        .npm-rows { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
        .npm-row { display: grid; grid-template-columns: minmax(0, 1.5fr) auto minmax(0, 1.3fr); gap: 8px; align-items: center; padding: 9px 12px; border-radius: 10px; background: #121212; border: 1px solid #1C1C1C; font-size: 12.5px; }
        .npm-row.zero { border-color: rgba(255, 56, 92, 0.35); }
        .npm-row.nope { opacity: 0.5; }
        .npm-name { color: #FFF; font-family: 'JetBrains Mono', monospace; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .npm-ver { color: #888; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
        .npm-deps { color: #888; display: flex; flex-wrap: wrap; gap: 4px; align-items: baseline; }
        .npm-deps b { color: #FF385C; }
        .npm-deps code { font-size: 11px; padding: 1px 5px; }
        .stack { padding-top: 20px; }
        pre.mermaid g.node { cursor: pointer; }
        pre.mermaid g.node:hover rect, pre.mermaid g.node:hover polygon { stroke-width: 2.5px; filter: brightness(1.4); }
        .paths .section-title { margin-bottom: 36px; }
        .path-list { display: flex; flex-direction: column; gap: 12px; max-width: 1000px; margin: 0 auto; }
        .path { display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: center; padding: 22px 26px;
          border: 1px solid #1A1A1A; border-radius: 18px; background: #0E0E0E; }
        .path h3 { margin: 0 0 6px; font-size: 18px; font-weight: 800; color: #FFF; letter-spacing: -0.3px; }
        .path p { margin: 0; font-size: 14px; color: #777; line-height: 1.55; }
        .path-pkgs { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
        .chip { padding: 7px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
          background: #161616; color: #AAA; border: 1px solid #262626; cursor: pointer; transition: 0.15s; }
        .chip:hover { border-color: #FF385C; color: #FFF; }
        .chip.main { background: rgba(255, 56, 92, 0.12); color: #FF6B86; border-color: rgba(255, 56, 92, 0.4); }
        .stack .section-title { margin-bottom: 30px; }
        pre.mermaid { background: #0B0B0B; border: 1px solid #1A1A1A; border-radius: 22px; padding: 30px; text-align: center; box-shadow: none; overflow-x: auto; }
        pre.mermaid:not([data-processed]) { color: transparent; min-height: 420px; }   /* 그려지기 전 원문 숨김 */
        .legend { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; margin-top: 16px; font-size: 13px; color: #777; }
        .lg { display: inline-flex; align-items: center; gap: 8px; }
        .lg::before { content: ''; width: 12px; height: 12px; border-radius: 3px; border: 1px solid; }
        .lg.fw::before { background: #2A0F16; border-color: #FF385C; }
        .lg.render::before { background: #1A1A1A; border-color: #FF6B86; }
        .lg.found::before { background: #141414; border-color: #555; }
        .lg.lib::before { background: #101010; border-color: #333; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .card { padding: 30px; border-radius: 20px; background: #111; border: 1px solid #1A1A1A; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; gap: 18px; }
        .card:hover { background: #161616; border-color: #333; transform: translateY(-4px); }
        .icon { font-size: 22px; width: 48px; height: 48px; background: #1A1A1A; border-radius: 12px; display: flex; align-items: center;
          justify-content: center; color: #FF385C; transition: 0.2s; }
        .card:hover .icon { background: #FF385C; color: #FFF; }
        .card h3 { font-size: 17px; font-weight: 700; margin: 0; color: #FFF; }
        .card p { font-size: 14px; color: #777; line-height: 1.6; margin: 0; }
        .card-footer { margin-top: auto; color: #FF385C; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 6px;
          text-transform: uppercase; letter-spacing: 1px; opacity: 0.55; transition: 0.2s; }
        .card:hover .card-footer { opacity: 1; color: #FFF; }

        @media (max-width: 900px) {
          .feature { grid-template-columns: 1fr; gap: 28px; }
          .feature:nth-child(even) .copy { order: 0; }
          .facts { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .hero { padding: 40px 22px 20px; }
          .hero h1 { font-size: 32px; letter-spacing: -1px; }
          .hero p { font-size: 17px; }
          .section, .facts { padding-left: 20px; padding-right: 20px; }
          .path { grid-template-columns: 1fr; gap: 14px; }
          .npm { margin: 0 16px 10px; padding: 20px 16px; }
          .npm-rows { grid-template-columns: 1fr; }
          .path-pkgs { justify-content: flex-start; }
          .section-title p { font-size: 28px; }
          .feature h3 { font-size: 26px; }
          .grid { grid-template-columns: 1fr; }
        }
      </style>

      <div class="hero">
        <h1><span lang="en">Ecosystem</span><span lang="ko">생태계</span></h1>
        <p lang="en">Fourteen packages, about 85,000 lines of TypeScript — written from scratch, no framework underneath.</p>
        <p lang="ko">패키지 열네 개, TypeScript 약 85,000줄 — 밑바닥부터, 아래에 다른 프레임워크 없이.</p>
      </div>

      <div class="facts">
        ${FACTS.map(f => `<div class="fact"><div class="v">${f.value}</div><div class="l"><span lang="en">${f.label.en}</span><span lang="ko">${f.label.ko}</span></div></div>`).join('')}
      </div>

      <div class="section stack">
        <div class="section-title">
          <h2 lang="en">How they stack</h2><h2 lang="ko">어떻게 쌓였나</h2>
          <p lang="en">Read from the top: everything<br>stands on a zero-dependency core.</p><p lang="ko">위에서부터 읽으세요: 전부 의존성 0인<br>core 위에 서 있습니다.</p>
        </div>
        <pre class="mermaid">${STACK_GRAPH}</pre>
        <div class="legend">
          ${PACKAGE_CATEGORIES.map((cat, i) => `<span class="lg ${CATEGORY_CLASS[i] ?? 'lib'}"><span lang="en">${cat.name}</span><span lang="ko">${cat.nameKo}</span></span>`).join('')}
        </div>
      </div>

      <div class="section paths">
        <div class="section-title">
          <h2 lang="en">Pick your path</h2><h2 lang="ko">어디서 시작할까</h2>
          <p lang="en">What do you want to build?</p><p lang="ko">뭘 만들고 싶으세요?</p>
        </div>
        <div class="path-list">
          ${PATHS.map(pt => `
            <div class="path">
              <div class="path-need">
                <h3><span lang="en">${pt.need[0]}</span><span lang="ko">${pt.need[1]}</span></h3>
                <p><span lang="en">${pt.how[0]}</span><span lang="ko">${pt.how[1]}</span></p>
              </div>
              <div class="path-pkgs">${pt.pkgs.map((id, i) => `<span class="chip${i === 0 ? ' main' : ''}" data-path="/package/${id}">${id}</span>`).join('')}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="dogfood">
        <h4><span lang="en"><i class="fa-solid fa-utensils"></i>&nbsp; This site eats its own cooking.</span><span lang="ko"><i class="fa-solid fa-utensils"></i>&nbsp; 이 사이트는 자기 요리를 먹습니다.</span></h4>
        <p lang="en">Every page you are reading was pre-rendered at build time by <b>dom-parser</b> and woke up in your browser with <b>simple-web-component</b>.</p><p lang="ko">지금 읽는 모든 페이지는 빌드 때 <b>dom-parser</b>로 미리 렌더됐고, 브라우저에선 <b>simple-web-component</b>으로 깨어났습니다.</p>
      </div>

      <div class="section">
        ${PACKAGE_CATEGORIES.map(cat => `
          <div class="cat-header">
            <h2><span lang="en">${cat.name}</span><span lang="ko">${cat.nameKo}</span></h2>
            <p><span lang="en">${cat.description}</span><span lang="ko">${cat.descriptionKo}</span></p>
          </div>
          <div class="grid">
            ${cat.packages.map(pkg => `
              <div class="card" data-path="/package/${pkg.id}">
                <div class="icon"><i class="fa-solid ${pkg.icon}"></i></div>
                <div class="card-content">
                  <h3>@dooboostore/${pkg.id}</h3>
                  <p><span lang="en">${pkg.tagline}</span><span lang="ko">${pkg.taglineKo}</span></p>
                </div>
                <div class="card-footer"><span lang="en">View documentation</span><span lang="ko">문서 보기</span> <i class="fa-solid fa-arrow-right"></i></div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
      <div class="npm">
        <div class="npm-head">
          <div>
            <div class="kicker">${t('Double-check', '한 번 더 확인')}</div>
            <h3>${t('The numbers above, straight from npm', '위 숫자들, npm에서 바로')} <span class="npm-scope">@dooboostore/*</span></h3>
          </div>
          <button class="btn primary" id="npm-btn"><i class="fa-brands fa-npm"></i> ${t('Ask registry.npmjs.org', 'registry.npmjs.org에 묻기')}</button>
        </div>
        <div class="npm-out">${npmTable(null)}</div>
      </div>
      `;
    }

    @event('#npm-btn', 'click')
    @innerHtml('.npm-out', { fallback: () => `<div class="npm-empty">${t('Asking npm…', 'npm에 묻는 중…')}</div>` })
    async askNpm() {
      const rows = await Promise.all(ALL_IDS.map(async (id): Promise<NpmRow> => {
        try {
          const res = await fetch(`https://registry.npmjs.org/@dooboostore%2f${id}/latest`);
          if (!res.ok) return { id, third: [] };
          const pkg = await res.json();
          return { id, version: pkg.version, third: Object.keys(pkg.dependencies ?? {}).filter(d => !d.startsWith('@dooboostore/')) };
        } catch {
          return { id, third: [] };
        }
      }));
      return npmTable(rows);
    }

    // 브라우저에서만 SVG로 그림 (SSG에선 no-op — 원문이 박히고 숨김 처리됨)
    @onConnectedAfter
    async drawStack() {
      if (this.shadowRoot) await runMermaid(this.shadowRoot);
    }

    // 계층도 노드 클릭 → 패키지 문서. mermaid 노드 id: "<prefix>-flowchart-<nodeId>-<n>"
    @event('pre.mermaid g.node', 'click', { delegate: true })
    onStackNode(@matchedElement node: SVGGElement) {
      const id = /-flowchart-(.+)-\d+$/.exec(node.id)?.[1]?.replace(/_/g, '-');
      if (id) this.router?.go(`/package/${id}`);
    }

    @event('[data-path]', 'click', { delegate: true })
    onNavigate(e: any) {
      const path = e.target.closest('[data-path]')?.dataset?.path;
      if (path) this.router?.go(path);
    }
  }
  return tagName;
};
