// 사이트 전체가 쓰는 패키지 정보의 단일 출처.
// 랜딩 카드, 상세 페이지 메타(title/description/og), SSG 경로 목록, sitemap 이 모두 여기서 나온다.

export const SITE_URL = 'https://dooboostore-develop.github.io';
export const SITE_NAME = '@dooboostore';
export const GITHUB_URL = 'https://github.com/dooboostore-develop/packages';
export const NPM_PROFILE_URL = 'https://www.npmjs.com/~dooboostore';

export type PackageInfo = {
  id: string;
  icon: string;          // Font Awesome class
  tagline: string;       // 카드/상단 한 줄 (en)
  taglineKo: string;     // 카드/상단 한 줄 (ko)
  description: string;   // meta description — en 유지 (검색·공유)
  highlights?: string[];   // en
  highlightsKo?: string[];  // ko
};

export type PackageCategory = { name: string; nameKo: string; description: string; descriptionKo: string; packages: PackageInfo[] };

export const PACKAGE_CATEGORIES: PackageCategory[] = [
  {
    name: 'Full-stack Framework',
    nameKo: '풀스택 프레임워크',
    description: 'One DI container, from the browser to the server.',
    descriptionKo: '브라우저부터 서버까지, 하나의 DI 컨테이너.',
    packages: [
      {
        id: 'simple-web-component',
        icon: 'fa-layer-group',
        tagline: 'Decorator-stack Web Components. Methods return values; stacked decorators decide where they go.',
        taglineKo: '데코레이터 스택 Web Components. 메서드는 값을 반환하고, 데코레이터가 둘 곳을 정합니다.',
        description: 'Standard Web Components with a decorator stack: triggers, outputs and uniform filter/before/finally hooks. Order-independent parameter injection and an app message bus.',
        highlights: [
          'Method bodies return plain values — `@innerHtml`, `@attribute`, `@publishSwcAppMessage` decide where they go',
          'Same `filter → before → handler → finally` hooks on events, observers, media queries, attributes, timers, routes and messages',
          'App message bus with payloads, replay (`behavior` / `replay`) and RxJS-style `observeMessage()`',
          'SSR-aware: server-rendered elements keep their DOM and skip re-rendering on the client',
        ],
        highlightsKo: [
          '메서드 본문은 평범한 값을 반환 — `@innerHtml`, `@attribute`, `@publishSwcAppMessage`가 둘 곳을 정함',
          '이벤트, 옵저버, 미디어쿼리, 속성, 타이머, 라우트, 메시지에 동일한 `filter → before → handler → finally` 훅',
          '페이로드·재생(`behavior`/`replay`)·RxJS식 `observeMessage()`를 갖춘 앱 메시지 버스',
          'SSR 대응: 서버 렌더된 엘리먼트는 DOM을 유지하고 클라이언트에서 다시 그리지 않음',
        ],
      },
      {
        id: 'simple-boot-http-server-ssr',
        icon: 'fa-bolt-lightning',
        tagline: 'Browserless SSR that boots the same app on the server — and skips re-rendering on the client.',
        taglineKo: '브라우저 없는 SSR. 서버에서 같은 앱을 부팅하고, 클라이언트는 다시 그리지 않습니다.',
        description: 'Server-side rendering without a browser: the same components and the same boot function run on the server. The client keeps the server DOM and hydrates @property fields through the custom-element upgrade.',
        highlights: [
          'The client and the server call the same `bootfactory` — only the service map differs',
          'Components never know where they run: no `getServerSideProps`, no client/server boundary',
          'Server-rendered elements keep their DOM; the client attaches behavior without re-rendering',
          '`@property` fields are hydrated through the custom-element upgrade algorithm — no re-fetch',
        ],
        highlightsKo: [
          '클라이언트와 서버가 같은 `bootfactory`를 호출 — 서비스 맵만 다름',
          '컴포넌트는 어디서 도는지 모름: `getServerSideProps`도 클라이언트/서버 경계도 없음',
          '서버 렌더된 엘리먼트는 DOM 유지, 클라이언트는 다시 그리지 않고 행위만 붙임',
          '`@property` 필드는 커스텀 엘리먼트 업그레이드로 하이드레이션 — 재조회 없음',
        ],
      },
      {
        id: 'simple-boot-http-server',
        icon: 'fa-server',
        tagline: 'An HTTP server that is its own DI container — with symbol RPC: one interface, one call.',
        taglineKo: '자체가 DI 컨테이너인 HTTP 서버 — Symbol RPC: 인터페이스 하나, 호출 한 번.',
        description: 'A Node HTTP server built on the simple-boot DI container. Onion-style filters, a unified RequestResponse, and symbol-intent RPC: the same interface is called over HTTP from the browser or in-process during SSR.',
        highlights: [
          'Write an interface once; the browser proxy and the server implementation share it',
          'No routes, no fetch code, no DTO layer — the method name is the path, the symbol is the header',
          'The request context flows through the injected service, not a global',
        ],
        highlightsKo: [
          '인터페이스 한 번 작성, 브라우저 프록시와 서버 구현이 공유',
          '라우트도 fetch 코드도 DTO 계층도 없음 — 메서드 이름이 경로, Symbol이 헤더',
          '요청 컨텍스트는 전역이 아니라 주입된 서비스를 타고 흐름',
        ],
      },
      {
        id: 'simple-boot',
        icon: 'fa-diagram-project',
        tagline: 'Symbol-based DI with AOP, an intent bus and a router — one object graph, browser or Node.',
        taglineKo: 'Symbol 기반 DI에 AOP, 인텐트 버스, 라우터 — 브라우저든 Node든 하나의 객체 그래프.',
        description: 'A dependency-injection container with multi-binding, container scopes, AOP advice, exception handlers, a URI-style intent bus and a nested router. Depends only on @dooboostore/core.',
      },
      {
        id: 'simple-boot-front',
        icon: 'fa-window-maximize',
        tagline: 'SPA bootstrap on top of simple-boot and dom-render.',
        taglineKo: 'simple-boot와 dom-render 위의 SPA 부트스트랩.',
        description: 'Single-page application bootstrap combining the simple-boot container with the dom-render view engine: components, routing and lifecycles.',
      },
    ],
  },
  {
    name: 'Rendering',
    nameKo: '렌더링',
    description: 'A DOM for the server and a view engine without a virtual DOM.',
    descriptionKo: '서버용 DOM과 가상 DOM 없는 뷰 엔진.',
    packages: [
      {
        id: 'dom-parser',
        icon: 'fa-code',
        tagline: 'A zero-dependency DOM for Node — enough to run real web components on the server.',
        taglineKo: 'Node용 무의존성 DOM — 서버에서 진짜 웹 컴포넌트를 돌리기에 충분.',
        description: 'Window, Document, 70+ HTML elements, CustomElementRegistry and Declarative Shadow DOM serialization, with no dependencies. Powers browserless SSR.',
      },
      {
        id: 'dom-render',
        icon: 'fa-wand-magic-sparkles',
        tagline: 'Proxy-based reactive templates that re-render only what changed. No virtual DOM, no build step.',
        taglineKo: '바뀐 것만 다시 그리는 프록시 기반 리액티브 템플릿. 가상 DOM도 빌드도 없음.',
        description: 'A reactive template engine that tracks changed property paths through proxies and re-renders only the affected bindings — no virtual DOM diff and no build step.',
      },
    ],
  },
  {
    name: 'Foundation',
    nameKo: '기반',
    description: 'A standard library written from scratch, plus platform adapters.',
    descriptionKo: '밑바닥부터 쓴 표준 라이브러리, 그리고 플랫폼 어댑터.',
    packages: [
      {
        id: 'core',
        icon: 'fa-gem',
        tagline: 'A zero-dependency standard library: reactive streams, fetch, expressions, validation, AOP.',
        taglineKo: '무의존성 표준 라이브러리: 리액티브 스트림, fetch, 표현식, 검증, AOP.',
        description: 'The foundation of the ecosystem with no runtime dependencies: an RxJS-style Observable with typed errors, a fetch pipeline, expressions and route matching, validators, AOP advice and reflection utilities.',
      },
      {
        id: 'core-web',
        icon: 'fa-globe',
        tagline: 'Browser adapters: path/hash routers, element apply, events, clipboard.',
        taglineKo: '브라우저 어댑터: path/hash 라우터, 엘리먼트 적용, 이벤트, 클립보드.',
        description: 'Browser-side adapters on top of core: path and hash routers, ElementApply bindings, event and clipboard helpers.',
      },
      {
        id: 'core-node',
        icon: 'fa-terminal',
        tagline: 'Node.js adapters: files, paths, processes, page downloads.',
        taglineKo: 'Node.js 어댑터: 파일, 경로, 프로세스, 페이지 다운로드.',
        description: 'Node.js-side adapters on top of core: file, path, process and memory utilities and an HTTP page downloader.',
      },
    ],
  },
  {
    name: 'Libraries',
    nameKo: '라이브러리',
    description: 'Ready-made pieces built on the stack.',
    descriptionKo: '스택 위에 지은 완성품들.',
    packages: [
      {
        id: 'simple-web-component-library',
        icon: 'fa-chart-line',
        tagline: 'Charts and controls built with simple-web-component.',
        taglineKo: 'simple-web-component으로 만든 차트와 컨트롤.',
        description: 'Components built with simple-web-component: cartesian, 3D, radar, bubble and stock charts and a range slider.',
      },
      {
        id: 'algorithm',
        icon: 'fa-square-root-variable',
        tagline: 'Market-data algorithms: candles, trends and trading simulation.',
        taglineKo: '시장 데이터 알고리즘: 캔들, 추세, 트레이딩 시뮬레이션.',
        description: 'Algorithms for market data: candle models, trend ranges, boost models and a trading simulator.',
      },
      {
        id: 'lib-web',
        icon: 'fa-image',
        tagline: 'Canvas tools for the web: image editing, cropping, GPS markers.',
        taglineKo: '웹용 캔버스 도구: 이미지 편집, 자르기, GPS 마커.',
        description: 'Web utilities focused on canvas: an image editor, image cropping and GPS marker rendering.',
      },
      {
        id: 'lib-node',
        icon: 'fa-cubes',
        tagline: 'Node.js utilities.',
        taglineKo: 'Node.js 유틸리티.',
        description: 'Utilities for Node.js applications, such as random image generation.',
      },
    ],
  },
];

