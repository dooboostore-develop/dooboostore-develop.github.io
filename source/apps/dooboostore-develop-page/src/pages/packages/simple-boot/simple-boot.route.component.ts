import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import template from "./simple-boot.route.component.html";
import style from "./simple-boot.route.component.css";
import { Sim } from "@dooboostore/simple-boot";
import { ComponentBase } from "@dooboostore/dom-render";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
@Sim
@Component({
  template,
  styles: [style],
})
export class SimpleBootRouteComponent extends ComponentBase {
  onInitRender(param: any, rawSet: RawSet) {
    super.onInitRender(param, rawSet);
  }
}
