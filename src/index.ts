import 'reflect-metadata';
import { defineSwcAppAll, SwcAppInterface } from '@dooboostore/simple-web-component';
import { UrlUtils } from "@dooboostore/core";
import {serviceFactories} from "@/services";
import {pageFactories} from "@/pages";
import {componentFactories} from "@/components";
import defineShowcaseAppBody from "@/ShowcaseAppBody";

const w = window;

w.document.addEventListener('DOMContentLoaded', async () => {
  const container = Symbol('container');
  serviceFactories.forEach(s => s(container));

  await defineSwcAppAll(w);
  await defineShowcaseAppBody(w);

  const appElement = w.document.querySelector('#app') as SwcAppInterface;
  if (appElement && typeof appElement.connect === 'function') {
    appElement.connect({
      path: UrlUtils.getUrlPath(w.location) ?? '/',
      routeType: 'path',
      container: container,
      window: w,
      onStartedLazyDefineComponent: [...pageFactories, ...componentFactories],
    });
  } else {
    console.error('[Root] Failed to initialize SWC App: appElement.connect is not a function. Check Safari polyfill.');
  }
});
