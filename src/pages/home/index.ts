import { Router } from '@dooboostore/core-web';
import { attribute, elementDefine, innerHtml, matchedElement, onConnectedBefore, onConnectedBodyShadow, onInitialize, setInterval, eventClickDelegate } from '@dooboostore/simple-web-component';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { HOME_META, SITE_URL, GITHUB_URL } from '@/data/packages';
import { LANDING_DEMOS } from '@/components/demos';
import { t } from '@/components/demos/shared';
// 버전·라이선스는 실제 package.json 에서 — 손으로 적으면 금방 거짓이 된다
import swcPkg from '../../../packages/@dooboostore/simple-web-component/package.json';

// 데모는 하나하나 src/components/demos 의 커스텀 엘리먼트다. 여기는 순서대로 늘어놓기만 한다.
// "이 사이트가 증거" — 회사 홈페이지에 필요한 것 중 이 사이트에서 실제로 돌아가는 것만
const SITE_REPO_URL = 'https://github.com/dooboostore-develop/dooboostore-develop.github.io';
const BUILT_WITH: Array<[string, string, string]> = [
  ['fa-language', 'KO / EN switch', '한/영 전환'],
  ['fa-magnifying-glass', 'SEO per page', '페이지별 SEO'],
  ['fa-bolt', 'Pre-rendered HTML + sitemap', 'HTML 미리 생성 + sitemap'],
  ['fa-rocket', 'Auto-deploy on push', '푸시하면 자동 배포'],
  ['fa-vial-circle-check', 'Browser-tested every deploy', '배포마다 브라우저 테스트'],
  ['fa-mobile-screen', 'Mobile', '모바일'],
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

export default (w: Window) => {
  const tagName = 'app-home-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

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
        .kicker { font-size: 12px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FF385C; margin-bottom: 8px; }
        .goals { padding: 28px; border-radius: 20px; background: #0E0E0E; border: 1px solid #1F1F1F; }
        .goals-title { font-size: 12px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FF385C; margin-bottom: 16px; }
        .goals ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .goals li { display: flex; gap: 12px; align-items: baseline; color: #DDD; font-size: 15px; line-height: 1.5; }
        .goals li i { color: #FF385C; font-size: 12px; }
        .goals code { background: rgba(255, 56, 92, 0.1); color: #FF6B86; padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }
        .goals-note { margin-top: 18px; font-size: 13px; color: #666; }
        .built { max-width: 1200px; margin: 30px auto; padding: 36px 40px; text-align: center;
          border-radius: 24px; background: linear-gradient(135deg, rgba(255, 56, 92, 0.10), rgba(255, 56, 92, 0.02)); border: 1px solid rgba(255, 56, 92, 0.25); }
        .built h2 { font-size: 28px; font-weight: 850; color: #FFF; letter-spacing: -1px; margin: 0 0 18px; line-height: 1.25; }
        .built-list { list-style: none; margin: 0 0 22px; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
        .built-list li { display: flex; gap: 8px; align-items: center; padding: 7px 14px; border-radius: 999px; background: #0E0E0E; border: 1px solid #1F1F1F; color: #CCC; font-size: 13.5px; }
        .built-list i { color: #FF385C; }
        .built .cta-row { margin-top: 0; }
        .punchline { margin: 22px auto 0; font-size: 18px; font-weight: 800; color: #FFF; letter-spacing: -0.3px; }
        .nope { margin: 34px auto 0; font-size: 17px; color: #777; display: flex; gap: 12px; justify-content: center; align-items: baseline; flex-wrap: wrap; }
        .nope-word { min-width: 280px; text-align: left; }
        .nope-word s { position: relative; text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 19px; color: #DDD;
          animation: nope-in 0.35s ease-out; }
        .nope-word s::after { content: ''; position: absolute; left: -4px; right: 100%; top: 52%; height: 3px; border-radius: 2px; background: #FF385C;
          animation: nope-strike 0.5s 0.45s cubic-bezier(0.6, 0, 0.2, 1) forwards; }
        @keyframes nope-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes nope-strike { to { right: -4px; } }
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
          .built { margin: 24px 16px; padding: 24px 18px; }
          .built h2 { font-size: 24px; }
          .early h2 { font-size: 30px; }
          .doors { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .hero { padding: 64px 22px 40px; }
          .hero h1 { font-size: 44px; letter-spacing: -2px; }
          .hero p { font-size: 17px; }
          .nope { font-size: 15px; }
          .nope-word { min-width: 0; text-align: center; }
          .nope-word s { font-size: 15px; }
          .doors { padding-left: 20px; padding-right: 20px; }
          .trust { padding-left: 20px; padding-right: 20px; }
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
        <div class="nope">${t("For those who've been there — you won't write", '고생해 본 분들께 — 이제 안 써도 되는 것')} <span class="nope-word"><s>${NOPES[0]}</s></span></div>
        <div class="cta-row">
          <div class="btn primary" data-path="/start"><i class="fa-solid fa-rocket"></i> ${t('Start in 5 minutes', '5분 만에 시작')}</div>
          <div class="btn" data-path="/package/simple-web-component/examples"><i class="fa-solid fa-play"></i> ${t('See it run', '돌아가는 거 보기')}</div>
        </div>
      </div>



      ${LANDING_DEMOS.map(tag => `<${tag}></${tag}>`).join('')}

      <section class="built">
        <h2>${t('Every demo above — and this whole site — runs on it.', '방금 눌러 본 데모, 그리고 이 사이트 전체가 이걸로 만들어졌습니다.')}</h2>
        <ul class="built-list">
          ${BUILT_WITH.map(([icon, en, ko]) => `<li><i class="fa-solid ${icon}"></i>${t(en, ko)}</li>`).join('')}
        </ul>
        <div class="cta-row">
          <div class="btn primary" data-path="/start"><i class="fa-solid fa-rocket"></i> ${t('Make one like this', '이 사이트처럼 만들기')}</div>
          <a class="btn" href="${SITE_REPO_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> ${t('Read this site\'s source', '이 사이트 소스 보기')}</a>
        </div>
      </section>

      <!-- 편한 걸 다 보여준 다음에: 튼튼함의 증거 -->
      <demo-leak></demo-leak>

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

    // ── 히어로 티커: 이것도 @setInterval ──
    private nopeIdx = 1;

    @setInterval(1800)
    @innerHtml('.nope-word')
    nextNope() {
      return `<s>${NOPES[this.nopeIdx++ % NOPES.length]}</s>`;
    }

    @eventClickDelegate('[data-path]')
    onNavigate(@matchedElement el: HTMLElement) {
      const path = el.dataset.path;
      if (path) this.router?.go(path);
    }
  }
  return tagName;
};
