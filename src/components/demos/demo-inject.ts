import { elementDefine, eventObject, helperHostSet, innerHtml, matchedElement, onConnectedBodyShadow, eventClickDelegate } from '@dooboostore/simple-web-component';
import type { HelperHostSet } from '@dooboostore/simple-web-component';
import { demoCard, t, type DemoCopy } from './shared';

const COPY: DemoCopy = {
  kicker: ['Take only what you need', '필요한 것만 골라 받기'],
  title: ['Zero argument order to memorize. Ask by name, it arrives.', '외울 인자 순서 0개. 이름으로 달라면 옵니다.'],
  cap: ['No positional arguments to memorize. Swap the parameters around — it still works.', '외울 인자 순서 없음. 파라미터 자리를 바꿔도 그대로 동작.'],
  code: `
@eventClickDelegate('.pick')
@innerHtml('.inject-out')
onPick(
  @helperHostSet h: HelperHostSet,   // $this, $q …
  @eventObject e: MouseEvent,        // DOM event
  @matchedElement item: HTMLElement, // the .pick
) {
  const host = h.$this.localName;
  return \`\${item.dataset.name} · \${e.type} · \${host}\`;
}`,
};

const CSS = `
  .picks { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; }
  .pick { font-size: 30px; width: 64px; height: 64px; border-radius: 16px; cursor: pointer; background: #161616; border: 1px solid #2A2A2A; transition: 0.15s; }
  .pick:hover { border-color: #FF385C; transform: translateY(-2px); }
`;

export default (w: Window) => {
  const tag = 'demo-inject';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoInject extends w.HTMLElement {
    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="picks">
          <button class="pick" data-name="apple">🍎</button>
          <button class="pick" data-name="lemon">🍋</button>
          <button class="pick" data-name="grape">🍇</button>
        </div>
        <div class="demo-out mono inject-out">${t('Pick one.', '하나 골라보세요.')}</div>`, CSS);
    }

    @eventClickDelegate('.pick')
    @innerHtml('.inject-out')
    onPick(@helperHostSet h: HelperHostSet, @eventObject e: MouseEvent, @matchedElement item: HTMLElement) {
      return `${item.dataset.name} · ${e.type} · ${(h.$this as HTMLElement).localName}`;
    }
  }
  return tag;
};
