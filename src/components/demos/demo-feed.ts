import { elementDefine, innerHtml, insertBeforeEnd, intersectionObserver, onConnectedBodyShadow } from '@dooboostore/simple-web-component';
import { demoCard, type DemoCopy } from './shared';

const MAX = 100;

const COPY: DemoCopy = {
  kicker: ['Infinite scroll', '무한 스크롤'],
  title: ['Infinite scroll. Zero scroll listeners.', '무한 스크롤. 스크롤 이벤트 0줄.'],
  cap: ['Scroll the box. When the bottom marker comes into view, the next 10 are appended — no scroll math, no throttling, no cleanup.', '박스를 스크롤해 보세요. 바닥 표시가 보이면 다음 10개가 붙어요 — 스크롤 계산도, 쓰로틀도, 정리도 없음.'],
  code: `
@intersectionObserver('.feed-end')       // the bottom marker
@insertBeforeEnd('.feed', { valueKey: 'items' })
@innerHtml('.feed-count', { valueKey: 'count' })
more(_els: unknown,
     entries: IntersectionObserverEntry[]) {
  const seen = entries.some(e => e.isIntersecting);
  if (seen && this.loaded < 100) this.loaded += 10;
  return {
    items: seen ? rows(this.loaded - 10, 10) : undefined,
    count: \`\${this.loaded} / 100\`,
  };
}`,
};

const CSS = `
  .feed { display: flex; flex-direction: column; gap: 8px; }
  .feed-row { flex: none; padding: 12px 16px; border-radius: 12px; background: #121212; border: 1px solid #1E1E1E; color: #DDD; font-weight: 700;
    font-family: 'JetBrains Mono', monospace; font-size: 14px; animation: feed-in 0.35s ease; }
  .feed-end { text-align: center; color: #444; padding: 6px; }
  @keyframes feed-in { from { opacity: 0; transform: translateY(8px); } }
`;

export default (w: Window) => {
  const tag = 'demo-feed';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoFeed extends w.HTMLElement {
    private loaded = 0;

    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="scroll-box"><div class="feed"></div><div class="feed-end">…</div></div>
        <div class="demo-out mono feed-count">0 / ${MAX}</div>`, CSS);
    }

    @intersectionObserver('.feed-end')
    @insertBeforeEnd('.feed', { valueKey: 'items' })
    @innerHtml('.feed-count', { valueKey: 'count' })
    more(_els: HTMLElement[], entries: IntersectionObserverEntry[]) {
      const seen = entries.some(e => e.isIntersecting) && this.loaded < MAX;
      if (seen) this.loaded += 10;
      const rows = seen ? Array.from({ length: 10 }, (_, i) => `<div class="feed-row">#${this.loaded - 9 + i}</div>`).join('') : undefined;
      return { items: rows, count: `${this.loaded} / ${MAX}` };
    }
  }
  return tag;
};
