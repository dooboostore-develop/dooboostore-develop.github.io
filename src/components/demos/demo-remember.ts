import { elementDefine, eventClick, fetchGet, innerHtml, onConnectedBodyShadow } from '@dooboostore/simple-web-component';
import { demoCard, esc, t, type DemoCopy } from './shared';

const POST_URL = 'https://jsonplaceholder.typicode.com/posts/3';

const COPY: DemoCopy = {
  kicker: ['Load once, keep it', '한 번 불러와서 기억하기'],
  title: ['Zero cache code. Read it ten times, the server hears once.', '캐시 코드 0줄. 열 번 읽어도 서버엔 한 번.'],
  cap: ['Press Read as often as you like — the request count stays at 1. Reload forgets it (this.post = undefined), so the next read asks the server again.',
    '읽기를 몇 번 눌러도 요청 수는 1. 다시 불러오기는 기억을 지우고(this.post = undefined), 다음 읽기에 서버에 다시 묻습니다.'],
  code: `
@fetchGet(POST_URL)
declare post?: Promise<Post>;   // read → request once → remembered

@eventClick('#read-btn')
@innerHtml('.mem-out')
read() {
  return this.post?.then(p => p.title);
}

@eventClick('#reload-btn')
reload() {
  this.post = undefined;          // forget → the next read requests again
}`,
};

const CSS = `
  .mem-stats { display: flex; gap: 18px; justify-content: var(--stage-justify); align-items: center; margin-bottom: 16px; color: #555; }
  .mem-stats div { display: flex; flex-direction: column; align-items: var(--stage-align); min-width: 90px; }
  .mem-stats b { font-size: 34px; font-weight: 850; color: #FFF; font-variant-numeric: tabular-nums; }
  .mem-stats b.req { color: #FF385C; }
  .mem-stats span { font-size: 12px; color: #777; }
  .mem-out { min-height: 54px; font-size: 18px; }
  .row { display: flex; gap: 8px; justify-content: var(--stage-justify); flex-wrap: wrap; }
`;

type Post = { title: string };

export default (w: Window) => {
  const tag = 'demo-remember';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoRemember extends w.HTMLElement {
    private reads = 0;
    private requests = 0;

    // request 팩토리는 요청이 실제로 나갈 때만 불린다 — 화면의 "요청" 수가 그대로 사실이 되도록 여기서 센다
    @fetchGet(POST_URL, { request: (self: DemoRemember) => { self.requests++; return {}; } })
    declare post?: Promise<Post>;

    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="mem-stats">${this.stats()}</div>
        <div class="demo-out mem-out">${t('Press Read.', '읽기를 눌러보세요.')}</div>
        <div class="row">
          <button class="demo-btn" id="read-btn">${t('Read', '읽기')}</button>
          <button class="demo-btn ghost" id="reload-btn">${t('Reload', '다시 불러오기')}</button>
        </div>
        <div class="meta">jsonplaceholder.typicode.com</div>`, CSS);
    }

    private stats() {
      return `<div><b>${this.reads}</b><span>${t('reads', '읽기')}</span></div>
        <i class="fa-solid fa-arrow-right"></i>
        <div><b class="req">${this.requests}</b><span>${t('requests', '실제 요청')}</span></div>`;
    }

    @eventClick('#read-btn')
    @innerHtml('.mem-out', { valueKey: 'text', fallback: () => t('Loading…', '불러오는 중…') })
    @innerHtml('.mem-stats', { valueKey: 'stats' })
    read() {
      this.reads++;
      return this.post?.then(
        p => ({ text: `<b>${esc(p.title)}</b>`, stats: this.stats() }),
        () => ({ text: t('Failed — Reload to try again.', '실패 — 다시 불러오기로 재시도.'), stats: this.stats() }));
    }

    @eventClick('#reload-btn')
    @innerHtml('.mem-out', { valueKey: 'text' })
    @innerHtml('.mem-stats', { valueKey: 'stats' })
    reload() {
      this.post = undefined;
      return { text: t('Forgotten — the next read asks the server again.', '잊었어요 — 다음 읽기는 서버에 다시 묻습니다.'), stats: this.stats() };
    }
  }
  return tag;
};
