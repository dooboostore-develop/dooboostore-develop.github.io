import { attribute, elementDefine, innerHtml, onConnectedBefore, onConnectedBodyLight } from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tag = 'about-page';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class AboutPage extends w.HTMLElement {
    @onConnectedBefore
    @innerHtml((_c, h) => h.$w.document.querySelector('title'), { valueKey: 'title' })
    @attribute((_c, h) => h.$w.document.querySelector('meta[name="description"]'), 'content', { valueKey: 'description' })
    meta() {
      return { title: 'About — My Company', description: 'Who we are and what we do.' };
    }

    @onConnectedBodyLight
    render() {
      return `
        <section class="page">
          <h1>About us</h1>
          <p>Tell your story here: when you started, what you believe in, who is on the team.</p>
          <p><a href="/contact">Get in touch →</a></p>
        </section>`;
    }
  }
  return tag;
};
