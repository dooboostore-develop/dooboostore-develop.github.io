import { elementDefine, event, matchedElement, onConnectedBodyLight, subscribeSwcAppRouteChange, swcAppRouteGo, updateClass } from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tag = 'site-header';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class SiteHeader extends w.HTMLElement {
    // 진짜 <a href> 라서 검색엔진이 링크를 따라간다
    @onConnectedBodyLight
    render() {
      return `
        <a class="logo" href="/">My Company</a>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>`;
    }

    // 클릭은 페이지를 새로 받지 않고 앱 안에서 이동 — 메서드는 갈 곳만 반환
    @event('a[href^="/"]', 'click', { delegate: true, preventDefault: true })
    @swcAppRouteGo
    go(@matchedElement a: HTMLAnchorElement) {
      return a.getAttribute('href');
    }

    // 지금 페이지 메뉴 강조
    @subscribeSwcAppRouteChange({ trigger: 'connectedDone' })
    @updateClass('nav a')
    highlight(route: { path: string }) {
      return { active: (el: HTMLElement) => el.getAttribute('href') === route.path };
    }
  }
  return tag;
};
