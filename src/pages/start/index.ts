import { Router } from '@dooboostore/core-web';
import { attribute, elementDefine, innerHtml, matchedElement, onConnectedBefore, onConnectedBodyShadow, onInitialize, eventClick, eventClickDelegate } from '@dooboostore/simple-web-component';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { START_META, SITE_URL, GITHUB_URL } from '@/data/packages';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
const hl = (lang: string, code: string) => hljs.highlight(code.trim(), { language: lang }).value;
const t = (en: string, ko: string) => `<span lang="en">${en}</span><span lang="ko">${ko}</span>`;

// 퀵스타트 코드는 packages/@dooboostore/simple-web-component/test/unit/quickstart.test.ts 에서 실제 브라우저로 돌린다.
// 여기를 바꾸면 그 테스트도 같이 맞출 것 — 문서가 거짓이 되지 않게.
type Step = { title: [string, string]; note: [string, string]; file: string; lang: string; code: string };
const STEPS: Step[] = [
  {
    title: ['Install', '설치'],
    note: ['<code>simple-boot</code>, <code>core</code> and <code>core-web</code> come along as dependencies. Add <code>@dooboostore/simple-boot</code> yourself only when your code imports it (e.g. <code>@Sim</code>, <code>@inject</code>).',
      '<code>simple-boot</code>·<code>core</code>·<code>core-web</code>은 의존성으로 같이 따라옵니다. 내 코드에서 직접 import 할 때(<code>@Sim</code>, <code>@inject</code> 등)만 <code>@dooboostore/simple-boot</code>를 따로 설치하세요.'],
    file: 'terminal', lang: 'bash',
    code: `npm i @dooboostore/simple-web-component reflect-metadata`,
  },
  {
    title: ['Turn on decorators', '데코레이터 켜기'],
    note: ['<code>emitDecoratorMetadata</code> lets the container inject by type alone. Plain esbuild/Vite don\'t emit it — there, name what you want with <code>@inject(SYMBOL)</code> (the starters do), or run tsc in the pipeline (ts-loader, esbuild-plugin-tsc).',
      '<code>emitDecoratorMetadata</code>가 있으면 타입만 보고 주입됩니다. esbuild/Vite 단독은 이걸 안 만들어요 — 거기선 <code>@inject(SYMBOL)</code>로 이름을 찍어 주입하거나(스타터들이 이 방식), 파이프라인에 tsc를 끼우세요(ts-loader, esbuild-plugin-tsc).'],
    file: 'tsconfig.json', lang: 'json',
    code: `{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}`,
  },
  {
    title: ['Write a component', '컴포넌트 하나'],
    note: ['The method returns; the decorators decide where it goes. That\'s the whole idea.', '메서드는 반환만, 둘 곳은 데코레이터가. 이게 전부예요.'],
    file: 'hello-card.ts', lang: 'typescript',
    code: `import { elementDefine, onConnectedBodyShadow, event, innerHtml }
  from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tag = 'hello-card';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class HelloCard extends w.HTMLElement {
    private count = 0;

    @onConnectedBodyShadow
    render() {
      return \`<p>Hello, \${this.getAttribute('name')}!</p>
              <button>clicked <b>0</b> times</button>\`;
    }

    @eventClick('button')
    @innerHtml('b')
    onClick() {
      return String(++this.count);
    }
  }
  return tag;
};`,
  },
  {
    title: ['Put it on a page', '페이지에 놓기'],
    note: ['<code>&lt;body is="swc-app-body"&gt;</code> becomes the app host. Safari needs the <code>is="…"</code> polyfill (first script).',
      '<code>&lt;body is="swc-app-body"&gt;</code>가 앱 호스트가 됩니다. 사파리는 <code>is="…"</code> 폴리필이 필요해요(첫 번째 스크립트).'],
    file: 'index.html', lang: 'xml',
    code: `<head>
  <script src="https://unpkg.com/@ungap/custom-elements"></script>
  <script type="module" src="./main.ts"></script>
</head>
<body id="app" is="swc-app-body">
  <hello-card name="World"></hello-card>
</body>`,
  },
  {
    title: ['Boot the app', '앱 띄우기'],
    note: ['Register the app hosts, then connect: give it a window, a container and the components to define.', '앱 호스트를 등록하고 connect: window, 컨테이너, 정의할 컴포넌트를 넘기면 끝.'],
    file: 'main.ts', lang: 'typescript',
    code: `import 'reflect-metadata';
import { defineSwcAppAll } from '@dooboostore/simple-web-component';
import helloCard from './hello-card';

await defineSwcAppAll(window);
document.querySelector<any>('#app').connect({
  window,
  container: Symbol('app'),
  onStartedLazyDefineComponent: [helloCard],
});`,
  },
];

