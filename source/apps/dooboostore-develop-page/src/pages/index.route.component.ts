import { Lifecycle, Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './index.route.component.html';
import style from './index.route.component.css';
import { SimFrontOption } from '@dooboostore/simple-boot-front/option/SimFrontOption';
import { ComponentBase } from '@dooboostore/dom-render/components/ComponentBase';
import { Appender } from '@dooboostore/dom-render/operators/Appender';
import { ApiService } from '@dooboostore/simple-boot/fetch/ApiService';
import { Inject } from '@dooboostore/simple-boot/decorators/inject/Inject';

@Sim({
  scope: Lifecycle.Transient
})
@Component({
  template: template,
  styles: style
})
export class IndexRouteComponent extends ComponentBase<any> {
  private fetchAppender = new Appender<string>();

  constructor(
    private simFrontConfig: SimFrontOption,
    private apiService: ApiService,
  ) {
    super();
  }

}
