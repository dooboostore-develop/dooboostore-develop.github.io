import 'reflect-metadata';
import '../src/style.css';
import { boot } from '../src/boot';
import { serviceFactories } from './services';

// 브라우저: 서비스는 HTTP 프록시. 서버가 그린 엘리먼트는 다시 그리지 않고 행위만 붙는다.
boot(window, serviceFactories, location.pathname);