// 가장 빠른 길: 이 저장소의 templates/* — 정적 홈페이지(homepage-starter) / 서버 렌더 풀스택(ssr-starter)
const TEMPLATES_URL = 'https://github.com/dooboostore-develop/dooboostore-develop.github.io/tree/main/templates/';
const STARTERS: Array<{ dir: string; folder: string; port: number; badge: [string, string]; title: [string, string]; lead: [string, string]; has: Array<[string, string]> }> = [
  {
    dir: 'homepage-starter', folder: 'my-site', port: 5173,
    badge: ['Fastest way', '가장 빠른 길'],
    title: ['A homepage search engines can read — in one <code>npm run build</code>.', '검색엔진이 읽는 회사 홈페이지, <code>npm run build</code> 한 줄.'],
    lead: ['A small company homepage, ready to edit. Copy it, run it, change the words. Static files only — no server to run.', '바로 고쳐 쓸 수 있는 작은 회사 홈페이지예요. 받아서, 돌리고, 문구만 바꾸세요. 정적 파일이라 서버가 필요 없어요.'],
    has: [
      ['Home / About / Contact pages, a header menu and a 404', '홈 / 소개 / 문의 페이지, 헤더 메뉴, 404'],
      ['A title and description per page (SEO)', '페이지마다 제목·설명 (SEO)'],
      ['<code>npm run build</code> → HTML per page + sitemap.xml + robots.txt', '<code>npm run build</code> → 페이지별 HTML + sitemap.xml + robots.txt'],
      ['Push to main → deployed to GitHub Pages', 'main 에 푸시 → GitHub Pages 배포'],
      ['Vite dev server — the one you already know', '익숙한 Vite 개발 서버'],
    ],
  },
  {
    dir: 'ssr-starter', folder: 'my-app', port: 3000,
    badge: ['Full-stack · SSR', '풀스택 · SSR'],
    title: ['Server-rendered pages that call the server like a method.', '서버가 그려 주는 페이지, 서버 호출은 메서드 한 줄.'],
    lead: ['A Node server renders the same components, ships the data with the page, and answers the browser through one shared interface. Open <code>/users</code> and watch what happens.', 'Node 서버가 같은 컴포넌트를 그리고, 데이터를 페이지에 실어 보내고, 공유 인터페이스 하나로 브라우저 호출에 답해요. <code>/users</code>를 열어 보세요.'],
    has: [
      ['First load: drawn on the server, 0 requests from the browser (hydration)', '첫 화면: 서버가 그려 보냄, 브라우저 요청 0개 (하이드레이션)'],
      ['One interface in <code>src/services</code> — HTTP proxy in front, real code on the server', '<code>src/services</code>의 인터페이스 하나 — 프론트는 HTTP 프록시, 서버는 진짜 구현'],
      ['No API routes, no <code>fetch</code> code — components just call <code>getUsers()</code>', 'API 라우트도 <code>fetch</code> 코드도 없음 — 컴포넌트는 <code>getUsers()</code>를 부를 뿐'],
      ['<code>npm run dev</code> rebuilds the front and restarts the server on save', '<code>npm run dev</code> 하나로 저장하면 프론트 다시 빌드 + 서버 재시작'],
    ],
  },
];
const starterCmd = (s: typeof STARTERS[number]) => `npx degit dooboostore-develop/dooboostore-develop.github.io/templates/${s.dir} ${s.folder}
cd ${s.folder}
npm install
npm run dev        # http://localhost:${s.port}`;

