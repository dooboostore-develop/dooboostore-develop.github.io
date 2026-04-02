import { elementDefine, fetch, fetchPromise, innerHtml, onConnectedBodyShadow, eventClick } from '@dooboostore/simple-web-component';
import { demoCard, esc, t, type DemoCopy } from './shared';

const COPY: DemoCopy = {
  kicker: ['Load data from a server', '서버에서 데이터 불러오기'],
  title: ['Zero try/catch. Loading, cancel and errors still handled.', 'try/catch 0줄. 그래도 로딩·취소·에러까지 처리.'],
  cap: ['Mash it: only the last request survives (Network tab shows the rest cancelled). You get the request as a Promise — failure goes to the second then callback, no try/catch.', '연타해 보세요: 마지막 요청만 살아남음 (네트워크 탭에 나머진 취소). 요청을 Promise로 받으니 실패는 then의 두 번째 콜백으로 — try/catch 없이.'],
  code: `
@eventClick('#fetch-btn')
// shown while the request is pending
@innerHtml('.fetch-out', { fallback: () => 'Loading…' })
// click again → the previous request is aborted
@fetch({ url: POST_URL, abortPrevious: true })
load(@fetchPromise p: Promise<Post>) {   // the request, as a Promise
  return p.then(post => \`<b>\${post.title}</b>\`,
                () => 'Failed — but no try/catch.');
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
    load(@fetchPromise p: Promise<any>) {
      return p.then(
        post => {
          const title = esc(String(post?.title ?? ''));
          return t(`<b>${title}</b><br>by user ${post?.userId}`, `<b>${title}</b><br>작성자 ${post?.userId}`);
        },
        () => t('Failed — but no try/catch.', '실패 — 그래도 try/catch 없음.'));
    }
  }
  return tag;
};
