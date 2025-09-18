import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './core-web.route.component.html';
import style from './core-web.route.component.css';
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
@Sim
@Component({
  template,
  styles: [style]
})
export class CoreWebRouteComponent {
}