// 언제 잘 맞고, 언제는 아직인지 — 솔직하게
const FIT_GOOD: Array<[string, string]> = [
  ['Company and product sites, landing and event pages — where search visibility matters', '회사·제품 소개 사이트, 랜딩·이벤트 페이지 — 검색 노출이 중요한 곳'],
  ['Adding interactive widgets to an existing site (they are standard custom elements)', '기존 사이트에 인터랙티브 위젯 붙이기 (표준 커스텀 엘리먼트라 어디든)'],
  ['Front and back end in one TypeScript codebase (same DI, Symbol RPC)', '프론트와 백을 TypeScript 하나로 (같은 DI, Symbol RPC)'],
  ['Small teams and personal projects that want a light, readable stack', '가볍고 읽을 수 있는 스택을 원하는 작은 팀·개인 프로젝트'],
];
const FIT_CAREFUL: Array<[string, string]> = [
  ['Large services many teams will run for years — React has far more people and material', '여러 팀이 오래 운영할 대형 서비스 — 사람·자료는 React 쪽이 압도적'],
  ['Non-developers must publish posts themselves — there is no content admin; consider a CMS', '비개발자가 글을 직접 올려야 함 — 콘텐츠 관리 화면이 없어요, CMS를 고려하세요'],
  ['You need lots of ready-made UI parts — the component library is still small', '기성 UI 부품이 많이 필요함 — 컴포넌트 라이브러리가 아직 작아요'],
  ['Only standard (TC39) decorators are allowed in your codebase', '표준(TC39) 데코레이터만 허용되는 코드베이스'],
];

const FAQ: Array<{ q: [string, string]; a: [string, string] }> = [
  {
    q: ['Why is every component wrapped in <code>(w: Window) =&gt; { … }</code>?', '왜 컴포넌트마다 <code>(w: Window) =&gt; { … }</code>로 감싸나요?'],
    a: ['So the same class can register into <b>any window</b> — the browser\'s, an iframe\'s, or the server-side DOM that renders SSR. The factory returns the tag name and bails out early if it\'s already defined.',
      '같은 클래스를 <b>어떤 window에든</b> 등록하려고요 — 브라우저, iframe, 그리고 SSR을 그리는 서버 쪽 DOM까지. 팩토리는 태그 이름을 돌려주고, 이미 정의돼 있으면 바로 빠집니다.'],
  },
  {
    q: ['Standard (TC39) decorators?', '표준(TC39) 데코레이터는요?'],
    a: ['Today it runs on TypeScript\'s <code>experimentalDecorators</code> + <code>reflect-metadata</code>. Moving to standard decorators is <b>a goal</b>, and the aim is to keep your call sites as they are.',
      '지금은 TypeScript의 <code>experimentalDecorators</code> + <code>reflect-metadata</code> 위에서 돕니다. 표준 데코레이터로 옮기는 게 <b>목표</b>이고, 호출하는 코드는 그대로 두는 걸 지향해요.'],
  },
  {
    q: ['Can I drop these into React, Vue or a plain page?', 'React, Vue, 그냥 HTML 페이지에 넣어도 되나요?'],
    a: ['Yes. They are standard custom elements — anything that renders DOM can render them.', '네. 표준 커스텀 엘리먼트라 DOM을 그리는 건 뭐든 렌더할 수 있어요.'],
  },
  {
    q: ['Do I have to use <code>is="swc-app-body"</code>?', '<code>is="swc-app-body"</code>를 꼭 써야 하나요?'],
    a: ['No — <code>swc-app-div</code> and friends exist, and <code>SwcAppMixin</code> turns your own element into an app host (no <code>is</code>, no Safari polyfill).',
      '아니요 — <code>swc-app-div</code> 같은 변형도 있고, <code>SwcAppMixin</code>으로 내 엘리먼트를 앱 호스트로 만들 수도 있어요(<code>is</code>도 사파리 폴리필도 불필요).'],
  },
];

