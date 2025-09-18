import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './swt.route.component.html';
import style from './swt.route.component.css';
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";

@Sim
@Component({
  template,
  styles: [style]
})
export class SwtRouteComponent {
}
