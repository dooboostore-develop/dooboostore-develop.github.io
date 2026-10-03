# Homepage starter — @dooboostore/simple-web-component

**English** | [한국어](README.ko.md)

A small company homepage, ready to edit.

- Three pages (Home / About / Contact), a header menu and a 404
- A title and description per page (SEO)
- One `npm run build` **pre-renders HTML for every page**, plus `sitemap.xml` and `robots.txt`, so search engines can read it without JavaScript
- Push to `main` and it **deploys to GitHub Pages automatically**

## Getting started

```bash
npx degit dooboostore-develop/dooboostore-develop.github.io/templates/homepage-starter my-site
cd my-site
npm install
npm run dev        # http://localhost:5173
```

## Where to edit

| To change | File |
|---|---|
| Text and content | `render()` in `src/pages/*.ts` |
| Page title and description (SEO) | `meta()` in `src/pages/*.ts` |
| Add a page | a file in `src/pages/` → one route line in `src/components/site-router.ts` → add it to `factories` and `ROUTES` in `src/app.ts` |
| Menu | `src/components/site-header.ts` |
| Design | `src/style.css` |

## Deploy (GitHub Pages)

1. Create a GitHub repository and push
2. Repository Settings → Pages → set Source to **GitHub Actions**
3. From then on, every push to `main` deploys

> This template assumes the site is served from the **domain root** (a `<name>.github.io` repository or a custom domain).
> To serve it from a sub-path such as `<name>.github.io/<repo>/`, you need to change the path settings.

## Notes

- Decorators use TypeScript `experimentalDecorators` (enabled in `tsconfig.json`).
- Safari doesn't support `is="…"`, so `index.html` includes a one-line polyfill.
- Docs: https://dooboostore-develop.github.io/package/simple-web-component