// 사실만. 지는 칸도 그대로 적는다.
const COMPARE_COLS = ['simple-web-component', 'Lit', 'React + Next'];
const COMPARE: Array<{ row: [string, string]; cells: Array<[string, string, ('win' | 'lose')?]> }> = [
  { row: ['What you ship', '결과물'], cells: [['standard custom elements', '표준 커스텀 엘리먼트', 'win'], ['standard custom elements', '표준 커스텀 엘리먼트', 'win'], ['React components', 'React 컴포넌트']] },
  { row: ['Virtual DOM', '가상 DOM'], cells: [['none', '없음'], ['none', '없음'], ['yes', '있음']] },
  { row: ['How the DOM updates', 'DOM 갱신 방식'], cells: [['a method returns → decorators write to targets', '메서드 반환 → 데코레이터가 대상에 씀'], ['reactive props → template re-render', '리액티브 프로퍼티 → 템플릿 재렌더'], ['state → re-render → diff', '상태 → 재렌더 → 비교']] },
  { row: ['After SSR, the browser…', 'SSR 뒤 브라우저는…'], cells: [['keeps the DOM, wires behavior', 'DOM 유지, 행위만 연결', 'win'], ['hydrates templates (labs)', '템플릿 하이드레이트(labs)'], ['re-runs components to hydrate', '컴포넌트를 다시 돌려 하이드레이트']] },
  { row: ['DI (dependency injection) container', 'DI(의존성 주입) 컨테이너'], cells: [['built in', '내장', 'win'], ['— (context protocol)', '— (context 프로토콜)'], ['— (context)', '— (context)']] },
  { row: ['Calling the server', '서버 호출'], cells: [['interface + Symbol (Symbol RPC)', '인터페이스 + Symbol (Symbol RPC)', 'win'], ['—', '—'], ['Server Actions', 'Server Actions']] },
  { row: ['Decorators', '데코레이터'], cells: [['TypeScript experimental', 'TypeScript experimental', 'lose'], ['standard + experimental', '표준 + experimental'], ['—', '—']] },
  { row: ['Ecosystem', '생태계'], cells: [['small — you\'d be early', '작음 — 초기 멤버가 됩니다', 'lose'], ['large', '큼'], ['huge', '거대']] },
];

