import {onAfterConnected,onConnectedSwcApp, elementDefine, onConnectedInnerHtml, addEventListener, onInitialize, setProperty, subscribeSwcAppRouteChange} from '@dooboostore/simple-web-component';
import { Inject } from '@dooboostore/simple-boot';
import {Router, type RouterEventType} from '@dooboostore/core-web';
import { GlobalStyle } from '../styles/GlobalStyle';

export default (w: Window) => {
  const tagName = 'app-landing-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  @elementDefine(tagName, { window: w })
  class LandingPage extends w.HTMLElement {
    private categories = [
      {
        name: 'Foundation',
        description: 'Core abstractions and reflection utilities.',
        packages: [
          { id: 'core', name: '@dooboostore/core', icon: 'fa-gem', description: 'The bedrock of the ecosystem with reflection utilities.' },
          { id: 'core-web', name: '@dooboostore/core-web', icon: 'fa-globe', description: 'Web native API wrappers and safe event management.' },
          { id: 'core-node', name: '@dooboostore/core-node', icon: 'fa-server', description: 'Core abstractions optimized for Node.js environments.' }
        ]
      },
      {
        name: 'UI & Components',
        description: 'Reactive rendering and standard component models.',
        packages: [
          { id: 'simple-web-component', name: '@dooboostore/simple-web-component', icon: 'fa-box', description: 'Reactive, standard-compliant Web Component library.' },
          { id: 'dom-render', name: '@dooboostore/dom-render', icon: 'fa-paint-roller', description: 'Lightweight, declarative DOM rendering engine.' },
          { id: 'dom-parser', name: '@dooboostore/dom-parser', icon: 'fa-code', description: 'Sophisticated template and DOM structure parser.' }
        ]
      },
      {
        name: 'Framework',
        description: 'Application lifecycle and dependency injection.',
        packages: [
          { id: 'simple-boot', name: '@dooboostore/simple-boot', icon: 'fa-bolt', description: 'Modular DI engine for any platform (Web, Node, Workers).' },
          { id: 'simple-boot-front', name: '@dooboostore/simple-boot-front', icon: 'fa-desktop', description: 'Enterprise-ready frontend application bootloader.' },
          { id: 'simple-boot-http-server', name: '@dooboostore/simple-boot-http-server', icon: 'fa-network-wired', description: 'Lightweight HTTP server with integrated DI.' },
          { id: 'simple-boot-http-server-ssr', name: '@dooboostore/simple-boot-http-server-ssr', icon: 'fa-cloud-arrow-up', description: 'Seamless Server-Side Rendering for dooboostore apps.' }
        ]
      },
      {
        name: 'Libraries',
        description: 'Essential utility collections for developers.',
        packages: [
          { id: 'lib-web', name: '@dooboostore/lib-web', icon: 'fa-window-restore', description: 'Standard UI components and web-specific utilities.' },
          { id: 'lib-node', name: '@dooboostore/lib-node', icon: 'fa-cubes', description: 'Common utility functions for Node.js applications.' }
        ]
      }
    ];
    private router: Router;

    @onConnectedSwcApp
    onconstructor(router: Router) {
      this.router = router;
      console.log('-----24--->', this.router)
    }

    @onInitialize
    onconstruactor(router: Router) {
      this.router = router;
      console.log('-----0--->', this.router)
    }
    @onAfterConnected
    a(router: Router){
      console.log('--22-', router)
    }

    @onConnectedInnerHtml({ useShadow: true })
    render(router: Router){
      console.log('--22222222html-', router)
      return `
      <style>
        ${GlobalStyle}

        :host { 
          display: block;
          background: #080808; 
          min-height: 100vh; 
          color: #A0A0A0; 
          font-family: 'Pretendard', sans-serif; 
          box-sizing: border-box; 
          overflow-x: hidden;
        }
        * { box-sizing: border-box; }
        
        .hero { 
          padding: 180px 40px 100px; 
          text-align: center; 
          max-width: 1000px;
          margin: 0 auto;
        }
        .hero h1 { 
          font-size: 72px; font-weight: 850; letter-spacing: -4px; margin: 0 0 32px; color: #FFF; line-height: 1.0;
        }
        .hero p { font-size: 20px; color: #666; max-width: 600px; margin: 0 auto; line-height: 1.6; }
        
        .highlight {
            background: linear-gradient(120deg, #FF385C 0%, #ff6b86 25%, #ff1a43 50%, #ff6b86 75%, #FF385C 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: aurora 8s linear infinite;
            font-weight: 800;
            filter: drop-shadow(0 0 10px rgba(255, 56, 92, 0.4));
            display: inline-block;
        }
        @keyframes aurora { from { background-position: 0% center; } to { background-position: 200% center; } }

        .section { max-width: 1400px; margin: 0 auto; padding: 40px 40px 100px; }
        .section-header { margin-bottom: 48px; border-top: 1px solid #1A1A1A; padding-top: 48px; }
        .section-header h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #FF385C; margin-bottom: 8px; }
        .section-header p { color: #FFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
        
        .grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 20px; 
          margin-bottom: 60px;
        }
        .card { 
          padding: 32px; 
          border-radius: 20px; 
          background: #111; 
          border: 1px solid #1A1A1A; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card:hover { 
          background: #161616;
          border-color: #333;
          transform: translateY(-4px);
        }
        .icon { 
          font-size: 24px; 
          width: 48px; 
          height: 48px; 
          background: #1A1A1A; 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #FF385C;
          transition: 0.2s;
        }
        .card:hover .icon { background: #FF385C; color: #FFF; }
        
        .card h3 { font-size: 18px; font-weight: 700; margin: 0; color: #FFF; }
        .card p { font-size: 14px; color: #666; line-height: 1.6; margin: 0; }
        .card-footer { margin-top: auto; color: #FF385C; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; transition: 0.2s; }
        .card:hover .card-footer { opacity: 1; color: #FFF; }

        @media (max-width: 768px) {
          .hero { padding: 120px 24px 60px; }
          .hero h1 { font-size: 44px; letter-spacing: -2px; }
          .hero p { font-size: 17px; }
          .section { padding: 24px; }
          .grid { grid-template-columns: 1fr; }
          .section-header p { font-size: 20px; }
        }
      </style>

      <div class="hero">
        <h1>Essential Building Blocks<br>for Modern Engineers.</h1>
        <p>
          High-performance <span class="highlight">ecosystem</span> crafted with standard-first philosophy 
          and minimal overhead for enterprise-grade applications.
        </p>
      </div>

      <div class="section">
        ${this.categories.map(cat => `
          <div class="section-header">
            <h2>${cat.name}</h2>
            <p>${cat.description}</p>
          </div>
          <div class="grid">
            ${cat.packages.map(pkg => `
              <div class="card" data-id="${pkg.id}">
                <div class="icon">
                  <i class="fa-solid ${pkg.icon}"></i>
                </div>
                <div class="card-content">
                  <h3>${pkg.name}</h3>
                  <p>${pkg.description}</p>
                </div>
                <div class="card-footer">View Documentation <i class="fa-solid fa-arrow-right"></i></div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
      `;
    }

    @addEventListener('.card', 'click', { delegate: true })
    onPackageClick(e: any) {
      const id = e.target.closest('.card').dataset.id;
      this.router.go(`/package/${id}`);
    }
  }
  return tagName;
};
