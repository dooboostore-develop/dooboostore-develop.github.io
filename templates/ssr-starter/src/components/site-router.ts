import { elementDefine, innerHtmlLight, matchedElement, subscribeSwcAppRouteChange, swcAppRouteGo, eventClickDelegate } from '@dooboostore/simple-web-component';

// 주소 → 페이지
export default (w: Window) => {
  const tag = 'site-router';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class SiteRouter extends w.HTMLElement {
    @subscribeSwcAppRouteChange(['', '/'])
    @innerHtmlLight
    home() { return '<home-page></home-page>'; }

    @subscribeSwcAppRouteChange(['/users'])
    @innerHtmlLight
    users() { return '<users-page></users-page>'; }

    @eventClickDelegate('a[href^="/"]', { preventDefault: true })
    @swcAppRouteGo
    go(@matchedElement a: HTMLAnchorElement) {
      return a.getAttribute('href');
    }

    @subscribeSwcAppRouteChange(['/{rest:.*}'], { order: 999 })
    @innerHtmlLight
    notFound() { return '<section class="page"><h1>404</h1><p><a href="/">← Home</a></p></section>'; }
  }
  return tag;
};
