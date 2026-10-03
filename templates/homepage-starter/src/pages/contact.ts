import { attribute, elementDefine, event, innerHtml, matchedElement, onConnectedBefore, onConnectedBodyLight } from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tag = 'contact-page';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class ContactPage extends w.HTMLElement {
    @onConnectedBefore
    @innerHtml((_c, h) => h.$w.document.querySelector('title'), { valueKey: 'title' })
    @attribute((_c, h) => h.$w.document.querySelector('meta[name="description"]'), 'content', { valueKey: 'description' })
    meta() {
      return { title: 'Contact — My Company', description: 'Send us a message.' };
    }

    @onConnectedBodyLight
    render() {
      return `
        <section class="page">
          <h1>Contact</h1>
          <form class="contact-form">
            <label>Name <input name="name" required></label>
            <label>Email <input name="email" type="email" required></label>
            <label>Message <textarea name="message" rows="4" required></textarea></label>
            <button class="button" type="submit">Send</button>
          </form>
          <p class="result"></p>
        </section>`;
    }

    // 제출 → 결과 문구. 실제로 보내려면 여기서 폼 서비스(Formspree 등)나 내 API 로 fetch 하면 된다.
    @event('form', 'submit', { preventDefault: true })
    @innerHtml('.result')
    onSubmit(@matchedElement form: HTMLFormElement) {
      const name = String(new FormData(form).get('name') ?? '');
      form.reset();
      return `Thanks, ${name.replace(/</g, '&lt;')}! We'll get back to you soon.`;
    }
  }
  return tag;
};
