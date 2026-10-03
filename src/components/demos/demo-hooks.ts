import { elementDefine, eventBeforeReturn, eventClick, innerHtml, onConnectedBodyShadow } from '@dooboostore/simple-web-component';
import { demoCard, sleep, t, type DemoCopy } from './shared';

const COPY: DemoCopy = {
  kicker: ['Check → prepare → run → clean up', '검사 → 준비 → 실행 → 정리'],
  title: ['Check, prepare, run, clean up — all on one method.', '검사·준비·실행·정리, 메서드 하나에 다 붙습니다.'],
  cap: ['filter gates it, before prepares data and injects it, finally always cleans up. The same four hooks exist on every trigger.', 'filter가 막고, before가 데이터를 준비해 꽂고, finally가 항상 정리. 모든 트리거에 같은 네 훅이 있어요.'],
  code: `
@eventClick('#buy-btn', {
  filter: (_e, { currentThis: c }) => c.agreed(),
  before: async () => {
    await sleep(900);               // pretend work
    return 'TOFU-' + randomDigits(4); // → injected
  },
  finally: (_e, { currentThis: c }) => c.unlock(),
})
@innerHtml('.buy-out')
onBuy(@eventBeforeReturn orderId: string) {
  return \`✓ Order \${orderId} placed\`;
}`,
};

const HOOKS = ['filter', 'before', 'handler', 'finally'];

// 체크박스 줄은 flex — GlobalStyle 의 [lang] 래퍼가 block 이라 inline 이면 줄이 깨진다
const CSS = `
  .agree { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #CCC; font-size: 14px; cursor: pointer; }
  .agree input { width: 18px; height: 18px; accent-color: #FF385C; }
  .pipe { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 20px 0 6px; flex-wrap: wrap; }
  .pipe i { color: #444; font-size: 12px; }
  .hook { padding: 6px 11px; border-radius: 999px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; font-weight: 700;
    background: #151515; border: 1px solid #262626; color: #777; transition: 0.2s; }
  .hook.run { color: #FFF; border-color: #FFB020; background: rgba(255, 176, 32, 0.15); }
  .hook.ok { color: #FFF; border-color: #FF385C; background: rgba(255, 56, 92, 0.18); }
  .hook.no { color: #FF6B86; border-color: #5A1A26; background: #1A0D10; text-decoration: line-through; }
`;

export default (w: Window) => {
  const tag = 'demo-hooks';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoHooks extends w.HTMLElement {
    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <label class="agree"><input type="checkbox" class="agree-box"><span>${t('I agree to buy a very real tofu', '진짜 두부 사는 데 동의합니다')}</span></label>
        <button class="demo-btn" id="buy-btn">${t('Buy', '구매')}</button>
        <div class="pipe">${HOOKS.map(h => `<span class="hook" data-step="${h}">${h}</span>`).join('<i class="fa-solid fa-angle-right"></i>')}</div>
        <div class="demo-out mono buy-out">${t('Try it unchecked first.', '먼저 체크 없이 눌러보세요.')}</div>`, CSS);
    }

    // 훅이 지금 어디까지 왔는지 불 켜기 (데모 시각화용)
    markHook(step: string, state: 'run' | 'ok' | 'no' | '') {
      const el = this.shadowRoot?.querySelector(`.hook[data-step="${step}"]`);
      if (el) el.className = `hook ${state}`;
    }

    agreed() {
      HOOKS.forEach(h => this.markHook(h, ''));
      const ok = !!(this.shadowRoot?.querySelector('.agree-box') as HTMLInputElement | null)?.checked;
      this.markHook('filter', ok ? 'ok' : 'no');
      if (!ok) {
        const out = this.shadowRoot?.querySelector('.buy-out');
        if (out) out.innerHTML = t('✗ Blocked by filter — tick the box.', '✗ filter가 막음 — 체크박스를 켜세요.');
        this.shadowRoot?.querySelector('.agree')?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
      }
      return ok;
    }

    unlock() {
      this.shadowRoot?.querySelector('#buy-btn')?.removeAttribute('disabled');
      this.markHook('finally', 'ok');
    }

    @eventClick('#buy-btn', {
      filter: (_e, { currentThis: c }) => c.agreed(),
      before: async (_e, { currentThis: c }) => {
        c.markHook('before', 'run');
        c.shadowRoot?.querySelector('#buy-btn')?.setAttribute('disabled', '');
        await sleep(900);
        c.markHook('before', 'ok');
        return 'TOFU-' + String(Math.floor(1000 + Math.random() * 9000));
      },
      finally: (_e, { currentThis: c }) => c.unlock(),
    })
    @innerHtml('.buy-out')
    onBuy(@eventBeforeReturn orderId: string) {
      this.markHook('handler', 'ok');
      return t(`✓ Order ${orderId} placed`, `✓ 주문 ${orderId} 완료`);
    }
  }
  return tag;
};
