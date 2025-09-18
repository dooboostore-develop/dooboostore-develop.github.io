import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './simple-boot-http-server-ssr.route.component.html';
import style from './simple-boot-http-server-ssr.route.component.css';
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
@Sim
@Component({
  template,
  styles: [style]
})
export class SimpleBootHttpServerSsrRouteComponent {
}
