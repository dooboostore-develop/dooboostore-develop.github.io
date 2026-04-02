import { Sim } from '@dooboostore/simple-boot';
import { UserService, type User, type UsersPage } from '../../src/services/UserService';

const USERS: User[] = [
  { id: 1, name: 'Kim', role: 'Designer' },
  { id: 2, name: 'Lee', role: 'Engineer' },
  { id: 3, name: 'Park', role: 'Product' },
  { id: 4, name: 'Choi', role: 'Engineer' },
  { id: 5, name: 'Jung', role: 'Marketing' },
  { id: 6, name: 'Kang', role: 'Support' },
];

// 서버 구현 — 진짜 로직 (DB 조회 자리). 같은 Symbol 로 등록한다.
// 브라우저에서 HTTP 로 오든, 서버 렌더 중에 직접 불리든 같은 메서드가 받는다.
@Sim({ symbol: UserService.SYMBOL })
export class UserBackService implements UserService {
  async getUsers(request: { from?: number; limit: number }): Promise<UsersPage> {
    const from = request?.from ?? 0;
    const users = USERS.slice(from, from + request.limit);
    const next = from + request.limit < USERS.length ? from + request.limit : undefined;
    return { users, next };
  }
}
