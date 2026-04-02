import { getSim } from '@dooboostore/simple-boot';
import { UserBackService } from './UserBackService';

// 서버 쪽 서비스 목록 — 서비스를 추가하면 여기에 한 줄 (SSR 렌더 때 컴포넌트에 주입된다)
export const pairServices = [getSim(UserBackService)!];
