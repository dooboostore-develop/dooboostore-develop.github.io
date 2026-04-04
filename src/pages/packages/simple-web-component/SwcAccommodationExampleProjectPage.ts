import { elementDefine, onConnectedInnerHtml, applyInnerHtmlNode, addEventListener, SwcAppInterface } from '@dooboostore/simple-web-component';
import { Sim } from '@dooboostore/simple-boot';
import bootFactory from "@simple-web-component/examples/accommodation/src/bootFactory";
import {SwcAttributeConfigType} from "@dooboostore/simple-web-component/elements/SwcAppEngine";

export default (w: Window,container: symbol) => {
  const tagName = 'app-accommodation-example-project-page';
  const existing = w.customElements.get(tagName);
  if (existing) return existing;

  @Sim({container: container})
  @elementDefine(tagName, { window: w })
  class SwcAccommodationExamplePage extends w.HTMLElement {
    private routerSubscription?: any;

    @applyInnerHtmlNode('#address-path')
    updateAddressDisplay(path: string) {
      return path;
    }

    @addEventListener('#back-btn', 'click')
    onBackClick() {
      const app = this.querySelector('#sub-app') as any;
      app?.back?.();
    }

    @addEventListener('#forward-btn', 'click')
    onForwardClick() {
      const app = this.querySelector('#sub-app') as any;
      app?.forward?.();
    }

    @addEventListener('#reload-btn', 'click')
    onReloadClick() {
      const app = this.querySelector('#sub-app') as any;
      app?.reload?.();
    }

    disconnectedCallback() {
      if (this.routerSubscription) {
        this.routerSubscription.unsubscribe();
      }
    }

    @onConnectedInnerHtml
    render() {
      return `
      <style>
        * { box-sizing: border-box; }
        :host {
          display: block;
          width: 100%;
          box-sizing: border-box;
          container-type: inline-size;
        }
        .page-container {
          padding: 40px;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }
        @container (max-width: 900px) {
          .page-container { padding: 20px; }
        }
        @container (max-width: 600px) {
          .page-container { padding: 12px; }
        }
        #sub-app {
          width: 100%;
          min-height: 700px;
          border: 1px solid #333;
          border-top: none;
          border-radius: 0 0 16px 16px;
          background-color: #fff;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        @container (max-width: 768px) {
          #sub-app { min-height: 500px; }
          .browser-header { padding: 10px 12px; gap: 10px; }
          .browser-dots { display: none; }
          .header-info h1 { font-size: 20px; }
        }
        .page-container {
          padding: 40px;
          max-width: 100%;
          overflow-x: hidden;
        }
        .header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
          margin-top: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .header-info h1 {
          font-size: 24px;
          margin: 0;
          color: #fff;
          font-weight: 850;
        }
        .view-source {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #1A1A1A;
          border: 1px solid #333;
          border-radius: 100px;
          color: #BBB;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s;
          white-space: nowrap;
        }
        .view-source:hover {
          background: #252525;
          color: #FF385C;
          border-color: #FF385C;
        }

        /* Browser Address Bar Style */
        .browser-mockup {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #080808;
          padding-top: 10px;
          width: 100%;
        }
        .browser-header {
          background: #1A1A1A;
          border: 1px solid #333;
          border-radius: 16px 16px 0 0;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: -1px;
        }
        .browser-dots { display: flex; gap: 6px; flex-shrink: 0; }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: #333; }
        .dot.red { background: #FF5F56; }
        .dot.yellow { background: #FFBD2E; }
        .dot.green { background: #27C93F; }
        
        .address-bar {
          flex: 1;
          min-width: 0;
          background: #080808;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 6px 16px;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 13px;
          color: #888;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        #address-path { 
          color: #BBB; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap; 
        }
        
        #sub-app {
          width: 100%;
          min-height: 700px;
          border: 1px solid #333;
          border-top: none;
          border-radius: 0 0 16px 16px;
          background-color: #fff;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          overflow: hidden;
          max-width: 100%;
          container-type: inline-size; /* 컨테이너 쿼리 활성화 */
        }
        @media (max-width: 768px) {
          .page-container { padding: 8px; }
          #sub-app { min-height: 500px; }
          .browser-header { padding: 10px 12px; gap: 10px; }
          .browser-dots { display: none; }
          .header-info h1 { font-size: 20px; }
        }
        @media (max-width: 480px) {
          .header-info { flex-direction: column; align-items: flex-start; }
          .view-source { width: 100%; justify-content: center; }
        }
      </style>
      <div class="page-container">
        <div class="header-info">
          <h1>Accommodation Example</h1>
          <a href="https://github.com/dooboostore-develop/packages/tree/main/@dooboostore/simple-web-component/examples/accommodation" target="_blank" class="view-source">
            <i class="fa-brands fa-github"></i> View Source
          </a>
        </div>

        <div class="browser-container">
          <div class="browser-mockup">
            <div class="browser-header">
              <div class="browser-dots">
                <div class="dot red"></div>
                <div class="dot yellow"></div>
                <div class="dot green"></div>
              </div>
              <div class="address-bar">
                <i class="fa-solid fa-lock" style="font-size: 11px; color: #27C93F;"></i>
                <span id="address-path">/</span>
              </div>
              <i id="back-btn" class="fa-solid fa-arrow-left" style="color: #555; font-size: 14px; cursor: pointer; flex-shrink: 0;"></i>
              <i id="forward-btn" class="fa-solid fa-arrow-right" style="color: #555; font-size: 14px; cursor: pointer; flex-shrink: 0;"></i>
              <i id="reload-btn" class="fa-solid fa-rotate-right" style="color: #555; font-size: 14px; cursor: pointer; flex-shrink: 0;"></i>
            </div>
          </div>
          <div id="sub-app" is="swc-app-div" swc-get-application-config="$host.config(this)" swc-on-disconnected="console.log('Sub-app for Accommodation disconnected')">
          <accommodation-root-router/>
          </div>
        </div>
      </div>
      `;
    }

    config(el: SwcAppInterface) {
      const container = Symbol('accommodation-example');
      bootFactory(w, container);
      const config: SwcAttributeConfigType = {
        path: '/',
        routeType: 'element',
        container: container,
        window: w,
        onEngineStarted: (app, e) => {
          // alert(1)
          // e.innerHTML=`<accommodation-root-router/>`;
          if (e.router) {
            this.routerSubscription = e.router.observable.subscribe((route: any) => {
              if (route.triggerPoint === 'end') {
                this.updateAddressDisplay(route.path);
              }
            });
          }
        },
        onDisconnected: () => {
          this.routerSubscription?.unsubscribe();
        }
      };

      return config;
    }
  }
  return SwcAccommodationExamplePage;
};
