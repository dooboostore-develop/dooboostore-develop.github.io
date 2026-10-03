import { attribute, elementDefine, innerHtml, onConnectedBefore, onConnectedBodyLight } from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tag = 'home-page';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class HomePage extends w.HTMLElement {
    // 이 페이지의 <title> 과 설명 — 빌드 때 HTML 에 박혀 검색엔진이 읽는다
    @onConnectedBefore
    @innerHtml((_c, h) => h.$w.document.querySelector('title'), { valueKey: 'title' })
    @attribute((_c, h) => h.$w.document.querySelector('meta[name="description"]'), 'content', { valueKey: 'description' })
    meta() {
      return { title: 'My Company', description: 'We build things people love.' };
    }

    @onConnectedBodyLight
    render() {
      return `
        <section class="hero">
          <h1>We build things people love.</h1>
          <p>Replace this text with what your company does, in one sentence.</p>
          <a class="button" href="/contact">Talk to us</a>
        </section>
        <section class="features">
          <div class="card"><h2>Fast</h2><p>Pages are rendered at build time, so they show up before any JavaScript runs.</p></div>
          <div class="card"><h2>Findable</h2><p>Every page has its own title and description, plus a sitemap for search engines.</p></div>
          <div class="card"><h2>Yours</h2><p>Plain Web Components. Edit <code>src/pages</code> and push — it deploys.</p></div>
        </section>`;
    }
  }
  return tag;
};
