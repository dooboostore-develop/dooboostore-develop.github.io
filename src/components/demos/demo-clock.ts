import { elementDefine, innerHtml, onConnectedBodyShadow, setInterval, updateStyle } from '@dooboostore/simple-web-component';
import { demoCard, type DemoCopy } from './shared';

const COPY: DemoCopy = {
  kicker: ['Update every second', '매초 갱신하기'],
  title: ['Zero clearInterval. Leave the page and it stops itself.', 'clearInterval 0줄. 페이지를 떠나면 알아서 멈춥니다.'],
  cap: ['Ticks every second. Leave this page and it stops by itself — the timer belongs to the element.', '매초 똑딱. 이 페이지를 떠나면 알아서 멈춥니다 — 타이머가 엘리먼트에 묶여 있어요.'],
  code: `
@setInterval(1000)
@innerHtml('.clock-time', { valueKey: 'time' })
@updateStyle('.clock-ring', { valueKey: 'ring' })
tick() {
  const now = new Date();
  const deg = now.getSeconds() * 6;
  return {
    time: now.toTimeString().slice(0, 8),  // 19:31:33
    ring: { background:
      \`conic-gradient(#FF385C \${deg}deg, #1E1E1E 0)\` },
  };
}
// no clearInterval — it stops when the element leaves`,
};

const CSS = `
  .clock-ring { width: 190px; height: 190px; border-radius: 50%; margin: 0 auto 6px; padding: 10px; background: conic-gradient(#FF385C 0deg, #1E1E1E 0);
    box-shadow: 0 0 40px rgba(255, 56, 92, 0.18); transition: background 0.3s; }
  .clock-face { width: 100%; height: 100%; border-radius: 50%; background: #0B0B0B; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .clock-time { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700; color: #FFF; }
  .clock-sub { margin-top: 6px; font-size: 12px; color: #FF6B86; font-family: 'JetBrains Mono', monospace; }
`;

export default (w: Window) => {
  const tag = 'demo-clock';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoClock extends w.HTMLElement {
    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="clock-ring"><div class="clock-face"><div class="clock-time">--:--:--</div><div class="clock-sub">@setInterval</div></div></div>`, CSS);
    }

    @setInterval(1000)
    @innerHtml('.clock-time', { valueKey: 'time' })
    @updateStyle('.clock-ring', { valueKey: 'ring' })
    tick() {
      const now = new Date();
      const deg = now.getSeconds() * 6;
      return {
        time: now.toTimeString().slice(0, 8),
        ring: { background: `conic-gradient(#FF385C ${deg}deg, #1E1E1E 0)` },
      };
    }
  }
  return tag;
};
