import { elementDefine, eventWindow, innerHtml, matchedElement, onConnectedAfter, onConnectedBodyShadow, setInterval, eventClick } from '@dooboostore/simple-web-component';
import { demoCard, sleep, t, type DemoCopy } from './shared';

// 프로브 1,000개를 붙였다 떼고, 뗀 뒤에도 돌고 있는 리스너·타이머를 센다 (모듈 안 카운터)
const LEAK = { connected: 0, answers: 0, ticks: 0 };
const N = 1000;
const PING = 'swc-leak-ping';

// 제목에서 '누수 0' 을 단정하는 근거: scripts/smoke.mjs 가 배포 때마다 이 버튼을 눌러 1,000/1,000/0/0 이 아니면 배포를 막는다.
const COPY: DemoCopy = {
  kicker: ["Don't take our word for it", '믿지 말고 눌러보세요'],
  title: ['Mount 1,000, remove 1,000. Zero leaks. Press it and see.', '1,000개 붙였다 떼도 누수 0. 지금 눌러서 확인하세요.'],
  cap: ['Each probe owns a timer and a window listener. Every listener, timer and observer a decorator creates is torn down when the element leaves — this button measures the listeners and timers, live.',
    '프로브마다 타이머 하나, window 리스너 하나. 데코레이터가 만든 리스너·타이머·옵저버는 엘리먼트가 떠나면 전부 정리됩니다 — 이 버튼은 그중 리스너와 타이머를 지금 직접 잽니다.'],
  code: `
@elementDefine('leak-probe', { window: w })
class LeakProbe extends w.HTMLElement {
  @setInterval(100)
  tick() { stats.ticks++; }

  @eventWindow('swc-leak-ping')
  pong() { stats.answers++; }
}

// the button: mount 1,000 → ping (all answer)
// → remove all → reset → ping again → wait → count
// no removeEventListener, no clearInterval anywhere`,
};

const stats = (mounted: string, answered: string, listening: string, ticking: string) => `
  <div class="ls"><div class="lv">${mounted}</div><div class="ll">${t('mounted', '붙임')}</div></div>
  <div class="ls"><div class="lv">${answered}</div><div class="ll">${t('answered the ping', '핑에 응답')}</div></div>
  <div class="ls zero"><div class="lv">${listening}</div><div class="ll">${t('still listening after removal', '뗀 뒤에도 듣는 리스너')}</div></div>
  <div class="ls zero"><div class="lv">${ticking}</div><div class="ll">${t('timers still ticking', '아직 도는 타이머')}</div></div>`;

const CSS = `
  .leak-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
  .ls { padding: 16px 10px; border-radius: 14px; background: #121212; border: 1px solid #1E1E1E; }
  .ls .lv { font-size: 34px; font-weight: 850; color: #FFF; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
  .ls .ll { margin-top: 4px; font-size: 12px; color: #777; }
  .ls.zero { border-color: rgba(255, 56, 92, 0.45); background: rgba(255, 56, 92, 0.07); }
  .ls.zero .lv { color: #FF385C; }
`;

export default (w: Window) => {
  const tag = 'demo-leak';
  if (w.customElements.get(tag)) return tag;

  // 누수 테스트용 프로브 — 타이머 하나, window 리스너 하나
  if (!w.customElements.get('leak-probe')) {
    @elementDefine('leak-probe', { window: w })
    class LeakProbe extends w.HTMLElement {
      @onConnectedAfter
      ready() { LEAK.connected++; }

      @setInterval(100)
      tick() { LEAK.ticks++; }

      @eventWindow(PING)
      pong() { LEAK.answers++; }
    }
  }

  @elementDefine(tag, { window: w })
  class DemoLeak extends w.HTMLElement {
    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="leak-stats">${stats('0', '0', '–', '–')}</div>
        <button class="demo-btn" id="leak-btn">${t('Mount 1,000 → remove all', '1,000개 붙이기 → 전부 떼기')}</button>
        <div class="leak-stage" hidden></div>`, CSS);
    }

    // 1,000개 붙임 → 핑 → 전부 뗌 → 리셋 → 다시 핑 → 대기 → 센다
    @eventClick('#leak-btn')
    @innerHtml('.leak-stats', { fallback: () => stats('…', '…', '…', '…') })
    async run(@matchedElement btn: HTMLButtonElement) {
      btn.disabled = true;
      const stage = this.shadowRoot!.querySelector('.leak-stage')!;
      Object.assign(LEAK, { connected: 0, answers: 0, ticks: 0 });
      for (let i = 0; i < N; i++) stage.appendChild(this.ownerDocument.createElement('leak-probe'));
      // 전부 연결될 때까지 (최대 5초)
      for (let i = 0; i < 50 && LEAK.connected < N; i++) await sleep(100);
      const mounted = LEAK.connected;
      w.dispatchEvent(new (w as any).Event(PING));
      const answered = LEAK.answers;
      stage.replaceChildren();
      await sleep(300);
      Object.assign(LEAK, { answers: 0, ticks: 0 });
      w.dispatchEvent(new (w as any).Event(PING));
      await sleep(600); // 타이머 주기(100ms)의 6배 기다려도 안 돌아야 한다
      btn.disabled = false;
      const n = (x: number) => x.toLocaleString('en-US');
      return stats(n(mounted), n(answered), n(LEAK.answers), n(LEAK.ticks));
    }
  }
  return tag;
};
