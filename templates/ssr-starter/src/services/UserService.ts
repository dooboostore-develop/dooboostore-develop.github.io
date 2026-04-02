// 브라우저와 서버가 함께 쓰는 "계약" — 인터페이스 하나 + Symbol 하나.
// 컴포넌트는 이 인터페이스만 안다. 브라우저에선 HTTP 프록시가, 서버에선 진짜 구현이 들어온다.
export type User = { id: number; name: string; role: string };
export type UsersPage = { users: User[]; next?: number };

export namespace UserService {
  // Symbol.for → 브라우저 번들과 서버가 같은 키를 쓴다 (HTTP 헤더로도 이 이름이 넘어간다)
  export const SYMBOL = Symbol.for('UserService');
}
export interface UserService {
  getUsers(request: { from?: number; limit: number }, ...rest: any[]): Promise<UsersPage>;
}
