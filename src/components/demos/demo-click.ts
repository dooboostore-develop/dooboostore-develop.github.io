import { elementDefine, innerHtml, onConnectedBodyShadow, eventClick } from '@dooboostore/simple-web-component';
import { demoCard, t, type DemoCopy } from './shared';

const COPY: DemoCopy = {
  kicker: ['Click → the screen updates', '클릭하면 화면이 바뀐다'],
  title: ['Two decorators. The screen updates. That\'s it.', '데코레이터 두 줄. 화면이 바뀝니다. 끝.'],
  cap: ['No setState. No store. The method on the right is the whole app.', 'setState도 스토어도 없음. 오른쪽 메서드가 앱 전부.'],
  code: `
private clicks = 0;

@eventClick('#click-btn')   // when: clicked
@innerHtml('.click-out')        // where: output div
onClick() {
  this.clicks++;
  return \`\${this.clicks} clicks so far.\`;
}`,
};

const said = (n: number) => t(`Click the button.<br><span class="n">${n}</span> clicks so far.`, `버튼을 눌러보세요.<br>지금까지 <span class="n">${n}</span>번.`);

export default (w: Window) => {
  const tag = 'demo-click';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class DemoClick extends w.HTMLElement {
    private clicks = 0;

    @onConnectedBodyShadow
    render() {
      return demoCard(tag, COPY, `
        <div class="demo-out click-out">${said(0)}</div>
        <button class="demo-btn" id="click-btn">${t('Click me', '눌러보기')}</button>`,
        `.demo-out .n { color: #FF385C; font-size: 40px; }`);
    }

    @eventClick('#click-btn')
    @innerHtml('.click-out')
    onClick() {
      this.clicks++;
      return said(this.clicks);
    }
  }
  return tag;
};
