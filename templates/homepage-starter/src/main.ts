import 'reflect-metadata';
import './style.css';
import { defineSwcAppAll } from '@dooboostore/simple-web-component';
import { factories } from './app';

defineSwcAppAll(window).then(() => {
  (document.querySelector('#app') as any).connect({
    window,
    container: Symbol('site'),
    path: location.pathname,
    routeType: 'path',
    onStartedLazyDefineComponent: factories,
  });
});
