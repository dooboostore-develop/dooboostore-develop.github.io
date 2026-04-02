import { Router } from '@dooboostore/core-web';
import {
  appMessage, attribute, elementDefine, event, eventBeforeReturn, eventClick, eventObject, eventWindow, fetch, intersectionObserver, setInterval, fetchSettled, helperHostSet, innerHtml, matchedElement,
  mutationObserver, onConnectedAfter, onConnectedBefore, onConnectedBodyShadow, onInitialize, publishSwcAppMessage, query, resizeObserver,
  subscribeSwcAppMessage, updateClass, updateStyle
} from '@dooboostore/simple-web-component';
import type { HelperHostSet, SwcAppMessage } from '@dooboostore/simple-web-component';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { HOME_META, SITE_URL, GITHUB_URL } from '@/data/packages';
// 버전·라이선스는 실제 package.json 에서 — 손으로 적으면 금방 거짓이 된다
import swcPkg from '../../../packages/@dooboostore/simple-web-component/package.json';

hljs.registerLanguage('typescript', typescript);
const ts = (code: string) => hljs.highlight(code.trim(), { language: 'typescript' }).value;
// 다국어 한 쌍
const t = (en: string, ko: string) => `<span lang="en">${en}</span><span lang="ko">${ko}</span>`;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const HOME_ECHO = 'home:echo';
const REVEAL_CARDS: Array<[string, string]> = [['🍣', 'Sushi'], ['🍕', 'Pizza'], ['🍜', 'Ramen'], ['🌮', 'Taco'], ['🥐', 'Croissant'], ['🍩', 'Donut'], ['🍦', 'Gelato'], ['🥗', 'Salad']];
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// "이 사이트가 증거" — 회사 홈페이지에 필요한 것 중 이 사이트에서 실제로 돌아가는 것만
const SITE_REPO_URL = 'https://github.com/dooboostore-develop/dooboostore-develop.github.io';
const BUILT_WITH: Array<[string, string, string]> = [
  ['fa-language', 'Korean / English switch (top right)', '한국어 / 영어 전환 (오른쪽 위)'],
  ['fa-magnifying-glass', 'A title, description and share image per page (SEO)', '페이지마다 제목·설명·공유 이미지 (SEO)'],
  ['fa-bolt', 'HTML pre-rendered at build time + sitemap, so search engines read it without JS', '빌드 때 HTML 미리 생성 + sitemap — 검색엔진이 JS 없이 읽음'],
  ['fa-rocket', 'Push to main → deployed to GitHub Pages automatically', 'main 에 푸시 → GitHub Pages 자동 배포'],
  ['fa-vial-circle-check', 'Every page click-tested in a real browser before each deploy', '배포 전 모든 페이지를 실제 브라우저로 클릭 테스트'],
  ['fa-mobile-screen', 'Works on phones', '모바일 대응'],
];

// 히어로 티커: "이제 안 써도 되는 것" — 하나하나 이 페이지의 데모가 증거
const NOPES = [
  'clearInterval(id)',            // 타이머 데모
  'removeEventListener(…)',       // 누수 테스트
  'observer.disconnect()',        // 옵저버 데모
  'new IntersectionObserver(…)',  // 스크롤 데모
  "fetch('/api/me')",             // Symbol RPC (SSR 페이지)
  'try { await fetch() } catch',  // @fetch 데모
  'useState() / useEffect()',     // 메서드는 값을 반환할 뿐
];

// 누수 테스트: 프로브 1,000개를 붙였다 떼고, 뗀 뒤에도 돌고 있는 리스너·타이머를 센다 (모듈 안 카운터)
const LEAK = { connected: 0, answers: 0, ticks: 0 };
const LEAK_N = 1000;
const LEAK_PING = 'swc-leak-ping';
const leakStats = (mounted: string, answered: string, listening: string, ticking: string) => `
  <div class="ls"><div class="lv">${mounted}</div><div class="ll">${t('mounted', '붙임')}</div></div>
  <div class="ls"><div class="lv">${answered}</div><div class="ll">${t('answered the ping', '핑에 응답')}</div></div>
  <div class="ls zero"><div class="lv">${listening}</div><div class="ll">${t('still listening after removal', '뗀 뒤에도 듣는 리스너')}</div></div>
  <div class="ls zero"><div class="lv">${ticking}</div><div class="ll">${t('timers still ticking', '아직 도는 타이머')}</div></div>`;
// 제목에서 '누수 0' 을 단정하는 근거: scripts/smoke.mjs 가 배포 때마다 이 버튼을 눌러 1,000/1,000/0/0 이 아니면 배포를 막는다.
const LEAK_DEMO = {
  kicker: ["Don't take our word for it", '믿지 말고 눌러보세요'] as [string, string],
  title: ['Mount 1,000, remove 1,000. Zero leaks. Press it and see.', '1,000개 붙였다 떼도 누수 0. 지금 눌러서 확인하세요.'] as [string, string],
  stage: `
      <div class="leak-stats">${leakStats('0', '0', '–', '–')}</div>
      <button class="demo-btn" id="leak-btn">${t('Mount 1,000 → remove all', '1,000개 붙이기 → 전부 떼기')}</button>
      <div class="leak-stage" hidden></div>`,
  cap: ['Each probe owns a timer and a window listener. Every listener, timer and observer a decorator creates is torn down when the element leaves — this button measures the listeners and timers, live.',
    '프로브마다 타이머 하나, window 리스너 하나. 데코레이터가 만든 리스너·타이머·옵저버는 엘리먼트가 떠나면 전부 정리됩니다 — 이 버튼은 그중 리스너와 타이머를 지금 직접 잽니다.'] as [string, string],
  code: `
@elementDefine('leak-probe', { window: w })
class LeakProbe extends w.HTMLElement {
  @setInterval(100, { type: 'onConnected' })
  tick() { stats.ticks++; }

  @eventWindow('swc-leak-ping')
  pong() { stats.answers++; }
}

// the button: mount 1,000 → ping (all answer)
// → remove all → reset → ping again → wait → count
// no removeEventListener, no clearInterval anywhere`,
};

