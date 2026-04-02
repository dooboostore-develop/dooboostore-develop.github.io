import { onConnectedBefore, onConnectedSwcApp, elementDefine, addEventListener, updateClass, applyAttribute, attribute, onInitialize, subscribeSwcAppRouteChange, property, SwcUtils, query, replaceChildren, onConnectedBody, event, onConnectedBodyShadow, innerHtml, innerHtmlLight } from '@dooboostore/simple-web-component';
import {Router, type RouterEventType} from '@dooboostore/core-web';
import commerceExampleProjectPageFactory from './SwcCommerceExampleProjectPage';
import accommodationExampleProjectPageFactory from './SwcAccommodationExampleProjectPage';
import stockExampleProjectPageFactory from './SwcStockExampleProjectPage';
import { EXAMPLES_META, SITE_URL } from '@/data/packages';

export default (w: Window) => {
  const tagName = 'app-swc-package-example-router-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class SwcRouterPage extends w.HTMLElement {
    private router: Router;

    @onConnectedBefore
    @innerHtml((c, helper) => helper.$w.document.querySelector('title'), { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:title"]'), 'content', { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:url"]'), 'content', { valueKey: 'url' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[property="og:image"]'), 'content', { valueKey: 'ogImage' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:title"]'), 'content', { valueKey: 'title' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:description"]'), 'content', { valueKey: 'description' })
    @attribute((c, helper) => helper.$w.document.querySelector('meta[name="twitter:image"]'), 'content', { valueKey: 'ogImage' })
    @attribute((c, helper) => helper.$w.document.querySelector('link[rel="canonical"]'), 'href', { valueKey: 'url' })
    setPageMeta() {
      return {
        title: EXAMPLES_META.title,
        description: EXAMPLES_META.description,
        url: SITE_URL + EXAMPLES_META.path,
        ogImage: `${SITE_URL}/assets/images/examples-og.png`,
      };
    }


    @onConnectedSwcApp
    onconstructor(router: Router) {
      this.router = router;
    }

    // @property('#router', 'value')
    @subscribeSwcAppRouteChange(['/package/simple-web-component/examples', '/package/simple-web-component/examples/accommodation-example'])
    @innerHtmlLight
    indedxOrAccommodationPage(router: RouterEventType) {
      this.updateActiveNav('accommodation-example');
      return `<app-accommodation-example-project-page/>`;
    }
    @subscribeSwcAppRouteChange(['/package/simple-web-component/examples/commerce-example'])
    @innerHtmlLight
    commercePage(router: RouterEventType) {
      this.updateActiveNav('commerce-example');
      return `<app-commerce-example-project-page/>`;
    }

    @subscribeSwcAppRouteChange(['/package/simple-web-component/examples/stock-example'])
    @innerHtmlLight
    stockPage(router: RouterEventType) {
      this.updateActiveNav('stock-example');
      return `<app-stock-example-project-page/>`;
    }


    @updateClass('.nav-item')
    updateActiveNav(id: string) {
      return {
        active: (el: any) => id === el.dataset.id
      };
    }

    @replaceChildren({ root: 'light', filter: (host, newNode) => !host.contains(newNode) })
    setChild(node: Node) { return node; }

    @onConnectedBodyShadow
    render(router?: Router) {
      return `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
        * { box-sizing: border-box; }
        :host { display: flex; flex-direction: column; flex: 1; width: 100%; color: #FFF; box-sizing: border-box; }
        .layout { display: flex; flex: 1; width: 100%; margin: 0 auto; box-sizing: border-box; align-items: stretch; }
        .sidebar { width: 260px; border-right: 1px solid #1A1A1A; padding: 40px; flex-shrink: 0; background: #0A0A0A; position: sticky; top: 0; }
        .back-to-docs { display: flex; align-items: center; gap: 8px; color: #666; font-size: 13px; font-weight: 600; margin-bottom: 16px; cursor: pointer; transition: 0.2s; }
        .back-to-docs:hover { color: #FFF; }
        .sidebar h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #FF385C; margin-bottom: 16px; font-weight: 800; }
        .nav-list { display: flex; flex-direction: column; gap: 8px; }
        .nav-item { padding: 12px 16px; color: #666; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 12px; font-weight: 600; border-radius: 10px; font-size: 15px; }
        .nav-item:hover { color: #FFF; background: rgba(255,255,255,0.03); }
        .nav-item.active { color: #FFF; background: rgba(255, 56, 92, 0.1); border: 1px solid rgba(255, 56, 92, 0.2); }
        .content-area { flex: 1; min-width: 0; background: #080808; display: flex; flex-direction: column; overflow-x: hidden; }
        @media (max-width: 768px) {
          .layout { flex-direction: column; }
          .sidebar { 
            width: 100%; 
            border-right: none; 
            border-bottom: 1px solid #1A1A1A; 
            padding: 20px; 
            background: #0A0A0A;
            /*z-index: 999999;*/
          }
          .nav-list { flex-direction: row; overflow-x: auto; padding-bottom: 4px; }
          .nav-item { white-space: nowrap; }
          .content-area { padding: 0; overflow-y: visible; }
        }
      </style>
      <div class="layout">
        <aside class="sidebar">
          <div class="back-to-docs" data-path="/package/simple-web-component">
            <i class="fa-solid fa-arrow-left-long"></i> Back to Docs
          </div>
          <h2><span lang="en">Examples</span><span lang="ko">예제</span></h2>
          <div class="nav-list">
            <div class="nav-item" data-id="accommodation-example"><i class="fa-solid fa-house-chimney"></i> Accommodation Example</div>
            <div class="nav-item" data-id="commerce-example"><i class="fa-solid fa-cart-shopping"></i> Commerce Example</div>
            <div class="nav-item" data-id="stock-example"><i class="fa-solid fa-chart-line"></i> Stock Example</div>
          </div>
        </aside>
        <section class="content-area">
         <slot></slot>
        </section>
      </div>`;
    }

    @event('.nav-item, .back-to-docs', 'click', { delegate: true })
    onNavClick(e: any) {
      const item = e.target.closest('[data-id]');
      if (item && item.dataset.id) {
        this.router.go(`/package/simple-web-component/examples/${item.dataset.id}`);
      } else {
        this.router.go(`/package/simple-web-component`);
      }
    }
  }
  return tagName;
};
