import { Router } from '@dooboostore/core-web';
import { attribute, elementDefine, innerHtml, onConnectedAfter, onConnectedBefore, onConnectedBodyShadow, onInitialize, eventClick, eventClickDelegate } from '@dooboostore/simple-web-component';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { SERVER_META, SITE_URL, findPackage } from '@/data/packages';
import { runMermaid } from '@/utils/markdown';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
const ts = (code: string) => hljs.highlight(code.trim(), { language: 'typescript' }).value;
const html = (code: string) => hljs.highlight(code.trim(), { language: 'xml' }).value;
const t = (en: string, ko: string) => `<span lang="en">${en}</span><span lang="ko">${ko}</span>`;

// ── 하이드레이션 섹션 ──
// 실제 동작 (simple-web-component + simple-boot-http-server-ssr):
//  서버: ssr 모드 SwcApp 이 연결된 엘리먼트마다 swc-use-ssr="<swcId>" 를 찍고, dom-parser 가 shadow root 를 DSD 로 직렬화
//  브라우저: connectedCallback 이 표시를 보면 @onConnected* 렌더를 건너뛰고(DOM·id 유지) 행위(이벤트·옵저버·구독)만 붙인 뒤 표시를 지움
//  데이터: 서버가 @property 값을 인라인 스크립트로 박제 → 업그레이드 전 엘리먼트에 el[prop]=값 → 업그레이드 뒤에도 own property 로 생존
const RECEIVED_HTML = `
<user-menu swc-use-ssr="s8k2j1x">
  <template shadowrootmode="open">
    <style>button { … }</style>
    <button class="me">Kim</button>
  </template>
</user-menu>`;

const TYPICAL_FLOW: Array<[string, string, string?]> = [
  ['render on the server', '서버에서 렌더'], ['ship HTML', 'HTML 전송'],
  ['re-run every component', '모든 컴포넌트 다시 실행', 'bad'], ['compare with the HTML', 'HTML과 비교', 'bad'], ['interactive', '동작'],
];
const SWC_FLOW: Array<[string, string, string?]> = [
  ['render + stamp', '렌더 + 표시'], ['ship HTML + shadow DOM', 'HTML + 섀도우 DOM 전송'],
  ['keep the DOM, skip render', 'DOM 유지, 렌더 생략', 'good'], ['wire behavior only', '행위만 연결', 'good'], ['interactive', '동작'],
];
const BROWSER_STEPS: Array<[string, string]> = [
  ['The HTML parser builds the DOM and attaches every shadow root from <code>&lt;template shadowrootmode&gt;</code> — the page is painted <b>before any JavaScript</b>.',
   'HTML 파서가 DOM을 만들고 <code>&lt;template shadowrootmode&gt;</code>로 섀도우 루트까지 붙입니다 — <b>자바스크립트 전에</b> 화면이 다 그려져요.'],
  ['Your bundle calls <code>customElements.define()</code>; the existing elements upgrade in place.',
   '번들이 <code>customElements.define()</code>을 부르면 이미 있는 엘리먼트가 그 자리에서 업그레이드됩니다.'],
  ['<code>connectedCallback</code> sees <code>swc-use-ssr</code>: it <b>skips the <code>@onConnected*</code> render</b>, keeps the DOM and reuses the id.',
   '<code>connectedCallback</code>이 <code>swc-use-ssr</code>를 보면 <b><code>@onConnected*</code> 렌더를 건너뛰고</b> DOM과 id를 그대로 씁니다.'],
  ['Only behavior is wired — <code>@event</code>, observers, message and route subscriptions, timers. Then the mark is removed, so later reconnects render normally.',
   '행위만 붙습니다 — <code>@event</code>, 옵저버, 메시지·라우트 구독, 타이머. 그리고 표시를 지워서 이후 재연결은 평소대로 렌더해요.'],
];

const HYDRATION_SCRIPT = `
<!-- embedded by the server, runs before your bundle -->
<script>
  window.__swc_hydration = [{
    sel: '[swc-use-ssr="s8k2j1x"]',
    prop: 'me', value: { "name": "Kim" }
  }];
  for (const h of window.__swc_hydration)
    document.querySelector(h.sel)[h.prop] = h.value;
</script>`;

const PROPERTY_CODE = `
@property                 // a hydration target
declare me: User | null;  // declare: no initializer

override async onSwcAppConnected(
  @inject(AuthService.SYMBOL) auth: AuthService,
) {
  this.me ??= await auth.me();  // already here → skipped
}`;

