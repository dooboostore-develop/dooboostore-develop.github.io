import { onConnectedSwcApp, elementDefine, subscribeSwcAppRouteChange, property, onInitialize, InjectSituationType, HostSet, SwcUtils, query, replaceChildren, onConnectedBody, onConnectedBodyShadow, innerHtml, innerHtmlLight } from '@dooboostore/simple-web-component';
import {type RouterEventType, Router} from '@dooboostore/core-web';

import ComponentsPageFactory from './components';
import HomePageFactory from './home';
import StartPageFactory from './start';
import PackageDetailPageFactory from './package';
import EcosystemPageFactory from './ecosystem';
import ServerPageFactory from './ssr';
import TestMermaidPageFactory from './test-mermaid'; // 개발 전용 (아래 DEV 참고)
import {simpleWebComponentFactories} from "@/pages/packages/simple-web-component";
import {Inject, route} from "@dooboostore/simple-boot";
import { GlobalStyle } from "@/styles/GlobalStyle";

// webpack 이 mode 에 맞춰 치환한다
const DEV = process.env.NODE_ENV !== 'production';

export const rootRouterFactory = (w: Window) => {
  const tagName = 'showcase-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  const routePaths = ['/', '/start', '/components', '/ssr', '/ecosystem', '/package/{id}', '/package/simple-web-component/examples{tail:.*}'];

  @elementDefine(tagName, {window: w})
  class RootRouter extends w.HTMLElement {
    private router: Router;


    @onConnectedSwcApp
    onconstructor(router: Router) {
      this.router = router;
    }

    @subscribeSwcAppRouteChange(['', '/'])
    @innerHtmlLight
    homePage(router: RouterEventType) {
      return `<app-home-page/>`
    }

    @subscribeSwcAppRouteChange(['/start'])
    @innerHtmlLight
    startPage() {
      return `<app-start-page/>`
    }

    @subscribeSwcAppRouteChange(['/components'])
    @innerHtmlLight
    componentsPage(router: RouterEventType) {
      return `<app-components-page/>`
    }

    @subscribeSwcAppRouteChange(['/ssr'])
    @innerHtmlLight
    serverPage(router: RouterEventType) {
      return `<app-server-page/>`
    }

    @subscribeSwcAppRouteChange(['/ecosystem'])
    @innerHtmlLight
    ecosystemPage(router: RouterEventType) {
      return `<app-ecosystem-page/>`
    }

    @subscribeSwcAppRouteChange(['/package/{id}'])
    @innerHtmlLight
    packagePage(router: RouterEventType) {
      return `<app-package-detail-page package-id="${router.pathData.id}" />`
    }

    @subscribeSwcAppRouteChange(['/package/simple-web-component/examples{tail:.*}'])
    @innerHtmlLight({
      filter: (target, newValue, meta) => {
        const currentThis = meta.currentThis as HTMLElement;
        return !currentThis.querySelector('app-swc-package-example-router-page');
      }
    })
    swcPage(router: RouterEventType) {
      return `<app-swc-package-example-router-page />`
    }

    // 개발 전용 테스트 페이지 — 배포본(production)에선 404 로 떨어진다
    @subscribeSwcAppRouteChange(['/test-mermaid'])
    @innerHtmlLight
    testMermaidPage() {
      return DEV ? `<app-test-mermaid-page />` : undefined;
    }

    @subscribeSwcAppRouteChange(['/{tail:.*}'], {order: 999})
    @innerHtmlLight
    handle404() {
      return `
              <div style="text-align: center; padding: 60px 20px; color: #999;">
                <h2 style="font-size: 24px; margin: 0 0 10px 0; color: #fff;"><span lang="en">404 - Page Not Found</span><span lang="ko">404 - 페이지를 찾을 수 없습니다</span></h2>
                <p style="margin: 0;"><span lang="en">The page you're looking for doesn't exist.</span><span lang="ko">찾는 페이지가 존재하지 않습니다.</span></p>
              </div>
              `;
    }

    @replaceChildren({
      root: 'light',
      filter: (host, newNode) => !host.contains(newNode)
    })
    renderContent(node: Node) {
      return node;
    }

    navigate(path: string): void {
      this.router.go(path);
    }

    onHeaderNavigate(event: CustomEvent, data: any) {
      // 헤더 클릭 시 즉시 스크롤 초기화
      window.scrollTo(0, 0);
      if (data?.path) this.router.go(data.path);
    }

    // @onConnectedInnerHtml({useShadow: true})
    @onConnectedBodyShadow
    render(router?: Router) {
      return `
        <style>
          ${GlobalStyle}
          * { box-sizing: border-box; }
          :host { 
            display: flex; 
            flex-direction: column; 
            min-height: 100vh; 
            width: 100%; 
            background: #080808;
          }
          app-header {
            display: block;
            position: sticky;
            top: -1px;
            z-index: 2000;
          }
          main {
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            width: 100%; 
            overflow-y: auto;
          }
          footer { 
            padding: 60px 20px; 
            background: #050505; 
            border-top: 1px solid #1A1A1A; 
            color: #FFF; 
            text-align: center;
          }
          .footer-text { 
            max-width: 1200px; 
            margin: 0 auto; 
            opacity: 0.4; 
            font-size: 14px; 
            font-weight: 500; 
          }
        </style>
        <app-header on-emit-navigate="$host.onHeaderNavigate(event, $data)"></app-header>
        <main>
        <slot></slot>
        </main>
          <footer>
            <div class="footer-text">
              © ${new Date().getFullYear()} dooboostore. <span lang="en">Built and pre-rendered with @dooboostore/simple-web-component.</span><span lang="ko">@dooboostore/simple-web-component으로 빌드·사전 렌더.</span>
            </div>
          </footer>
      `;
    }
  }

  return tagName;
};

export const pageFactories = [
  rootRouterFactory,
  HomePageFactory,
  StartPageFactory,
  ComponentsPageFactory,
  PackageDetailPageFactory,
  EcosystemPageFactory,
  ServerPageFactory,
  ...(DEV ? [TestMermaidPageFactory] : []),
  ...simpleWebComponentFactories
];
