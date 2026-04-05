import {onConnectedSwcApp, elementDefine, subscribeSwcAppRouteChangeWhileConnected, setProperty, onInitialize, applyReplaceChildrenNodeHost, onConnectedInnerHtml, onAfterConnected, InjectSituationType, HostSet, SwcUtils, query, type SwcChooseInterface} from '@dooboostore/simple-web-component';
import {type RouterEventType, Router} from '@dooboostore/core-web';

import LandingPageFactory from './LandingPage';
import PackageDetailPageFactory from './PackageDetailPage';
import {simpleWebComponentFactories} from "@/pages/packages/simple-web-component";
import {Inject, route} from "@dooboostore/simple-boot";

export const rootRouterFactory = (w: Window) => {
  const tagName = 'showcase-root-router';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  const routePaths = ['/', '/package/{id}', '/package/simple-web-component/examples{tail:.*}'];

  @elementDefine(tagName, {window: w})
  class RootRouter extends w.HTMLElement {
    private router: Router;

    @query('#router')
    routerChooseTemplate!: SwcChooseInterface;

    private routerPathSet: { path: string; pathData?: { [p: string]: string } };

    @onConnectedSwcApp
    onconstructor(router: Router) {
      // console.log('222----RootRouter----', router)
      this.router = router;
    }
    // @onInitialize
    // onconstructssor(router: Router) {
    //   this.router = router;
    //   console.log('222-----0--->', this.router)
    // }
    // @onConnectedSwcApp
    // onconstructossr(router: Router) {
    //   this.router = router;
    //   console.log('222--------1>', this.router)
    // }
    // @onAfterConnected
    // ssssa(router: Router){
    //   console.log('222---', router)
    // }

    // @setProperty('#router', 'value')
    @subscribeSwcAppRouteChangeWhileConnected(routePaths)
    routeChanged(router: RouterEventType) {
      this.routerPathSet = router;
      this.routerChooseTemplate.refresh();
      // console.log('rrrrrrrrrrrrrrrrrrrrrrrrr', router)
      // return router;
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

    // @onConnectedInnerHtml({useShadow: true})
    @onConnectedInnerHtml
    render(router?: Router){
      this.routerPathSet = SwcUtils.parsePathPatternsSet(routePaths, router?.value?.path)
      // const routeStr = SwcUtils.parsePathPatternsSetAttributeString(routePaths, router?.value?.path);
      // console.log('vvvvvvvvvvv', this.routerPathSet)
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
          <template id="router" value="{{= $host.routerPathSet }}" is="swc-choose">
            <!-- Landing -->
            <template is="swc-when" value="{{ ['','/'].includes($value?.path)}}">
              <app-landing-page />
            </template>
            
            <!-- Package Detail -->
            <template is="swc-when" value="{{ $value?.path?.startsWith('/package/') && !$value?.path.includes('examples') }}">
              <app-package-detail-page package-id="{{$value?.pathData?.id}}" />
            </template>
            
            <!-- Package Examples -->
            <template is="swc-when" value="{{ $value?.path?.includes('/package/simple-web-component/examples') }}" skip-if-same>
              <app-swc-package-example-router-page />
            </template>
            
            <!-- Not Found -->
            <template is="swc-otherwise">
              <div style="text-align: center; padding: 60px 20px; color: #999;">
                <h2 style="font-size: 24px; margin: 0 0 10px 0; color: #fff;">404 - Page Not Found</h2>
                <p style="margin: 0;">The page you're looking for doesn't exist.</p>
              </div>
            </template>
          </template>
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