const DATA_FLOW = `sequenceDiagram
  participant S as server (dom-parser)
  participant P as HTML parser
  participant E as user-menu
  participant J as your bundle
  S->>S: render · this.me = await auth.me()
  S->>P: HTML + inline hydration script
  P->>E: el.me = value (not upgraded yet)
  J->>E: customElements.define → upgrade
  Note over E: own property survives the upgrade
  E->>E: this.me ??= … → skipped, no request`;

const DATA_RULES: Array<[string, string]> = [
  ['bare <code>@property</code> marks the field', '맨 <code>@property</code>로 필드 지정'],
  ['use <code>declare</code> — an initializer would overwrite it', '<code>declare</code>로 — 초기값을 주면 덮어씀'],
  ['JSON values only (functions skipped)', 'JSON 값만 (함수는 제외)'],
  ['<code>&lt;</code> escaped — no <code>&lt;/script&gt;</code> injection', '<code>&lt;</code> 이스케이프 — <code>&lt;/script&gt;</code> 주입 차단'],
];

// ── Symbol RPC 섹션 ──
// 실제 동작 (simple-boot-http-server):
//  브라우저: SymbolIntentApiServiceProxy 가 메서드 호출에 send() 를 붙여 넘김 → send() = POST /<메서드명>
//           + 헤더 x-simple-boot-ssr-intent-scheme: Symbol.for(<이름>)
//  서버: IntentSchemeFilter 가 그 헤더로 같은 Symbol 의 @Sim 을 찾아 메서드 호출 → JSON 응답
//  SSR: 같은 Symbol 로 진짜 구현이 주입되고, injectRequestResponse 가 인자 끝에 rr 을 붙임
const RPC_FILES: Array<{ cls: string; path: string; role: [string, string]; code: string }> = [
  { cls: 'shared', path: 'shared/auth.service.ts', role: ['the contract — written once', '계약 — 한 번만 작성'], code: `
export interface AuthService {
  me(...args: any[]): Promise<User | null>;
}
export namespace AuthService {
  // Symbol.for → same key in both bundles
  export const SYMBOL = Symbol.for('AuthService');
}` },
  { cls: 'front', path: 'front/auth.front.ts', role: ['browser — a proxy, one line', '브라우저 — 프록시, 한 줄'], code: `
@Sim({
  symbol: AuthService.SYMBOL,
  proxy: intentProxy,   // the HTTP bridge
})
class AuthFront implements AuthService {
  me(send) { return send(); }
}` },
  { cls: 'back', path: 'back/auth.back.ts', role: ['server — the real logic', '서버 — 진짜 로직'], code: `
@Sim({ symbol: AuthService.SYMBOL })
class AuthBack implements AuthService {
  async me(rr: RequestResponse) {
    /* session cookie → User */
  }
}` },
  { cls: 'use', path: 'components/user-menu.ts', role: ['anywhere — just call it', '어디서든 — 그냥 호출'], code: `
@onConnectedAfter
async load(
  @inject(AuthService.SYMBOL)
  auth: AuthService,
) {
  this.me = await auth.me();
}` },
];

const RPC_BROWSER_FLOW = `sequenceDiagram
  participant C as user-menu
  participant F as AuthFront (proxy)
  participant S as server · IntentSchemeFilter
  participant B as AuthBack
  C->>F: auth.me()
  F->>S: POST /me
  Note over F,S: header → Symbol.for(AuthService)
  S->>B: same Symbol → me(rr)
  B-->>S: User
  S-->>F: 200 · JSON
  F-->>C: Promise resolves with User`;

const RPC_SSR_FLOW = `sequenceDiagram
  participant C as user-menu (on the server)
  participant B as AuthBack
  C->>B: auth.me()
  Note over C,B: no HTTP · AuthBack itself, rr appended
  B-->>C: User`;

// 소스 보기 챌린지: 서빙된 원본 HTML(스크립트 전)에 이미 들어 있는 것을 센다
const sourceStats = (kb: string, shadows: string, headings: string, samples: string[]) => `
  <div class="ps"><div class="pv">${kb}</div><div class="pl">${t('KB of HTML before JS', 'JS 전 HTML 크기(KB)')}</div></div>
  <div class="ps"><div class="pv">${shadows}</div><div class="pl">${t('shadow roots, already attached', '이미 붙은 섀도우 루트')}</div></div>
  <div class="ps"><div class="pv">${headings}</div><div class="pl">${t('headings already in the HTML', 'HTML에 이미 있는 제목')}</div></div>
  ${samples.length ? `<div class="ps-samples">${samples.map(x => `<span>“${x}”</span>`).join('')}</div>` : ''}`;

