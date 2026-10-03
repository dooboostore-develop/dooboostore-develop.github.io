import { defineSwcAppAll, type SwcAppInterface } from '@dooboostore/simple-web-component';
import { factories } from './app';

// 브라우저(front-end/index.ts)와 서버(back-end/index.ts)가 똑같이 부르는 부팅 함수.
//  - 브라우저: services = 프론트 서비스 팩토리 목록 (HTTP 프록시)
//  - 서버:     services = Map<Symbol, 진짜 서비스> (SSR 필터가 요청마다 만들어 넘긴다)
export const boot = async (w: Window, services: Array<(container: symbol) => unknown> | Map<symbol, unknown>, path: string) => {
  const container = Symbol('app');
  if (Array.isArray(services)) services.forEach(register => register(container));

  await defineSwcAppAll(w);
  const app = w.document.querySelector('#app') as SwcAppInterface;

  // 서버는 화면이 다 그려진 뒤 HTML 을 보내야 하므로, 자식 연결·첫 라우트가 끝날 때까지 기다린다
  return new Promise<SwcAppInterface>(resolve => {
    let done = 0;
    const tick = () => { if (++done === 2) resolve(app); };
    setTimeout(() => resolve(app), 5000);
    app.connect({
      window: w,
      container,
      path,
      routeType: 'path',
      ssr: true, // 서버에서 그린 엘리먼트에 "이미 그림" 표시 → 브라우저는 다시 안 그린다
      otherInstanceSim: services instanceof Map ? services : undefined,
      onStartedLazyDefineComponent: factories,
      onChildrenConnectedDone: tick,
      onChildrenRouteChanged: tick,
    } as any);
  });
};
