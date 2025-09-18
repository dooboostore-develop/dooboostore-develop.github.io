import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { SwtRouteComponent } from './swt.route.component';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase';
import template from './swt.router.component.html';
import styles from './swt.router.component.css';
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
import { Router as DomrenderRouter } from "@dooboostore/dom-render/routers/Router";
import {
  BreadcrumbData,
  BreadcrumbDropdown,
  BreadcrumbItem,
} from "@src/component";
import { ChildrenSet } from "@dooboostore/dom-render/components/ComponentBase";
import { query } from "@dooboostore/dom-render/components/ComponentBase";

@Sim
@Router({
    path: '/swt',
    route: {
      '': '/',
      '/': SwtRouteComponent,
    },
})
@Component({
    template,
  styles,
    using: [SwtRouteComponent]
})
export class SwtRouterComponent extends ComponentRouterBase {
  @query("h1")
  h1s?: HTMLElement[];

  @query("h2")
  h2s?: HTMLElement[];

  breadcrumbs?: BreadcrumbData[];

  constructor(private router: DomrenderRouter) {
    super({ sameRouteNoApply: true });
  }

  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
    super.onCreatedThisChildDebounce(childrenSet);
    this.refreshDecorators();
    const list: BreadcrumbData[] = [
    ];
    this.h1s?.forEach((it) => {
      list.push({
        text: it.textContent,
        link: `/packages/${it.textContent?.replace("@dooboostore/", "") ?? it.textContent}`,
      });
    });
    const last: BreadcrumbDropdown = {
      items: this.h2s?.map((it) => ({ text: it.textContent, data: it })) ?? [],
    };
    list.push(last);
    this.breadcrumbs = list;
  }

  handleNavigate(item: BreadcrumbItem) {
    if (item.link) {
      this.router.go(item.link);
    } else if (item.data instanceof HTMLElement) {
      item.data.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}
