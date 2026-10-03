import { elementDefine, eventObject, onConnectedBodyShadow, requestAnimationFrame, updateStyle, eventPointermove } from '@dooboostore/simple-web-component';
import { demoCard, t, type DemoCopy } from './shared';

const COPY: DemoCopy = {
  kicker: ['Smooth animation', '부드러운 애니메이션'],
  title: ['An animation loop with zero loop code.', '애니메이션 루프, 루프 코드 0줄.'],
  cap: ['Runs every frame while the element is on the page — no requestAnimationFrame to re-schedule, no cancelAnimationFrame when it leaves.', '엘리먼트가 화면에 있는 동안 매 프레임 실행 — requestAnimationFrame 재예약도, 떠날 때 cancelAnimationFrame도 없음.'],
  code: `
@eventPointermove('.chase')
aim(@eventObject e: PointerEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  this.tx = e.clientX - r.left;
  this.ty = e.clientY - r.top;
}

@requestAnimationFrame  // every frame
@updateStyle('.chase-dot')
follow() {
  this.x += (this.tx - this.x) * 0.12;  // ease toward
  this.y += (this.ty - this.y) * 0.12;
  return { transform: \`translate(\${this.x}px, \${this.y}px)\` };
}`,
};

// touch-action: none — 모바일에서 손가락 드래그가 페이지 스크롤이 아니라 pointermove 로 온다
const CSS = `
  .chase { position: relative; height: 220px; max-width: 420px; margin: 0 auto; border: 1px dashed #2A2A2A; border-radius: 16px;
    overflow: hidden; touch-action: none; display: flex; align-items: center; justify-content: center; color: #555; font-size: 13px; cursor: crosshair; user-select: none; }
  .chase-dot { position: absolute; left: -14px; top: -14px; width: 28px; height: 28px; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle at 35% 35%, #FF8FA3, #FF385C); box-shadow: 0 0 24px rgba(255, 56, 92, 0.7); }
`;

export default (w: Window) => {
  const tag = 'demo-chase';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoChase extends w.HTMLElement {
    private tx = 0;
    private ty = 0;
    private x = 0;
    private y = 0;

    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="chase">${t('Move your pointer (or drag) here', '여기서 마우스를 움직이거나 드래그해 보세요')}<div class="chase-dot"></div></div>`, CSS);
    }

    @eventPointermove('.chase')
    aim(@eventObject e: PointerEvent) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      this.tx = e.clientX - r.left;
      this.ty = e.clientY - r.top;
    }

    @requestAnimationFrame
    @updateStyle('.chase-dot')
    follow() {
      this.x += (this.tx - this.x) * 0.12;
      this.y += (this.ty - this.y) * 0.12;
      return { transform: `translate(${this.x}px, ${this.y}px)` };
    }
  }
  return tag;
};
