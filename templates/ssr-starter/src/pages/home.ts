import { elementDefine, onConnectedBodyLight } from '@dooboostore/simple-web-component';

export default (w: Window) => {
  const tag = 'home-page';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class HomePage extends w.HTMLElement {
    @onConnectedBodyLight
    render() {
      return `
        <section class="page">
          <h1>Rendered on the server.</h1>
          <p>Open "view source" — this text is already in the HTML. The browser keeps it and only wires up behavior.</p>
          <ul class="facts">
            <li><b>SSR</b> — the same components run on the server (no headless browser) and in the browser.</li>
            <li><b>Hydration</b> — data the server fetched arrives with the page; the browser doesn't fetch it again.</li>
            <li><b>Symbol RPC</b> — one interface; in the browser it becomes HTTP, during SSR a direct call.</li>
          </ul>
          <p><a class="button" href="/users">See it on the Users page →</a></p>
        </section>`;
    }
  }
  return tag;
};
