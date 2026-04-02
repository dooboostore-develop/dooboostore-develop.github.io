import { Router } from '@dooboostore/core-web';
import { attribute, elementDefine, event, innerHtml, matchedElement, onConnectedBefore, onConnectedBodyShadow, onInitialize } from '@dooboostore/simple-web-component';
import * as SWC from '@dooboostore/simple-web-component';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { LANDING_META, SITE_URL } from '@/data/packages';

hljs.registerLanguage('typescript', typescript);
const t = (en: string, ko: string) => `<span lang="en">${en}</span><span lang="ko">${ko}</span>`;

// ── 다이어그램 (HTML/CSS — 한/영 전환·모바일 그대로) ──
// ① 큰 그림: 언제(트리거) → 무엇을(메서드) → 어디로(아웃풋). 예시는 첫 카드 코드와 같은 라우트 예제.
const HOW_CODE = `
handleRelease(route) {
  return {
    element: ReleasePage(…),
    href: 'releases',
  };
}`;
const howItWorks = () => `
  <div class="howto">
    <div class="howto-head">
      <div class="kicker">${t('How it works', '이렇게 동작해요')}</div>
      <h2>${t('When → what → where. Three parts that never meet.', '언제 → 무엇을 → 어디로. 서로 모르는 세 조각.')}</h2>
    </div>
    <div class="flow3">
      <div class="col">
        <div class="col-title">${t('① When — triggers', '① 언제 — 트리거')}</div>
        <div class="trig">${['@event(\'click\')', '@subscribeSwcAppRouteChange', '@subscribeSwcAppMessage', '@setInterval', '@resizeObserver'].map(x => `<code>${x}</code>`).join('')}</div>
        <div class="col-note">${t('Pick one or more and stack them.', '하나 이상 골라 쌓아요.')}</div>
      </div>
      <div class="arrow"><i class="fa-solid fa-arrow-right"></i></div>
      <div class="col mid">
        <div class="col-title">${t('② What — your method', '② 무엇을 — 내 메서드')}</div>
        <pre class="mini"><code class="hljs language-typescript">${ts(HOW_CODE)}</code></pre>
        <div class="hooks"><span>filter</span><i class="fa-solid fa-angle-right"></i><span>before</span><i class="fa-solid fa-angle-right"></i><b>method</b><i class="fa-solid fa-angle-right"></i><span>finally</span></div>
        <div class="col-note">${t('It just returns a value — it knows nothing about the DOM.', '값만 반환해요 — DOM은 몰라요.')}</div>
      </div>
      <div class="arrow"><i class="fa-solid fa-arrow-right"></i></div>
      <div class="col">
        <div class="col-title">${t('③ Where — outputs', '③ 어디로 — 아웃풋')}</div>
        <div class="out"><code>element</code><i class="fa-solid fa-arrow-right"></i><b>@replaceChildrenLight</b><small>${t('swaps the page content', '페이지 내용을 바꿈')}</small></div>
        <div class="out"><code>href</code><i class="fa-solid fa-arrow-right"></i><b>@attribute('nav', 'href')</b><small>${t('updates the link', '링크 주소를 바꿈')}</small></div>
        <div class="out faded">+ @innerHtml · @updateClass · @publishSwcAppMessage …</div>
        <div class="col-note">${t('valueKey splits one return value between them.', 'valueKey 가 반환값 하나를 나눠 담아요.')}</div>
      </div>
    </div>
  </div>`;

// ② 섀도우 ⇄ 라이트: 한 엘리먼트 안의 두 층, 데코레이터마다 어느 층을 볼지 고른다
const shadowLightDiagram = () => `
  <div class="dg">
    <div class="dg-host"><code>&lt;my-article&gt;</code>
      <div class="dg-layer shadow">
        <div class="dg-label">#shadow-root · ${t('the look', '겉모습')}</div>
        <code>&lt;style&gt; &lt;h1&gt; &lt;slot&gt;</code>
        <div class="dg-tags"><span>@innerHtmlShadow</span><span>@eventShadow</span></div>
      </div>
      <div class="dg-slot"><i class="fa-solid fa-arrow-up"></i> ${t('light DOM shows through &lt;slot&gt;', '라이트 DOM이 &lt;slot&gt; 자리에 보여요')}</div>
      <div class="dg-layer light">
        <div class="dg-label">light DOM · ${t('the content', '본문')}</div>
        <code>&lt;article&gt;…&lt;/article&gt;</code>
        <div class="dg-tags"><span>@innerHtmlLight</span><span>@eventDelegateLight</span></div>
      </div>
      <div class="dg-both"><b>@mutationObserverAll</b> ${t('watches both', '둘 다 감시')}</div>
    </div>
  </div>`;