export default (w: Window) => {
  const tagName = 'app-start-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class StartPage extends w.HTMLElement {
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
      return { title: START_META.title, description: START_META.description, url: SITE_URL + START_META.path };
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
        .hero { padding: 56px 40px 10px; max-width: 1000px; margin: 0 auto; }
        .hero h1 { font-size: 40px; font-weight: 850; letter-spacing: -1.5px; margin: 0 0 14px; color: #FFF; line-height: 1.1; }
        .hero p { font-size: 17px; color: #888; margin: 0; line-height: 1.6; }
        .wrap { max-width: 1000px; margin: 0 auto; padding: 30px 40px 40px; }
        .step { display: grid; grid-template-columns: 44px 1fr; gap: 18px; padding: 26px 0; border-top: 1px solid #151515; }
        .step > * { min-width: 0; }
        .no { width: 36px; height: 36px; border-radius: 50%; background: #FF385C; color: #FFF; font-weight: 850; display: flex; align-items: center; justify-content: center; }
        .step h2 { margin: 4px 0 8px; font-size: 22px; font-weight: 850; color: #FFF; letter-spacing: -0.5px; }
        .step p { margin: 0 0 14px; font-size: 14.5px; line-height: 1.7; color: #888; }
        .file { border: 1px solid #262626; border-radius: 14px; background: #0D1117; overflow: hidden; }
        .file-head { padding: 9px 14px; background: #121212; border-bottom: 1px solid #222; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #FFF; font-weight: 700; }
        pre { margin: 0; padding: 16px 18px; overflow-x: auto; }
        pre code { background: transparent; color: #C9D1D9; padding: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; line-height: 1.65; }
        .starter { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: center; padding: 30px; margin-bottom: 18px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(255, 56, 92, 0.10), rgba(255, 56, 92, 0.02)); border: 1px solid rgba(255, 56, 92, 0.3); }
        .starter > * { min-width: 0; }
        .starter pre { white-space: pre-wrap; overflow-wrap: anywhere; }  /* 복사해 갈 명령이라 잘리지 않게 */
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #FF385C; color: #FFF; font-size: 12px; font-weight: 800; margin-bottom: 12px; }
        .starter h2 { margin: 0 0 10px; color: #FFF; font-size: 26px; font-weight: 850; letter-spacing: -0.6px; }
        .starter p { margin: 0 0 14px; color: #999; font-size: 15px; line-height: 1.7; }
        .starter ul, .fit ul { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 8px; }
        .starter li, .fit li { display: flex; gap: 10px; align-items: baseline; color: #CCC; font-size: 14.5px; line-height: 1.55; }
        .starter li i, .fit .good i { color: #FF385C; }
        .fit { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .fit-col { padding: 22px 24px; border-radius: 16px; background: #0E0E0E; border: 1px solid #1F1F1F; }
        .fit-col h3 { margin: 0 0 14px; color: #FFF; font-size: 17px; font-weight: 800; }
        .fit .careful i { color: #FFB020; }
        .fit ul { margin: 0; }
        .done { margin: 10px 0 0; padding: 26px 28px; border-radius: 18px; background: rgba(255, 56, 92, 0.06); border: 1px solid rgba(255, 56, 92, 0.3); }
        .done h3 { margin: 0 0 14px; color: #FFF; font-size: 20px; font-weight: 850; }
        .next { display: flex; flex-wrap: wrap; gap: 10px; }
        .btn { padding: 12px 18px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; border: 1px solid #2A2A2A; background: #141414; color: #DDD;
          display: inline-flex; align-items: center; gap: 8px; transition: 0.15s; text-decoration: none; }
        .btn:hover { border-color: #FF385C; color: #FFF; }
        .btn.primary { background: #FF385C; border-color: #FF385C; color: #FFF; }
        .section-title { margin: 60px 0 22px; }
        .section-title h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: #FF385C; margin: 0 0 10px; }
        .section-title p { color: #FFF; font-size: 30px; font-weight: 850; letter-spacing: -1px; margin: 0; line-height: 1.2; }
        details { border: 1px solid #1F1F1F; border-radius: 14px; background: #0E0E0E; margin-bottom: 10px; }
        /* [lang] 래퍼가 block 이라 ::before(+) 와 한 줄에 두려면 flex */
        summary { cursor: pointer; padding: 18px 22px; color: #FFF; font-weight: 800; font-size: 16px; list-style: none; display: flex; align-items: baseline; }
        summary::-webkit-details-marker { display: none; }
        summary::before { content: '+'; color: #FF385C; font-weight: 850; margin-right: 12px; }
        details[open] summary::before { content: '−'; }
        details > div { padding: 0 22px 20px 46px; color: #999; line-height: 1.75; font-size: 15px; }
        .table { overflow-x: auto; border: 1px solid #1F1F1F; border-radius: 16px; }
        table { width: 100%; border-collapse: collapse; min-width: 640px; }
        th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #1A1A1A; font-size: 14px; vertical-align: top; }
        th { color: #FF385C; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; background: #0E0E0E; }
        th.swc, td.swc { background: rgba(255, 56, 92, 0.05); }
        td.row { color: #FFF; font-weight: 700; white-space: nowrap; }
        td { color: #999; }
        td.win { color: #FFF; font-weight: 700; }
        td.win .ck { color: #FF385C; }
        td.lose { color: #888; }
        .table-note { margin: 12px 0 0; font-size: 13px; color: #666; }
        @media (max-width: 768px) {
          .hero { padding: 40px 22px 0; }
          .hero h1 { font-size: 32px; letter-spacing: -1px; }
          .wrap { padding: 20px 22px 40px; }
          .step { grid-template-columns: 1fr; gap: 10px; }
          .starter, .fit { grid-template-columns: 1fr; }
          .starter { padding: 22px 18px; }
          .section-title p { font-size: 24px; }
          pre code { font-size: 12px; }
        }
      </style>

      <div class="hero">
        <h1>${t('Get started', '시작하기')}</h1>
        <p lang="en">From an empty folder to a working component in about five minutes.</p>
        <p lang="ko">빈 폴더에서 동작하는 컴포넌트까지, 대략 5분.</p>
      </div>

      <div class="wrap">
        ${STARTERS.map(st => `
        <div class="starter">
          <div class="starter-copy">
            <div class="badge">${t(st.badge[0], st.badge[1])}</div>
            <h2>${t(st.title[0], st.title[1])}</h2>
            <p>${t(st.lead[0], st.lead[1])}</p>
            <ul>${st.has.map(([en, ko]) => `<li><i class="fa-solid fa-check"></i>${t(en, ko)}</li>`).join('')}</ul>
            <a class="btn" href="${TEMPLATES_URL + st.dir}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> ${t('See the starter on GitHub', 'GitHub에서 스타터 보기')}</a>
          </div>
          <div class="file"><div class="file-head">terminal</div><pre><code class="hljs language-bash">${hl('bash', starterCmd(st))}</code></pre></div>
        </div>`).join('')}

        <div class="section-title">
          <h2>${t('Or set it up yourself', '직접 하나씩 설정하고 싶다면')}</h2>
          <p>${t('The same thing, one piece at a time.', '같은 걸 한 조각씩.')}</p>
        </div>
        ${STEPS.map((s, i) => `
          <div class="step">
            <div class="no">${i + 1}</div>
            <div>
              <h2>${t(s.title[0], s.title[1])}</h2>
              <p>${t(s.note[0], s.note[1])}</p>
              <div class="file"><div class="file-head">${s.file}</div><pre><code class="hljs language-${s.lang}">${hl(s.lang, s.code)}</code></pre></div>
            </div>
          </div>`).join('')}

        <div class="done">
          <h3>${t('That\'s it — a counter with no state library, no virtual DOM.', '끝 — 상태 라이브러리도 가상 DOM도 없는 카운터.')}</h3>
          <div class="next">
            <span class="btn primary" data-path="/components"><i class="fa-solid fa-box"></i> ${t('Every decorator idea', '데코레이터 아이디어 전부')}</span>
            <span class="btn" data-path="/package/simple-web-component/examples"><i class="fa-solid fa-play"></i> ${t('Full example apps', '예제 앱')}</span>
            <span class="btn" data-path="/package/simple-web-component"><i class="fa-solid fa-book"></i> ${t('Reference (README)', '레퍼런스 (README)')}</span>
            <span class="btn" data-path="/ssr"><i class="fa-solid fa-bolt"></i> ${t('Add SSR', 'SSR 붙이기')}</span>
          </div>
        </div>

        <div class="section-title">
          <h2>FAQ</h2>
          <p>${t('The questions you were about to ask.', '막 물어보려던 그 질문들.')}</p>
        </div>
        ${FAQ.map(f => `<details><summary>${t(f.q[0], f.q[1])}</summary><div>${t(f.a[0], f.a[1])}</div></details>`).join('')}

        <div class="section-title">
          <h2>${t('Is it a fit?', '나한테 맞을까?')}</h2>
          <p>${t('Where it shines, and where to think twice.', '잘 맞는 곳, 그리고 한 번 더 생각할 곳.')}</p>
        </div>
        <div class="fit">
          <div class="fit-col good"><h3>${t('A good fit', '이럴 때 잘 맞아요')}</h3><ul>${FIT_GOOD.map(([en, ko]) => `<li><i class="fa-solid fa-check"></i>${t(en, ko)}</li>`).join('')}</ul></div>
          <div class="fit-col careful"><h3>${t('Think twice', '이럴 땐 아직 신중하게')}</h3><ul>${FIT_CAREFUL.map(([en, ko]) => `<li><i class="fa-solid fa-triangle-exclamation"></i>${t(en, ko)}</li>`).join('')}</ul></div>
        </div>

        <div class="section-title">
          <h2>${t('How it compares', '비교')}</h2>
          <p>${t('Honest, including where we lose.', '솔직하게, 지는 칸까지.')}</p>
        </div>
        <div class="table">
          <table>
            <thead><tr><th></th>${COMPARE_COLS.map((c, i) => `<th class="${i === 0 ? 'swc' : ''}">${c}</th>`).join('')}</tr></thead>
            <tbody>
              ${COMPARE.map(r => `<tr><td class="row">${t(r.row[0], r.row[1])}</td>${r.cells.map((c, i) => { const ck = c[2] === 'win' ? '<span class="ck">✓</span> ' : ''; return `<td class="${i === 0 ? 'swc ' : ''}${c[2] ?? ''}">${t(ck + c[0], ck + c[1])}</td>`; }).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="table-note">${t(`Small ecosystem, big leverage: issues get read by the people who wrote the code. <a href="${GITHUB_URL}" target="_blank" style="color:#FF6B86">Say hi on GitHub</a>.`,
          `생태계는 작지만, 대신 이슈를 코드 쓴 사람이 직접 읽습니다. <a href="${GITHUB_URL}" target="_blank" style="color:#FF6B86">GitHub에서 인사하기</a>.`)}</p>
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
