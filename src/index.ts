import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import bootFactory from "./bootFactory";

const w = window;

w.document.addEventListener('DOMContentLoaded', () => {
  const container = Symbol('container');
  bootFactory(w, container);

  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement) {
    appElement.connect({
      path: UrlUtils.getUrlPath(w.location) ?? '/',
      routeType: 'path',
      container: container,
      window: w,
      onEngineStarted: () => {
        console.log('[Root] Engine started');
        appElement.innerHTML = '<showcase-root-router></showcase-root-router>';
      }
    });
  }
});
