import { elementDefine, onConnectedInnerHtml, addEventListener } from '@dooboostore/simple-web-component';
import { Sim } from '@dooboostore/simple-boot';
import { Router as WebRouter } from '@dooboostore/core-web';

export default (w: Window) => {
  const tagName = 'app-landing-page';
  const existing = w.customElements.get(tagName);
  if (existing) return existing;

  @Sim
  @elementDefine(tagName, { window: w })
  class LandingPage extends w.HTMLElement {
    private categories = [
      {
        name: 'Foundation',
        description: 'Fundamental types and cross-platform abstractions.',
        packages: [
          { id: 'core', name: '@dooboostore/core', icon: 'fa-gem', description: 'The bedrock of the ecosystem with reflection utilities.' },
          { id: 'core-web', name: '@dooboostore/core-web', icon: 'fa-globe', description: 'Web native API wrappers and safe event management.' },
          { id: 'core-node', name: '@dooboostore/core-node', icon: 'fa-server', description: 'Core abstractions optimized for Node.js environments.' }
        ]
      },
      {
        name: 'DOM & Components',
        description: 'Philosophy-driven UI and rendering engines.',
        packages: [
          { id: 'simple-web-component', name: '@dooboostore/simple-web-component', icon: 'fa-box', description: 'Reactive, standard-compliant Web Component library.' },
          { id: 'dom-render', name: '@dooboostore/dom-render', icon: 'fa-paint-roller', description: 'Lightweight, declarative DOM rendering engine.' },
          { id: 'dom-parser', name: '@dooboostore/dom-parser', icon: 'fa-code', description: 'Sophisticated template and DOM structure parser.' },
          { id: 'dom-editor', name: '@dooboostore/dom-editor', icon: 'fa-pen-to-square', description: 'Extensible components for DOM-based editing.' }
        ]
      },
      {
        name: 'Boot & Framework',
        description: 'Application lifecycle and dependency injection.',
        packages: [
          { id: 'simple-boot', name: '@dooboostore/simple-boot', icon: 'fa-bolt', description: 'Modular DI engine for any platform (Web, Node, Workers).' },
          { id: 'simple-boot-front', name: '@dooboostore/simple-boot-front', icon: 'fa-desktop', description: 'Enterprise-ready frontend application bootloader.' },
          { id: 'simple-boot-http-server', name: '@dooboostore/simple-boot-http-server', icon: 'fa-network-wired', description: 'Lightweight HTTP server with integrated DI.' },
          { id: 'simple-boot-http-server-ssr', name: '@dooboostore/simple-boot-http-server-ssr', icon: 'fa-cloud-arrow-up', description: 'Seamless Server-Side Rendering for dooboostore apps.' }
        ]
      },
      {
        name: 'Standard Libraries',
        description: 'Essential utility collections for developers.',
        packages: [
          { id: 'lib-web', name: '@dooboostore/lib-web', icon: 'fa-window-restore', description: 'Standard UI components and web-specific utilities.' },
          { id: 'lib-node', name: '@dooboostore/lib-node', icon: 'fa-cubes', description: 'Common utility functions for Node.js applications.' }
        ]
      }
    ];

    constructor(private webRouter: WebRouter) {
      super();
    }

    @onConnectedInnerHtml({ useShadow: true })
    render() {
      return `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

        :host { display: block; background: #0F0F0F; min-height: 100vh; color: #E0E0E0; }
        .hero { 
          padding: 160px 40px 100px; 
          text-align: center; 
          background: radial-gradient(circle at 50% 50%, #1A1A1A 0%, #0F0F0F 100%);
          border-bottom: 1px solid #2A2A2A;
        }
        .hero h1 { font-size: 64px; font-weight: 850; letter-spacing: -3px; margin: 0 0 24px; color: #FFF; }
        .hero p { font-size: 22px; color: #888; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        
        .section { max-width: 1300px; margin: 0 auto; padding: 100px 40px; }
        .section-header { margin-bottom: 48px; border-left: 5px solid #FF385C; padding-left: 24px; }
        .section-header h2 { font-size: 32px; font-weight: 800; margin: 0 0 8px; letter-spacing: -1px; color: #FFF; }
        .section-header p { color: #888; font-size: 18px; margin: 0; }
        
        .grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: 32px; 
          margin-bottom: 80px;
        }
        .card { 
          padding: 32px; 
          border-radius: 24px; 
          background: #1A1A1A; 
          border: 1px solid #2A2A2A; 
          cursor: pointer; 
          transition: 0.4s cubic-bezier(0.2, 0, 0, 1);
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #FF385C; transform: scaleX(0); transition: 0.4s;
        }
        .card:hover { 
          transform: translateY(-8px); 
          border-color: #3A3A3A;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        .card:hover::before { transform: scaleX(1); }
        .icon { 
          font-size: 32px; 
          width: 64px; 
          height: 64px; 
          background: #2A2A2A; 
          border-radius: 16px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #FF385C;
        }
        .card h3 { font-size: 18px; font-weight: 700; margin: 0; color: #FFF; line-height: 1.4; }
        .card p { font-size: 14px; color: #888; line-height: 1.6; margin: 0; }
        .card-footer { margin-top: auto; color: #FF385C; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .card-footer i { transition: 0.3s; }
        .card:hover .card-footer i { transform: translateX(4px); }

        /* Responsive */
        @media (max-width: 768px) {
          .hero { padding: 100px 20px 60px; }
          .hero h1 { font-size: 40px; letter-spacing: -1.5px; }
          .hero p { font-size: 18px; }
          .section { padding: 40px 20px; }
          .section-header { padding-left: 16px; margin-bottom: 32px; }
          .section-header h2 { font-size: 24px; }
          .section-header p { font-size: 15px; }
          .grid { grid-template-columns: 1fr; gap: 20px; }
          .card { padding: 24px; }
        }
      </style>

      <div class="hero">
        <h1>Packages Ecosystem.</h1>
        <p>
          Discover a comprehensive library collection crafted with extreme focus 
          on standard-compliance and modular architecture.
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
                <div class="card-footer">Explore <i class="fa-solid fa-arrow-right"></i></div>
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
      this.webRouter.go(`/package/${id}`);
    }
  }
  return LandingPage;
};
