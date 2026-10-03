// 앱 구성 — 브라우저(main.ts)와 빌드 때 미리 렌더(scripts/prerender.ts)가 똑같이 쓴다.
import siteHeader from './components/site-header';
import siteRouter from './components/site-router';
import homePage from './pages/home';
import aboutPage from './pages/about';
import contactPage from './pages/contact';

export const factories = [siteHeader, siteRouter, homePage, aboutPage, contactPage];

// 미리 렌더할 페이지 — 페이지를 추가하면 여기에도 추가
export const ROUTES = ['/', '/about', '/contact'];
