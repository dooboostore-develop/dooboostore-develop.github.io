import * as SWC from '@dooboostore/simple-web-component';
import { elementDefine, innerHtml, matchedElement, onConnectedBodyShadow, eventInput } from '@dooboostore/simple-web-component';
import { demoCard, t, type DemoCopy } from './shared';

// 검색 대상: 이 라이브러리가 실제로 내보내는 이름들
const NAMES = Object.keys(SWC).sort();

const COPY: DemoCopy = {
  kicker: ['Search as you type', '입력하면서 검색'],
  title: ['Debounce without writing a debounce. One option.', 'debounce를 안 짜도 debounce. 옵션 하나.'],
  cap: ['Searching this library\'s own export names. Type a word quickly: the key count races, the search count barely moves.', '이 라이브러리가 실제로 내보내는 이름들에서 검색. 빠르게 쳐보면 키 수는 치솟고 검색 수는 거의 안 움직여요.'],
  code: `
@eventInput('.q-in')                 // every key
@innerHtml('.q-keys')
countKey() { return ++this.keys; }

@eventInput('.q-in', {
  debounceTime: 300,                     // after a pause
})
@innerHtml('.q-runs', { valueKey: 'runs' })
@innerHtml('.q-out', { valueKey: 'hits' })
search(@matchedElement input: HTMLInputElement) {
  const q = input.value;
  const hits = NAMES.filter(n => n.includes(q));
  return { runs: ++this.runs, hits: chips(hits) };
}`,
};

const CSS = `
  .q-stats { display: flex; gap: 18px; justify-content: center; align-items: center; margin-bottom: 16px; color: #555; }
  .q-stats div { display: flex; flex-direction: column; align-items: center; min-width: 90px; }
  .q-stats b { font-size: 34px; font-weight: 850; color: #FFF; font-variant-numeric: tabular-nums; }
  .q-stats b.q-runs { color: #FF385C; }
  .q-stats span { font-size: 12px; color: #777; }
  .q-out { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; min-height: 34px; max-width: 340px; margin: 0 auto;
    padding: 6px; border: 1px dashed #2A2A2A; border-radius: 12px; color: #777; font-size: 13px; }
  .q-out span { padding: 4px 10px; border-radius: 999px; background: rgba(255, 56, 92, 0.15); color: #FF6B86; font-size: 13px; font-weight: 600;
    font-family: 'JetBrains Mono', monospace; }
  .q-out em { font-style: normal; color: #888; font-size: 12px; padding: 4px 6px; }
`;

export default (w: Window) => {
  const tag = 'demo-search';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoSearch extends w.HTMLElement {
    private keys = 0;
    private runs = 0;

    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <input class="text-in q-in" placeholder="route, fetch, observer…" autocomplete="off" />
        <div class="q-stats">
          <div><b class="q-keys">0</b><span>${t('keys typed', '누른 키')}</span></div>
          <i class="fa-solid fa-arrow-right"></i>
          <div><b class="q-runs">0</b><span>${t('searches run', '실제 검색')}</span></div>
        </div>
        <div class="q-out">${t('Type fast — searches wait for a pause.', '빠르게 쳐보세요 — 멈출 때만 검색합니다.')}</div>`, CSS);
    }

    @eventInput('.q-in')
    @innerHtml('.q-keys')
    countKey() { return String(++this.keys); }

    @eventInput('.q-in', { debounceTime: 300 })
    @innerHtml('.q-runs', { valueKey: 'runs' })
    @innerHtml('.q-out', { valueKey: 'hits' })
    search(@matchedElement input: HTMLInputElement) {
      const q = input.value.trim().toLowerCase();
      const hits = q ? NAMES.filter(n => n.toLowerCase().includes(q)) : [];
      const shown = hits.slice(0, 12).map(n => `<span>${n}</span>`).join('');
      const more = hits.length > 12 ? `<em>+${hits.length - 12}</em>` : '';
      return { runs: String(++this.runs), hits: q ? (shown + more || t('No match', '없음')) : '' };
    }
  }
  return tag;
};
