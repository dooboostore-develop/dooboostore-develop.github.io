# Homepage starter — @dooboostore/simple-web-component

회사·제품 소개 홈페이지를 바로 시작하는 템플릿입니다. A ready-to-edit company homepage.

- 페이지 3개 (홈 / 소개 / 문의) + 헤더 메뉴 + 404
- 페이지마다 제목·설명 (SEO)
- `npm run build` 한 번이면 **페이지별 HTML 미리 생성** + `sitemap.xml` + `robots.txt` → 검색엔진이 자바스크립트 없이 읽음
- `main` 에 푸시하면 **GitHub Pages 자동 배포**

## 시작하기

```bash
npx degit dooboostore-develop/dooboostore-develop.github.io/templates/homepage-starter my-site
cd my-site
npm install
npm run dev        # http://localhost:5173
```

## 고칠 곳

| 하고 싶은 것 | 파일 |
|---|---|
| 문구·내용 바꾸기 | `src/pages/*.ts` 의 `render()` |
| 페이지 제목·설명 (SEO) | `src/pages/*.ts` 의 `meta()` |
| 페이지 추가 | `src/pages/` 에 파일 → `src/components/site-router.ts` 에 주소 한 줄 → `src/app.ts` 의 `factories`·`ROUTES` 에 추가 |
| 메뉴 | `src/components/site-header.ts` |
| 디자인 | `src/style.css` |

## 배포 (GitHub Pages)

1. GitHub 에 저장소를 만들고 푸시
2. 저장소 Settings → Pages → Source 를 **GitHub Actions** 로
3. 이후로는 `main` 에 푸시할 때마다 자동 배포

> 이 템플릿은 **도메인 루트**(`<이름>.github.io` 저장소 또는 커스텀 도메인) 기준입니다.
> `<이름>.github.io/<저장소>/` 같은 하위 경로에 올리려면 경로 설정을 따로 바꿔야 합니다.

## 참고

- 데코레이터는 TypeScript `experimentalDecorators` 를 씁니다 (`tsconfig.json` 에 켜져 있음).
- 사파리는 `is="…"` 를 지원하지 않아 `index.html` 에 폴리필 한 줄이 들어 있습니다.
- 문서: https://dooboostore-develop.github.io/package/simple-web-component
