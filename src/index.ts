import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import bootFactory from "./bootFactory";

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('container');
  bootFactory(w, container);

  // Safari compatibility: Wait for the customized built-in element to be upgraded by the polyfill
  await w.customElements.whenDefined('swc-app-body');

  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement && typeof appElement.connect === 'function') {
    appElement.connect({
      path: UrlUtils.getUrlPath(w.location) ?? '/',
      routeType: 'path',
      container: container,
      window: w,
      onEngineStarted: () => {
        console.log('[Root] Engine started');
        // appElement.innerHTML = '<showcase-root-router></showcase-root-router>';
      }
    });
  } else {
    console.error('[Root] Failed to initialize SWC App: appElement.connect is not a function. Check Safari polyfill.');
  }
});