// ③ 메시지 버스: 반환값이 발행, 버스가 마지막 값을 들고 있어 늦게 온 구독자도 받는다
const busDiagram = () => `
  <div class="dg bus">
    <div class="bus-node pub"><b>login-form</b><code>return user</code><small>@publishSwcAppMessage</small></div>
    <div class="bus-arrow"><i class="fa-solid fa-arrow-right"></i></div>
    <div class="bus-node pipe"><b>AUTH_CHANGED</b><small>${t('keeps the last value', '마지막 값을 들고 있음')}</small></div>
    <div class="bus-arrow"><i class="fa-solid fa-arrow-right"></i></div>
    <div class="bus-subs">
      <div class="bus-node"><b>app-header</b><small>${t('shows the name', '이름 표시')}</small></div>
      <div class="bus-node"><b>side-menu</b><small>${t('shows "My page"', '"내 페이지" 표시')}</small></div>
      <div class="bus-node late"><b>cart-badge</b><small>${t('joined later — still gets it', '나중에 붙어도 받음')} (behavior)</small></div>
    </div>
  </div>`;

const FEATURE_DIAGRAMS: Record<string, () => string> = { 'Shadow ⇄ Light': shadowLightDiagram, 'App Message Bus': busDiagram };

// 이벤트 데코레이터 이름 — 패키지의 실제 export 에서 센다 (손으로 적은 숫자 아님)
const EVENT_DECORATORS = Object.keys(SWC).filter(k => /^event[A-Z]/.test(k) && typeof (SWC as any)[k] === 'function').sort();
const searchDecorators = (q: string) => {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length ? EVENT_DECORATORS.filter(n => words.every(w => n.toLowerCase().includes(w))) : EVENT_DECORATORS;
};
const decoratorResults = (q: string) => {
  const hits = searchDecorators(q);
  const shown = hits.slice(0, 48);
  return `<div class="deco-count"><b>${hits.length}</b> ${t('matches', '개 일치')}${hits.length > shown.length ? ` · ${t(`showing ${shown.length}`, `${shown.length}개 표시`)}` : ''}</div>
    <div class="deco-chips">${shown.map(n => `<code>@${n}</code>`).join('')}</div>`;
};
const ts = (code: string) => hljs.highlight(code.trim(), { language: 'typescript' }).value;

