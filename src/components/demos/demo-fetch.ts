import { elementDefine, fetch, fetchSettled, innerHtml, onConnectedBodyShadow, eventClick } from '@dooboostore/simple-web-component';
import { demoCard, esc, t, type DemoCopy } from './shared';

const COPY: DemoCopy = {
  kicker: ['Load data from a server', '서버에서 데이터 불러오기'],
  title: ['Zero try/catch. Loading, cancel and errors still handled.', 'try/catch 0줄. 그래도 로딩·취소·에러까지 처리.'],
  cap: ['Mash it: only the last request survives (Network tab shows the rest cancelled). Failure arrives as data, not a throw.', '연타해 보세요: 마지막 요청만 살아남음 (네트워크 탭에 나머진 취소). 실패도 throw가 아니라 데이터로.'],
  code: `
@eventClick('#fetch-btn')
// shown while the request is pending
@innerHtml('.fetch-out', { fallback: () => 'Loading…' })
// click again → the previous request is aborted
@fetch({ url: POST_URL, abortPrevious: true })
async load(@fetchSettled settled?: Settled<Post>) {
  if (settled?.status !== 'fulfilled')
    return 'Failed — but no throw.';
  return \`<b>\${settled.value.title}</b>\`;
}`,
};

export default (w: Window) => {
  const tag = 'demo-fetch';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoFetch extends w.HTMLElement {
    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="demo-out fetch-out">${t('Press load — a real GET goes out.', '불러오기를 눌러보세요 — 진짜 GET이 나갑니다.')}</div>
        <button class="demo-btn" id="fetch-btn">${t('Load post #1', '글 #1 불러오기')}</button>
        <div class="meta">jsonplaceholder.typicode.com</div>`);
    }

    @eventClick('#fetch-btn')
    @innerHtml('.fetch-out', { fallback: () => t('Loading…', '불러오는 중…') })
    @fetch({ url: 'https://jsonplaceholder.typicode.com/posts/1', abortPrevious: true })
    async load(@fetchSettled settled?: PromiseSettledResult<any>) {
      if (settled?.status !== 'fulfilled') return t('Failed — but no throw.', '실패 — 그래도 throw 없음.');
      const title = esc(String(settled.value?.title ?? ''));
      return t(`<b>${title}</b><br>by user ${settled.value?.userId}`, `<b>${title}</b><br>작성자 ${settled.value?.userId}`);
    }
  }
  return tag;
};
