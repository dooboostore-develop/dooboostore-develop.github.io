// 앱 구성 — 브라우저와 서버가 똑같이 쓴다
import siteHeader from './components/site-header';
import siteRouter from './components/site-router';
import homePage from './pages/home';
import usersPage from './pages/users';

export const factories = [siteHeader, siteRouter, homePage, usersPage];
