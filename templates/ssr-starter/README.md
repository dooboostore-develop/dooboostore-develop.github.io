# SSR starter — @dooboostore/simple-web-component + simple-boot-http-server-ssr

**English** | [한국어](README.ko.md)

A full-stack template: the server renders the HTML, and the browser attaches behavior without drawing it again.

- **SSR (server-side rendering)**: the same components run on the server (Node, dom-parser) and in the browser
- **Hydration**: data the server loaded (`@property`) ships with the page → zero browser requests on first load
- **Symbol RPC**: one interface (`src/services`), implemented twice — an HTTP proxy in the front end, the real code in the back end. Components just call a method. No API routes, no `fetch` code

## Getting started

```bash
npx degit dooboostore-develop/dooboostore-develop.github.io/templates/ssr-starter my-app
cd my-app
npm install
npm run dev        # http://localhost:3000
```

Open `/users`.

| What you do | Text under the list | What happened |
|---|---|---|
| Type `/users` in the address bar | 💧 Hydrated | The server called `UserBackService` directly and sent the result. Zero browser requests |
| Click **Load more** | 🌐 Loaded more | The same `getUsers()` goes to the server as `POST /getUsers` |
| Go to `/users` from the menu on Home | 🌐 Loaded | Drawn in the browser → HTTP through the same proxy |

## Layout

```
src/          shared by server and browser — components, pages, boot (boot.ts), service interfaces
front-end/    browser only — entry (index.html, index.ts), service HTTP proxies
back-end/     server only — server (index.ts), real service implementations
```

| File | Role |
|---|---|
| `src/services/UserService.ts` | interface + Symbol ← the contract both sides share |
| `front-end/services/UserFrontService.ts` | browser side: HTTP proxy (one-line body) |
| `back-end/services/UserBackService.ts` | server side: the real data |
| `src/pages/users.ts` | gets it with `@inject(UserService.SYMBOL)` and just calls it |
| `back-end/index.ts` | filters in order: static files → Symbol RPC → SSR |

## Where to edit

| To change | File |
|---|---|
| Add a service | interface in `src/services` → proxy in `front-end/services` → implementation in `back-end/services` → one line in each folder's `index.ts` list |
| Add a page | a file in `src/pages/` → a route in `src/components/site-router.ts` → `factories` in `src/app.ts` |
| Menu | `src/components/site-header.ts` |
| Design | `src/style.css` |

## Running in production

```bash
npm run build      # front-end bundle (dist/)
npm start          # PORT defaults to 3000
```

You need a Node server — static hosting alone can't do SSR or RPC. For a static site, use `homepage-starter`.

## Notes

- Decorators use TypeScript `experimentalDecorators` (enabled in `tsconfig.json`).
- Declare `@property` fields with `declare`. An initial value would overwrite what the server sent.
- Docs: https://dooboostore-develop.github.io/ssr
