import 'reflect-metadata';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IntentSchemeFilter, ResourceFilter } from '@dooboostore/simple-boot-http-server';
import { HttpSSRServerOption, SimpleBootHttpSSRServer, SSRSimpleWebComponentDomParserFilter } from '@dooboostore/simple-boot-http-server-ssr';
import { pairServices } from './services';
import { boot } from '../src/boot';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist'); // vite build 결과
const PORT = Number(process.env.PORT ?? 3000);

const server = new SimpleBootHttpSSRServer(new HttpSSRServerOption({
  listen: { port: PORT },
  // 요청은 위에서부터 차례로 필터를 지난다 (isSupport: 이 필터를 쓸지)
  filters: [
    // 1) 정적 파일 (vite 가 만든 /assets/*)
    { filter: new ResourceFilter(DIST, [/^\/assets\//]), isSupport: true },
    // 2) Symbol RPC — 브라우저 프록시가 보낸 요청을 같은 Symbol 의 서비스로 연결
    { filter: IntentSchemeFilter, isSupport: true },
    // 3) 나머지 페이지 요청은 서버에서 렌더 (브라우저 없이 dom-parser 로)
    {
      filter: new SSRSimpleWebComponentDomParserFilter({
        frontDistPath: DIST,
        intentServices: pairServices, // 서버 렌더 때 컴포넌트에 주입할 진짜 서비스
        registerComponents: (window, _rr, services) => boot(window, services, window.location.pathname),
      }),
      isSupport: true,
    },
  ],
}));
server.option.listen.listeningListener = () => console.log(`SSR server → http://localhost:${PORT}`);
server.run();
