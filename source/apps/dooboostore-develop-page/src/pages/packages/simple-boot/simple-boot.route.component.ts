import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import template from "./simple-boot.route.component.html";
import style from "./simple-boot.route.component.css";
import { ApiService } from "@dooboostore/simple-boot/fetch/ApiService";
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
import { ComponentBase } from "@dooboostore/simple-boot-front/component/ComponentBase";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import { RoutingDataSet } from "@dooboostore/simple-boot/route/RouterManager";
import projectComponent from '@src/component'
@Sim
@Component({
  template,
  styles: [style],
  using: [projectComponent]
})
export class SimpleBootRouteComponent extends ComponentBase {
  name: string = "SimpleBootRouteComponent";
  constructor(private apiService: ApiService) {
    super();
  }
  onInitRender(param: any, rawSet: RawSet) {
    super.onInitRender(param, rawSet);
    // this.apiService
    //   .get({ target: "https://registry.npmjs.org/@dooboostore/dom-render" })
    //   .then((it) => {
    //     console.log("-->", it);
    //     this.name = (it as any).name;
    //   });
  }

  copyCode(element: HTMLElement) {

  }
  async onRouting(r: RoutingDataSet): Promise<void> {
    await super.onRouting(r);
    // console.log('fffffffvvv');
    // const datas = await this.apiService.get({
    //   target: "https://registry.npmjs.org/@dooboostore/dom-render",
    // });
    // this.name = (datas as any).name;
    // console.log('fffffffeeeeeee');
  }
}
