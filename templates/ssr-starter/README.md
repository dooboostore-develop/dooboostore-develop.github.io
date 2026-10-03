# SSR starter — @dooboostore/simple-web-component + simple-boot-http-server-ssr

서버에서 HTML을 미리 그려 보내고, 브라우저는 다시 그리지 않고 동작만 붙이는 풀스택 템플릿입니다.

- **SSR(서버 렌더링)**: 같은 컴포넌트가 서버(Node, dom-parser)와 브라우저에서 그대로 돈다
- **하이드레이션**: 서버가 불러온 데이터(`@property`)가 페이지와 함께 넘어온다 → 첫 화면에서 브라우저 요청 0개
- **Symbol RPC**: 인터페이스 하나(`src/services`)를 프론트(HTTP 프록시)와 백(진짜 구현)이 각각 구현 → 컴포넌트는 그냥 메서드를 부른다. API 라우트도 `fetch` 코드도 없음

## 시작하기

```bash
npx degit dooboostore-develop/dooboostore-develop.github.io/templates/ssr-starter my-app
cd my-app
npm install
npm run dev        # http://localhost:3000
```

`/users` 를 열어 보세요.

| 상황 | 화면 아래 문구 | 무슨 일이 있었나 |
|---|---|---|
| 주소창에 `/users` 를 치고 들어옴 | 💧 Hydrated | 서버가 `UserBackService` 를 직접 불러 그려 보냄. 브라우저 요청 0개 |
| **Load more** 클릭 | 🌐 Loaded more | 같은 `getUsers()` 가 `POST /getUsers` 로 서버에 감 |
| 홈에서 메뉴로 `/users` 이동 | 🌐 Loaded | 브라우저에서 그림 → 같은 프록시로 HTTP |

## 구조

```
src/          서버·브라우저 공통 — 컴포넌트, 페이지, 부팅(boot.ts), 서비스 인터페이스
front-end/    브라우저 전용 — 진입점(index.html, index.ts), 서비스 HTTP 프록시
back-end/     서버 전용 — 서버(index.ts), 서비스 진짜 구현
```

| 파일 | 역할 |
|---|---|
| `src/services/UserService.ts` | 인터페이스 + Symbol ← 프론트·백 공통 계약 |
| `front-end/services/UserFrontService.ts` | 브라우저 구현: HTTP 프록시 (본문 한 줄) |
| `back-end/services/UserBackService.ts` | 서버 구현: 진짜 데이터 |
| `src/pages/users.ts` | `@inject(UserService.SYMBOL)` 로 받아서 부를 뿐 |
| `back-end/index.ts` | 정적 파일 → Symbol RPC → SSR 순서의 필터 |

## 고칠 곳

| 하고 싶은 것 | 파일 |
|---|---|
| 서비스 추가 | `src/services` 에 인터페이스 → `front-end/services` 에 프록시 → `back-end/services` 에 구현 → 각 폴더 `index.ts` 목록에 한 줄씩 |
| 페이지 추가 | `src/pages/` 에 파일 → `src/components/site-router.ts` 에 주소 → `src/app.ts` 의 `factories` |
| 메뉴 | `src/components/site-header.ts` |
| 디자인 | `src/style.css` |

## 운영

```bash
npm run build      # 프론트 번들 (dist/)
npm start          # PORT=3000 기본
```

Node 서버가 필요합니다 (정적 호스팅만으로는 SSR·RPC 불가). 정적 사이트면 `homepage-starter` 를 쓰세요.

## 참고

- 데코레이터는 TypeScript `experimentalDecorators` 를 씁니다 (`tsconfig.json` 에 켜져 있음).
- `@property` 는 `declare` 로 선언하세요. 초기값을 주면 서버에서 넘어온 값을 덮어씁니다.
- 문서: https://dooboostore-develop.github.io/ssr
