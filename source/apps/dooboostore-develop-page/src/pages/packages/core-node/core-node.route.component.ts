
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './core-node.route.component.html';
import style from './core-node.route.component.css';
import { Sim } from "@dooboostore/simple-boot";

@Sim
@Component({
  template,
  styles: [style]
})
export class CoreNodeRouteComponent {
}
