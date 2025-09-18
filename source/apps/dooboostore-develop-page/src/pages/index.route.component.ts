import {
  Lifecycle,
  Sim,
} from "@dooboostore/simple-boot/decorators/SimDecorator";
import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import template from "./index.route.component.html";
import style from "./index.route.component.css";
import { SimFrontOption } from "@dooboostore/simple-boot-front/option/SimFrontOption";
import { Appender } from "@dooboostore/dom-render/operators/Appender";
import { ApiService } from "@dooboostore/simple-boot/fetch/ApiService";
import { ComponentBase } from "@dooboostore/simple-boot-front/component/ComponentBase";
import { RoutingDataSet } from "@dooboostore/simple-boot/route/RouterManager";
import { PackagesRouterComponent } from "@src/pages/packages/packages.router.component";

@Sim({
  scope: Lifecycle.Transient,
})
@Component({
  template: template,
  styles: style,
})
export class IndexRouteComponent extends ComponentBase<any> {
  private fetchAppender = new Appender<string>();

  constructor(
    private simFrontConfig: SimFrontOption,
    private apiService: ApiService,
    private p: PackagesRouterComponent,
  ) {
    super();
    // console.log("index route constructor", apiService, p);
  }

  async onRouting(r: RoutingDataSet): Promise<void> {
    super.onRouting(r);
    // console.log('index route onRouting??', r);
  }
}
