import { elementDefine, eventWindow, emitCustomEvent, event, innerHtml, onConnectedBody, onConnectedBodyShadow, onConnectedSwcApp, onInitialize, SwcAppInterface, subscribeSwcAppMessage, appMessage, subscribeSwcAppRouteChange, updateClass } from "@dooboostore/simple-web-component";
import type { SwcAppMessage } from "@dooboostore/simple-web-component";
import type { RouterEventType } from "@dooboostore/core-web";
import { LANG_CHANGED, type Lang } from "@/utils/lang";
import {GlobalStyle} from "@/styles/GlobalStyle";
import { GITHUB_URL, NPM_PROFILE_URL } from "@/data/packages";

export default (w: Window) => {
    const tagName = 'app-header';
    const existing = w.customElements.get(tagName);
    if (existing) return tagName;

    @elementDefine(tagName, { window: w })
    class AppHeader extends w.HTMLElement {
        @onConnectedBody
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
                app-header .actions { display: flex; align-items: center; }
                app-header .logo-container { display: flex; align-items: center; gap: 12px; cursor: pointer; text-decoration: none; }
                app-header .logo-img { height: 40px; width: auto; filter: drop-shadow(0 0 10px rgba(255, 56, 92, 0.3)); }
                app-header .logo-text { font-size: 24px; font-weight: 850; color: #FFF; letter-spacing: -1px; display: flex; align-items: center; }
                app-header .brand-name { color: #FFF; transition: 0.3s; }

                app-header .links { display: flex; gap: 32px; font-weight: 600; color: #888; }
                app-header .links span { cursor: pointer; transition: 0.2s; display: flex; align-items: center; }
                app-header .links span:hover { color: #FFF; }
                app-header .links span.active { color: #FFF; }
                app-header .links span.active i { opacity: 1; }
                app-header .links i { font-size: 16px; color: #FF385C; opacity: 0.8; margin-right: 8px; font-style: normal; }
                app-header .cta { 
                    padding: 0; width: 44px; height: 44px; border-radius: 12px; 
                    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #BBB; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
                }
                app-header .cta:hover { background: #FF385C; color: #FFF; }
                app-header .cta span { display: none; }
                app-header .cta i { margin-right: 0; font-size: 24px; font-style: normal; }
                app-header .dev { position: relative; margin-right: 12px; }
                app-header .dev.open .cta { background: #FF385C; color: #FFF; }
                app-header .dev-menu {
                    display: none;
                    position: absolute; top: calc(100% + 8px); right: 0; min-width: 250px;
                    background: rgba(15, 15, 15, 0.97); backdrop-filter: blur(12px);
                    border: 1px solid #2A2A2A; border-radius: 12px; padding: 6px;
                    z-index: 10001;
                }
                app-header .dev.open .dev-menu { display: block; }
                app-header .dev-opt { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; text-decoration: none; color: #DDD; font-size: 14px; font-weight: 700; }
                app-header .dev-opt:hover { background: rgba(255, 255, 255, 0.06); color: #FFF; }
                app-header .dev-opt i { width: 20px; font-size: 18px; color: #FF385C; }
                app-header .dev-opt small { margin-left: auto; font-size: 12px; font-weight: 500; color: #666; font-family: 'JetBrains Mono', monospace; }
                app-header .lang { position: relative; }
                app-header .lang-current {
                    display: flex; align-items: center; gap: 6px; height: 44px;
                    font-size: 13px; font-weight: 700; color: #BBB;
                    padding: 10px 12px; border-radius: 12px; cursor: pointer;
                    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: 0.2s;
                }
                app-header .lang-current:hover { color: #FFF; }
                app-header .lang-menu {
                    display: none;
                    position: absolute; top: calc(100% + 8px); right: 0; min-width: 140px;
                    background: rgba(15, 15, 15, 0.97); backdrop-filter: blur(12px);
                    border: 1px solid #2A2A2A; border-radius: 12px; padding: 6px;
                    z-index: 10001;
                }
                app-header .lang.open .lang-menu { display: block; }
                app-header .lang-opt { display: block; font-size: 14px; font-weight: 600; color: #888; padding: 10px 12px; border-radius: 8px; cursor: pointer; }
                app-header .lang-opt:hover { color: #FFF; background: rgba(255, 255, 255, 0.06); }
                app-header .lang-opt.active { color: #FFF; }

                @media (max-width: 768px) {
                    app-header .nav { padding: 0 20px; }
                    app-header .logo-text { display: none; }
                    app-header .links { gap: 24px; }
                    app-header .links span { font-size: 0; }
                    app-header .links i { font-size: 22px; margin-right: 0; }
                    app-header .lang { margin-right: 0; }
                }
            </style>
            <div class="nav">
                <div class="logo-container" id="home" data-path="/">
                    <img src="assets/dooboostore.png" class="logo-img" alt="logo">
                    <div class="logo-text">
                        <span lang="en" class="brand-name">@dooboostore</span><span lang="ko" class="brand-name">두부가게</span>
                    </div>
                </div>
                <div class="links">
                    <span data-path="/start"><i class="fa-solid fa-rocket"></i>Start</span>
                    <span data-path="/components"><i class="fa-solid fa-box"></i>Components</span>
                    <span data-path="/ssr"><i class="fa-solid fa-bolt"></i>SSR</span>
                    <span data-path="/ecosystem"><i class="fa-solid fa-layer-group"></i>Ecosystem</span>
                </div>
                <div class="actions">
                    <div class="dev">
                        <div class="cta" id="github-btn" title="GitHub · npm">
                            <i class="fa-brands fa-github"></i><span>GitHub</span>
                        </div>
                        <div class="dev-menu">
                            <a class="dev-opt" href="${GITHUB_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i>GitHub<small>packages</small></a>
                            <a class="dev-opt" href="${NPM_PROFILE_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-npm"></i>npm<small>~dooboostore</small></a>
                            <a class="dev-opt" href="${GITHUB_URL}/issues" target="_blank" rel="noopener"><i class="fa-regular fa-comment"></i>Issues<small>bugs · ideas</small></a>
                        </div>
                    </div>
                    <div class="lang" id="lang-menu">
                        <button class="lang-current" id="lang-btn">EN</button>
                        <div class="lang-menu">
                            <span class="lang-opt" data-lang="en">EN · English</span>
                            <span class="lang-opt" data-lang="ko">KO · 한국어</span>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        // 현재 경로에 해당하는 메뉴 강조 (하위 경로 포함: /package/simple-web-component/examples → SWC)
        // trigger 'connectedDone': 첫 로드 때 메뉴 렌더(@onConnectedBody) 이후에 현재 경로를 재생
        @subscribeSwcAppRouteChange({ trigger: 'connectedDone' })
        @updateClass('.links span')
        highlightNav(route: RouterEventType) {
            return { active: (el: HTMLElement) => !!el.dataset.path && (route.path === el.dataset.path || route.path.startsWith(el.dataset.path + '/')) };
        }

        // GitHub·npm 펼침 — 열 때 언어 메뉴는 닫는다
        @event('#github-btn', 'click')
        onDevMenuToggle() {
            this.querySelector('.lang')?.classList.remove('open');
            this.querySelector('.dev')?.classList.toggle('open');
        }

        @event('.dev-opt', 'click', { delegate: true })
        onDevOptClick() { this.querySelector('.dev')?.classList.remove('open'); }

        // 헤더 밖을 누르면 펼친 메뉴를 닫는다 (리스너는 엘리먼트가 떠나면 자동 해제)
        @eventWindow('click')
        onOutsideClick(e: Event) {
            if (e.composedPath().includes(this)) return;
            this.querySelectorAll('.dev.open, .lang.open').forEach(el => el.classList.remove('open'));
        }

        // 현재 언어 표시 — behavior라 첫 로드 때 현재값 바로 반영
        @subscribeSwcAppMessage(LANG_CHANGED, { subject: 'behavior' })
        @innerHtml('.lang-current')
        renderLang(@appMessage msg: SwcAppMessage<Lang>) {
            return (msg?.data ?? 'en').toUpperCase();
        }

        // 펼침 메뉴 안 현재 언어 강조
        @subscribeSwcAppMessage(LANG_CHANGED, { subject: 'behavior' })
        @updateClass('.lang-opt')
        highlightLang(@appMessage msg: SwcAppMessage<Lang>) {
            return { active: (el: HTMLElement) => el.dataset.lang === (msg?.data ?? 'en') };
        }

        // 펼침 열기/닫기
        @event('#lang-btn', 'click')
        onLangMenuToggle() {
            this.querySelector('.dev')?.classList.remove('open');
            this.querySelector('.lang')?.classList.toggle('open');
        }

        // 언어 전환 — 단일 기록 경로: body.changeLang(상태+저장+발행), 고르면 메뉴 닫음
        @event('.lang-opt', 'click', { delegate: true })
        onLangClick(e: any) {
            const lang = e.target.closest('[data-lang]')?.dataset?.lang;
            if (lang === 'ko' || lang === 'en') {
                (this.ownerDocument.querySelector('#app') as any)?.changeLang?.(lang);
            }
            this.querySelector('.lang')?.classList.remove('open');
        }

        @emitCustomEvent('navigate', { attributeName: 'on-emit-navigate' })
        @event('.links span, .logo-container', 'click', { delegate: true })
        onNavClick(e: any) {
            const target = e.target.closest('[data-path]');
            const path = target?.dataset?.path || '/';
            return { path };
        }
    }
    return tagName;
};
