import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './simple-boot-front.route.component.html';
import style from './simple-boot-front.route.component.css';
import { Sim } from "@dooboostore/simple-boot";
@Sim
@Component({
  template,
  styles: [style]
})
export class SimpleBootFrontRouteComponent {
}
