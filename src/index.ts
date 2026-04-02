import 'reflect-metadata';
import register, { elementDefine, onConnectedInnerHtml } from '@dooboostore/simple-web-component';
import { Sim, Router, RouterAction, RoutingDataSet, RouterConfig } from '@dooboostore/simple-boot';
import { Router as WebRouter } from '@dooboostore/core-web';
import { SwcAppInterface } from '@dooboostore/simple-web-component';

// Pages
import createLandingPage from './pages/LandingPage';
import createPackageDetailPage from './pages/PackageDetailPage';

// Header
import { createAppHeader } from './components/AppHeader';

const w = window;

const initialize = (w: Window, routerConfig: RouterConfig) => {
  @Sim
  @Router(routerConfig)
  @elementDefine('showcase-root-router', { window: w })
  class RootRouter extends w.HTMLElement implements RouterAction.CanActivate {
    constructor(private webRouter: WebRouter) { super(); }

    async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
      const pageContainer = this.querySelector('#page-container');
      if (pageContainer && data instanceof Node) {
        pageContainer.replaceChildren(data);
        window.scrollTo(0, 0);
      }
    }

    @onConnectedInnerHtml({ useShadow: false })
    render() {
      return `
        <app-header on-emit-navigate="$host.onHeaderNavigate(event, $data)"></app-header>
        <div id="page-container" style="padding-top: 80px;"></div>
        <footer style="padding: 60px 20px; background: #222; color: #FFF; text-align: center;">
          <div style="max-width: 1200px; margin: 0 auto; opacity: 0.6; font-size: 14px;">
            © 2024 dooboostore Ecosystem. Built with @dooboostore/simple-web-component.
          </div>
        </footer>
      `;
    }

    onHeaderNavigate(event: CustomEvent, data: any) {
      console.log('------->')
      if (data?.path) this.webRouter.go(data.path);
    }
  }
  return RootRouter;
};

register(w, [createAppHeader]);

const RootRouter = initialize(w, {
  path: '',
  route: {
    '': '/',
    '/': createLandingPage(w),
    '/package/{id}': createPackageDetailPage(w)
  }
});

w.document.addEventListener('DOMContentLoaded', () => {
  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement) {
    appElement.connect({
      rootRouter: RootRouter,
      path: window.location.pathname === '/' ? '/' : window.location.pathname,
      routeType: 'path',
      window: w
    });
  }
});