const SERVER_PACKAGES = ['simple-boot-http-server-ssr', 'simple-boot-http-server', 'simple-boot'];

export default (w: Window) => {
  const tagName = 'app-server-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class ServerPage extends w.HTMLElement {
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
        title: SERVER_META.title,
        description: SERVER_META.description,
        url: SITE_URL + SERVER_META.path,
      };
    }

    @onConnectedBodyShadow
    render() {
      const pkgs = SERVER_PACKAGES.map(id => findPackage(id)!).filter(Boolean);
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
        .hero p { font-size: 16px; color: #777; margin: 0; line-height: 1.7; max-width: 860px; }
        .h1-full { font-size: 18px; font-weight: 600; color: #FF6B86; letter-spacing: 0; margin-left: 10px; vertical-align: middle; }
        .term { margin-top: 14px; font-size: 14px; color: #888; }
        .term b { color: #FF6B86; }
        .btn { padding: 16px 28px; border-radius: 14px; font-weight: 800; font-size: 15px; cursor: pointer; border: 1px solid #2A2A2A;
          background: #141414; color: #DDD; display: inline-flex; align-items: center; gap: 10px; transition: 0.2s; }
        .btn:hover { transform: translateY(-2px); border-color: #444; color: #FFF; }
        .btn.primary { background: #FF385C; border-color: #FF385C; color: #FFF; box-shadow: 0 10px 30px rgba(255, 56, 92, 0.25); }
        .btn.primary:hover { background: #E31C5F; }

        .section { max-width: 1200px; margin: 0 auto; padding: 60px 40px; }
        .section-title { text-align: center; margin-bottom: 70px; }
        .section-title h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: #FF385C; margin: 0 0 14px; }
        .section-title p { color: #FFF; font-size: 40px; font-weight: 850; letter-spacing: -1.5px; margin: 0; line-height: 1.15; }

        .kicker { font-size: 12px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FF385C; margin-bottom: 16px; }
        pre { margin: 0; background: #0D1117; border: 1px solid #22272E; border-radius: 18px; padding: 26px 28px; overflow-x: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }
        pre code { background: transparent; color: #C9D1D9; padding: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13.5px; line-height: 1.7; }
        .proof { max-width: 1200px; margin: 10px auto 0; padding: 30px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; align-items: center; }
        .proof h3 { font-size: 26px; font-weight: 850; color: #FFF; letter-spacing: -0.6px; margin: 0 0 12px; line-height: 1.25; }
        .proof p { font-size: 15px; color: #888; line-height: 1.7; margin: 0 0 20px; }
        .proof-out { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .ps { padding: 18px 10px; border-radius: 14px; background: #0E0E0E; border: 1px solid #1F1F1F; text-align: center; }
        .ps .pv { font-size: 32px; font-weight: 850; color: #FF385C; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
        .ps .pl { margin-top: 6px; font-size: 12px; color: #777; line-height: 1.4; }
        .ps-samples { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; }
        .ps-samples span { padding: 6px 10px; border-radius: 10px; background: #121212; border: 1px solid #222; color: #BBB; font-size: 12.5px; }
        .rpc .section-title, .hyd .section-title { margin-bottom: 30px; }
        .step .kicker { margin-bottom: 8px; }
        .compare { display: flex; flex-direction: column; gap: 10px; }
        .flow { display: grid; grid-template-columns: 124px 1fr; gap: 14px; align-items: center; padding: 14px 18px; border-radius: 14px; border: 1px solid #1F1F1F; background: #0E0E0E; }
        .flow.swc { border-color: rgba(255, 56, 92, 0.45); background: rgba(255, 56, 92, 0.05); }
        .flow-label { font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #888; }
        .flow.swc .flow-label { color: #FF385C; text-transform: none; letter-spacing: 0.3px; }
        .flow-steps { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .flow-steps i { color: #444; font-size: 12px; }
        .fs { padding: 7px 12px; border-radius: 10px; background: #161616; border: 1px solid #262626; color: #BBB; font-size: 13.5px; font-weight: 700; }
        .fs.bad { color: #777; text-decoration: line-through; text-decoration-color: rgba(255, 56, 92, 0.7); }
        .fs.good { color: #FFF; border-color: rgba(255, 56, 92, 0.5); background: rgba(255, 56, 92, 0.12); }
        .timeline { margin: 6px 0 0; padding-left: 22px; display: flex; flex-direction: column; gap: 10px; }
        .timeline li { color: #999; font-size: 15px; line-height: 1.7; }
        .timeline li::marker { color: #FF385C; font-weight: 800; }
        .punch { margin: 4px 0 0; font-size: 17px; color: #CCC; }
        .data-grid { display: flex; flex-direction: column; gap: 14px; }
        .data-grid pre.mermaid svg { max-width: 860px !important; }
        .data-code { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
        .data-code > * { min-width: 0; }
        .rules { justify-content: flex-start; margin: 4px 0 0; }
        .step { display: grid; grid-template-columns: 0.8fr 1.4fr; gap: 48px; align-items: center; padding: 48px 0; border-top: 1px solid #151515; }
        .step > * { min-width: 0; }
        .step.wide { grid-template-columns: 1fr; gap: 28px; }
        .step.wide .step-copy { max-width: 760px; }
        .step-no { width: 34px; height: 34px; border-radius: 50%; background: #FF385C; color: #FFF; font-weight: 850; display: flex;
          align-items: center; justify-content: center; margin-bottom: 16px; }
        .step h3 { font-size: 26px; font-weight: 850; letter-spacing: -0.8px; color: #FFF; margin: 0 0 14px; line-height: 1.2; }
        .step p { font-size: 15.5px; line-height: 1.75; color: #888; margin: 0; }
        .tree { display: flex; flex-direction: column; }
        .file { border: 1px solid #262626; border-radius: 14px; background: #0D1117; overflow: hidden; }
        .file.shared { border-color: #FF385C; box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.12); }
        .file-head { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 9px 14px; background: #121212; border-bottom: 1px solid #222; }
        .file-head .path { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #FFF; font-weight: 700; }
        .file-head .role { font-size: 11.5px; color: #FF6B86; font-weight: 700; }
        .file pre { border: none; border-radius: 0; box-shadow: none; padding: 14px 16px; }
        .file pre code { font-size: 11.5px; line-height: 1.6; }
        .imports { display: grid; grid-template-columns: repeat(3, 1fr); padding: 10px 0; text-align: center; color: #FF6B86; font-size: 12px; font-weight: 700; }
        .impls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        pre.mermaid { background: #0B0B0B; border: 1px solid #1A1A1A; border-radius: 18px; padding: 20px; text-align: center; box-shadow: none; }
        pre.mermaid:not([data-processed]) { color: transparent; min-height: 260px; }
        .nots { margin-top: 30px; padding: 30px; border-radius: 20px; background: #0E0E0E; border: 1px solid #1F1F1F; text-align: center; }
        .nots-title { font-size: 12px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FF385C; margin-bottom: 18px; }
        .nots-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 10px; }
        .not { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 999px; background: #151515; border: 1px solid #262626;
          color: #777; font-size: 14px; font-weight: 700; text-decoration: line-through; text-decoration-color: rgba(255, 56, 92, 0.6); }
        .not i { color: #FF385C; }
        .nots-row.yes .not { text-decoration: none; color: #FFF; border-color: rgba(255, 56, 92, 0.4); background: rgba(255, 56, 92, 0.1); }
        .after { margin-top: 0; grid-column: auto; }
        .after > * { min-width: 0; }

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

        .diagram { background: #0E0E0E; border: 1px solid #1F1F1F; border-radius: 22px; padding: 34px 28px; overflow-x: auto; }
        .flow-col { display: flex; flex-direction: column; }
        .flow-row { display: flex; align-items: stretch; gap: 0; }
        .lane { flex: 1; background: #111; border: 1px solid #2A2A2A; border-radius: 16px; padding: 24px 20px; }
        .lane.shared { border-color: #FF385C; }
        .lane h4 { margin: 0 0 16px; font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #FF385C; }
        .lane ul { margin: 0; padding: 0; list-style: none; }
        .lane li { color: #FFF; font-size: 15px; font-weight: 700; padding: 8px 0; border-top: 1px solid #1E1E1E; }
        .lane li:first-child { border-top: none; }
        .lane-arrow { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 12px; color: #FF6B86; flex: none; }
        .lane-arrow i { font-size: 20px; }
        .lane-arrow span { font-size: 12px; color: #888; margin-top: 6px; white-space: nowrap; }
        .fork { display: flex; }
        .fork-arrow { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 12px 0; color: #FF6B86; }
        .fork-arrow i { font-size: 20px; }
        .fork-arrow span { font-size: 12px; color: #888; margin-top: 6px; }

        @media (max-width: 900px) {
          .step { grid-template-columns: 1fr; gap: 24px; }
          .proof { grid-template-columns: 1fr; padding: 20px; }
          .imports { display: none; }
          .impls { grid-template-columns: 1fr; }
          .data-code { grid-template-columns: 1fr; }
          .flow { grid-template-columns: 1fr; gap: 8px; }
        }
        @media (max-width: 768px) {
          .hero { padding: 40px 22px 20px; }
          .hero h1 { font-size: 32px; letter-spacing: -1px; }
          .hero p { font-size: 15px; }
          .section { padding-left: 20px; padding-right: 20px; }
          .section-title p { font-size: 28px; }
          .grid { grid-template-columns: 1fr; }
          .flow-row { flex-direction: column; }
          .vs { grid-template-columns: 1fr; }
          .vs pre { padding: 18px; }
          pre code { font-size: 12px; }
          .lane-arrow { flex-direction: row; padding: 12px 0; gap: 8px; }
          .lane-arrow i { transform: rotate(90deg); }
          .lane-arrow span { margin-top: 0; }
          .diagram { padding: 24px 16px; }
        }
      </style>

      <div class="hero">
        <h1>SSR <span class="h1-full">Server-Side Rendering</span></h1>
        <p lang="en"><b>SSR</b> means the server renders the page and sends finished HTML, so it shows up before any JavaScript runs.
        Here the same app boots on the server without a browser, and the browser never renders it a second time.
        On top of that, <b>RPC</b> (calling a server function as if it were local) works with just an interface and a Symbol.</p>
        <p lang="ko"><b>SSR(서버 사이드 렌더링)</b>은 서버가 화면을 미리 그려서 완성된 HTML로 보내는 방식이에요. 그래서 자바스크립트가 돌기 전에 이미 화면이 보여요.
        여기선 같은 앱이 브라우저 없이 서버에서 부팅되고, 브라우저는 그걸 두 번 그리지 않습니다.
        그리고 <b>RPC(서버 함수를 내 함수처럼 부르기)</b>를 인터페이스 하나와 Symbol만으로 합니다.</p>
      </div>

      <div class="section">
        <div class="section-title">
          <h2 lang="en">System</h2><h2 lang="ko">시스템 구성</h2>
          <p lang="en">How a request becomes a page.</p><p lang="ko">요청이 페이지가 되기까지.</p>
        </div>
        <div class="diagram">
          <div class="flow-col">
            <div class="lane shared">
              <h4><span lang="en">SHARED SOURCE — one codebase</span><span lang="ko">공유 소스 — 코드 하나</span></h4>
              <ul>
                <li>bootfactory</li>
                <li><span lang="en">same components</span><span lang="ko">같은 컴포넌트</span></li>
                <li><span lang="en">one interface + one Symbol</span><span lang="ko">인터페이스 하나 + Symbol 하나</span></li>
              </ul>
            </div>
            <div class="fork">
              <div class="fork-arrow"><i class="fa-solid fa-arrow-down"></i><span lang="en">same code → server</span><span lang="ko">같은 코드 → 서버</span></div>
              <div class="fork-arrow"><i class="fa-solid fa-arrow-down"></i><span lang="en">same code → browser</span><span lang="ko">같은 코드 → 브라우저</span></div>
            </div>
            <div class="flow-row">
              <div class="lane">
                <h4><span lang="en">SERVER</span><span lang="ko">서버</span></h4>
                <ul>
                  <li><span lang="en">request + cookies</span><span lang="ko">요청 + 쿠키</span></li>
                  <li>dom-parser</li>
                  <li><span lang="en">real HTML</span><span lang="ko">진짜 HTML</span></li>
                </ul>
              </div>
              <div class="lane-arrow"><i class="fa-solid fa-arrow-right"></i><span>HTML</span></div>
              <div class="lane">
                <h4><span lang="en">BROWSER</span><span lang="ko">브라우저</span></h4>
                <ul>
                  <li><span lang="en">inherit DOM</span><span lang="ko">DOM 상속</span></li>
                  <li><span lang="en">upgrade alive</span><span lang="ko">업그레이드 생존</span></li>
                  <li><span lang="en">wire behavior</span><span lang="ko">행위만 배선</span></li>
                </ul>
              </div>
            </div>
            <div class="fork">
              <div class="fork-arrow"><i class="fa-solid fa-arrow-up"></i><span lang="en">intent + Symbol header → same service</span><span lang="ko">인텐트 + Symbol 헤더 → 같은 서비스</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="section hyd">
        <div class="section-title">
          <h2 lang="en">Hydration</h2><h2 lang="ko">하이드레이션</h2>
          <p lang="en">The server draws it. That's it.<br>The browser never draws it twice.</p><p lang="ko">서버가 그리면 끝.<br>브라우저는 두 번 안 그립니다.</p>
        </div>

        <div class="step">
          <div class="step-copy">
            <div class="step-no">1</div>
            <div class="kicker">${t('Structure', '구조')}</div>
            <h3>${t('The server renders — and stamps', '서버가 그리고, 표시를 찍습니다')}</h3>
            <p lang="en">The same app boots inside <b>dom-parser</b> on the server — same boot function, same components, no headless Chrome.
            <code>@onConnected*</code> render methods run there, every connected element is stamped <code>swc-use-ssr="&lt;id&gt;"</code>,
            and shadow roots are written out as <b>Declarative Shadow DOM</b>.</p>
            <p lang="ko">같은 앱이 서버의 <b>dom-parser</b> 위에서 부팅됩니다 — 같은 부팅 함수, 같은 컴포넌트, 헤드리스 크롬 없이.
            <code>@onConnected*</code> 렌더 메서드가 거기서 돌고, 연결된 엘리먼트마다 <code>swc-use-ssr="&lt;id&gt;"</code>가 찍히고,
            섀도우 루트는 <b>Declarative Shadow DOM</b>으로 나갑니다.</p>
          </div>
          <div class="file">
            <div class="file-head"><span class="path">${t('what the browser receives', '브라우저가 받는 것')}</span><span class="role">HTML</span></div>
            <pre><code class="hljs language-xml">${html(RECEIVED_HTML)}</code></pre>
          </div>
        </div>

        <div class="step wide">
          <div class="step-copy">
            <div class="step-no">2</div>
            <div class="kicker">${t('Structure', '구조')}</div>
            <h3>${t('The browser keeps it, skips the render, wires behavior', '브라우저는 그대로 두고, 렌더는 건너뛰고, 행위만 붙입니다')}</h3>
          </div>
          <div class="compare">
            <div class="flow typical"><div class="flow-label">${t('Typical SSR', '흔한 SSR')}</div><div class="flow-steps">${TYPICAL_FLOW.map(([en, ko, c]) => `<span class="fs ${c ?? ''}">${t(en, ko)}</span>`).join('<i class="fa-solid fa-arrow-right"></i>')}</div></div>
            <div class="flow swc"><div class="flow-label">@dooboostore</div><div class="flow-steps">${SWC_FLOW.map(([en, ko, c]) => `<span class="fs ${c ?? ''}">${t(en, ko)}</span>`).join('<i class="fa-solid fa-arrow-right"></i>')}</div></div>
          </div>
          <ol class="timeline">
            ${BROWSER_STEPS.map(([en, ko]) => `<li><span lang="en">${en}</span><span lang="ko">${ko}</span></li>`).join('')}
          </ol>
          <p class="punch">${t('No second render pass — so there is <b>nothing to mismatch</b>.', '두 번째 렌더가 없으니 <b>어긋날 것도 없습니다</b>.')}</p>
        </div>

        <div class="step wide">
          <div class="step-copy">
            <div class="step-no">3</div>
            <div class="kicker">${t('Data', '데이터')}</div>
            <h3>${t('Data rides the custom-element upgrade', '데이터는 커스텀 엘리먼트 업그레이드를 타고 옵니다')}</h3>
            <p lang="en">A value set on an element <b>before</b> <code>customElements.define()</code> stays on it after the upgrade — that's the spec.
            The server collects every <code>@property</code> field and embeds a tiny script that sets them on the not-yet-upgraded elements.
            When your component wakes up, the data is <b>already there</b>: no fetch, no store, no keys.</p>
            <p lang="ko"><code>customElements.define()</code> <b>전에</b> 엘리먼트에 넣은 값은 업그레이드 뒤에도 남습니다 — 스펙이에요.
            서버가 <code>@property</code> 필드를 모아 작은 스크립트로 박고, 그 스크립트가 아직 업그레이드 전인 엘리먼트에 값을 넣습니다.
            컴포넌트가 깨어나면 데이터는 <b>이미 와 있어요</b>: fetch도 스토어도 키도 없이.</p>
          </div>
          <div class="data-grid">
            <pre class="mermaid">${DATA_FLOW}</pre>
            <div class="data-code">
              <div class="file">
                <div class="file-head"><span class="path">${t('in the HTML', 'HTML 안')}</span><span class="role">${t('server writes', '서버가 씀')}</span></div>
                <pre><code class="hljs language-xml">${html(HYDRATION_SCRIPT)}</code></pre>
              </div>
              <div class="file">
                <div class="file-head"><span class="path">components/user-menu.ts</span><span class="role">${t('you write', '내가 씀')}</span></div>
                <pre><code class="hljs language-typescript">${ts(PROPERTY_CODE)}</code></pre>
              </div>
            </div>
          </div>
          <div class="nots-row yes rules">
            ${DATA_RULES.map(([en, ko]) => `<span class="not"><i class="fa-solid fa-check"></i>${t(en, ko)}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="proof">
        <div class="proof-copy">
          <div class="kicker">${t('See it for yourself', '직접 확인해 보기')}</div>
          <h3>${t('This page was rendered ahead of time too — want to check?', '이 페이지도 미리 그려서 보냈어요 — 확인해 볼까요?')}</h3>
          <p>${t('Press it: we download the raw HTML this page was served as — the bytes before any script runs — and count what is already inside.',
            '눌러보세요: 이 페이지가 서빙된 원본 HTML — 스크립트가 돌기 전의 바이트 — 을 받아서 안에 이미 뭐가 들었는지 셉니다.')}</p>
          <button class="btn primary" id="src-btn"><i class="fa-solid fa-code"></i> ${t('Check the raw HTML', '원본 HTML 확인')}</button>
        </div>
        <div class="proof-out">${sourceStats('–', '–', '–', [])}</div>
      </div>

      <div class="section rpc">
        <div class="section-title">
          <h2>Symbol RPC</h2>
          <p lang="en">Zero API routes. Zero fetch code.<br>One interface, and you're done.</p><p lang="ko">API 라우트 0개. fetch 코드 0줄.<br>인터페이스 하나면 끝.</p>
          <div class="term">${t('<b>RPC</b> = Remote Procedure Call — calling a function that lives on the server as if it were in your own code.', '<b>RPC</b> = Remote Procedure Call — 서버에 있는 함수를 내 코드의 함수처럼 부르는 것.')}</div>
        </div>

        <div class="step wide">
          <div class="step-copy">
            <div class="step-no">1</div>
            <h3><span lang="en">Write the contract once</span><span lang="ko">계약은 한 번만 씁니다</span></h3>
            <p lang="en">An <code>interface</code> and a <code>Symbol</code> live in shared code. The browser and the server each
            <b>import the same file</b> and implement it their own way — the browser with a one-line proxy (<code>SymbolIntentApiServiceProxy</code>), the server with the real logic.
            Components only ever see the interface.</p>
            <p lang="ko">공유 코드에 <code>interface</code>와 <code>Symbol</code> 하나. 브라우저와 서버가 <b>같은 파일을 import</b>해서
            각자 구현합니다 — 브라우저는 한 줄짜리 프록시(<code>SymbolIntentApiServiceProxy</code>), 서버는 진짜 로직. 컴포넌트는 인터페이스만 봅니다.</p>
          </div>
          <div class="tree">
            ${(() => { const card = (f: typeof RPC_FILES[number]) => `
              <div class="file ${f.cls}">
                <div class="file-head"><span class="path">${f.path}</span><span class="role"><span lang="en">${f.role[0]}</span><span lang="ko">${f.role[1]}</span></span></div>
                <pre><code class="hljs language-typescript">${ts(f.code)}</code></pre>
              </div>`;
              const [shared, ...rest] = RPC_FILES;
              return `${card(shared)}
              <div class="imports">${rest.map(f => `<span class="${f.cls}"><i class="fa-solid fa-arrow-down"></i> import</span>`).join('')}</div>
              <div class="impls">${rest.map(card).join('')}</div>`; })()}
          </div>
        </div>

        <div class="step">
          <div class="step-copy">
            <div class="step-no">2</div>
            <h3><span lang="en">In the browser, the call travels by itself</span><span lang="ko">브라우저에선 호출이 알아서 건너갑니다</span></h3>
            <p lang="en"><code>auth.me()</code> hits the proxy, which turns it into <code>POST /me</code> with the Symbol in the <code>x-simple-boot-ssr-intent-scheme</code> header.
            The server reads the header, finds the <code>@Sim</code> registered under <b>the same Symbol</b> and calls its <code>me()</code>.
            The method name is the path. The Symbol is the address.</p>
            <p lang="ko"><code>auth.me()</code>는 프록시를 거쳐 <code>x-simple-boot-ssr-intent-scheme</code> 헤더에 Symbol을 실은 <code>POST /me</code>가 됩니다.
            서버는 헤더를 읽고 <b>같은 Symbol</b>로 등록된 <code>@Sim</code>을 찾아 <code>me()</code>를 부릅니다.
            메서드 이름이 경로, Symbol이 주소.</p>
          </div>
          <pre class="mermaid">${RPC_BROWSER_FLOW}</pre>
        </div>

        <div class="step">
          <div class="step-copy">
            <div class="step-no">3</div>
            <h3><span lang="en">During SSR, no network at all</span><span lang="ko">SSR 중엔 네트워크조차 없습니다</span></h3>
            <p lang="en">The same component runs on the server. There, the container hands it <code>AuthBack</code> itself,
            so <b>the very same line</b> becomes a plain function call — and the current request is appended as <code>rr</code>,
            exactly like over HTTP. One signature on the server, either way.</p>
            <p lang="ko">같은 컴포넌트가 서버에서 돕니다. 거기선 컨테이너가 <code>AuthBack</code> 자체를 주입하니까
            <b>똑같은 그 한 줄</b>이 그냥 함수 호출이 됩니다 — 현재 요청은 HTTP 때와 똑같이 <code>rr</code>로 붙고요.
            서버 쪽 시그니처는 어느 길이든 하나.</p>
          </div>
          <pre class="mermaid">${RPC_SSR_FLOW}</pre>
        </div>

        <div class="nots">
          <div class="nots-title"><span lang="en">What you didn't write</span><span lang="ko">안 쓴 것들</span></div>
          <div class="nots-row">
            ${[['route tables', '라우트 테이블'], ['URL strings', 'URL 문자열'], ['fetch / axios calls', 'fetch / axios 호출'], ['DTOs & mappers', 'DTO와 매퍼'], ['if (isServer) branches', 'if (isServer) 분기']]
              .map(([en, ko]) => `<span class="not"><i class="fa-solid fa-xmark"></i><span lang="en">${en}</span><span lang="ko">${ko}</span></span>`).join('')}
          </div>
          <div class="nots-row yes">
            ${[['one interface', '인터페이스 하나'], ['one Symbol', 'Symbol 하나'], ['a method call', '메서드 호출']]
              .map(([en, ko]) => `<span class="not"><i class="fa-solid fa-check"></i><span lang="en">${en}</span><span lang="ko">${ko}</span></span>`).join('')}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <h2 lang="en">Server packages</h2><h2 lang="ko">서버 패키지</h2>
          <p lang="en">The pieces that run behind.</p><p lang="ko">뒤에서 도는 부품들.</p>
        </div>
        <div class="grid">
          ${pkgs.map(pkg => `
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
      </div>
      `;
    }

    // 브라우저에서만 SVG로 (SSG에선 no-op)
    @onConnectedAfter
    async drawFlows() {
      if (this.shadowRoot) await runMermaid(this.shadowRoot);
    }

    @eventClick('#src-btn')
    @innerHtml('.proof-out', { fallback: () => sourceStats('…', '…', '…', []) })
    async checkSource() {
      // 이 사이트는 빌드 때 미리 렌더(SSG)해서 /ssr → ssr.html 로 서빙된다. 그 원본을 그대로 받는다.
      const path = location.pathname === '/' ? '/index.html' : `${location.pathname.replace(/\/$/, '')}.html`;
      try {
        const res = await fetch(path, { cache: 'no-store' });
        const html = res.ok ? await res.text() : '';
        const shadows = (html.match(/<template shadowrootmode=/g) ?? []).length;
        const heads = [...html.matchAll(/<h3[^>]*>\s*(?:<span lang="en">)?([^<]+)/g)].map(m => m[1].trim()).filter(Boolean);
        const kb = (new Blob([html]).size / 1024).toFixed(1);
        return sourceStats(kb, String(shadows), String(heads.length), heads.slice(0, 3));
      } catch {
        return sourceStats('?', '?', '?', []);
      }
    }

    @eventClickDelegate('[data-path]')
    onNavigate(e: any) {
      const path = e.target.closest('[data-path]')?.dataset?.path;
      if (path) this.router?.go(path);
    }
  }
  return tagName;
};
