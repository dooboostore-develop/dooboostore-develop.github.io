import { elementDefine, matchedElement, onConnectedBodyLight, subscribeSwcAppRouteChange, swcAppRouteGo, updateClass, eventClickDelegate } from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tag = 'site-header';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class SiteHeader extends w.HTMLElement {
    @onConnectedBodyLight
    render() {
      return `
        <a class="logo" href="/">SSR Starter</a>
        <nav>
          <a href="/">Home</a>
          <a href="/users">Users</a>
        </nav>`;
    }

    // 클릭은 앱 안에서 이동 — 메서드는 갈 곳만 반환
    @eventClickDelegate('a[href^="/"]', { preventDefault: true })
    @swcAppRouteGo
    go(@matchedElement a: HTMLAnchorElement) {
      return a.getAttribute('href');
    }

    @subscribeSwcAppRouteChange({ trigger: 'connectedDone' })
    @updateClass('nav a')
    highlight(route: { path: string }) {
      return { active: (el: HTMLElement) => el.getAttribute('href') === route.path };
    }
  }
  return tag;
};
