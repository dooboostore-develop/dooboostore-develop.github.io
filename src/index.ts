import 'reflect-metadata';
import { SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import bootFactory from "./bootFactory";

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('container');
  bootFactory(w, container);

  // Safari compatibility: Wait for the customized built-in element to be upgraded
  await w.customElements.whenDefined('swc-app-body');
  
  // Force upgrade all is="swc-app-*" elements explicitly for Safari
  const swcAppElements = w.document.querySelectorAll('[is^="swc-app-"]');
  for (const el of swcAppElements) {
    if (w.customElements.get(el.getAttribute('is')!)) {
      try {
        w.customElements.upgrade(el);
      } catch (e) {
        console.log('Manual upgrade attempted');
      }
    }
  }
  
  // Small delay to ensure all upgrades complete
  await new Promise(resolve => setTimeout(resolve, 100));

  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement && typeof appElement.connect === 'function') {
    appElement.connect({
      path: UrlUtils.getUrlPath(w.location) ?? '/',
      routeType: 'path',
      container: container,
      window: w,
      onEngineStarted: (app, component) => {
        console.log('[Root] Engine started');
        console.log('Router:', component.router);
      }
    });
  } else {
    console.error('[Root] Failed to initialize SWC App: appElement.connect is not a function. Check Safari polyfill.');
  }
});
