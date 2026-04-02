import { elementDefine, innerHtmlLight, matchedElement, subscribeSwcAppRouteChange, swcAppRouteGo, eventClickDelegate } from '@dooboostore/simple-web-component';

// 주소 → 페이지. 페이지를 추가하면 여기와 src/app.ts 의 ROUTES 에 한 줄씩.
export default (w: Window) => {
  const tag = 'site-router';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class SiteRouter extends w.HTMLElement {
    @subscribeSwcAppRouteChange(['', '/'])
    @innerHtmlLight
    home() { return '<home-page></home-page>'; }

    @subscribeSwcAppRouteChange(['/about'])
    @innerHtmlLight
    about() { return '<about-page></about-page>'; }

    @subscribeSwcAppRouteChange(['/contact'])
    @innerHtmlLight
    contact() { return '<contact-page></contact-page>'; }

    // 페이지 본문 안의 내부 링크도 앱 안에서 이동
    @eventClickDelegate('a[href^="/"]', { preventDefault: true })
    @swcAppRouteGo
    go(@matchedElement a: HTMLAnchorElement) {
      return a.getAttribute('href');
    }

    @subscribeSwcAppRouteChange(['/{rest:.*}'], { order: 999 })
    @innerHtmlLight
    notFound() { return '<section class="page"><h1>404</h1><p>Page not found.</p><p><a href="/">← Home</a></p></section>'; }
  }
  return tag;
};
