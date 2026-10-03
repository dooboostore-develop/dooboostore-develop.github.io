import { elementDefine, innerHtml, onConnectedAfter, onConnectedBodyLight, property, eventClick } from '@dooboostore/simple-web-component';
import { inject } from '@dooboostore/simple-boot';
import { UserService, type User } from '../services/UserService';

const listHtml = (users: User[]) => users.map(u => `<li><b>${u.name}</b><span>${u.role}</span></li>`).join('');
const onServer = typeof window === 'undefined' || typeof process !== 'undefined' && !!process.versions?.node;

export default (w: Window) => {
  const tag = 'users-page';
  if (w.customElements.get(tag)) return tag;

  @elementDefine(tag, { window: w })
  class UsersPage extends w.HTMLElement {
    // 서버에서 채운 값이 브라우저로 그대로 넘어온다 (@property 하이드레이션).
    // declare 로 선언할 것 — 초기값을 주면 업그레이드 때 넘어온 값을 덮어쓴다.
    @property declare users: User[] | null;
    @property declare next: number | null;
    private userService?: UserService;

    @onConnectedBodyLight
    render() {
      return `
        <section class="page">
          <h1>Users</h1>
          <ul class="users"></ul>
          <button class="button more">Load more</button>
          <p class="origin"></p>
        </section>`;
    }

    // 서버 렌더 때는 users 가 비어 있어 서버 구현을 "직접" 호출한다 (HTTP 없음).
    // 브라우저 첫 로드 때는 users 가 이미 넘어와 있어 요청을 보내지 않는다.
    @onConnectedAfter
    @innerHtml('.users', { valueKey: 'list' })
    @innerHtml('.origin', { valueKey: 'origin' })
    async load(@inject(UserService.SYMBOL) userService: UserService) {
      this.userService = userService;
      let origin = '💧 Hydrated: the server sent this data with the page — 0 requests from the browser.';
      if (!this.users) {
        const page = await userService.getUsers({ limit: 3 });
        this.users = page.users;
        this.next = page.next ?? null;
        origin = onServer
          ? '🖥 Rendered on the server: UserBackService was called directly (no HTTP).'
          : '🌐 Loaded in the browser: POST /getUsers with the Symbol header.';
      }
      return { list: listHtml(this.users), origin };
    }

    // 브라우저에서 누르면 같은 인터페이스가 HTTP 로 서버를 부른다
    @eventClick('.more')
    @innerHtml('.users', { valueKey: 'list' })
    @innerHtml('.origin', { valueKey: 'origin' })
    async more() {
      if (this.next == null || !this.userService) return { list: listHtml(this.users ?? []), origin: "That's everyone." };
      const page = await this.userService.getUsers({ from: this.next, limit: 2 });
      this.users = [...(this.users ?? []), ...page.users];
      this.next = page.next ?? null;
      return { list: listHtml(this.users), origin: '🌐 Loaded more in the browser: POST /getUsers with the Symbol header.' };
    }
  }
  return tag;
};