// 홍보 문구 — 세게 말하되, 전부 실제로 참인 것만.
// 코드 패널 폭에 맞춰 한 줄 56자 안쪽으로.
const FEATURES = [
  {
    kicker: { en: 'Just Web Components', ko: '그냥 Web Components' },
    title: { en: 'Standard custom elements.<br>No runtime to adopt.', ko: '표준 커스텀 엘리먼트.<br>따라 들일 런타임 없음.' },
    text: {
      en: `Every component is a real <code>customElements.define()</code> — extend <code>HTMLElement</code>, or a built-in
      like <code>&lt;body&gt;</code> via <code>is="…"</code>. No virtual DOM, no template compiler: <b>the browser is the framework</b>.
      Drop them into plain HTML or any app that renders DOM. Pass a <code>window</code> and the same class registers into
      an iframe — or a <b>server-side DOM</b>, which is how SSR works here.`,
      ko: `모든 컴포넌트는 진짜 <code>customElements.define()</code>입니다 — <code>HTMLElement</code>를 상속하거나,
      <code>is="…"</code>로 <code>&lt;body&gt;</code> 같은 내장 엘리먼트를 확장하세요. 가상 DOM도 템플릿 컴파일러도 없습니다:
      <b>브라우저가 곧 프레임워크</b>. 순수 HTML이든 DOM을 그리는 어떤 앱이든 그냥 넣으면 됩니다. <code>window</code>를 넘기면
      같은 클래스가 iframe에도 — <b>서버 쪽 DOM</b>에도 등록됩니다. 여기 SSR이 그렇게 돌아요.`,
    },
    code: `
@elementDefine('user-card', { window: w })
class UserCard extends w.HTMLElement { … }

// customized built-in → <body is="app-body">
@elementDefine('app-body', { window: w, extends: 'body' })
class AppBody extends w.HTMLBodyElement { … }

// use it anywhere HTML goes
<user-card user-id="7"></user-card>`,
  },
  {
    kicker: { en: 'Decorator Stack', ko: '데코레이터 스택' },
    title: { en: 'Your method returns a value.<br>Decorators decide where it lands.', ko: '메서드는 값을 반환하세요.<br>데코레이터가 둘 곳을 정합니다.' },
    text: {
      en: `Triggers say <b>when</b>. Outputs say <b>where</b>. Hooks say <b>whether</b>. None of them know about each other —
      swap the trigger and the output doesn't even notice. The method body stays a pure function: no DOM, no plumbing.`,
      ko: `트리거는 <b>언제</b>, 아웃풋은 <b>어디로</b>, 훅은 <b>통과 여부</b>를 맡습니다. 서로를 모르죠 —
      트리거를 바꿔도 아웃풋은 눈치채지 못합니다. 메서드 본문은 순수 함수로 남습니다. DOM도, 배관도 없습니다.`,
    },
    code: `
// where: light DOM
@replaceChildrenLight({ valueKey: 'element' })
// when: this route
@subscribeSwcAppRouteChange('/releases/{seq}')
// where: nav[href]
@attribute('nav', 'href', { valueKey: 'href' })
handleRelease(route: RouterEventType) {
  const { seq } = route.pathData;
  return {
    element: ReleasePage(w, { attrs: { seq } }),
    href: 'releases',
  };
}`,
  },
  {
    kicker: { en: 'Shadow ⇄ Light', ko: '섀도우 ⇄ 라이트' },
    title: { en: 'Shadow DOM or light DOM.<br>Choose per decorator.', ko: '섀도우 DOM이냐 라이트 DOM이냐.<br>데코레이터마다 고르세요.' },
    text: {
      en: `Encapsulated chrome in the shadow root, crawlable content in the light DOM — <b>on the same element, at once</b>.
      Every output, event, query and observer takes <code>root: 'shadow' | 'light' | 'all' | 'auto'</code> and comes as a named
      variant: <code>innerHtmlShadow</code>, <code>eventDelegateLight</code>, <code>queryShadow</code>, <code>mutationObserverAll</code>…
      <code>auto</code> follows whether a shadow root exists, so moving a component between the two is a one-word change.`,
      ko: `캡슐화된 겉모습은 섀도우 루트에, 검색되는 본문은 라이트 DOM에 — <b>한 엘리먼트에서, 동시에</b>.
      모든 아웃풋·이벤트·쿼리·옵저버가 <code>root: 'shadow' | 'light' | 'all' | 'auto'</code>를 받고, 이름 붙은 변형으로도 옵니다:
      <code>innerHtmlShadow</code>, <code>eventDelegateLight</code>, <code>queryShadow</code>, <code>mutationObserverAll</code>…
      <code>auto</code>는 섀도우 루트가 있는지를 따라가서, 둘 사이를 옮기는 건 단어 하나 바꾸기입니다.`,
    },
    code: `
@onConnectedBodyShadow      // chrome: encapsulated
renderShell() {
  return '<style>…</style><h1></h1><slot></slot>';
}

@onConnectedBodyLight       // content: light DOM
renderBody() { return '<article>…</article>'; }

@innerHtmlShadow('h1')      // write into shadow
setTitle(t: string) { return t; }

@eventDelegateLight('article a', 'click')
onLink(@matchedElement a: HTMLAnchorElement) { … }

@mutationObserverAll        // watch both roots
onAnyChange() { … }`,
  },
  {
    kicker: { en: 'Hooks Everywhere', ko: '어디에나 훅' },
    title: { en: 'filter → before → handler → finally.<br>On everything.', ko: 'filter → before → handler → finally.<br>모든 것에.' },
    text: {
      en: `Clicks, mutations, resizes, media queries, attribute changes, timers, routes and messages
      all share <b>one lifecycle</b>. Gate it asynchronously, prepare data and inject it straight into the handler,
      clean up on error — the same way, every single time.`,
      ko: `클릭, 뮤테이션, 리사이즈, 미디어쿼리, 속성 변경, 타이머, 라우트, 메시지가
      전부 <b>하나의 라이프사이클</b>을 씁니다. 비동기로 걸고, 데이터를 준비해서 핸들러에 바로 꽂고,
      에러 나면 정리 — 매번 똑같이.`,
    },
    code: `
@eventClick('.save', {
  filter:  async () => await auth.canEdit(),
  before:  async () => await loadDraft(),
  finally: (_e, _meta, { error }) => spinner.hide(error),
})
onSave(@eventBeforeReturn draft: Draft) {
  return save(draft);
}`,
  },
  {
    kicker: { en: 'Order-free Injection', ko: '순서 없는 주입' },
    title: { en: 'Ask for arguments by name.<br>In any order.', ko: '인자는 이름으로 받으세요.<br>순서는 상관없이.' },
    text: {
      en: `Events, lifecycles, routes, messages and observers all take their arguments through
      <b>parameter decorators</b> — the event, the matched element, the host tree, a <code>before</code> result,
      and DI (dependency injection) services via <code>@inject</code>, mixed in one signature. Decorate nothing and the old positional
      arguments still arrive: <b>nothing that worked breaks</b>.`,
      ko: `이벤트, 라이프사이클, 라우트, 메시지, 옵저버가 전부 <b>파라미터 데코레이터</b>로 인자를 받습니다 —
      이벤트, 매칭된 엘리먼트, 호스트 트리, <code>before</code> 결과, 그리고 <code>@inject</code>로 DI(의존성 주입) 서비스까지
      한 시그니처에 섞어서. 아무것도 안 붙이면 예전 위치 인자가 그대로 옵니다: <b>되던 건 안 깨집니다</b>.`,
    },
    code: `
@onConnectedAfter
init(
  @hostSet hs: HostSet,
  @inject(UserService.SYMBOL) users: UserService,
) { /* framework values + DI, side by side */ }

@eventClick('.save', { before: () => loadDraft() })
onSave(
  @matchedElement btn: HTMLButtonElement,
  @eventBeforeReturn draft: Draft,
) { /* swap them — still works */ }`,
  },
  {
    kicker: { en: '@fetch', ko: '@fetch' },
    title: { en: 'HTTP without the boilerplate.<br>No try/catch.', ko: '보일러 없는 HTTP.<br>try/catch도 없음.' },
    text: {
      en: `Failed fetch doesn't throw — it arrives as <code>settled</code>. <code>abortPrevious</code>
      kills stale requests when the user types fast, and the output's <code>fallback</code> shows while it's pending.
      Loading, error and cancel handling — <b>all in decorators</b>.`,
      ko: `실패한 fetch는 throw하지 않습니다 — <code>settled</code>로 와요. <code>abortPrevious</code>는
      사용자가 빨리 칠 때 묵은 요청을 폐기하고, 아웃풋의 <code>fallback</code>은 기다리는 동안 보입니다.
      로딩·에러·취소 처리 — <b>전부 데코레이터로</b>.`,
    },
    code: `
@onConnectedAfter
@innerHtml('.grid', { fallback: () => 'Loading…' })
@fetchManual((self) => self.api.getReleases(self.q()), {
  abortPrevious: true,   // type fast → only the last
})
async load(@fetchSettled settled?: Settled<Item[]>) {
  const ok = settled?.status === 'fulfilled';
  return this.renderItems(ok ? settled.value : []);
}`,
  },
  {
    kicker: { en: 'App Message Bus', ko: '앱 메시지 버스' },
    title: { en: 'Signals are cheap.<br>Ship the data.', ko: '시그널은 싸다.<br>데이터를 실어 보내라.' },
    text: {
      en: `Publish by <b>returning a value</b>. Subscribe with a decorator or with RxJS-style <code>observeMessage()</code>.
      Late subscribers replay the last message. Your header doesn't fetch the user after login — <b>it receives it.</b>`,
      ko: `값을 <b>반환하면 발행</b>입니다. 데코레이터나 RxJS식 <code>observeMessage()</code>로 구독하세요.
      늦게 온 구독자는 마지막 메시지를 재생합니다. 헤더는 로그인 뒤 유저를 fetch하지 않습니다 — <b>받아요.</b>`,
    },
    code: `
@publishSwcAppMessage(AUTH_CHANGED)
publishMe(me: User) { return me; }  // return = message

@subscribeSwcAppMessage(AUTH_CHANGED, {
  subject: 'behavior',   // late joiners replay the last
})
@innerHtml('.user')
renderUser(@appMessage msg: SwcAppMessage<User>) {
  return msg.data?.name ?? 'Sign in';
}`,
  },
  {
    kicker: { en: 'Pooled Observers', ko: '공유 옵저버' },
    title: { en: 'Stack observers freely.<br>One of each, per element.', ko: '옵저버는 마음껏 쌓으세요.<br>엘리먼트당 하나씩만 생깁니다.' },
    text: {
      en: `<code>@mutationObserver</code> and <code>@resizeObserver</code> are declarations, not instances.
      However many you stack, an element shares <b>one MutationObserver and one ResizeObserver</b> — delegate mode
      tracks elements added later through that same MutationObserver. Bare <code>@mutationObserver</code> watches the
      whole subtree and is attached <b>before the first render</b>, so it sees the render itself.
      Everything disconnects when the element leaves.`,
      ko: `<code>@mutationObserver</code>와 <code>@resizeObserver</code>는 인스턴스가 아니라 선언입니다.
      몇 개를 쌓든 엘리먼트는 <b>MutationObserver 하나와 ResizeObserver 하나</b>를 공유해요 — delegate 모드가
      나중에 추가된 요소를 추적하는 것도 그 MutationObserver 하나로. 맨 <code>@mutationObserver</code>는 하위 전체를 보고
      <b>첫 렌더 전에</b> 붙어서 렌더 자체도 봅니다. 엘리먼트가 떠나면 전부 해제.`,
    },
    code: `
@mutationObserver           // whole subtree, from render
onAnyChange(@hostSet hs: HostSet) { … }

@mutationObserverDelegate('.row')  // rows added later
@resizeObserverDelegate('.row')
onRow(rows: HTMLElement[]) { … }

@resizeObserver             // the element itself
onResize([el]: HTMLElement[]) { … }

// → 1 MutationObserver + 1 ResizeObserver`,
  },
  {
    kicker: { en: 'Explicit Names', ko: '이름이 곧 문서' },
    title: { en: 'Names you can read.<br>900+ of them.', ko: '읽히는 이름.<br>900개 넘게.' },
    text: {
      en: `Every DOM event × binding strategy is generated as its own decorator — <code>eventClick</code>,
      <code>eventKeydownWindow</code>, <code>eventClickDelegateLight</code>… <b>900+ named aliases</b>.
      Autocomplete teaches the API and the name says what it does; no option strings to memorize.
      The generic <code>@event(...)</code> is still there when you want it.`,
      ko: `DOM 이벤트 × 바인딩 방식마다 데코레이터가 따로 생성됩니다 — <code>eventClick</code>,
      <code>eventKeydownWindow</code>, <code>eventClickDelegateLight</code>… <b>이름 붙은 별칭 900개 이상</b>.
      자동완성이 API를 가르치고 이름이 하는 일을 말해줍니다. 외울 옵션 문자열이 없어요.
      범용 <code>@event(...)</code>도 그대로 있습니다.`,
    },
    code: `
@eventClick('.save')
onSave() { … }

@eventKeydownWindow
onKey(e: KeyboardEvent) { … }

@eventClickDelegateLight('.row')
onRow(@matchedElement row: HTMLElement) { … }
// = @event('.row', 'click',
//          { delegate: true, root: 'light' })`,
  },
];

