import { createElement, type CreateElementConfig, elementDefine, property, SwcAppMixin, type SwcAppInterface } from '@dooboostore/simple-web-component';
import type { Subscription } from '@dooboostore/core';
import { LANG_CHANGED, type Lang, persistLang, resolveInitialLang } from '@/utils/lang';

export const showcaseAppBodyTagName = 'swc-app-showcase-body';

export const ShowcaseAppBody = (w: Window, data?: CreateElementConfig) => {
  return createElement<SwcAppInterface & HTMLBodyElement>(w, showcaseAppBodyTagName, data);
};

export const defineShowcaseAppBody = async (w: Window) => {
  const existing = w.customElements.get(showcaseAppBodyTagName);
  if (existing) return existing;

  @elementDefine(showcaseAppBodyTagName, { window: w, extends: 'body' })
  class ShowcaseAppBodyImpl extends SwcAppMixin(w.HTMLBodyElement) implements SwcAppInterface {
    // 현재 언어. 자기 버스를 코드로 구독해 전환마다 갱신.
    // @property: SSR 하이드레이션 직렬화 대상 표시 (자기 필드라 순수 동작, DOM 탐색 없음)
    // 주의: 'lang;' 선언도 emit되면 업그레이드 때 undefined로 덮어씀. declare로 타입만 둘 것.
    @property
    declare lang: Lang;
    private langSubscription?: Subscription;

    // DOM에 붙을 때: 자기 버스 구독
    override onConnected(): void {
      this.langSubscription = this.observeMessage<Lang>(LANG_CHANGED, { subject: 'behavior' })
        .subscribe(msg => {
          if (msg.data === 'ko' || msg.data === 'en') this.lang = msg.data;
        });
    }

    // DOM에서 떨어질 때: 구독 해제
    override onDisconnected(): void {
      this.langSubscription?.unsubscribe();
      this.langSubscription = undefined;
    }

    // connect() 완료 후 호출 → 최초 언어 1회 발행 (늦게 붙는 구독자도 behavior로 수신).
    // @publishSwcAppMessage 데코레이터는 부모 호스트를 찾아 쏘는데 body는 자기 자신이
    // 호스트라 부모가 없어서 버려짐. 그래서 this.publishMessage 직접 호출.
    override async onSwcAppConnected(): Promise<void> {
      try {
        // 최초 언어는 window에서 해결: 저장값 → navigator.language → 'en'
        this.lang = resolveInitialLang(this.ownerDocument?.defaultView ?? window);
        this.applyLangToDom(this.lang);
        this.publishMessage({ type: LANG_CHANGED, data: this.lang });
      } catch {
        // 발행 실패해도 앱 부팅은 계속
      }
    }

    // 헤더 토글 등에서 호출: 상태 갱신 + 저장 + 발행 (구독자 재조회 없음)
    changeLang(lang: Lang): void {
      this.lang = lang;
      try {
        persistLang(this.ownerDocument?.defaultView ?? window, lang);
      } catch {
        // 무시
      }
      this.applyLangToDom(lang);
      this.publishMessage({ type: LANG_CHANGED, data: lang });
    }

    // 다국어 DOM 반영 단일 경로: data-lang + CSS 변수 (섀도우 안까지 상속됨)
    private applyLangToDom(lang: Lang): void {
      try {
        this.dataset.lang = lang;
        this.style.setProperty('--show-en', lang === 'en' ? 'block' : 'none');
        this.style.setProperty('--show-ko', lang === 'ko' ? 'block' : 'none');
        const docEl = this.ownerDocument?.documentElement;
        if (docEl) docEl.setAttribute('lang', lang);
      } catch {
        // 무시
      }
    }
  }

  return w.customElements.whenDefined(showcaseAppBodyTagName);
};

export default defineShowcaseAppBody;