// 신뢰 표시줄 — 전부 확인 가능한 사실 (2026-10-03 기준 수치는 주석의 출처에서)
const NPM_URL = `https://www.npmjs.com/package/${swcPkg.name}`;
const TRUST: Array<{ v: string; l: [string, string]; href?: string }> = [
  { v: `v${swcPkg.version}`, l: [`on npm · ${swcPkg.license}`, `npm 배포 · ${swcPkg.license}`], href: NPM_URL },
  // simple-web-component test/unit — Playwright 로 실제 Chromium 에서 실행
  { v: '170+', l: ['real-browser tests — Chromium, no jsdom', '실브라우저 테스트 — Chromium, jsdom 없음'], href: `${GITHUB_URL}/tree/main/@dooboostore/simple-web-component/test/unit` },
  // 각 package.json dependencies 기준
  { v: '11 / 14', l: ['packages with zero third-party runtime deps', '서드파티 런타임 의존성 0인 패키지'] },
  // packages/@dooboostore/*/src 의 .ts 줄 수
  { v: '85k', l: ['lines of TypeScript, written from scratch', '줄의 TypeScript, 밑바닥부터'] },
];

// "일부러 초기" — 작다는 걸 숨기지 않고, 목표는 목표라고 밝힌다
const GOALS: Array<[string, string]> = [
  ['TC39 standard decorators — no <code>experimentalDecorators</code> flag', 'TC39 표준 데코레이터 — <code>experimentalDecorators</code> 없이'],
  ['A one-command starter project', '명령 한 줄짜리 스타터 프로젝트'],
  ['More example apps and a component gallery', '예제 앱과 컴포넌트 갤러리 늘리기'],
  ['Whatever your use case needs — tell us in an issue', '당신의 쓰임새에 필요한 것 — 이슈로 알려주세요'],
];