export default (w: Window) => {
  const tagName = 'app-components-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class ComponentsPage extends w.HTMLElement {
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
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:image"]'), 'content', { valueKey: 'ogImage' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:title"]'), 'content', { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:image"]'), 'content', { valueKey: 'ogImage' })
    @attribute((c, helper) => helper.$w.document.querySelector('link[rel="canonical"]'), 'href', { valueKey: 'url' })
    setPageMeta() {
      return {
        title: LANDING_META.title,
        description: LANDING_META.description,
        url: SITE_URL + LANDING_META.path,
        ogImage: `${SITE_URL}/assets/dooboostore.png`,
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
        .hero p { font-size: 16px; color: #777; margin: 0; line-height: 1.7; max-width: 860px; }
        /* [lang] 래퍼가 block 이라 제목과 풀네임을 한 줄에 두려면 flex */
        .hero h1 { display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 12px; }
        .h1-full { font-size: 18px; font-weight: 600; color: #FF6B86; letter-spacing: 0; }
        .btn { padding: 16px 28px; border-radius: 14px; font-weight: 800; font-size: 15px; cursor: pointer; border: 1px solid #2A2A2A;
          background: #141414; color: #DDD; display: inline-flex; align-items: center; gap: 10px; transition: 0.2s; }
        .btn:hover { transform: translateY(-2px); border-color: #444; color: #FFF; }
        .btn.primary { background: #FF385C; border-color: #FF385C; color: #FFF; box-shadow: 0 10px 30px rgba(255, 56, 92, 0.25); }
        .btn.primary:hover { background: #E31C5F; }

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

        .deco { max-width: 1000px; margin: 20px auto 0; padding: 30px 40px; border-radius: 22px; background: #0E0E0E; border: 1px solid #1F1F1F; }
        .deco h3 { font-size: 28px; font-weight: 850; color: #FFF; letter-spacing: -0.8px; margin: 0 0 18px; }
        .deco-search { width: 100%; padding: 16px 18px; border-radius: 14px; border: 1px solid #2A2A2A; background: #141414; color: #FFF;
          font-family: 'JetBrains Mono', monospace; font-size: 16px; outline: none; }
        .deco-search:focus { border-color: #FF385C; box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.15); }
        .deco-count { margin: 14px 0 10px; font-size: 13px; color: #888; display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
        .deco-count b { color: #FF385C; font-size: 18px; }
        .deco-chips { display: flex; flex-wrap: wrap; gap: 6px; max-height: 190px; overflow-y: auto; }
        .deco-chips code { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; padding: 5px 9px; }
        .deco-note { margin: 14px 0 0; font-size: 13px; color: #666; }
        .howto { max-width: 1200px; margin: 30px auto 0; padding: 0 40px; }
        .howto-head { margin-bottom: 18px; }
        .howto-head .kicker { margin-bottom: 8px; }
        .howto h2 { margin: 0; font-size: 30px; font-weight: 850; color: #FFF; letter-spacing: -1px; }
        .flow3 { display: grid; grid-template-columns: 1fr auto 1.15fr auto 1.1fr; gap: 12px; align-items: stretch; }
        .flow3 > * { min-width: 0; }
        .flow3 .col { padding: 20px; border-radius: 18px; background: #0E0E0E; border: 1px solid #1F1F1F; display: flex; flex-direction: column; gap: 10px; }
        .flow3 .col.mid { border-color: rgba(255, 56, 92, 0.45); background: rgba(255, 56, 92, 0.05); }
        .col-title { font-size: 13px; font-weight: 800; color: #FF385C; letter-spacing: 0.5px; }
        .col-note { margin-top: auto; font-size: 13px; color: #777; }
        .flow3 .arrow { display: flex; align-items: center; color: #FF385C; font-size: 18px; }
        .trig { display: flex; flex-direction: column; gap: 6px; }
        .trig code, .out code { font-size: 12px; }
        pre.mini { margin: 0; padding: 12px 14px; border-radius: 12px; box-shadow: none; }
        pre.mini code { font-size: 12px; }
        .hooks { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #777; }
        .hooks b { color: #FFF; }
        .hooks i { font-size: 9px; color: #444; }
        .out { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 10px 12px; border-radius: 12px; background: #141414; border: 1px solid #222; font-size: 13px; color: #DDD; }
        .out i { color: #FF385C; font-size: 11px; }
        .out b { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #FFF; }
        .out small { width: 100%; color: #777; font-size: 12px; }
        .out.faded { color: #666; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; background: transparent; border-style: dashed; }
        .dg { margin-top: 22px; }
        .dg code { font-size: 12px; }
        .dg-host { padding: 14px; border-radius: 16px; border: 1px solid #2A2A2A; background: #0B0B0B; display: flex; flex-direction: column; gap: 8px; }
        .dg-layer { padding: 12px 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 6px; }
        .dg-layer.shadow { background: rgba(255, 56, 92, 0.07); border: 1px solid rgba(255, 56, 92, 0.4); }
        .dg-layer.light { background: #141414; border: 1px solid #2A2A2A; }
        /* [lang] 래퍼가 block 이라 라벨과 설명을 한 줄에 두려면 flex */
        .dg-label, .dg-slot, .dg-both { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }
        .dg-label { font-size: 12px; font-weight: 800; color: #FFF; }
        .dg-host > code, .dg-layer > code { align-self: flex-start; }
        .dg-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .dg-tags span { font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 3px 8px; border-radius: 999px; background: #1C1C1C; color: #BBB; }
        .dg-slot, .dg-both { font-size: 12px; color: #888; padding-left: 4px; }
        .dg-slot i { color: #FF385C; }
        .dg-both b { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #FF6B86; }
        .bus { display: grid; grid-template-columns: 1fr auto 1fr auto 1.2fr; gap: 8px; align-items: center; }
        .bus > * { min-width: 0; }
        .bus-node { padding: 10px 12px; border-radius: 12px; background: #141414; border: 1px solid #262626; display: flex; flex-direction: column; gap: 4px; }
        .bus-node b { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #FFF; }
        .bus-node small { font-size: 11.5px; color: #888; }
        .bus-node.pub { border-color: rgba(255, 56, 92, 0.45); }
        .bus-node.pipe { background: rgba(255, 56, 92, 0.12); border-color: #FF385C; text-align: center; }
        .bus-node.late { border-style: dashed; }
        .bus-subs { display: flex; flex-direction: column; gap: 6px; }
        .bus-arrow { color: #FF385C; font-size: 14px; }
        .dogfood { max-width: 1100px; margin: 20px auto 40px; padding: 34px 40px; border-radius: 22px; text-align: center;
          background: radial-gradient(120% 140% at 50% 0%, rgba(255, 56, 92, 0.14), rgba(255, 56, 92, 0) 60%), #0E0E0E; border: 1px solid #1F1F1F; }
        .dogfood h4 { color: #FFF; font-size: 22px; font-weight: 850; margin: 0 0 10px; letter-spacing: -0.5px; }
        .dogfood p { margin: 0; color: #888; line-height: 1.6; }
        .cta-row { display: flex; gap: 12px; justify-content: center; margin-top: 22px; flex-wrap: wrap; }


        @media (max-width: 900px) {
          .feature { grid-template-columns: 1fr; gap: 28px; }
          .feature:nth-child(even) .copy { order: 0; }
        }
        @media (max-width: 768px) {
          .hero { padding: 40px 22px 20px; }
          .hero h1 { font-size: 32px; letter-spacing: -1px; }
          .hero p { font-size: 17px; }
          .section { padding-left: 20px; padding-right: 20px; }
          .howto { padding: 0 20px; }
          .howto h2 { font-size: 22px; }
          .flow3, .bus { grid-template-columns: 1fr; }
          .flow3 .arrow, .bus-arrow { justify-content: center; transform: rotate(90deg); justify-self: center; }
          .deco { margin: 10px 16px 0; padding: 22px 18px; }
          .deco h3 { font-size: 22px; }
          .section-title p { font-size: 28px; }
          .feature h3 { font-size: 26px; }
        }
      </style>

      <div class="hero">
        <h1>${t('Components', '컴포넌트')} <span class="h1-full">simple-web-component · SWC</span></h1>
        <p lang="en"><b>SWC</b> is short for <b>@dooboostore/simple-web-component</b> — standard Web Components where a method just returns a value
        and the decorators stacked on it decide where that value goes. No virtual DOM, no template compiler: what you ship are plain custom elements.</p>
        <p lang="ko"><b>SWC</b>는 <b>@dooboostore/simple-web-component</b>의 줄임말이에요. 메서드는 값을 반환만 하고,
        그 위에 쌓은 데코레이터가 값을 어디에 둘지 정하는 표준 Web Components예요. 가상 DOM도 템플릿 컴파일러도 없이, 결과물은 그냥 커스텀 엘리먼트입니다.</p>
      </div>

      ${howItWorks()}

      <div class="section">
        <div class="section-title">
          <h2 lang="en">Why Components</h2><h2 lang="ko">왜 컴포넌트인가</h2>
          <p lang="en">Standard Web Components.<br>Plus eight ideas on top.</p><p lang="ko">표준 Web Components.<br>그 위에 여덟 가지.</p>
        </div>
        <div class="features">
          ${FEATURES.map(f => `
            <div class="feature">
              <div class="copy">
                <div class="kicker"><span lang="en">${f.kicker.en}</span><span lang="ko">${f.kicker.ko}</span></div>
                <h3><span lang="en">${f.title.en}</span><span lang="ko">${f.title.ko}</span></h3>
                <div class="text"><span lang="en">${f.text.en}</span><span lang="ko">${f.text.ko}</span></div>
                ${FEATURE_DIAGRAMS[f.kicker.en]?.() ?? ''}
              </div>
              <pre><code class="hljs language-typescript">${ts(f.code)}</code></pre>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="deco">
        <div class="kicker">${t('Curious?', '궁금하다면')}</div>
        <h3>${t(`How far does the naming go? All ${EVENT_DECORATORS.length} event decorators, searchable.`, `이름이 어디까지 있을까? 이벤트 데코레이터 ${EVENT_DECORATORS.length}개, 검색해 보세요.`)}</h3>
        <input class="deco-search" value="click delegate" placeholder="click · keydown window · input shadow …" autocomplete="off" spellcheck="false">
        <div class="deco-results">${decoratorResults('click delegate')}</div>
        <p class="deco-note">${t('Counted from the package\'s real exports, right now. The name tells you what it does — no option strings to memorize.',
          '패키지의 실제 export에서 지금 센 숫자예요. 이름이 하는 일을 말해줍니다 — 외울 옵션 문자열 없이.')}</p>
      </div>

      <div class="dogfood">
        <p lang="en">Want to poke at these? The landing page runs them live. SWC is also one of fourteen packages — <b>see the whole ecosystem</b>.</p><p lang="ko">직접 눌러보고 싶다면 첫 화면에서 실제로 돌아갑니다. SWC는 열네 개 패키지 중 하나 — <b>생태계 전체 보기</b>.</p>
        <div class="cta-row">
          <div class="btn primary" data-path="/"><i class="fa-solid fa-play"></i> <span lang="en">Try them live</span><span lang="ko">직접 해보기</span></div>
          <div class="btn" data-path="/ecosystem"><i class="fa-solid fa-layer-group"></i> <span lang="en">View ecosystem</span><span lang="ko">생태계 보기</span></div>
        </div>
      </div>
      `;
    }

    @event('.deco-search', 'input')
    @innerHtml('.deco-results')
    onDecoSearch(@matchedElement input: HTMLInputElement) {
      return decoratorResults(input.value);
    }

    @event('[data-path]', 'click', { delegate: true })
    onNavigate(e: any) {
      const path = e.target.closest('[data-path]')?.dataset?.path;
      if (path) this.router?.go(path);
    }
  }
  return tagName;
};
