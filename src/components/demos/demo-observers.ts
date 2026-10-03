import { elementDefine, innerHtml, matchedElement, mutationObserver, onConnectedAfter, onConnectedBodyShadow, query, resizeObserver, updateStyle, eventClick, eventInput, removeNode } from '@dooboostore/simple-web-component';
import { demoCard, t, type DemoCopy } from './shared';

const COPY: DemoCopy = {
  kicker: ['Watch size and changes', '크기·변화 감지하기'],
  title: ['Stack as many as you like — still one MutationObserver, one ResizeObserver.', '몇 개를 쌓든 MutationObserver·ResizeObserver는 딱 하나씩.'],
  cap: ['However many observer decorators you stack, the element shares one MutationObserver and one ResizeObserver.', '옵저버 데코레이터를 몇 개 쌓든, 엘리먼트당 MutationObserver 하나와 ResizeObserver 하나를 공유.'],
  code: `
// shadow root resolved for you
@query('.chips') declare chips: HTMLElement;

@mutationObserver('.chips', { childList: true })
@resizeObserver('.chips')          // same box
@innerHtml('.chip-out')
onChips() {
  const { children, offsetHeight } = this.chips;
  return \`\${children.length} chips · \${offsetHeight}px\`;
}

@eventInput('.rs-range')       // slider → box width
@updateStyle('.rs-box')
onRange(@matchedElement r: HTMLInputElement) {
  return { width: \`\${r.value}px\` };
}

@resizeObserver('.rs-box')         // any size change
@innerHtml('.rs-out')
onBoxResize([box]: HTMLElement[]) {
  return \`\${box.offsetWidth} × \${box.offsetHeight}\`;
}`,
};

// 모서리 드래그(resize)는 터치에서 안 되므로 슬라이더로 크기를 바꾼다
const CSS = `
  .row { display: flex; gap: 8px; justify-content: center; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; min-height: 34px; max-width: 340px; margin: 0 auto 14px;
    padding: 6px; border: 1px dashed #2A2A2A; border-radius: 12px; }
  .chips span { padding: 4px 10px; border-radius: 999px; background: rgba(255, 56, 92, 0.15); color: #FF6B86; font-size: 13px; font-weight: 700; }
  .rs-box { overflow: hidden; width: 220px; height: 70px; max-width: 100%; transition: width 0.08s;
    margin: 18px auto 0; border: 1px solid #FF385C; border-radius: 12px; background: rgba(255, 56, 92, 0.06);
    display: flex; align-items: center; justify-content: center; font-size: 13px; color: #FF6B86; font-weight: 700; }
  .rs-range { display: block; width: 100%; max-width: 320px; margin: 14px auto 0; accent-color: #FF385C; }
`;

export default (w: Window) => {
  const tag = 'demo-observers';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoObservers extends w.HTMLElement {
    // declare: 필드 선언이 emit 되면 @query 접근자를 undefined 로 덮는다
    @query('.chips') declare chips: HTMLElement;

    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="chips"></div>
        <div class="row">
          <button class="demo-btn sm" id="chip-add">${t('+ chip', '+ 칩')}</button>
          <button class="demo-btn sm ghost" id="chip-remove">${t('− chip', '− 칩')}</button>
        </div>
        <div class="demo-out mono chip-out">0 chips · 0px</div>
        <div class="rs-box">${t('resize me', '크기를 바꿔보세요')}</div>
        <input class="rs-range" type="range" min="120" max="320" value="220" aria-label="box width">
        <div class="demo-out mono rs-out">—</div>
        <div class="meta obs-count"></div>`, CSS);
    }

    @eventClick('#chip-add')
    addChip() {
      const chip = this.ownerDocument.createElement('span');
      chip.textContent = `#${this.chips.children.length + 1}`;
      this.chips.appendChild(chip);
    }

    // 마지막 칩을 뗀다 — 칩이 없으면 대상이 없어 아무 일도 안 함
    @eventClick('#chip-remove')
    @removeNode('.chips > :last-child')
    removeChip() {}

    @mutationObserver('.chips', { childList: true })
    @resizeObserver('.chips')
    @innerHtml('.chip-out')
    onChips() {
      return `${this.chips.children.length} chips · ${this.chips.offsetHeight}px`;
    }

    @eventInput('.rs-range')
    @updateStyle('.rs-box')
    onRange(@matchedElement r: HTMLInputElement) {
      return { width: `${r.value}px` };
    }

    @resizeObserver('.rs-box')
    @innerHtml('.rs-out')
    onBoxResize([box]: HTMLElement[]) {
      return `${box.offsetWidth} × ${box.offsetHeight}`;
    }

    // 증거: 이 엘리먼트가 실제로 만든 옵저버 수
    @onConnectedAfter
    @innerHtml('.obs-count')
    countObservers() {
      const list: any[] = (this as any).__swc_observers ?? [];
      const n = (C: any) => list.filter(o => o instanceof C).length;
      const win = w as any;
      return `this element → MutationObserver × ${n(win.MutationObserver)} · ResizeObserver × ${n(win.ResizeObserver)}`;
    }
  }
  return tag;
};