// 데모 카드: 왼쪽 무대(직접 만져보는 곳) + 오른쪽 그 무대를 움직이는 실제 코드.
// 코드 스니펫은 아래 클래스의 실제 구현과 같다 (다국어·긴 문자열, 데모 시각화용 표시 코드만 줄임).
type Demo = { kicker: [string, string]; title: [string, string]; stage: string; cap: [string, string]; code: string };
const DEMOS: Demo[] = [
  {
    kicker: ['Click → the screen updates', '클릭하면 화면이 바뀐다'],
    title: ['Two decorators. The screen updates. That\'s it.', '데코레이터 두 줄. 화면이 바뀝니다. 끝.'],
    stage: `
      <div class="demo-out click-out">${t('Click the button.<br><span class="n">0</span> clicks so far.', '버튼을 눌러보세요.<br>지금까지 <span class="n">0</span>번.')}</div>
      <button class="demo-btn" id="click-btn">${t('Click me', '눌러보기')}</button>`,
    cap: ['No setState. No store. The method on the right is the whole app.', 'setState도 스토어도 없음. 오른쪽 메서드가 앱 전부.'],
    code: `
private clicks = 0;

@event('#click-btn', 'click')   // when: clicked
@innerHtml('.click-out')        // where: output div
onClick() {
  this.clicks++;
  return \`\${this.clicks} clicks so far.\`;
}`,
  },
  {
    kicker: ['Load data from a server', '서버에서 데이터 불러오기'],
    title: ['Zero try/catch. Loading, cancel and errors still handled.', 'try/catch 0줄. 그래도 로딩·취소·에러까지 처리.'],
    stage: `
      <div class="demo-out fetch-out">${t('Press load — a real GET goes out.', '불러오기를 눌러보세요 — 진짜 GET이 나갑니다.')}</div>
      <button class="demo-btn" id="fetch-btn">${t('Load post #1', '글 #1 불러오기')}</button>
      <div class="meta">jsonplaceholder.typicode.com</div>`,
    cap: ['Mash it: only the last request survives (Network tab shows the rest cancelled). Failure arrives as data, not a throw.', '연타해 보세요: 마지막 요청만 살아남음 (네트워크 탭에 나머진 취소). 실패도 throw가 아니라 데이터로.'],
    code: `
@event('#fetch-btn', 'click')
// shown while the request is pending
@innerHtml('.fetch-out', { fallback: () => 'Loading…' })
// click again → the previous request is aborted
@fetch({ url: POST_URL, abortPrevious: true })
async load(@fetchSettled settled?: Settled<Post>) {
  if (settled?.status !== 'fulfilled')
    return 'Failed — but no throw.';
  return \`<b>\${settled.value.title}</b>\`;
}`,
  },
  {
    kicker: ['Update every second', '매초 갱신하기'],
    title: ['Zero clearInterval. Leave the page and it stops itself.', 'clearInterval 0줄. 페이지를 떠나면 알아서 멈춥니다.'],
    stage: `
      <div class="clock-ring"><div class="clock-face"><div class="clock-time">--:--:--</div><div class="clock-sub">@setInterval</div></div></div>`,
    cap: ['Ticks every second. Leave this page and it stops by itself — the timer belongs to the element.', '매초 똑딱. 이 페이지를 떠나면 알아서 멈춥니다 — 타이머가 엘리먼트에 묶여 있어요.'],
    code: `
@setInterval(1000, { type: 'onConnected' })
@innerHtml('.clock-time', { valueKey: 'time' })
@updateStyle('.clock-ring', { valueKey: 'ring' })
tick() {
  const now = new Date();
  const deg = now.getSeconds() * 6;
  return {
    time: now.toTimeString().slice(0, 8),  // 19:31:33
    ring: { background:
      \`conic-gradient(#FF385C \${deg}deg, #1E1E1E 0)\` },
  };
}
// no clearInterval — it stops when the element leaves`,
  },
  {
    kicker: ['Components talking to each other', '컴포넌트끼리 대화하기'],
    title: ['Zero wiring. Return a value — anyone in the app receives it.', '연결 코드 0줄. 반환하면 앱 어디서든 받습니다.'],
    stage: `
      <input class="echo-in" placeholder="Type something…" autocomplete="off">
      <div class="demo-out echo-out">${t('Waiting for a message…', '메시지 기다리는 중…')}</div>`,
    cap: ['The publisher doesn\'t know who listens. The subscriber could live anywhere in the app — the header uses this for the language switch.', '발행자는 누가 듣는지 모름. 구독자는 앱 어디에 있어도 됨 — 상단 언어 전환도 이걸로 돎.'],
    code: `
@event('.echo-in', 'input')
@publishSwcAppMessage('home:echo')  // return = message
publish(@matchedElement input: HTMLInputElement) {
  return input.value;
}

@subscribeSwcAppMessage('home:echo', {
  subject: 'behavior',   // late joiners replay the last
})
@innerHtml('.echo-out')
show(@appMessage msg: SwcAppMessage<string>) {
  return msg.data || 'Waiting for a message…';
}`,
  },
  {
    kicker: ['Scroll animations', '스크롤 애니메이션'],
    title: ['Never create or tear down an IntersectionObserver again.', 'IntersectionObserver, 만들 일도 해제할 일도 없습니다.'],
    stage: `
      <div class="reveal-box">${REVEAL_CARDS.map(([e, n]) => `<div class="reveal-card"><span>${e}</span>${n}</div>`).join('')}</div>
      <div class="demo-out mono reveal-count">0 / ${REVEAL_CARDS.length} in view</div>`,
    cap: ['No IntersectionObserver setup, no unobserve on teardown — one decorator, and it\'s all cleaned up when the element leaves.', 'IntersectionObserver 생성도, 해제도 직접 안 함 — 데코레이터 하나, 엘리먼트가 떠나면 알아서 정리.'],
    code: `
private seen = new Set<Element>();

@intersectionObserver('.reveal-card', {
  threshold: 0.6,
})
@updateClass('.reveal-card', {
  root: 'auto', valueKey: 'cls',
})
@innerHtml('.reveal-count', { valueKey: 'count' })
onReveal(_els: unknown,
         entries: IntersectionObserverEntry[]) {
  for (const e of entries)
    e.isIntersecting ? this.seen.add(e.target)
                     : this.seen.delete(e.target);
  return {
    cls: { on: (el: Element) => this.seen.has(el) },
    count: \`\${this.seen.size} / 8 in view\`,
  };
}`,
  },
  {
    kicker: ['Check → prepare → run → clean up', '검사 → 준비 → 실행 → 정리'],
    title: ['Check, prepare, run, clean up — all on one method.', '검사·준비·실행·정리, 메서드 하나에 다 붙습니다.'],
    stage: `
      <label class="agree"><input type="checkbox" class="agree-box"><span>${t('I agree to buy a very real tofu', '진짜 두부 사는 데 동의합니다')}</span></label>
      <button class="demo-btn" id="buy-btn">${t('Buy', '구매')}</button>
      <div class="pipe">${['filter', 'before', 'handler', 'finally'].map(h => `<span class="hook" data-step="${h}">${h}</span>`).join('<i class="fa-solid fa-angle-right"></i>')}</div>
      <div class="demo-out mono buy-out">${t('Try it unchecked first.', '먼저 체크 없이 눌러보세요.')}</div>`,
    cap: ['filter gates it, before prepares data and injects it, finally always cleans up. The same four hooks exist on every trigger.', 'filter가 막고, before가 데이터를 준비해 꽂고, finally가 항상 정리. 모든 트리거에 같은 네 훅이 있어요.'],
    code: `
@eventClick('#buy-btn', {
  filter: (_e, { currentThis: c }) => c.agreed(),
  before: async () => {
    await sleep(900);               // pretend work
    return 'TOFU-' + randomDigits(4); // → injected
  },
  finally: (_e, { currentThis: c }) => c.unlock(),
})
@innerHtml('.buy-out')
onBuy(@eventBeforeReturn orderId: string) {
  return \`✓ Order \${orderId} placed\`;
}`,
  },
  {
    kicker: ['Take only what you need', '필요한 것만 골라 받기'],
    title: ['Zero argument order to memorize. Ask by name, it arrives.', '외울 인자 순서 0개. 이름으로 달라면 옵니다.'],
    stage: `
      <div class="picks">
        <button class="pick" data-name="apple">🍎</button>
        <button class="pick" data-name="lemon">🍋</button>
        <button class="pick" data-name="grape">🍇</button>
      </div>
      <div class="demo-out mono inject-out">${t('Pick one.', '하나 골라보세요.')}</div>`,
    cap: ['No positional arguments to memorize. Swap the parameters around — it still works.', '외울 인자 순서 없음. 파라미터 자리를 바꿔도 그대로 동작.'],
    code: `
@event('.pick', 'click', { delegate: true })
@innerHtml('.inject-out')
onPick(
  @helperHostSet h: HelperHostSet,   // $this, $q …
  @eventObject e: MouseEvent,        // DOM event
  @matchedElement item: HTMLElement, // the .pick
) {
  const host = h.$this.localName;
  return \`\${item.dataset.name} · \${e.type} · \${host}\`;
}`,
  },
  {
    kicker: ['Watch size and changes', '크기·변화 감지하기'],
    title: ['Stack as many as you like — still one MutationObserver, one ResizeObserver.', '몇 개를 쌓든 MutationObserver·ResizeObserver는 딱 하나씩.'],
    stage: `
      <div class="chips"></div>
      <div class="row">
        <button class="demo-btn sm" id="chip-add">${t('+ chip', '+ 칩')}</button>
        <button class="demo-btn sm ghost" id="chip-remove">${t('− chip', '− 칩')}</button>
      </div>
      <div class="demo-out mono chip-out">0 chips · 0px</div>
      <div class="rs-box">${t('resize me', '크기를 바꿔보세요')}</div>
      <input class="rs-range" type="range" min="120" max="320" value="220" aria-label="box width">
      <div class="demo-out mono rs-out">—</div>
      <div class="meta obs-count"></div>`,
    cap: ['However many observer decorators you stack, the element shares one MutationObserver and one ResizeObserver.', '옵저버 데코레이터를 몇 개 쌓든, 엘리먼트당 MutationObserver 하나와 ResizeObserver 하나를 공유.'],
    code: `
// shadow root resolved for you
@query('.chips') declare chips: HTMLElement;

@mutationObserver('.chips', { childList: true })
@resizeObserver('.chips')          // same box
@innerHtml('.chip-out')
onChips() {
  const { children, offsetHeight } = this.chips;
  return \`\${children.length} chips · \${offsetHeight}px\`;
}

@event('.rs-range', 'input')       // slider → box width
@updateStyle('.rs-box')
onRange(@matchedElement r: HTMLInputElement) {
  return { width: \`\${r.value}px\` };
}

@resizeObserver('.rs-box')         // any size change
@innerHtml('.rs-out')
onBoxResize([box]: HTMLElement[]) {
  return \`\${box.offsetWidth} × \${box.offsetHeight}\`;
}`,
  },
];

