import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
import { Router } from "@dooboostore/simple-boot/decorators/route/Router";
import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import { IndexRouteComponent } from "./index.route.component";
import { ComponentRouterBase } from "@dooboostore/simple-boot-front/component/ComponentRouterBase";
import template from "./index.router.component.html";
import style from "./index.router.component.css";
import { drComponent } from "@dooboostore/dom-render/components/index";
import ProjectComponent from "@src/component";
import { PackagesRouterComponent } from "./packages/packages.router.component";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import { Router as DomRenderRouter } from "@dooboostore/dom-render/routers/Router";
import { RoutingDataSet } from "@dooboostore/simple-boot/route/RouterManager";
import { ValidUtils } from "@dooboostore/core-web/valid/ValidUtils";
// import { DateUtils } from "@dooboostore/core/date/DateUtils";
// import { BehaviorSubject, filter } from "rxjs";
// import { fromFetch } from "rxjs/internal/observable/dom/fetch";
import { ChildrenSet } from "@dooboostore/dom-render/components/ComponentBase";
import { OnRawSetRendered, OnRawSetRenderedOtherData } from "@dooboostore/dom-render/lifecycle/OnRawSetRendered";
import { RandomUtils } from "@dooboostore/core/random/RandomUtils";
import { ArrayUtils } from "@dooboostore/core/array/ArrayUtils";

// import { RandomUtils } from "source/packages/@dooboostore/core/src/random";
// import { RandomUtils } from "@dooboostore/core/random/RandomUtils";
// import { fromFetch } from "rxjs/internal/observable/dom/fetch";
// import { fromFetch } from "rxjs/internal/observable/dom/fetch";
// import { Behavior } from '@google/genai';
// DateUtils.compare;
// Behavior
// DateU
// Point2D
// RandomUtils.it();
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
  private arry: number[] = [1,2,3];
  private sw = true;
  constructor(private router: DomRenderRouter) {
    super({ sameRouteNoApply: true });
    // console.log(ValidUtils.isBrowser());
  }
 async onInitRender(param: any, rawSet: RawSet) {
    super.onInitRender(param, rawSet);
    // console.log('zzzzzzzz');
    // this.router.observable.subscribe((it) => {
    //   setTimeout(() => {
    //     const p = (this.domRenderConfig?.window as any).Prism;
    //     if (p) {
    //       p.highlightAll();
    //     }
    //   }, 100);
    // });
    // setInterval(()=>{
    //   console.log('se', this.getChildren(RouterOutlet.RouterOutlet));
    // }, 1000)
  }
  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    super.canActivate(url, data);
    // console.log('index.router canAct', data);
  }

  async onRouting(r: RoutingDataSet): Promise<void> {
    await super.onRouting(r);
    console.log('onRouting');
    this.sw = Math.random() > 0.5;
    this.arry = [66,34345,5445,45,45,45,45,45,45];

    // if (RouterAction.isOnRouting(this.child?.obj)){
    //   await this.child.obj.onRouting(r);
    // }
  }

  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
    super.onCreatedThisChildDebounce(childrenSet);
    // console.log('vvdvvvvv');
  }
  test() {}
}