export const ALL_PACKAGES: PackageInfo[] = PACKAGE_CATEGORIES.flatMap(c => c.packages);
export const findPackage = (id?: string | null) => ALL_PACKAGES.find(p => p.id === id);

// 페이지 메타 — SSG 때 <head>에 그대로 박힌다
export type PageMeta = { title: string; description: string; path: string };

export const LANDING_META: PageMeta = {
  title: '@dooboostore/simple-web-component — Decorator-stack Web Components',
  description: 'Methods return values; stacked decorators decide where they go. Upgrade-native hydration, one lifecycle for everything, and an app message bus.',
  path: '/components',
};

export const HOME_META: PageMeta = {
  title: '@dooboostore — Pick a door',
  description: 'Decorator-stack Web Components (simple-web-component), browserless servers, or the whole fourteen-package ecosystem. One DI container, from the browser to the server.',
  path: '/',
};

export const START_META: PageMeta = {
  title: 'Get started — simple-web-component in five minutes',
  description: 'Install, turn on decorators, write a component, boot the app. From an empty folder to a working Web Component in about five minutes.',
  path: '/start',
};

export const ECOSYSTEM_META: PageMeta = {
  title: '@dooboostore ecosystem — Fourteen packages, one philosophy',
  description: 'The full @dooboostore lineup: framework, rendering, foundation and libraries. One DI container, from the browser to the server.',
  path: '/ecosystem',
};

export const SERVER_META: PageMeta = {
  title: '@dooboostore server — Browserless SSR and symbol RPC',
  description: 'The same app boots on the server: browserless SSR without re-rendering, and symbol RPC with one interface.',
  path: '/ssr',
};

export const packageMeta = (id: string): PageMeta => {
  const p = findPackage(id);
  return {
    title: `@dooboostore/${id} — ${p?.tagline ?? 'Documentation'}`,
    description: p?.description ?? `Documentation for @dooboostore/${id}.`,
    path: `/package/${id}`,
  };
};

export const EXAMPLES_META: PageMeta = {
  title: 'simple-web-component — Interactive examples',
  description: 'Commerce, accommodation and stock apps built with @dooboostore/simple-web-component, running live in the browser.',
  path: '/package/simple-web-component/examples',
};
