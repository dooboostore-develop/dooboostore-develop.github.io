import { elementDefine, onConnectedInnerHtml, addEventListener, emitCustomEventHost } from '@dooboostore/simple-web-component';

export const createAppHeader = (w: Window) => {
    const tagName = 'app-header';
    const existing = w.customElements.get(tagName);
    if (existing) return existing;

    @elementDefine(tagName, { window: w })
    class AppHeader extends w.HTMLElement {
        @onConnectedInnerHtml({ useShadow: true })
        render() {
            return `
            <style>
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

                :host {
                    display: block; position: fixed; top: 0; left: 0; right: 0; height: 80px;
                    background: rgba(15, 15, 15, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #2A2A2A; z-index: 1000;
                }
                .nav { max-width: 1200px; margin: 0 auto; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; }
                .logo-container { display: flex; align-items: center; gap: 12px; cursor: pointer; text-decoration: none; }
                .logo-img { height: 40px; width: auto; filter: drop-shadow(0 0 10px rgba(255, 56, 92, 0.3)); }
                .logo-text { font-size: 24px; font-weight: 850; color: #FFF; letter-spacing: -1px; }
                .logo-text span { color: #FF385C; }
                .links { display: flex; gap: 32px; font-weight: 600; color: #888; }
                .links span { cursor: pointer; transition: 0.2s; display: flex; align-items: center; }
                .links span:hover { color: #FFF; }
                .links i { font-size: 16px; color: #FF385C; opacity: 0.8; margin-right: 8px; }
                .cta { background: #FFF; color: #000; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; text-decoration: none; }
                .cta:hover { background: #FF385C; color: #FFF; }
                .cta i { font-size: 18px; margin-right: 8px; }

                /* Mobile Responsive Styles */
                @media (max-width: 768px) {
                    .nav { padding: 0 20px; }
                    .logo-text { display: none; }
                    .links { gap: 24px; }
                    .links span { font-size: 0; } /* 텍스트 숨김 */
                    .links i { font-size: 22px; margin-right: 0; } /* 아이콘만 크게 표시 */
                    .cta { padding: 10px; width: 40px; height: 40px; border-radius: 50%; justify-content: center; }
                    .cta span { display: none; } /* GitHub 텍스트 숨김 */
                    .cta i { margin-right: 0; font-size: 22px; }
                }
            </style>
            <div class="nav">
                <div class="logo-container" id="home" data-path="/">
                    <img src="assets/dooboostore.png" class="logo-img" alt="logo">
                    <div class="logo-text">@dooboostore<span> ecosystem</span></div>
                </div>
                <div class="links">
                    <span data-path="/"><i class="fa-solid fa-compass"></i>Explore</span>
                    <span data-path="/package/core"><i class="fa-solid fa-gem"></i>Core</span>
                    <span data-path="/package/simple-boot"><i class="fa-solid fa-bolt"></i>Boot</span>
                    <span data-path="/package/simple-web-component"><i class="fa-solid fa-box"></i>SWC</span>
                </div>
                <div class="cta" id="github-btn">
                    <i class="fa-brands fa-github"></i><span>GitHub</span>
                </div>
            </div>
            `;
        }

        @addEventListener('#github-btn', 'click')
        onGithubClick() {
            window.open('https://github.com/dooboostore-develop/packages', '_blank');
        }

        @emitCustomEventHost('navigate')
        @addEventListener('.links span, .logo-container', 'click', { delegate: true })
        onNavClick(e: any) {
            const target = e.target.closest('[data-path]');
            const path = target?.dataset?.path || '/';
            return { path };
        }
    }
    return AppHeader;
};
