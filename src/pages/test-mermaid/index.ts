// TEMP-TEST: 옵저버 4종(this/selector × mutation/resize) + mermaid 검증용. 검증 후 삭제/유지 결정.
import { elementDefine, event, innerHtml, innerHtmlLight, mutationObserver, onConnectedBody, resizeObserver, subscribeSwcAppRouteChangeConnectedDone } from '@dooboostore/simple-web-component';
import { createMarked, runMermaid } from '@/utils/markdown';

// 콜백 로그용: 노드 → tag.class
const d = (n: any) => !n ? String(n) : n.nodeType === 1 ? `${n.tagName.toLowerCase()}${n.getAttribute('class') ? '.' + n.getAttribute('class').trim().split(/\s+/).join('.') : ''}` : n.nodeType === 11 ? '#shadow' : `#${n.nodeName}`;
const recs = (muts: MutationRecord[]) => (muts ?? []).map(m => `${m.type}@${d(m.target)}${m.addedNodes.length ? ' +' + Array.from(m.addedNodes).map(d).join(',') : ''}${m.removedNodes.length ? ' -' + m.removedNodes.length : ''}`);

const SAMPLE = '# mermaid e2e\n\n```mermaid\ngraph TD\n  A[boot] --> B[parse]\n  B --> C[render]\n```\n\n```ts\nconst a: number = 1;\n```\n';

export default (w: Window) => {
  const tagName = 'app-test-mermaid-page';
  const existing = w.customElements.get(tagName);
  if (existing) return tagName;

  const marked = createMarked();

  @elementDefine(tagName, { window: w })
  class TestMermaidPage extends w.HTMLElement {
    private moThisCount = 0;
    private moSelCount = 0;
    private roThisCount = 0;
    private roSelCount = 0;

    @onConnectedBody({ fallback: '<div class="readme-content">fallback-loading…</div>' })
    async render() {
      await new Promise(r => setTimeout(r, 1500));
      return `<div class="readme-content">loading…</div>
      <div class="obs-tests" style="max-width:900px;margin:0 auto;padding:20px 40px 60px;color:#DDD;font-size:14px;">
        <h2>observer matrix</h2>
        <div class="obs-row">
          <h3>1. mutation × this(bare)</h3>
          <button id="mo-add">add .mo-item</button>
          <ul id="mo-list"></ul>
          <div id="mo-log"></div>
        </div>
        <div class="obs-row">
          <h3>2. mutation × selector(.watched)</h3>
          <button id="mo-sel-add">add to .watched</button>
          <div class="watched" style="border:1px solid #333;padding:8px;min-height:30px;"></div>
          <div id="mo-sel-log"></div>
        </div>
        <div class="obs-row">
          <h3>3. resize × this(bare)</h3>
          <div id="ro-log" style="height:120px;overflow:auto;"></div>
        </div>
        <div class="obs-row">
          <h3>4. resize × selector(.ro-box)</h3>
          <button id="ro-toggle">toggle .ro-box size</button>
          <div class="ro-box" style="width:100px;height:40px;background:#222;"></div>
          <div id="ro-sel-log" style="height:120px;overflow:auto;"></div>
        </div>
      </div>`;
    }

    private log(sel: string, msg: string) {
      const box = this.querySelector(sel);
      if (!box) return;
      const line = this.ownerDocument.createElement('div');
      line.className = 'log-line';
      line.textContent = msg;
      box.appendChild(line);
    }

    // 1. mutation this — .mo-item 추가만 기록 (로그라인은 무시 → 루프 없음)
    @mutationObserver
    onAnyMut(els: HTMLElement[], muts: MutationRecord[]) {
      const r = recs(muts);
      console.log('[1 mo:this]', els.map(d), r.length > 3 ? [...r.slice(0, 3), `…+${r.length - 3}`] : r);
      for (const m of muts ?? []) {
        for (const n of Array.from(m.addedNodes ?? [])) {
          if (n.nodeType === 1 && (n as Element).matches?.('.mo-item')) {
            this.moThisCount++;
            this.log('#mo-log', `this #${this.moThisCount}: ${(n as Element).textContent}`);
          }
        }
      }
    }

    // 2. mutation selector
    @mutationObserver('.watched', { childList: true, subtree: true })
    onWatchedMut(els: HTMLElement[], muts: MutationRecord[]) {
      console.log('[2 mo:.watched]', els.map(d), recs(muts));
      let added = 0;
      for (const m of muts ?? []) added += (m.addedNodes ?? []).length;
      if (!added) return;
      this.moSelCount++;
      this.log('#mo-sel-log', `selector #${this.moSelCount}: +${added} nodes`);
    }

    // 3. resize this — 로그 박스는 고정 높이: 핸들러가 자기 크기를 키우면 RO 루프 에러(undelivered notifications)
    @resizeObserver
    onResizeSelf(matched: HTMLElement[], entries: ResizeObserverEntry[]) {
      console.log('[3 ro:this]', matched.map(d), (entries ?? []).map(e => `${d(e.target)} ${Math.round(e.contentRect.width)}x${Math.round(e.contentRect.height)}`));
      for (const en of entries ?? []) {
        if (en.target !== this) continue;
        this.roThisCount++;
        const r = (en.target as Element).getBoundingClientRect();
        this.log('#ro-log', `this #${this.roThisCount}: ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }

    // 4. resize selector
    @resizeObserver('.ro-box')
    onResizeBox(matched: HTMLElement[], entries: ResizeObserverEntry[]) {
      console.log('[4 ro:.ro-box]', matched.map(d), (entries ?? []).map(e => `${d(e.target)} ${Math.round(e.contentRect.width)}x${Math.round(e.contentRect.height)}`));
      if (!entries?.length) return;
      this.roSelCount++;
      const t = entries[0].target as Element;
      const r = t.getBoundingClientRect();
      const cls = (t as HTMLElement).className ?? t.tagName;
      this.log('#ro-sel-log', `selector #${this.roSelCount}: ${Math.round(r.width)}x${Math.round(r.height)} [${cls}]`);
    }

    @event('#mo-add', 'click')
    addMoItem() {
      const li = this.ownerDocument.createElement('li');
      li.className = 'mo-item';
      li.textContent = `item ${this.ownerDocument.querySelectorAll('.mo-item').length + 1}`;
      this.querySelector('#mo-list')?.appendChild(li);
    }

    @event('#mo-sel-add', 'click')
    addWatchedItem() {
      const d = this.ownerDocument.createElement('div');
      d.textContent = `w${Date.now() % 1000}`;
      this.querySelector('.watched')?.appendChild(d);
    }

    @event('#ro-toggle', 'click')
    toggleRoBox() {
      const box = this.querySelector('.ro-box') as HTMLElement | null;
      if (!box) return;
      box.style.width = box.style.width === '200px' ? '100px' : '200px';
    }

    @subscribeSwcAppRouteChangeConnectedDone(['/test-mermaid'])
    @innerHtml('.readme-content')
    async fill() {
      return `${marked.parse(SAMPLE)}`;
    }

    @mutationObserver('.readme-content', { childList: true, subtree: true, delegate: true })
    async onRendered(els: HTMLElement[], muts: MutationRecord[]) {
      console.log('[5 mo:.readme-content delegate]', `${els.length} els`, `${recs(muts).length} records`);
      await runMermaid(this);
    }
  }
  return tagName;
};
