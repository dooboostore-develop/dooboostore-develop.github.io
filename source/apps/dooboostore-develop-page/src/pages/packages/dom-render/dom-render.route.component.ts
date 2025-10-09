import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './dom-render.route.component.html';
import style from './dom-render.route.component.css';
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
import projectComponent from "@src/component";
import { ComponentBase } from "@dooboostore/simple-boot-front/component/ComponentBase";

@Sim
@Component({
  template,
  styles: [style],
  using: [projectComponent],
})
export class DomRenderRouteComponent extends ComponentBase {
}
