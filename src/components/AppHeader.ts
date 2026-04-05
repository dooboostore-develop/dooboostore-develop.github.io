import { elementDefine, onConnectedInnerHtml, addEventListener, emitCustomEventHost } from '@dooboostore/simple-web-component';
import {GlobalStyle} from "@/styles/GlobalStyle";

export default (w: Window) => {
    const tagName = 'app-header';
    const existing = w.customElements.get(tagName);
    if (existing) return tagName;

    @elementDefine(tagName, { window: w })
    class AppHeader extends w.HTMLElement {
        @onConnectedInnerHtml({ useShadow: false })
        render() {
            return `
            <style>
                ${GlobalStyle}
                
                app-header {
                    display: block !important; 
                    width: 100% !important;
                    background: rgba(15, 15, 15, 0.85) !important; 
                    backdrop-filter: blur(12px) !important; 
                    border-bottom: 1px solid #2A2A2A !important; 
                    z-index: 10000 !important;
                    box-sizing: border-box !important;
                }
                app-header * {
                    box-sizing: border-box;
                }
                app-header .nav { max-width: 1200px; margin: 0 auto; height: 80px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; box-sizing: border-box; }
                app-header .logo-container { display: flex; align-items: center; gap: 12px; cursor: pointer; text-decoration: none; }
                app-header .logo-img { height: 40px; width: auto; filter: drop-shadow(0 0 10px rgba(255, 56, 92, 0.3)); }
                app-header .logo-text { font-size: 24px; font-weight: 850; color: #FFF; letter-spacing: -1px; display: flex; align-items: center; }
                app-header .brand-name { color: #FFF; transition: 0.3s; }
                app-header .logo-text .ecosystem { 
                    margin-left: 8px;
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

                app-header .links { display: flex; gap: 32px; font-weight: 600; color: #888; }
                app-header .links span { cursor: pointer; transition: 0.2s; display: flex; align-items: center; }
                app-header .links span:hover { color: #FFF; }
                app-header .links i { font-size: 16px; color: #FF385C; opacity: 0.8; margin-right: 8px; font-style: normal; }
                app-header .cta { 
                    padding: 0; width: 44px; height: 44px; border-radius: 12px; 
                    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #BBB; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
                }
                app-header .cta:hover { background: #FF385C; color: #FFF; }
                app-header .cta span { display: none; }
                app-header .cta i { margin-right: 0; font-size: 24px; font-style: normal; }

                @media (max-width: 768px) {
                    app-header .nav { padding: 0 20px; }
                    app-header .logo-text { display: none; }
                    app-header .links { gap: 24px; }
                    app-header .links span { font-size: 0; }
                    app-header .links i { font-size: 22px; margin-right: 0; }
                }
            </style>
            <div class="nav">
                <div class="logo-container" id="home" data-path="/">
                    <img src="assets/dooboostore.png" class="logo-img" alt="logo">
                    <div class="logo-text">
                        <span class="brand-name">@dooboostore</span>
                        <span class="ecosystem">ecosystem</span>
                    </div>
                </div>
                <div class="links">
                    <span data-path="/package/core"><i class="fa-solid fa-gem"></i>Core</span>
                    <span data-path="/package/simple-boot"><i class="fa-solid fa-bolt"></i>Boot</span>
                    <span data-path="/package/simple-web-component"><i class="fa-solid fa-box"></i>SWC</span>
                    <span data-path="/package/simple-boot-http-server"><i class="fa-solid fa-network-wired"></i>Server</span>
                    <span data-path="/package/dom-parser"><i class="fa-solid fa-code"></i>Parser</span>
                </div>
                <div class="cta" id="github-btn">
                    <i class="fa-brands fa-github"></i><span>GitHub</span>
                </div>
            </div>
            `;
        }

        @addEventListener('#github-btn', 'click')
        onGithubClick() { window.open('https://github.com/dooboostore-develop/packages', '_blank'); }

        @emitCustomEventHost('navigate')
        @addEventListener('.links span, .logo-container', 'click', { delegate: true })
        onNavClick(e: any) {
            const target = e.target.closest('[data-path]');
            const path = target?.dataset?.path || '/';
            return { path };
        }
    }
    return tagName;
};