const demoHtml = (d: Demo) => `
  <section class="demo">
    <div class="demo-head">
      <div class="kicker">${t(d.kicker[0], d.kicker[1])}</div>
      <h2>${t(d.title[0], d.title[1])}</h2>
    </div>
    <div class="demo-box">
      <div class="demo-stage">
        ${d.stage}
        <div class="demo-cap">${t(d.cap[0], d.cap[1])}</div>
      </div>
      <pre><code class="hljs language-typescript">${ts(d.code)}</code></pre>
    </div>
  </section>`;

export default (w: Window) => {
  const tagName = 'app-home-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  // 누수 테스트용 프로브 — 타이머 하나, window 리스너 하나
  if (!w.customElements.get('leak-probe')) {
    @elementDefine('leak-probe', { window: w })
    class LeakProbe extends w.HTMLElement {
      @onConnectedAfter
      ready() { LEAK.connected++; }

      @setInterval(100, { type: 'onConnected' })
      tick() { LEAK.ticks++; }

      @eventWindow(LEAK_PING)
      pong() { LEAK.answers++; }
    }
  }

  @elementDefine(tagName, { window: w })
  class HomePage extends w.HTMLElement {
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
        title: HOME_META.title,
        description: HOME_META.description,
        url: SITE_URL + HOME_META.path,
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

        .hero { padding: 104px 40px 70px; text-align: center; max-width: 1100px; margin: 0 auto; }
        .eyebrow { display: inline-block; font-size: 12px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: #FF385C;
          border: 1px solid rgba(255, 56, 92, 0.35); border-radius: 999px; padding: 8px 18px; margin-bottom: 36px; }
        .eyebrow p { margin: 0; }
        .hero h1 { font-size: 76px; font-weight: 850; letter-spacing: -4px; margin: 0 0 32px; color: #FFF; line-height: 1.02; }
        .highlight {
          background: linear-gradient(120deg, #FF385C 0%, #ff6b86 25%, #ff1a43 50%, #ff6b86 75%, #FF385C 100%);
          background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: aurora 8s linear infinite; filter: drop-shadow(0 0 12px rgba(255, 56, 92, 0.4)); display: inline-block;
        }
        @keyframes aurora { from { background-position: 0% center; } to { background-position: 200% center; } }
        .hero p { font-size: 21px; color: #777; max-width: 760px; margin: 0 auto; line-height: 1.65; }
        .cta-row { display: flex; gap: 14px; justify-content: center; margin-top: 48px; flex-wrap: wrap; }
        .btn { padding: 16px 28px; border-radius: 14px; font-weight: 800; font-size: 15px; cursor: pointer; border: 1px solid #2A2A2A;
          background: #141414; color: #DDD; display: inline-flex; align-items: center; gap: 10px; transition: 0.2s; }
        .btn:hover { transform: translateY(-2px); border-color: #444; color: #FFF; }
        .btn.primary { background: #FF385C; border-color: #FF385C; color: #FFF; box-shadow: 0 10px 30px rgba(255, 56, 92, 0.25); }
        .btn.primary:hover { background: #E31C5F; }

        .trust { max-width: 1100px; margin: 10px auto 30px; padding: 0 40px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .trust-item { display: block; text-decoration: none; text-align: center; padding: 20px 14px; border-radius: 16px; background: #0E0E0E; border: 1px solid #1A1A1A; transition: 0.15s; }
        a.trust-item:hover { border-color: #FF385C; }
        .trust-item .v { font-size: 30px; font-weight: 850; color: #FFF; letter-spacing: -1px; line-height: 1.1; }
        .trust-item .l { margin-top: 8px; font-size: 12.5px; color: #777; line-height: 1.45; }
        .early { max-width: 1200px; margin: 50px auto 0; padding: 40px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: center; }
        .early h2 { font-size: 40px; font-weight: 850; letter-spacing: -1.5px; color: #FFF; margin: 0 0 18px; line-height: 1.1; }
        .early p { font-size: 16px; color: #888; line-height: 1.75; margin: 0; }
        .cta-row.left { justify-content: flex-start; margin-top: 26px; }
        a.btn { text-decoration: none; }
        .goals { padding: 28px; border-radius: 20px; background: #0E0E0E; border: 1px solid #1F1F1F; }
        .goals-title { font-size: 12px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FF385C; margin-bottom: 16px; }
        .goals ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .goals li { display: flex; gap: 12px; align-items: baseline; color: #DDD; font-size: 15px; line-height: 1.5; }
        .goals li i { color: #FF385C; font-size: 12px; }
        .goals code { background: rgba(255, 56, 92, 0.1); color: #FF6B86; padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }
        .goals-note { margin-top: 18px; font-size: 13px; color: #666; }
        .demo { max-width: 1200px; margin: 0 auto; padding: 40px 40px 20px; }
        .demo-head { margin: 0 0 18px 6px; }
        .kicker { font-size: 12px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FF385C; margin-bottom: 8px; }
        .demo-head h2 { font-size: 28px; font-weight: 850; letter-spacing: -1px; color: #FFF; margin: 0; }
        .demo-box { display: grid; grid-template-columns: 1fr 1.15fr; gap: 56px; align-items: center;
          padding: 40px; border: 1px solid #222; border-radius: 22px; background: #0E0E0E; }
        .demo-box > * { min-width: 0; }
        .demo-stage { text-align: center; }
        .demo-out { font-size: 22px; font-weight: 800; color: #FFF; margin: 0 0 24px; min-height: 64px; line-height: 1.5; }
        .demo-out .n { color: #FF385C; font-size: 40px; }
        .demo-out.mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 15px; font-weight: 600; color: #DDD; min-height: 0; margin: 14px 0; }
        .demo-btn { display: inline-block; padding: 16px 34px; border-radius: 14px; font-weight: 800; font-size: 16px; cursor: pointer;
          background: #FF385C; color: #FFF; border: none; transition: 0.15s; }
        .demo-btn:hover { background: #E31C5F; }
        .demo-btn:active { transform: scale(0.96); }
        .demo-btn.sm { padding: 10px 20px; font-size: 14px; border-radius: 10px; }
        .demo-btn.ghost { background: rgba(255,255,255,0.06); color: #CCC; }
        .demo-btn.ghost:hover { background: rgba(255,255,255,0.12); }
        .demo-cap { margin-top: 18px; font-size: 13px; color: #666; line-height: 1.6; }
        .meta { margin-top: 12px; font-size: 12px; color: #555; font-family: 'JetBrains Mono', monospace; }
        .row { display: flex; gap: 8px; justify-content: center; }

        .picks { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; }
        .pick { font-size: 30px; width: 64px; height: 64px; border-radius: 16px; cursor: pointer; background: #161616; border: 1px solid #2A2A2A; transition: 0.15s; }
        .pick:hover { border-color: #FF385C; transform: translateY(-2px); }
        .echo-in { width: 100%; max-width: 340px; padding: 14px 16px; border-radius: 12px; border: 1px solid #2A2A2A; background: #141414;
          color: #FFF; font-size: 16px; outline: none; margin-bottom: 18px; }
        .echo-in:focus { border-color: #FF385C; }
        .chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; min-height: 34px; max-width: 340px; margin: 0 auto 14px;
          padding: 6px; border: 1px dashed #2A2A2A; border-radius: 12px; }
        .chips span { padding: 4px 10px; border-radius: 999px; background: rgba(255, 56, 92, 0.15); color: #FF6B86; font-size: 13px; font-weight: 700; }
        .rs-box { overflow: hidden; width: 220px; height: 70px; max-width: 100%; transition: width 0.08s;
          margin: 18px auto 0; border: 1px solid #FF385C; border-radius: 12px; background: rgba(255, 56, 92, 0.06);
          display: flex; align-items: center; justify-content: center; font-size: 13px; color: #FF6B86; font-weight: 700; }

        .rs-range { display: block; width: 100%; max-width: 320px; margin: 14px auto 0; accent-color: #FF385C; }
        .built { max-width: 1200px; margin: 10px auto 30px; padding: 36px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; align-items: center;
          border-radius: 24px; background: linear-gradient(135deg, rgba(255, 56, 92, 0.10), rgba(255, 56, 92, 0.02)); border: 1px solid rgba(255, 56, 92, 0.25); }
        .built h2 { font-size: 30px; font-weight: 850; color: #FFF; letter-spacing: -1px; margin: 0 0 12px; line-height: 1.2; }
        .built p { margin: 0; color: #999; font-size: 15.5px; line-height: 1.7; }
        .built-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .built-list li { display: flex; gap: 12px; align-items: baseline; padding: 12px 16px; border-radius: 12px; background: #0E0E0E; border: 1px solid #1F1F1F; color: #DDD; font-size: 14.5px; }
        .built-list i { color: #FF385C; width: 18px; text-align: center; }
        .punchline { margin: 22px auto 0; font-size: 18px; font-weight: 800; color: #FFF; letter-spacing: -0.3px; }
        .nope { margin: 34px auto 0; font-size: 17px; color: #777; display: flex; gap: 12px; justify-content: center; align-items: baseline; flex-wrap: wrap; }
        .nope-word { min-width: 280px; text-align: left; }
        .nope-word s { position: relative; text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 19px; color: #DDD;
          animation: nope-in 0.35s ease-out; }
        .nope-word s::after { content: ''; position: absolute; left: -4px; right: 100%; top: 52%; height: 3px; border-radius: 2px; background: #FF385C;
          animation: nope-strike 0.5s 0.45s cubic-bezier(0.6, 0, 0.2, 1) forwards; }
        @keyframes nope-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes nope-strike { to { right: -4px; } }
        .leak-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
        .ls { padding: 16px 10px; border-radius: 14px; background: #121212; border: 1px solid #1E1E1E; }
        .ls .lv { font-size: 34px; font-weight: 850; color: #FFF; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
        .ls .ll { margin-top: 4px; font-size: 12px; color: #777; }
        .ls.zero { border-color: rgba(255, 56, 92, 0.45); background: rgba(255, 56, 92, 0.07); }
        .ls.zero .lv { color: #FF385C; }
        #leak-btn[disabled] { opacity: 0.5; cursor: wait; }
        .clock-ring { width: 190px; height: 190px; border-radius: 50%; margin: 0 auto 6px; padding: 10px; background: conic-gradient(#FF385C 0deg, #1E1E1E 0);
          box-shadow: 0 0 40px rgba(255, 56, 92, 0.18); transition: background 0.3s; }
        .clock-face { width: 100%; height: 100%; border-radius: 50%; background: #0B0B0B; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .clock-time { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700; color: #FFF; }
        .clock-sub { margin-top: 6px; font-size: 12px; color: #FF6B86; font-family: 'JetBrains Mono', monospace; }
        .agree { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #CCC; font-size: 14px; cursor: pointer; }
        .agree input { width: 18px; height: 18px; accent-color: #FF385C; }
        .demo-btn[disabled] { opacity: 0.5; cursor: wait; }
        .pipe { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 20px 0 6px; flex-wrap: wrap; }
        .pipe i { color: #444; font-size: 12px; }
        .hook { padding: 6px 11px; border-radius: 999px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; font-weight: 700;
          background: #151515; border: 1px solid #262626; color: #777; transition: 0.2s; }
        .hook.run { color: #FFF; border-color: #FFB020; background: rgba(255, 176, 32, 0.15); }
        .hook.ok { color: #FFF; border-color: #FF385C; background: rgba(255, 56, 92, 0.18); }
        .hook.no { color: #FF6B86; border-color: #5A1A26; background: #1A0D10; text-decoration: line-through; }
        .reveal-box { height: 210px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 12px; max-width: 340px; margin: 0 auto;
          border: 1px dashed #2A2A2A; border-radius: 16px; scroll-snap-type: y proximity; }
        .reveal-card { flex: none; display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: 14px; background: #121212; border: 1px solid #1E1E1E;
          color: #555; font-weight: 800; font-size: 16px; opacity: 0.35; transform: scale(0.94); transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .reveal-card span { font-size: 26px; filter: grayscale(1); transition: filter 0.35s; }
        .reveal-card.on { opacity: 1; transform: scale(1); color: #FFF; border-color: rgba(255, 56, 92, 0.5);
          background: linear-gradient(120deg, rgba(255, 56, 92, 0.16), rgba(255, 56, 92, 0.03)); }
        .reveal-card.on span { filter: none; }
        pre { margin: 0; background: #0D1117; border: 1px solid #22272E; border-radius: 18px; padding: 26px 28px; overflow-x: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }
        pre code { background: transparent; color: #C9D1D9; padding: 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13.5px; line-height: 1.7; }

        .doors { max-width: 1100px; margin: 0 auto; padding: 60px 40px 100px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .door { padding: 44px 34px; border-radius: 24px; background: #111; border: 1px solid #1A1A1A; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; gap: 16px; text-align: left; }
        .door:hover { background: #161616; border-color: #FF385C; transform: translateY(-4px); }
        .door .icon { font-size: 26px; width: 56px; height: 56px; background: #1A1A1A; border-radius: 14px; display: flex; align-items: center;
          justify-content: center; color: #FF385C; transition: 0.2s; }
        .door:hover .icon { background: #FF385C; color: #FFF; }
        .door h2 { font-size: 26px; font-weight: 850; margin: 0; color: #FFF; letter-spacing: -1px; }
        .door p { font-size: 15px; color: #777; line-height: 1.65; margin: 0; }
        .door .go { margin-top: auto; color: #FF385C; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 8px;
          text-transform: uppercase; letter-spacing: 1px; }

        @media (max-width: 900px) {
          .trust { grid-template-columns: repeat(2, 1fr); }
          .early { grid-template-columns: 1fr; padding: 30px 20px; }
          .built { grid-template-columns: 1fr; margin: 10px 16px 30px; padding: 24px 18px; }
          .built h2 { font-size: 24px; }
          .early h2 { font-size: 30px; }
          .doors { grid-template-columns: 1fr; }
          .demo-box { grid-template-columns: 1fr; gap: 28px; }
        }
        @media (max-width: 768px) {
          .hero { padding: 64px 22px 40px; }
          .hero h1 { font-size: 44px; letter-spacing: -2px; }
          .hero p { font-size: 17px; }
          .nope { font-size: 15px; }
          .nope-word { min-width: 0; text-align: center; }
          .nope-word s { font-size: 15px; }
          .doors { padding-left: 20px; padding-right: 20px; }
          .demo, .trust { padding-left: 20px; padding-right: 20px; }
          .demo-head h2 { font-size: 22px; }
          .demo-box { padding: 26px 20px; }
          pre { padding: 18px; }
          pre code { font-size: 12px; }
        }
      </style>

      <div class="hero">
        <div class="eyebrow"><p lang="en">a TypeScript framework on web standards</p><p lang="ko">웹 표준 위의 TypeScript 프레임워크</p></div>
        <h1>${t('Return a value.<br><span class="highlight">We\'ll put it everywhere.</span>', '값을 반환하세요.<br><span class="highlight">나머지는 우리가 둡니다.</span>')}</h1>
        <p lang="en">
          Build company sites and web apps out of standard Web Components.
          Buttons that update the screen, data that loads itself, pages search engines can read —
          <b>each in a few lines</b>.
        </p>
        <p lang="ko">
          표준 Web Components로 회사 홈페이지와 웹앱을 만듭니다.
          누르면 바뀌는 화면, 알아서 불러오는 데이터, 검색엔진이 읽는 페이지까지 —
          <b>각각 몇 줄이면 돼요</b>.
        </p>
        <div class="punchline">${t('No React. No virtual DOM. No state library.', 'React 없이. 가상 DOM 없이. 상태관리 라이브러리 없이.')}</div>
        <div class="cta-row">
          <div class="btn primary" data-path="/start"><i class="fa-solid fa-rocket"></i> ${t('Start in 5 minutes', '5분 만에 시작')}</div>
          <div class="btn" data-path="/package/simple-web-component/examples"><i class="fa-solid fa-play"></i> ${t('See it run', '돌아가는 거 보기')}</div>
        </div>
      </div>


      <section class="built">
        <div class="built-copy">
          <div class="kicker">${t('Can I build a homepage with it?', '이걸로 홈페이지 만들 수 있어요?')}</div>
          <h2>${t('Proof? You\'re reading it.', '증거요? 지금 보고 계신 이 사이트입니다.')}</h2>
          <p>${t('Everything a company site needs is already running on the page you are reading:', '회사 홈페이지에 필요한 것들이 지금 이 페이지에서 이미 돌아가고 있어요:')}</p>
          <div class="cta-row left">
            <div class="btn primary" data-path="/start"><i class="fa-solid fa-rocket"></i> ${t('Make one like this', '이 사이트처럼 만들기')}</div>
            <a class="btn" href="${SITE_REPO_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> ${t('Read this site\'s source', '이 사이트 소스 보기')}</a>
          </div>
        </div>
        <ul class="built-list">
          ${BUILT_WITH.map(([icon, en, ko]) => `<li><i class="fa-solid ${icon}"></i>${t(en, ko)}</li>`).join('')}
        </ul>
      </section>

      ${DEMOS.map(demoHtml).join('')}

      <!-- 편한 걸 다 보여준 다음에: 튼튼함의 증거 -->
      <div class="nope">${t("For those who've been there — you won't write", '고생해 본 분들께 — 이제 안 써도 되는 것')} <span class="nope-word"><s>${NOPES[0]}</s></span></div>
      ${demoHtml(LEAK_DEMO)}

      <div class="trust">
        ${TRUST.map(x => `<${x.href ? `a href="${x.href}" target="_blank" rel="noopener"` : 'div'} class="trust-item"><div class="v">${x.v}</div><div class="l">${t(x.l[0], x.l[1])}</div></${x.href ? 'a' : 'div'}>`).join('')}
      </div>

      <section class="early">
        <div class="early-copy">
          <div class="kicker">${t('Early, on purpose', '일부러, 초기')}</div>
          <h2>${t('Small community.<br>Short distance.', '작은 커뮤니티.<br>짧은 거리.')}</h2>
          <p lang="en">You won't find thousands of plugins here yet. What you will find: issues that land on the desk of the person who wrote the code,
          an API that is still shaped by the people using it, and a stack you can read top to bottom. Issues in Korean or English are both welcome.</p>
          <p lang="ko">아직 수천 개의 플러그인은 없습니다. 대신 이런 게 있어요: 이슈가 코드를 쓴 사람 책상에 바로 떨어지고,
          API가 아직 쓰는 사람들 손으로 다듬어지고, 스택을 위에서 아래까지 읽을 수 있습니다. <b>이슈는 한국어로 남겨도 돼요.</b></p>
          <div class="cta-row left">
            <a class="btn primary" href="${GITHUB_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> ${t('Star & watch on GitHub', 'GitHub에서 Star')}</a>
            <a class="btn" href="${GITHUB_URL}/issues" target="_blank" rel="noopener"><i class="fa-regular fa-comment"></i> ${t('Open an issue', '이슈 남기기')}</a>
          </div>
        </div>
        <div class="goals">
          <div class="goals-title">${t('Where we want to go', '가고 싶은 곳')}</div>
          <ul>${GOALS.map(([en, ko]) => `<li><i class="fa-solid fa-flag"></i>${t(en, ko)}</li>`).join('')}</ul>
          <div class="goals-note">${t('Goals, not promises — tell us which one matters to you.', '약속이 아니라 목표예요 — 어떤 게 중요한지 알려주세요.')}</div>
        </div>
      </section>

      <div class="doors">
        <div class="door" data-path="/components">
          <div class="icon"><i class="fa-solid fa-box"></i></div>
          <h2>${t('Components', '컴포넌트')}</h2>
          <p lang="en">Decorator-stack Web Components. Methods return values; decorators decide where they go.</p>
          <p lang="ko">데코레이터 스택 Web Components. 메서드는 값을 반환하고, 데코레이터가 둘 곳을 정합니다.</p>
          <div class="go">${t('Enter', '들어가기')} <i class="fa-solid fa-arrow-right"></i></div>
        </div>
        <div class="door" data-path="/ssr">
          <div class="icon"><i class="fa-solid fa-network-wired"></i></div>
          <h2>SSR</h2>
          <p lang="en">Server-side rendering that doesn't render twice, and RPC (calling server functions like local ones) by Symbol.</p>
          <p lang="ko">두 번 그리지 않는 SSR(서버 사이드 렌더링), 그리고 Symbol로 오가는 RPC(서버 함수를 내 함수처럼 부르기).</p>
          <div class="go">${t('Enter', '들어가기')} <i class="fa-solid fa-arrow-right"></i></div>
        </div>
        <div class="door" data-path="/ecosystem">
          <div class="icon"><i class="fa-solid fa-layer-group"></i></div>
          <h2>${t('Ecosystem', '생태계')}</h2>
          <p lang="en">Fourteen packages, one philosophy. The full lineup at a glance.</p>
          <p lang="ko">열네 개 패키지, 하나의 철학. 전체 라인업을 한눈에.</p>
          <div class="go">${t('Enter', '들어가기')} <i class="fa-solid fa-arrow-right"></i></div>
        </div>
      </div>
      `;
    }

    // ── 1. decorator stack ──
    private clicks = 0;

    @event('#click-btn', 'click')
    @innerHtml('.click-out')
    onClick() {
      this.clicks++;
      return t(`Click the button.<br><span class="n">${this.clicks}</span> clicks so far.`, `버튼을 눌러보세요.<br>지금까지 <span class="n">${this.clicks}</span>번.`);
    }

    // ── 히어로 티커: 이것도 @setInterval ──
    private nopeIdx = 1;

    @setInterval(1800, { type: 'onConnected' })
    @innerHtml('.nope-word')
    nextNope() {
      return `<s>${NOPES[this.nopeIdx++ % NOPES.length]}</s>`;
    }

    // ── 누수 테스트: 1,000개 붙임 → 핑 → 전부 뗌 → 리셋 → 다시 핑 → 대기 → 센다 ──
    @event('#leak-btn', 'click')
    @innerHtml('.leak-stats', { fallback: () => leakStats('…', '…', '…', '…') })
    async runLeak(@matchedElement btn: HTMLButtonElement) {
      btn.disabled = true;
      const stage = this.shadowRoot!.querySelector('.leak-stage')!;
      Object.assign(LEAK, { connected: 0, answers: 0, ticks: 0 });
      for (let i = 0; i < LEAK_N; i++) stage.appendChild(this.ownerDocument.createElement('leak-probe'));
      // 전부 연결될 때까지 (최대 5초)
      for (let i = 0; i < 50 && LEAK.connected < LEAK_N; i++) await sleep(100);
      const mounted = LEAK.connected;
      w.dispatchEvent(new (w as any).Event(LEAK_PING));
      const answered = LEAK.answers;
      stage.replaceChildren();
      await sleep(300);
      Object.assign(LEAK, { answers: 0, ticks: 0 });
      w.dispatchEvent(new (w as any).Event(LEAK_PING));
      await sleep(600); // 타이머 주기(100ms)의 6배 기다려도 안 돌아야 한다
      btn.disabled = false;
      const n = (x: number) => x.toLocaleString('en-US');
      return leakStats(n(mounted), n(answered), n(LEAK.answers), n(LEAK.ticks));
    }

    // ── 타이머: 엘리먼트가 떠나면 알아서 멈춘다 ──
    @setInterval(1000, { type: 'onConnected' })
    @innerHtml('.clock-time', { valueKey: 'time' })
    @updateStyle('.clock-ring', { valueKey: 'ring' })
    tick() {
      const now = new Date();
      const deg = now.getSeconds() * 6;
      return {
        time: now.toTimeString().slice(0, 8),
        ring: { background: `conic-gradient(#FF385C ${deg}deg, #1E1E1E 0)` },
      };
    }

    // ── 훅: filter → before → handler → finally (data-step 불은 데모 시각화용) ──
    private markHook(step: string, state: 'run' | 'ok' | 'no' | '') {
      const el = this.shadowRoot?.querySelector(`.hook[data-step="${step}"]`);
      if (el) el.className = `hook ${state}`;
    }
    agreed() {
      ['filter', 'before', 'handler', 'finally'].forEach(h => this.markHook(h, ''));
      const ok = !!(this.shadowRoot?.querySelector('.agree-box') as HTMLInputElement | null)?.checked;
      this.markHook('filter', ok ? 'ok' : 'no');
      if (!ok) {
        const out = this.shadowRoot?.querySelector('.buy-out');
        if (out) out.innerHTML = t('✗ Blocked by filter — tick the box.', '✗ filter가 막음 — 체크박스를 켜세요.');
        this.shadowRoot?.querySelector('.agree')?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
      }
      return ok;
    }
    unlock() {
      (this.shadowRoot?.querySelector('#buy-btn') as HTMLButtonElement | null)?.removeAttribute('disabled');
      this.markHook('finally', 'ok');
    }

    @eventClick('#buy-btn', {
      filter: (_e, { currentThis: c }) => c.agreed(),
      before: async (_e, { currentThis: c }) => {
        c.markHook('before', 'run');
        c.shadowRoot?.querySelector('#buy-btn')?.setAttribute('disabled', '');
        await sleep(900);
        c.markHook('before', 'ok');
        return 'TOFU-' + String(Math.floor(1000 + Math.random() * 9000));
      },
      finally: (_e, { currentThis: c }) => c.unlock(),
    })
    @innerHtml('.buy-out')
    onBuy(@eventBeforeReturn orderId: string) {
      this.markHook('handler', 'ok');
      return t(`✓ Order ${orderId} placed`, `✓ 주문 ${orderId} 완료`);
    }

    // ── 2. @fetch: fallback + abortPrevious + settled ──
    @event('#fetch-btn', 'click')
    @innerHtml('.fetch-out', { fallback: () => t('Loading…', '불러오는 중…') })
    @fetch({ url: 'https://jsonplaceholder.typicode.com/posts/1', abortPrevious: true })
    async load(@fetchSettled settled?: PromiseSettledResult<any>) {
      if (settled?.status !== 'fulfilled') return t('Failed — but no throw.', '실패 — 그래도 throw 없음.');
      const title = esc(String(settled.value?.title ?? ''));
      return t(`<b>${title}</b><br>by user ${settled.value?.userId}`, `<b>${title}</b><br>작성자 ${settled.value?.userId}`);
    }

    // ── 3. order-free parameter injection ──
    @event('.pick', 'click', { delegate: true })
    @innerHtml('.inject-out')
    onPick(@helperHostSet h: HelperHostSet, @eventObject e: MouseEvent, @matchedElement item: HTMLElement) {
      return `${item.dataset.name} · ${e.type} · ${(h.$this as HTMLElement).localName}`;
    }

    // ── 4. app message bus ──
    @event('.echo-in', 'input')
    @publishSwcAppMessage(HOME_ECHO)
    publishEcho(@matchedElement input: HTMLInputElement) {
      return input.value;
    }

    @subscribeSwcAppMessage(HOME_ECHO, { subject: 'behavior' })
    @innerHtml('.echo-out')
    showEcho(@appMessage msg: SwcAppMessage<string>) {
      return msg?.data ? esc(msg.data) : t('Waiting for a message…', '메시지 기다리는 중…');
    }

    // ── 5. observers: 데코레이터 셋 → MutationObserver 1 + ResizeObserver 1 ──
    // declare: 필드 선언이 emit 되면 @query 접근자를 undefined 로 덮는다
    @query('.chips') declare chips: HTMLElement;

    @event('#chip-add', 'click')
    addChip() {
      const chip = this.ownerDocument.createElement('span');
      chip.textContent = `#${this.chips.children.length + 1}`;
      this.chips.appendChild(chip);
    }

    @event('#chip-remove', 'click')
    removeChip() {
      this.chips.lastElementChild?.remove();
    }

    @mutationObserver('.chips', { childList: true })
    @resizeObserver('.chips')
    @innerHtml('.chip-out')
    onChips() {
      return `${this.chips.children.length} chips · ${this.chips.offsetHeight}px`;
    }

    // 모서리 드래그(resize)는 터치에서 안 되므로 슬라이더로 — 반환값이 스타일, RO 는 결과 크기를 본다
    @event('.rs-range', 'input')
    @updateStyle('.rs-box')
    onRange(@matchedElement r: HTMLInputElement) {
      return { width: `${r.value}px` };
    }

    @resizeObserver('.rs-box')
    @innerHtml('.rs-out')
    onBoxResize([box]: HTMLElement[]) {
      return `${box.offsetWidth} × ${box.offsetHeight}`;
    }

    // ── 스크롤 등장: 박스 안에서 화면에 들어온 카드만 켠다 ──
    private seen = new Set<Element>();

    @intersectionObserver('.reveal-card', { threshold: 0.6 })
    @updateClass('.reveal-card', { root: 'auto', valueKey: 'cls' })
    @innerHtml('.reveal-count', { valueKey: 'count' })
    onReveal(_els: HTMLElement[], entries: IntersectionObserverEntry[]) {
      for (const e of entries) e.isIntersecting ? this.seen.add(e.target) : this.seen.delete(e.target);
      return {
        cls: { on: (el: Element) => this.seen.has(el) },
        count: `${this.seen.size} / ${REVEAL_CARDS.length} in view`,
      };
    }

    // 증거: 이 엘리먼트가 실제로 만든 옵저버 수 (연결 때마다 갱신)
    @onConnectedAfter
    @innerHtml('.obs-count')
    countObservers() {
      const list: any[] = (this as any).__swc_observers ?? [];
      const n = (C: any) => list.filter(o => o instanceof C).length;
      const win = w as any;
      return `this element → MutationObserver × ${n(win.MutationObserver)} · ResizeObserver × ${n(win.ResizeObserver)}`;
    }

    @event('[data-path]', 'click', { delegate: true })
    onNavigate(@matchedElement el: HTMLElement) {
      const path = el.dataset.path;
      if (path) this.router?.go(path);
    }
  }
  return tagName;
};
