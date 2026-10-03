import { Sim } from '@dooboostore/simple-boot';
import SymbolIntentApiServiceProxy from '@dooboostore/simple-boot-http-server/proxy/SymbolIntentApiServiceProxy';
import { UserService, type UsersPage } from '../../src/services/UserService';

// 브라우저 구현 — 한 줄. 프록시가 호출을 POST /getUsers 로 바꾸고, 헤더에 Symbol 을 실어 보낸다.
export default (container: symbol) => {
  @Sim({ symbol: UserService.SYMBOL, container, proxy: SymbolIntentApiServiceProxy({ container }) })
  class UserFrontService implements UserService {
    getUsers(request: { from?: number; limit: number }, send: (config: { body: unknown }) => Promise<UsersPage>) {
      return send({ body: request });
    }
  }
  return UserFrontService;
};
