import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { IndexRouteComponent } from './index.route.component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase';
import template from './index.router.component.html';
import style from './index.router.component.css';
import {drComponent} from '@dooboostore/dom-render/components';
import ProjectComponent from '@src/component';
import { PackagesRouterComponent } from './packages/packages.router.component';
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import { Router as DomRenderRouter } from "@dooboostore/dom-render/routers/Router";

@Sim
@Router({
  path: "",
  route: {
    "/": IndexRouteComponent,
  },
  routers: [PackagesRouterComponent],
})
@Component({
  template: template,
  styles: style,
  using: [
    drComponent,
    ProjectComponent,
    IndexRouteComponent,
    PackagesRouterComponent,
  ],
})
export class IndexRouterComponent extends ComponentRouterBase {
  constructor(private router: DomRenderRouter) {
    super({ sameRouteNoApply: true });
  }
  onInitRender(param: any, rawSet: RawSet) {
    super.onInitRender(param, rawSet);
    // console.log('zzzzzzzz');
    this.router.observable.subscribe(it => {
      setTimeout(() => {
        const p = (this.domRenderConfig?.window as any).Prism;
        if (p) {
          p.highlightAll();
        }
      }, 10)
    })
    // setInterval(()=>{
    //   console.log('se', this.getChildren(RouterOutlet.RouterOutlet));
    // }, 1000)
  }
  test() {}
}