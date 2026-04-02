import { elementDefine, innerHtml, intersectionObserver, onConnectedBodyShadow, updateClass } from '@dooboostore/simple-web-component';
import { demoCard, type DemoCopy } from './shared';

const CARDS: Array<[string, string]> = [['🍣', 'Sushi'], ['🍕', 'Pizza'], ['🍜', 'Ramen'], ['🌮', 'Taco'], ['🥐', 'Croissant'], ['🍩', 'Donut'], ['🍦', 'Gelato'], ['🥗', 'Salad']];

const COPY: DemoCopy = {
  kicker: ['Scroll animations', '스크롤 애니메이션'],
  title: ['Never create or tear down an IntersectionObserver again.', 'IntersectionObserver, 만들 일도 해제할 일도 없습니다.'],
  cap: ['No IntersectionObserver setup, no unobserve on teardown — one decorator, and it\'s all cleaned up when the element leaves.', 'IntersectionObserver 생성도, 해제도 직접 안 함 — 데코레이터 하나, 엘리먼트가 떠나면 알아서 정리.'],
  code: `
private seen = new Set<Element>();

@intersectionObserver('.reveal-card', {
  threshold: 0.6,
})
@updateClass('.reveal-card', {
  root: 'auto', valueKey: 'cls',
})
@innerHtml('.reveal-count', { valueKey: 'count' })
onReveal(_els: unknown,
         entries: IntersectionObserverEntry[]) {
  for (const e of entries)
    e.isIntersecting ? this.seen.add(e.target)
                     : this.seen.delete(e.target);
  return {
    cls: { on: (el: Element) => this.seen.has(el) },
    count: \`\${this.seen.size} / 8 in view\`,
  };
}`,
};

const CSS = `
  .scroll-box { scroll-snap-type: y proximity; }
  .reveal-card { flex: none; display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: 14px; background: #121212; border: 1px solid #1E1E1E;
    color: #555; font-weight: 800; font-size: 16px; opacity: 0.35; transform: scale(0.94); transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .reveal-card span { font-size: 26px; filter: grayscale(1); transition: filter 0.35s; }
  .reveal-card.on { opacity: 1; transform: scale(1); color: #FFF; border-color: rgba(255, 56, 92, 0.5);
    background: linear-gradient(120deg, rgba(255, 56, 92, 0.16), rgba(255, 56, 92, 0.03)); }
  .reveal-card.on span { filter: none; }
`;

export default (w: Window) => {
  const tag = 'demo-reveal';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoReveal extends w.HTMLElement {
    private seen = new Set<Element>();

    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="scroll-box">${CARDS.map(([e, n]) => `<div class="reveal-card"><span>${e}</span>${n}</div>`).join('')}</div>
        <div class="demo-out mono reveal-count">0 / ${CARDS.length} in view</div>`, CSS);
    }

    @intersectionObserver('.reveal-card', { threshold: 0.6 })
    @updateClass('.reveal-card', { root: 'auto', valueKey: 'cls' })
    @innerHtml('.reveal-count', { valueKey: 'count' })
    onReveal(_els: HTMLElement[], entries: IntersectionObserverEntry[]) {
      for (const e of entries) e.isIntersecting ? this.seen.add(e.target) : this.seen.delete(e.target);
      return {
        cls: { on: (el: Element) => this.seen.has(el) },
        count: `${this.seen.size} / ${CARDS.length} in view`,
      };
    }
  }
  return tag;
};
