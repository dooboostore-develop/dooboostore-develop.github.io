import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './dom-render.route.component.html';
import style from './dom-render.route.component.css';
import { Sim } from "@dooboostore/simple-boot";
@Sim
@Component({
  template,
  styles: [style]
})
export class DomRenderRouteComponent {
}