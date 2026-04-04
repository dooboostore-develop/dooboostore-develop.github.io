import {onConnectedSwcApp,elementDefine, subscribeSwcAppRouteChange, applyInnerHtmlNodeHost, onInitialize, applyReplaceChildrenNodeHost, onConnectedInnerHtml, onAfterConnected} from '@dooboostore/simple-web-component';
import {type RouterEventType, Router} from '@dooboostore/core-web';

import LandingPageFactory from './LandingPage';
import PackageDetailPageFactory from './PackageDetailPage';
import {simpleWebComponentFactories} from "@/pages/packages/simple-web-component";

export const rootRouterFactory = (w: Window) => {
  const tagName = 'showcase-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, {window: w})
  class RootRouter extends w.HTMLElement {
    private router: Router;

    // constructor() {
    //   super();
    //   console.log('--------')
    // }
    @onConnectedSwcApp
    onconstructor(router: Router) {
      console.log('----RootRouter----', router)
      this.router = router;
    }

    @subscribeSwcAppRouteChange('/')
    @applyInnerHtmlNodeHost({root: 'light'})
    landingRoute(router: RouterEventType) {
      console.log('indexrouter-landingRoute');
      return `<app-landing-page />`;
    }

    @subscribeSwcAppRouteChange('/package/{id}')
    @applyInnerHtmlNodeHost({root: 'light'})
    packageRoute(router: RouterEventType, pathData: any) {
      console.log('indexrouter-packageRoute');
      return `<app-package-detail-page package-id="${pathData.id}" />`;
    }

    @subscribeSwcAppRouteChange('/package/simple-web-component/examples{tail:.*}')
    @applyInnerHtmlNodeHost({
      root: 'light', filter: (target: HTMLElement) => {
        return !target.querySelector('app-swc-package-example-router-page')
      }
    })
    packageExampleRoute(router: RouterEventType, pathData: any) {
      console.log('indexrouter-packageExampleRoute');
      return `<app-swc-package-example-router-page />`;
    }

    @applyReplaceChildrenNodeHost({
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

    @onConnectedInnerHtml({useShadow: true})
    render() {
      return `
        <style>
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
            top: 0;
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
            © 2024 dooboostore. Built with @dooboostore/simple-web-component.
          </div>
        </footer>
      `;
    }
  }

  return tagName;
};

export const pageFactories = [
  rootRouterFactory,
  LandingPageFactory,
  PackageDetailPageFactory,
  ...simpleWebComponentFactories
];
